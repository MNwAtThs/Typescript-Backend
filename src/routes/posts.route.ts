import { Router } from 'express'
import validator, { ContainerType } from '../middlewares/validator.middleware'

import { createPostSchema, createPost } from '../controllers/posts.controller'
import authMiddleware from '../middlewares/auth.middleware'

const router = Router()

router.post(
    '/',
    authMiddleware,
    validator(createPostSchema, ContainerType.BODY),
    createPost
)

export default router
