import express from 'express'

import auth from './auth.route'
import profile from './profile.route'
import posts from './posts.route'

const router = express.Router()

router.use('/auth', auth)
router.use('/profile', profile)
router.use('/post', posts)

export default router
