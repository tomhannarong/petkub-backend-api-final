import { config } from 'dotenv'
config()

import mongoose from 'mongoose'

import express from 'express'
import createServer from './createServer'
import passport from 'passport'
import { PassportFB, PassportGoogle } from './passport'
import { FBAuthenticate, GoogleAuthenticate } from './passport/socialMediaAuth'

const {
    PORT, DB_USER, DB_PASSWORD, DB_ENDPOINT, DB_NAME, FACEBOOK_CALLBACK_ROUTE, GOOGLE_CALLBACK_ROUTE, FRONTEND_URI,
} = process.env

PassportFB()
PassportGoogle()

const startServer = async () => {
    try {
        // Connect to the database
        await mongoose.connect(`mongodb+srv://${DB_USER}:${DB_PASSWORD}@${DB_ENDPOINT}/${DB_NAME}?retryWrites=true&w=majority`, 
        {useCreateIndex: true ,useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false})

        const app = express()

        // Facebook login route
        app.get('/auth/facebook', passport.authenticate('facebook'))

        // SET Facebook developer
        // menu Products -> Settings -> Valid OAuth Redirect URIs
        // Facebook callback route
        app.get(
            FACEBOOK_CALLBACK_ROUTE!,
            passport.authenticate('facebook', {
            session: false,
            failureRedirect: FRONTEND_URI,
            scope: ['profile', 'email'],
        }),
            FBAuthenticate
        )

        // Google login route
        app.get(
            '/auth/google',
            passport.authenticate('google', { scope: ['profile', 'email'] })
        )
  
        // Google callback route
        app.get(
            GOOGLE_CALLBACK_ROUTE!,
            passport.authenticate('google', {
            session: false,
            failureRedirect: FRONTEND_URI,
            }),
            GoogleAuthenticate
        )

        const server = await createServer()

        server.applyMiddleware({ app, cors: { origin: FRONTEND_URI, credentials: true}})

        app.listen({port: PORT}, () => {
            console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
        })
    } catch (error) {
        console.log(error)
    }
}
startServer()