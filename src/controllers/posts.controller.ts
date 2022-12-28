import express from 'express'
import Joi from 'joi'
import Post from '../models/Post.model'

export const createPostSchema = Joi.object({
    title: Joi.string().required(),
})
export const createPost: express.Handler = async (req, res, next) => {
    const requser = req.user!

    let dbpost = new Post({
        title: 'test',
        user: requser,
    })

    await dbpost.save()

    const { user, ...post } = dbpost.toJSON()

    res.status(201).json({ user, post })
}
