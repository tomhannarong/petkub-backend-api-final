import {  registerDecorator, ValidatorConstraint, ValidatorConstraintInterface, ValidationOptions } from "class-validator";
import { PetBreedModel } from "../../../entities/PetBreed";


@ValidatorConstraint({ async: true })
export class IsBreedAlreadyExistConstraint
    implements ValidatorConstraintInterface {
    async validate(name: string) {
        return await PetBreedModel.findOne({ name }).then(breed => {
            if (breed) return false;
            return true;
        });
    }
}


export function IsBreedAlreadyExist(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsBreedAlreadyExistConstraint,
        });
    };
}
