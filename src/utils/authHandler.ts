import { UserModel } from "../entities/User"
import { AppRequest } from "../types"

export const isAuthenticated = async (req: AppRequest) =>{

    // console.log(req)

    if(!req?.userId) throw new Error('Please log in to proceed')  

    // Query user from database
    const user = await UserModel.findById(req.userId)

    if(!user) throw new Error('User not authenticated.') 

    // Check if token version is valid
    if(req.tokenVersion != user.tokenVersion) throw new Error('Not authenticated.') 

    return user

}