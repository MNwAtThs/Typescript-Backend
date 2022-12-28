import { Request, Response, NextFunction, Handler } from 'express'
import Joi from 'joi'
import { APIError } from './error.middleware'
import jwt from 'jsonwebtoken'
import User from '../models/User.model'

// get JWT secret from environment variables
const { JWT_SECRET } = process.env

/**
 * The JWT payload of a Bearer Token
 */
export interface AuthJwt extends jwt.JwtPayload {
    userId: string
}

/**
 * A Joi schema to check the headers against
 */
const headerSchema = Joi.object({
    authorization: Joi.string().required().trim(),
})

/**
 * A default error for unauthorized access
 */
export const UnauthorizedError = new APIError(
    401,
    'Unauthorized: "authorization" header missing or invalid'
)

/**
 * An authentication middleware that handles use authentication by Bearer Token
 *
 * @param request - express request
 * @param response - express response
 * @param next - express nextFunction
 */
const authMiddleware: Handler = async (
    request: Request,
    response: Response,
    next: NextFunction
) => {
    // validate headers
    let validation = headerSchema.validate(request.headers, {
        allowUnknown: true,
    })

    // respond with error if validation failed
    if (validation.error) {
        return next(UnauthorizedError)
    }

    // respond with error if authorization field does not exist in headers
    const { authorization } = request.headers
    if (!authorization) {
        return next(UnauthorizedError)
    }

    // respond with error if authorization property is no a valid Bearer Token
    if (!authorization.startsWith('Bearer ')) {
        return next(UnauthorizedError)
    }

    // extract token
    const token = authorization.substring(7, authorization.length)

    try {
        // verify token
        const verify = jwt.verify(token, JWT_SECRET!) as AuthJwt

        // get user from database
        let user = await User.findById(verify.userId)

        // abort if user does not exist in database
        if (!user) {
            return next(UnauthorizedError)
        }

        // attach user from database to rquest
        request.user = user

        // continue normally
        next()
    } catch {
        // if error occured while verifying, abort and respond with unauthorized error
        return next(UnauthorizedError)
    }
}

export default authMiddleware
