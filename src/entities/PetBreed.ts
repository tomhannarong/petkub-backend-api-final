import { getModelForClass, prop, Ref } from "@typegoose/typegoose";
import { ObjectType, Field ,ID, ArgsType} from "type-graphql";
import { PetType } from "./PetType";

@ObjectType({description: 'PetBreed Model'})
@ArgsType()
export class PetBreed {
    @Field(()=> ID)
    id: string

    @Field()
    @prop({required: true, unique: true})
    name: string 

    @Field(() => PetType , {nullable: true})
    @prop({type: ID!, ref: PetType})
    petType: Ref<PetType>;

    @Field({nullable: true})
    @prop({default: Date.now() + 60 * 60 * 1000 * 7})
    createdAt?: Date

    @Field({nullable: true})
    @prop({default: Date.now() + 60 * 60 * 1000 * 7})
    updatedAt?: Date

    @Field({nullable: true})
    @prop()
    deletedAt?: Date
}

export const PetBreedModel = getModelForClass(PetBreed)


