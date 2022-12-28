import { Handler } from 'express'
import Joi from 'joi'
import { UnauthorizedError } from '../middlewares/auth.middleware'
import { APIError } from '../middlewares/error.middleware'
import User from '../models/User.model'
import fsPromises from 'fs/promises'
import { v4 as uuidv4 } from 'uuid'
import sharp from 'sharp'

export const patchUsernameSchema = Joi.object({
    username: Joi.string().trim().required().min(3),
})

export const patchUsername: Handler = async (req, res, next) => {
    const { user } = req
    if (!user) {
        return next(UnauthorizedError)
    }

    const { username } = req.body

    let dbUser = await User.findByIdAndUpdate(
        user._id,
        { username },
        { new: true }
    )

    res.json(dbUser)
}

export const patchAvatarSchema = Joi.object({
    'content-type': Joi.string().required().equal('application/octet-stream'),
    'content-length': Joi.number().required(),
})
export const patchAvatar: Handler = async (req, res, next) => {
    const { user } = req
    if (!user) {
        return next(UnauthorizedError)
    }

    const filename = uuidv4()
    const path = `${__dirname}/../public/images`
    const filepath = `${path}/${filename}`

    try {
        await fsPromises.mkdir(path, { recursive: true })

        const finishedHandler = async (err: Error) => {
            if (err) {
                return next(new APIError(400, 'invalid file'))
            }
            let sizes = [800, 400, 200, 100]
            let p = sizes.map((size) => {
                return sharp(`${filepath}_tmp.jpg`)
                    .resize(size, size, { fit: 'cover' })
                    .toFormat('jpg')
                    .toFile(`${filepath}_${size}.jpg`)
            })

            const b64buffer = await sharp(`${filepath}_tmp.jpg`)
                .resize(20, 20, { fit: 'cover' })
                .blur(40)
                .toBuffer()

            await Promise.all(p)
            await fsPromises.rm(`${filepath}_tmp.jpg`)

            let dbUser = await User.findById(user._id)
            if (!dbUser) {
                return next(UnauthorizedError)
            }

            // delete old
            let toDelete = Object.values(
                dbUser.avatarDescription?.sizes ?? {}
            ).map((size) => {
                return fsPromises.rm(`${path}/${size.filename}`)
            })

            try {
                await Promise.all(toDelete)
            } catch {
                // already deleted
            }

            // set and save new avatar
            dbUser.avatar = `${filename}`
            dbUser.avatarPreview = b64buffer.toString('base64')
            await dbUser.save()

            res.status(201).json(dbUser)
        }

        let transformer = sharp()
            .toFormat('jpg')
            .toFile(`${filepath}_tmp.jpg`, finishedHandler)

        req.pipe(transformer)
    } catch {
        await fsPromises.rm(filepath)
        next(new APIError(400, 'invalid file'))
    }
}

export default {
    patchUsername,
    patchAvatar,
}
