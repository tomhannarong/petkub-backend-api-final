import { IsNotEmpty } from "class-validator";
import { ArgsType, Field, InputType} from "type-graphql";
import { IsBreedAlreadyExist } from "./IsBreedAlreadyExist";
import { IsPetTypeAlreadyExist } from "./IsPetTypeAlreadyExist";


@InputType({ description: "validate create pet breed" })
@ArgsType()
export class CreatePetBreedInput {
    @Field()
    @IsNotEmpty()
    @IsBreedAlreadyExist({ message: "Name already in use, please sign in instead." })
    name: string;

    @Field()
    @IsNotEmpty()
    petTypeId: string;
}

@InputType({ description: "validate update pet breed" })
@ArgsType()
export class UpdatePetBreedInput {

    @Field()
    @IsNotEmpty()
    id: string

    @Field()
    @IsNotEmpty()
    name: string;

    @Field()
    @IsNotEmpty()
    petTypeId: string;
}


@InputType({ description: "validate create pet type" })
@ArgsType()
export class CreatePetTypeInput {

    @Field()
    @IsNotEmpty()
    @IsPetTypeAlreadyExist({ message: "Name already in use, please sign in instead." })
    name: string;

}

@InputType({ description: "validate update pet type" })
@ArgsType()
export class UpdatePetTypeInput {

    @Field() 
    @IsNotEmpty()
    id: string

    @Field()
    @IsNotEmpty()
    // @IsPetTypeAlreadyExist({ message: "Name already in use, please sign in instead." })
    name: string;
}





