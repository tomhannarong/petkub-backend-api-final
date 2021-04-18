import {  IsEmail, Matches, IsNotEmpty } from "class-validator";
import { Field, InputType } from "type-graphql";
import { IsEmailAlreadyExist } from "./isEmailAlreadyExist";
import { Match } from "./matchPassword";

@InputType({ description: "validate signup"})
export class SignupInput {

  @Field()
  @IsNotEmpty()
  fname: string;

  @Field()
  @IsNotEmpty()
  lname : string;

  @Field()
  @IsEmail()
  @IsEmailAlreadyExist({ message: "Email already in use, please sign in instead." })
  email: string;

  @Field()
  @IsNotEmpty()
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {message: 'password too weak'})
  password: string;

  @Field()
  @IsNotEmpty()
  @Match('password')
  passwordConfirm: string;
}

@InputType({ description: "validate signin"})
export class SigninInput {
  @Field()
  @IsNotEmpty()
  email: string;

  @Field()
  @IsNotEmpty()
  password: string;
}


