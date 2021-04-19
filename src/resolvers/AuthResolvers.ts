
import { randomBytes } from "crypto";
import { Resolver, Query, Mutation, Arg, Ctx, ObjectType, Field, Int, Args } from "type-graphql";
import Sendgrid, { MailDataRequired } from '@sendgrid/mail'
import { User, UserModel } from "../entities/User";
import bcrypt from "bcryptjs";

import { signAccessToken, verifyAcessToken, signRefreshToken, verifyRefreshToken } from "../utils/tokenHandler";
import { AppContext } from '../types'
import { isAuthenticated } from '../utils/authHandler';
import { SigninInput, SignupInput } from "../utils/validate/auth/AuthInput";


Sendgrid.setApiKey(process.env.SENDGRID_API_KEY!)

@ObjectType()
export class ResponseMessage {
    @Field()
    message: string
}

@ObjectType()
export class AuthData {
    @Field({ nullable: true })
    userId?: string

    @Field({ nullable: true })
    accessToken?: string

    @Field({ nullable: true })
    refreshToken?: string

    @Field(() => Int, { nullable: true })
    expiresIn?: number
}



@Resolver()
export class AuthResolvers {

    @Query(() => User, { nullable: true, description: "me data" }) //[User]!
    async me(@Ctx() { req }: AppContext): Promise<User | null> {
        try {
            // Check if user is authenicated
            return await isAuthenticated(req)

        } catch (error) {
            throw error
        }
    }

    @Mutation(() => AuthData, { nullable: true })
    async signup(@Args()
    {
        fname,
        lname,
        email,
        password,
    }: SignupInput): Promise<AuthData | null> {
        try {
            const hashedPassword = await bcrypt.hash(password, 10)

            const newUser = await (await UserModel.create({
                email: email.trim().toLocaleLowerCase(),
                password: hashedPassword,
                personalInformation: {
                    fname: fname,
                    lname: lname
                }
            })).save();

            // sign Access Token
            const accessToken = signAccessToken(newUser.id, newUser.tokenVersion)

            const decodedAcessToken = verifyAcessToken(accessToken) as {
                exp: number
            } | null

            return {
                userId: newUser.id,
                accessToken: accessToken,
                refreshToken: signRefreshToken(newUser.id, newUser.tokenVersion),
                expiresIn: decodedAcessToken?.exp,
            }

        } catch (error) {
            throw error
        }
    }

    @Mutation(() => AuthData, { nullable: true })
    async signin(@Args()
    {
        email,
        password,
    }: SigninInput): Promise<AuthData | null> {
        try {
            // Check if email exist in the database
            const user = await UserModel.findOne({ email })
            if (!user) throw new Error('No such user found.')

            // Check if the password is valid
            const isPasswordvalid = await bcrypt.compare(password, user.password)
            if (!isPasswordvalid) throw new Error('Username or password is invalid.')

            // sign Access Token
            const accessToken = signAccessToken(user.id, user.tokenVersion)

            const decodedAcessToken = verifyAcessToken(accessToken) as {
                exp: number
            } | null

            return {
                userId: user.id,
                accessToken: accessToken,
                refreshToken: signRefreshToken(user.id, user.tokenVersion),
                expiresIn: decodedAcessToken?.exp,
            }

        } catch (error) {
            throw error
        }
    }

    @Mutation(() => ResponseMessage, { nullable: true })
    async signout(
        @Ctx() { req }: AppContext
    ): Promise<ResponseMessage | null> {
        try {
            const user = await isAuthenticated(req)

            // Bump up token version
            user.tokenVersion = user.tokenVersion + 1
            await user.save()

            return { message: "Signout Success." }

        } catch (error) {
            throw error
        }
    }

