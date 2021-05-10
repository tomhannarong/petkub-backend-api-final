
import { mongoose } from "@typegoose/typegoose";
import { Resolver, Mutation, Query, Ctx, Arg, ForbiddenError, Args } from "type-graphql";
import { PetBreed, PetBreedModel } from "../entities/PetBreed";
import { AppContext, RoleOptions } from "../types";
import { isAuthenticated } from "../utils/authHandler";
import { CreatePetBreedInput, UpdatePetBreedInput } from "../utils/validate//masterData/MasterDataInput";
import { ResponseMessage } from "./AuthResolvers";

@Resolver()
export class PetBreedResolvers {

    @Query(() => [PetBreed], { nullable: 'items', description: "PetBreed List" })
    async petBreeds(@Ctx() { req }: AppContext): Promise<PetBreed[] | null> {
        try {
            // Check if user is authenicated
            const user = await isAuthenticated(req)

            // Check if user is authorized (Admin, SuperAdmin)
            const isAuthorized =
                user.roles.includes(RoleOptions.superAdmin) ||
                user.roles.includes(RoleOptions.admin)

            if (!isAuthorized) throw new ForbiddenError()

            return PetBreedModel.find().sort({ createdAt: 'desc' }).populate({
                path: 'petType'
            })
        } catch (error) {
            throw error
        }
    }

    @Mutation(() => PetBreed, { nullable: true })
    async createPetBreed(
        @Args() {
            name,
            petTypeId
        }: CreatePetBreedInput,
        @Ctx() { req }: AppContext
    ): Promise<PetBreed | null> {
        try {
            // Check if user is authenicated
            const user = await isAuthenticated(req)

            // Check if user is authorized (Admin, SuperAdmin)
            const isAuthorized =
                user.roles.includes(RoleOptions.superAdmin) ||
                user.roles.includes(RoleOptions.admin)

            if (!isAuthorized) throw new ForbiddenError()

            // insert pet breed to the database
            const createdPetBreed = await PetBreedModel.create({ name, petType: petTypeId })

            if (!createdPetBreed) throw new Error('pet breed can not insert.')

            // Get Pet Breed By Id at insert and populate
            const createdPetBreedFind = await PetBreedModel.findById(createdPetBreed.id).populate({
                path: 'petType'
            })

            return createdPetBreedFind
        } catch (error) {
            throw error
        }
    }

    @Mutation(() => PetBreed, { nullable: true })
    async updatePetBreed(
        @Args() {
            id,
            name,
            petTypeId
        }: UpdatePetBreedInput,
        @Ctx() { req }: AppContext
    ): Promise<PetBreed | null> {
        try {
            // const petBreed = await PetBreedModel.find({ name ,_id: { $ne: petBreedId } })
            // if(petBreed) 

            // Check if user is authenicated
            const user = await isAuthenticated(req)

            // Check if user is authorized (Admin, SuperAdmin)
            const isAuthorized =
                user.roles.includes(RoleOptions.superAdmin) ||
                user.roles.includes(RoleOptions.admin)

            if (!isAuthorized) throw new ForbiddenError()

            // insert pet breed to the database
            const updatedPetBreed = await PetBreedModel.findByIdAndUpdate(id,
                {
                    name,
                    petType: mongoose.Types.ObjectId(petTypeId),
                    updatedAt: new Date(Date.now() + 60 * 60 * 1000 * 7)
                }, { new: true })
                .populate({
                    path: 'petType'
                })

            if (!updatedPetBreed) throw new Error('Pet type can not update.')

            return updatedPetBreed
        } catch (error) {
            throw error
        }
    }

    @Mutation(() => ResponseMessage, { nullable: true })
    async activePetBreed(
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
            const petBreed = await PetBreedModel.findById(id)

            if (!petBreed) throw new Error('Sorry, cannot proceed.')

            // Check pet type not have deletedAt date
            let message = ''
            if (!petBreed?.deletedAt) {
                // Update deletedAt date 
                petBreed.deletedAt = new Date(Date.now() + 60 * 60 * 1000 * 7)
                message = `pet breed name: ${petBreed.name} status is inActive.`
            } else {
                // user have deletedAt date
                petBreed.deletedAt = undefined
                message = `pet breed name: ${petBreed.name} status is Active.`
            }

            await petBreed.save()
            return { message }

        } catch (error) {
            throw error
        }
    }

    @Mutation(() => ResponseMessage, { nullable: true })
    async deletePetBreed(
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

            // Query pet breed (to be updated) from the database
            const deletedPetBreed = await PetBreedModel.findByIdAndDelete(id)

            if (!deletedPetBreed) throw new Error('Sorry, cannot proceed.')

            return { message: `pet breed name: ${deletedPetBreed.name} has been deleted.` }
        } catch (error) {
            throw error
        }
    }



}