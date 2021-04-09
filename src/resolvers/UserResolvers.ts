
import { Resolver, Mutation, Arg, Args, Query, Ctx } from "type-graphql";
import Sendgrid from '@sendgrid/mail'
import { PersonalInformation, User, UserModel} from "../entities/User";
import { AppContext, RoleOptions } from "../types";
import { isAuthenticated } from "../utils/authHandler";
import { ResponseMessage } from "./AuthResolvers";

Sendgrid.setApiKey(process.env.SENDGRID_API_KEY!)

@Resolver()
export class UserResolvers {

    @Query(() => [User], { nullable: 'items',description: "Users List"}) //[User]!
    async users(@Ctx() { req }: AppContext): Promise<User[] | null> {
        try {
            // Check if user is authenicated
            const user = await isAuthenticated(req)

            // Check if user is authorized (Admin, SuperAdmin)
            const isAuthorized =
                user.roles.includes(RoleOptions.superAdmin) ||
                user.roles.includes(RoleOptions.admin)

            if (!isAuthorized) throw new Error('No Authorization.')

            return UserModel.find().sort({ createdAt: 'desc' })
        } catch (error) {
            throw error
        }
    }
    
    @Mutation(() => User , {nullable: true})
    async updatePersonalInformation(
        
        @Args() personalInformation: PersonalInformation,
        @Arg('userId') userId: string,
        @Ctx() { req }: AppContext
    ): Promise<User | null> {
        try {
            const {fname, lname} = personalInformation
            const admin  = await isAuthenticated(req)            

            // Check if admin is super admin
            const isSuperAdmin = admin.roles.includes(RoleOptions.superAdmin)
            const isAdmin = admin.roles.includes(RoleOptions.admin)
            if (!isSuperAdmin || isAdmin) throw new Error('Not authorized.')

            //validate Personal information
            if(!userId) throw new Error('user id is required.')
            if(!fname) throw new Error('first name is required.')
            if(!lname) throw new Error('last name is required.')
            // if(!personalInformation.gender) throw new Error('gender is required.') 
            // if(!birthday) throw new Error('birthday is invalid.') 

            const user = await UserModel.findById(userId) 

            if(!user) throw new Error('User not found.') 

            //Update product in datebase 
            const updatedUser = await UserModel.findByIdAndUpdate(userId,{personalInformation},{ new: true })

            if (!updatedUser) throw new Error('User not found.')

            return updatedUser

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

            // Check if admin is super admin
            const isSuperAdmin = admin.roles.includes(RoleOptions.superAdmin)

            if (!isSuperAdmin) throw new Error('Not authorized.')

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
    async deleteUser(
        @Arg('userId') userId: string,
        @Ctx() { req }: AppContext
    ): Promise<ResponseMessage | null> {
        try {

            // Check if user (admin) is authenticated
            const admin = await isAuthenticated(req)

            // Check if admin is super admin
            const isSuperAdmin = admin.roles.includes(RoleOptions.superAdmin)

            if (!isSuperAdmin) throw new Error('Not authorized.')

            // Query user (to be updated) from the database
            const user = await UserModel.findByIdAndDelete(userId)

            if (!user) throw new Error('Sorry, cannot proceed.')

            return { message: `User id: ${userId} has been deleted.` }
        } catch (error) {
            throw error
        }
    }
    

}