    @Mutation(() => ResponseMessage, { nullable: true })
    async requestResetPassword(
        @Arg('email') email: string
    ): Promise<ResponseMessage | null> {
        try {
            if (!email) throw new Error('Email is required.')

            // Check if email exist in the database
            const user = await UserModel.findOne({ email })

            if (!user) throw new Error('Email not found.')

            const resetPasswordToken = randomBytes(16).toString('hex')
            const resetPasswordTokenExpiry = Date.now() + 1000 * 60 * 30 //30 = 30 นาที

            // Update user in the database
            const updatedUser = await UserModel.findOneAndUpdate(
                { email },
                { resetPasswordToken, resetPasswordTokenExpiry },
                { new: true }
            )

            if (!updatedUser) throw new Error('Sorry, cannot proceed.')

            // Send email to user's email
            const message: MailDataRequired = {
                from: 'admin@test.com',
                to: email,
                subject: 'Reset password',
                html: `
                  <div>
                    <p>Please click below link to reset your password.</p>
                    <a href='http://localhost:3000/?resetToken=${resetPasswordToken}' target='blank'>Click to reset password</a>
                  </div>
                `,
            }
            console.log(`resetPasswordToken: ${resetPasswordToken}`)

            const response = await Sendgrid.send(message)

            if (!response || response[0]?.statusCode !== 202) throw new Error('Sorry, cannot proceed.')

            return { message: 'Please check your email to reset password' }

        } catch (error) {
            throw error
        }
    }

    @Mutation(() => ResponseMessage, { nullable: true })
    async resetPassword(
        @Arg('password') password: string,
        @Arg('token') token: string
    ): Promise<ResponseMessage | null> {
        try {
            if (!password) throw new Error('Password is required.')
            if (!token) throw new Error('Sorry, cannot proceed.')

            // Check if email exist in the database
            const user = await UserModel.findOne({ resetPasswordToken: token })

            if (!user) throw new Error('Sorry, cannot proceed.')

            if (!user.resetPasswordTokenExpiry)
                throw new Error('Sorry, cannot proceed.')

            // Check if token is valid
            const isTokenValid = Date.now() <= user.resetPasswordTokenExpiry

            if (!isTokenValid) throw new Error('Sorry, cannot proceed.')

            // Hash password
            const hashedPassword = await bcrypt.hash(password, 10)

            // Update user in the database
            const updatedUser = await UserModel.findOneAndUpdate(
                { email: user.email },
                {
                    password: hashedPassword,
                    resetPasswordToken: undefined,
                    resetPasswordTokenExpiry: undefined,
                },
                { new: true }
            )

            if (!updatedUser) throw new Error('Sorry, cannot proceed.')

            return { message: 'Successfully reset password.' }
        } catch (error) {
            throw error
        }
    }

    @Mutation(() => AuthData, { nullable: true })
    async refreshToken(
        @Arg('refreshToken') refreshToken: string,
    ): Promise<AuthData | null> {
        try {

            const decodedRefreshToken = verifyRefreshToken(refreshToken) as {
                userId: string,
                tokenVersion: number
            } | null

            if (decodedRefreshToken) {
                const user = await UserModel.findById(decodedRefreshToken.userId);

                if (user) {
                    // Check if the token version is correct
                    if (user.tokenVersion === decodedRefreshToken.tokenVersion) {
                        user.tokenVersion = user.tokenVersion + 1
                        const updatedUser = await user.save()

                        if (updatedUser) {

                            const accessToken = signAccessToken(
                                updatedUser.id,
                                updatedUser.tokenVersion
                            )

                            const decodedAcessToken = verifyAcessToken(accessToken) as {
                                exp: number
                            } | null

                            return {
                                userId: updatedUser.id,
                                accessToken: accessToken,
                                refreshToken: signRefreshToken(updatedUser.id, updatedUser.tokenVersion),
                                expiresIn: decodedAcessToken?.exp,
                            }
                        }
                        throw new Error("updated user fail");
                    }
                    throw new Error("token version mismatch");
                }
                throw new Error("user not found");
            }
            throw new Error("token invalid");

        } catch (error) {
            throw error
        }
    }
}