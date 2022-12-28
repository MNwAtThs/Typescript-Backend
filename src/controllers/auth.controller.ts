import express from 'express'
import { APIError } from '../middlewares/error.middleware'
import Joi from 'joi'
import { MongoServerError } from 'mongodb'
import PhoneService from '../services/phoneService'
import PhoneAuth from '../models/PhoneAuth.model'
import User from '../models/User.model'

/**
 * a Joi schema that validates a phoneAuth request
 */
export const phoneAuthSchema = Joi.object({
    phonenumber: Joi.string()
        .trim()
        .required()
        .custom((value) => {
            if (PhoneService.validate(value)) {
                return PhoneService.format(value)
            }
            throw Error()
        }),
})

/**
 * PhoneAuth handler
 * @param req - Express request
 * @param res - Express response
 * @param next - Exporess nextFunction
 */
export const phoneAuth: express.Handler = async (req, res, next) => {
    // check if phone number is in body & valid
    const { phonenumber } = req.body

    let phoneAuth = new PhoneAuth({
        phonenumber: phonenumber,
    })

    try {
        await phoneAuth.save()

        await PhoneService.sendVerificationSMS(
            phoneAuth.code,
            phoneAuth.phonenumber
        )

        res.status(200).json(phoneAuth)
    } catch (error) {
        if (error instanceof MongoServerError && error.code === 11000) {
            return next(new APIError(429, 'too many requests'))
        }
        console.error(error)
        next(error)
    }
}

export const verifyPhoneSchema = Joi.object({
    id: Joi.string().hex().length(24),
    code: Joi.string().required().length(6),
})

export const verifyPhoneAuth: express.Handler = async (req, res, next) => {
    const { id, code } = req.body
    let phoneAuth = await PhoneAuth.findOne({ _id: id, code: code })
    if (!phoneAuth) {
        return next(new APIError(400, 'Invalid code or id'))
    }
    var isNew = false
    let user = await User.findOne({ phonenumber: phoneAuth.phonenumber })
    if (!user) {
        isNew = true
        user = new User({
            phonenumber: phoneAuth.phonenumber,
        })
        await user.save()
    }

    await phoneAuth.delete()
    let jwt = await user.generateJWT()

    res.status(isNew ? 201 : 200).json({
        user,
        jwt,
    })
}
