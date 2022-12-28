import { Request, Response, NextFunction } from 'express'

/**
 * An Error for API errors
 */
export class APIError extends Error {
    statusCode: number

    /**
     *
     * @param statusCode - the statusCode that will be returned by the API
     * @param message - the message that will be returned
     */
    constructor(statusCode: number, message?: string) {
        super(message ?? 'Something went wrong')
        this.statusCode = statusCode
        Object.setPrototypeOf(this, APIError.prototype)
    }
}

/**
 * An error middleware that handles and returns errors for API endpoints
 *
 * @param error - the error
 * @param request - express request
 * @param response - express response
 * @param next - express nextFunction
 */
const errorMiddleware = (
    error: Error,
    request: Request,
    response: Response,
    next: NextFunction
) => {
    if (error instanceof APIError) {
        return response.status(error.statusCode).json({
            status: error.statusCode,
            message: error.message,
        })
    }

    console.error(error)
    return response.status(500).json({
        status: 500,
        message: 'internal server error',
    })
}

export default errorMiddleware
