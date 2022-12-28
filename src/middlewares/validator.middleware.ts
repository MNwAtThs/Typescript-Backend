import Joi from 'joi'
import { Request, Response, NextFunction } from 'express'
import { APIError } from './error.middleware'

/**
 * the container type to validate in
 */
export enum ContainerType {
    BODY = 'body',
    QUERY = 'query',
    HEADERS = 'headers',
}

// custom message for failed validations
const messages = {
    'any.custom': 'Invalid value for key "{#key}"',
}

/**
 * Validator middleware
 *
 * @param schema - the schema to validate against
 * @param containerType - the container type e.g. BODY, QUERY, HEADERS
 * @returns express middleware
 */
const validator = (schema: Joi.Schema, containerType: ContainerType) => {
    // returns an express middleware
    return (request: Request, res: Response, next: NextFunction) => {
        // validate corresponding request parts
        var result
        switch (containerType) {
            case ContainerType.BODY:
                result = schema.validate(request.body, { messages: messages })
                break
            case ContainerType.QUERY:
                result = schema.validate(request.query)
                break
            case ContainerType.HEADERS:
                result = schema.validate(request.headers, {
                    allowUnknown: true,
                })
                break
        }

        // if error cancel
        if (result.error) {
            return next(new APIError(400, result.error.message))
        }

        // set the body to sanitized values
        switch (containerType) {
            case ContainerType.BODY:
                request.body = result.value
                break
            case ContainerType.QUERY:
                request.query = result.value
                break
            case ContainerType.HEADERS:
                request.header = result.value
                break
        }

        next()
    }
}

export default validator
