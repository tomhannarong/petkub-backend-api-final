import { Response } from 'express'

import { AppRequest } from '../types'
import { UserModel } from '../entities/User'
import { signAccessToken } from '../utils/tokenHandler'

const { FRONTEND_URI } = process.env

export const FBAuthenticate = async (req: AppRequest, res: Response) => {
  if (!req.userProfile) return

  const { id, emails, displayName, provider } = req.userProfile

  try {
    // Query user from the database
    const user = await UserModel.findOne({ facebookId: id })
    let token: string

    if (!user) {
      // New user --> create new user on our database
      const newUser = await UserModel.create({
        username: displayName,
        email: (emails && emails[0].value) || provider,
        facebookId: id,
        password: provider,
      })

      await newUser.save()

      // Create token
      token = signAccessToken(newUser.id, newUser.tokenVersion)

      console.log("Send token to the frontend", token)
      // Send token to the frontend
      // sendToken(res, token)

      // Redirect user to the frontend --> dashboard
      res.redirect(`${FRONTEND_URI}/dashboard`)
    } else {
      // Old user
      // Create token
      token = signAccessToken(user.id, user.tokenVersion)

      // Send token to the frontend
      // sendToken(res, token)

      // Redirect user to the frontend --> dashboard
      res.redirect(`${FRONTEND_URI}/dashboard`)
    }
  } catch (error) {
    res.redirect(FRONTEND_URI!)
  }
}

export const GoogleAuthenticate = async (req: AppRequest, res: Response) => {
  if (!req.userProfile) return

  const { id, emails, displayName, provider } = req.userProfile

  try {
    // Query user from the database
    const user = await UserModel.findOne({ googleId: id })
    let token: string

    if (!user) {
      // New user --> create new user on our database
      const newUser = await UserModel.create({
        username: displayName,
        email: (emails && emails[0].value) || provider,
        googleId: id,
        password: provider,
      })

      await newUser.save()

      // Create token
      token = signAccessToken(newUser.id, newUser.tokenVersion)

      console.log("Send token to the frontend", token)

      // Send token to the frontend
      // sendToken(res, token)

      // Redirect user to the frontend --> dashboard
      res.redirect(`${FRONTEND_URI}/dashboard`)
    } else {
      // Old user
      // Create token
      token = signAccessToken(user.id, user.tokenVersion)

      console.log("Send token to the frontend", token)
      // Send token to the frontend
      // sendToken(res, token)

      // Redirect user to the frontend --> dashboard
      res.redirect(`${FRONTEND_URI}/dashboard`)
    }
  } catch (error) {
    res.redirect(FRONTEND_URI!)
  }
}