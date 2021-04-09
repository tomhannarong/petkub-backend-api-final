import { AppContext } from './types/index';
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from 'type-graphql'
import { AuthResolvers } from "./resolvers/AuthResolvers";
import { verifyAcessToken } from "./utils/tokenHandler";
import { UserResolvers } from './resolvers/UserResolvers';
import { PetTypeResolvers } from './resolvers/PetTypeResolvers';

export default async () => {
    const schema = await buildSchema({
        resolvers: [AuthResolvers, UserResolvers, PetTypeResolvers],
        dateScalarMode: "timestamp",
        emitSchemaFile: { path: './src/schema.graphql' },
        validate: false
    })
    return new ApolloServer({
        schema,
        context: async ({ req, res }: AppContext) => {

            // Check token from Headers 
            const token = req.headers.authorization || ''

            if (token) {
                try {
                    const parsedToken = token.split(' ')[1]
                    //varify token 
                    const decodedAcessToken = verifyAcessToken(parsedToken) as {
                        userId: string,
                        tokenVersion: number,
                        iat: number,
                        exp: number
                    } | null

                    if (decodedAcessToken) {
                        req.userId = decodedAcessToken.userId
                        req.tokenVersion = decodedAcessToken.tokenVersion
                    }
                } catch (error) {
                    req.userId = undefined
                    req.tokenVersion = undefined
                }

            }
            return { req, res }
        },
    })
}
