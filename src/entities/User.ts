import { getModelForClass, modelOptions, prop } from "@typegoose/typegoose";
import { ObjectType, Field ,ID, ArgsType} from "type-graphql";
import { RoleOptions } from "../types";

@modelOptions({ schemaOptions: { _id: false } })
@ObjectType({ description: "Personal Information"})
@ArgsType()
export class PersonalInformation {
  
  @Field()
  @prop()
  fname: string

  @Field()
  @prop()
  lname: string

  //Field Int 
  //@Field(() => Int ,{nullable: true} )
  @Field({nullable: true} )
  @prop()
  birthday: Date

  @Field()
  @prop()
  gender: string
}

@ObjectType({ description: "Contact"})
export class Contact {
  
  @Field()
  @prop()
  nickname: string

  @Field(() => [String], {nullable: "items"})
  @prop()
  phone: string[];

  @Field({nullable: true})
  @prop()
  facebook: string

  @Field({nullable: true})
  @prop()
  line: string

  @Field({nullable: true})
  @prop()
  instagram: string


}


@ObjectType({description: 'User Model'})
export class User {
    @Field(()=> ID)
    id: string

    // Personal Information type Object
    @Field({nullable: true})
    @prop()
    personalInformation?: PersonalInformation; 

    // Contact type Object
    @Field(() => Contact , {nullable: true} )
    @prop()
    contact?: Contact; 

    // Contact type Array Object
    // @Field(() => [Contact] , {nullable: "items"} )
    // @prop()
    // contact?: Contact[]; 

    @Field({nullable: true})
    @prop()
    profileImg? : string

    @Field()
    @prop()
    username: string

    @Field()
    @prop({required: true, trim: true, unique: true, lowercase: true})
    email: string 

    @prop({required: true})
    password: string

    @prop({default: 0})
    tokenVersion: number

    @prop()
    resetPasswordToken?: string

    @prop()
    resetPasswordTokenExpiry?: number

    @prop()
    facebookId?: string

    @prop()
    googleId?: string

    @Field(() => [String])
    @prop({
      type: String,
      enum: RoleOptions,
      default: [RoleOptions.client],
    })
    roles: RoleOptions[]

    @Field()
    @prop({default: Date.now() + 60 * 60 * 1000 * 7})
    createdAt: Date

    @Field()
    @prop({default: Date.now() + 60 * 60 * 1000 * 7})
    updatedAt: Date

    @Field({nullable: true})
    @prop()
    deletedAt?: Date
}

export const UserModel = getModelForClass(User)


