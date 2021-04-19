
import { Resolver, Mutation, Query, Ctx, Arg, Args, ForbiddenError } from "type-graphql";
import { PetType, PetTypeModel } from "../entities/PetType";
import { AppContext, RoleOptions } from "../types";
import { isAuthenticated } from "../utils/authHandler";
import { CreatePetTypeInput, UpdatePetTypeInput } from "../utils/validate/masterData/MasterDataInput";
import { ResponseMessage } from "./AuthResolvers";

@Resolver()
export class PetTypeResolvers {

    @Query(() => [PetType], { nullable: 'items', description: "PetType List" })
    async petTypes(@Ctx() { req }: AppContext): Promise<PetType[] | null> {
        try {
            // Check if user is authenicated
            const user = await isAuthenticated(req)

            // Check if user is authorized (Admin, SuperAdmin)
            const isAuthorized =
                user.roles.includes(RoleOptions.superAdmin) ||
                user.roles.includes(RoleOptions.admin)

            if (!isAuthorized) throw new ForbiddenError()

            return PetTypeModel.find().sort({ createdAt: 'desc' }).populate({
                path: 'PetBreed'

            })
        } catch (error) {
            throw error
        }
    }

    @Mutation(() => PetType, { nullable: true })
    async createPetType(
        @Args() petTypeInput: CreatePetTypeInput,
        @Ctx() { req }: AppContext
    ): Promise<PetType | null> {
        try {

            const { name } = petTypeInput
            // Check if user is authenicated
            const user = await isAuthenticated(req)

            // Check if user is authorized (Admin, SuperAdmin)
            const isAuthorized =
                user.roles.includes(RoleOptions.superAdmin) ||
                user.roles.includes(RoleOptions.admin)

            if (!isAuthorized) throw new ForbiddenError()

            if (!name) throw new Error('name is required.')

            // insert pet type to the database
            const createdPetType = await PetTypeModel.create({ name })

            if (!createdPetType) throw new Error('Pet type can not create.')

            return createdPetType
        } catch (error) {
            throw error
        }
    }

    @Mutation(() => PetType, { nullable: true })
    async updatePetType(
        @Args() {
            id,
            name
        }: UpdatePetTypeInput,
        @Ctx() { req }: AppContext
    ): Promise<PetType | null> {
        try {

            // Check if user is authenicated
            const user = await isAuthenticated(req)

            // Check if user is authorized (Admin, SuperAdmin)
            const isAuthorized =
                user.roles.includes(RoleOptions.superAdmin) ||
                user.roles.includes(RoleOptions.admin)

            if (!isAuthorized) throw new ForbiddenError()

            // insert pet type to the database
            const updatedPetType = await PetTypeModel.findByIdAndUpdate(id, {
                name,
                updatedAt: new Date(Date.now() + 60 * 60 * 1000 * 7)
            }, { new: true })

            if (!updatedPetType) throw new Error('Pet type can not update.')

            return updatedPetType
        } catch (error) {
            throw error
        }
    }

    @Mutation(() => ResponseMessage, { nullable: true })
    async activePetType(
        @Arg('id') id: string,
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

            // Query pet type (to be updated) from the database
            const petType = await PetTypeModel.findById(id)

            if (!petType) throw new Error('Sorry, cannot proceed.')

            // Check pet type not have deletedAt date
            let message = ''
            if (!petType?.deletedAt) {
                // Update deletedAt date 
                petType.deletedAt = new Date(Date.now() + 60 * 60 * 1000 * 7)
                message = `pet type name: ${petType.name} status is inActive.`
            } else {
                // user have deletedAt date
                petType.deletedAt = undefined
                message = `pet type name: ${petType.name} status is Active.`
            }

            await petType.save()
            return { message }

        } catch (error) {
            throw error
        }
    }

    @Mutation(() => ResponseMessage, { nullable: true })
    async deletePetType(
        @Arg('id') id: string,
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

            // Query pet type (to be updated) from the database
            const petType = await PetTypeModel.findByIdAndDelete(id)

            if (!petType) throw new Error('Sorry, cannot proceed.')

            return { message: `pet type name: ${petType.name} has been deleted.` }
        } catch (error) {
            throw error
        }
    }


}