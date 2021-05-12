
import { Resolver, Mutation, Arg, Query, Ctx, ForbiddenError } from "type-graphql";
import { User, UserModel } from "../entities/User";
import { AppContext, RoleOptions } from "../types";
import { isAuthenticated } from "../utils/authHandler";
import { ResponseMessage } from "./AuthResolvers";

@Resolver()
export class UserResolvers {

    @Query(() => User, { nullable: true, description: "User by id" }) //[User]!
    async user(
        @Arg('id') id: string,
        @Ctx() { req }: AppContext
    ): Promise<User | null> {
        try {
            // Check if user(admin) is authenicated
            const admin = await isAuthenticated(req)

            // Check if user is authorized (Admin, SuperAdmin)
            const isAuthorized =
                admin.roles.includes(RoleOptions.superAdmin) ||
                admin.roles.includes(RoleOptions.admin)

            if (!isAuthorized) throw new ForbiddenError();

            const user = await UserModel.findById(id)

            if (!user) throw new Error('User not found.')

            return user;

        } catch (error) {
            throw error
        }
    }

    @Query(() => [User], { nullable: 'items', description: "Users List" }) //[User]!
    async users(@Ctx() { req }: AppContext): Promise<User[] | null> {
        try {
            // Check if user(admin) is authenicated
            const admin = await isAuthenticated(req)

            // Check if user is authorized (Admin, SuperAdmin)
            const isAuthorized =
                admin.roles.includes(RoleOptions.superAdmin) ||
                admin.roles.includes(RoleOptions.admin)

            if (!isAuthorized) throw new ForbiddenError()

            return UserModel.find().sort({ createdAt: 'desc' })
        } catch (error) {
            throw error
        }
    }

    @Mutation(() => User, { nullable: true })
    async updateRoles(
        @Arg('newRoles', () => [String]) newRoles: RoleOptions[],
        @Arg('userId') userId: string,
        @Ctx() { req }: AppContext
    ): Promise<User | null> {
        try {
            // Check if user (admin) is authenticated
            const admin = await isAuthenticated(req)

            // Check if user is authorized (Admin, SuperAdmin)
            const isAuthorized =
                admin.roles.includes(RoleOptions.superAdmin) ||
                admin.roles.includes(RoleOptions.admin)

            if (!isAuthorized) throw new ForbiddenError();

            // Query user (to be updated) from the database
            const user = await UserModel.findById(userId)

            if (!user) throw new Error('User not found.')

            // Update roles
            user.roles = newRoles

            await user.save()

            return user
        } catch (error) {
            throw error
        }
    }

    @Mutation(() => ResponseMessage, { nullable: true })
    async activeUser(
        @Arg('userId') userId: string,
        @Ctx() { req }: AppContext
    ): Promise<ResponseMessage | null> {
        try {
            // Check if user (admin) is authenticated
            const admin = await isAuthenticated(req)

            // Check if user is authorized (Admin, SuperAdmin)
            const isAuthorized =
                admin.roles.includes(RoleOptions.superAdmin) ||
                admin.roles.includes(RoleOptions.admin)

            if (!isAuthorized) throw new ForbiddenError()

            // Query user (to be updated) from the database
            const user = await UserModel.findById(userId)
            if (!user) throw new Error('Sorry, cannot proceed.')

            // Check user not have deletedAt date
            let message = ''
            if (!user?.deletedAt) {
                // Update deletedAt date 
                user.deletedAt = new Date(Date.now() + 60 * 60 * 1000 * 7)
                message = `User id: ${userId} status is inActive.`
            } else {
                // user have deletedAt date
                user.deletedAt = undefined
                message = `User id: ${userId} status is Active.`
            }

            await user.save()
            return { message }

        } catch (error) {
            throw error
        }
    }

    @Mutation(() => ResponseMessage, { nullable: true })
    async deleteUser(
        @Arg('userId') userId: string,
        @Ctx() { req }: AppContext
    ): Promise<ResponseMessage | null> {
        try {
            // Check if user (admin) is authenticated
            const admin = await isAuthenticated(req)

            // Check if user is authorized (Admin, SuperAdmin)
            const isAuthorized =
                admin.roles.includes(RoleOptions.superAdmin) ||
                admin.roles.includes(RoleOptions.admin)

            if (!isAuthorized) throw new ForbiddenError();

            // Query user (to be updated) from the database
            const user = await UserModel.findByIdAndDelete(userId)

            if (!user) throw new Error('Sorry, cannot proceed.')

            return { message: `User id: ${userId} has been deleted.` }
        } catch (error) {
            throw error
        }
    }


}