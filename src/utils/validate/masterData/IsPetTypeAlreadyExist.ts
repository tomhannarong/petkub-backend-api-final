import {  registerDecorator, ValidatorConstraint, ValidatorConstraintInterface, ValidationOptions } from "class-validator";
import { PetTypeModel } from "../../../entities/PetType";


@ValidatorConstraint({ async: true })
export class IsPetTypeAlreadyExistConstraint
    implements ValidatorConstraintInterface {
    async validate(name: string) {
        return await PetTypeModel.findOne({ name }).then(type => {
            if (type) return false;
            return true;
        });
    }
}


export function IsPetTypeAlreadyExist(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsPetTypeAlreadyExistConstraint,
        });
    };
}
