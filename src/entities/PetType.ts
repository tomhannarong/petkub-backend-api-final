import { getModelForClass, prop } from "@typegoose/typegoose";
import { ObjectType, Field ,ID, ArgsType} from "type-graphql";

@ObjectType({description: 'PetType Model'})
@ArgsType()
export class PetType {
    @Field(()=> ID)
    id: string

    @Field()
    @prop({required: true, unique: true})
    name: string 

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

export const PetTypeModel = getModelForClass(PetType)


