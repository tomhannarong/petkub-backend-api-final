import { AuthenticationError } from "apollo-server-errors"
import { UserModel } from "../entities/User"
import { AppRequest } from "../types"

export const isAuthenticated = async (req: AppRequest) =>{

    if(!req?.userId) throw new AuthenticationError('Please log in to proceed') 

    // Query user from database
    const user = await UserModel.findById(req.userId)
    
    if(!user) throw new AuthenticationError('User not authenticated.')

    // Check if token version is valid
    if(req.tokenVersion != user.tokenVersion) throw new AuthenticationError('Not authenticated.')
 
    return user
}