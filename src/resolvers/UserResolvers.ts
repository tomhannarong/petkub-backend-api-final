
import { Resolver, Mutation, Arg, ObjectType, Field, Args } from "type-graphql";
import Sendgrid from '@sendgrid/mail'
import { PersonalInformation, User, UserModel} from "../entities/User";

Sendgrid.setApiKey(process.env.SENDGRID_API_KEY!)

@ObjectType()
export class ResponseMessage {
    @Field()
    message: string
}

@Resolver()
export class UserResolvers {
    
    @Mutation(() => User , {nullable: true})
    async updatePersonalInformation(
        
        @Args() personalInformation: PersonalInformation,
        @Arg('userId') userId: string,
        
        // @Ctx() {res} : AppContext
    ): Promise<User | null> {
        try {
            //validate Personal information
            if(!personalInformation.fname) throw new Error('fname is required.')
            if(!personalInformation.lname) throw new Error('lname is required.')
            if(!personalInformation.gender) throw new Error('gender is required.') 
            // if(!birthday) throw new Error('birthday is invalid.') 
            const user = UserModel.findById(userId)

            if (!user) throw new Error('User not found.')

            // Update personal information
            user.personalInformation = personalInformation ;

            await user.save()

            return user

        } catch (error) {
            throw error
        }
    }




}