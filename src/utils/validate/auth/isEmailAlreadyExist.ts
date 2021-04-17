import {
    registerDecorator,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface
} from "class-validator";

import { UserModel } from "../../../entities/User";

@ValidatorConstraint({ async: true })
export class IsEmailAlreadyExistConstraint
    implements ValidatorConstraintInterface {
    async validate(email: string) {
        return await UserModel.findOne({  email  }).then(user => {
            if (user) return false;
            return true;
        });
    }
}

export function IsEmailAlreadyExist(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsEmailAlreadyExistConstraint
        });
    };
}



