import express from 'express'
import validator, { ContainerType } from '../middlewares/validator.middleware'
import authMiddleware from '../middlewares/auth.middleware'

import onboardingController, {
    patchAvatarSchema,
    patchUsernameSchema,
} from '../controllers/profile.controller'

const router = express.Router()
router.use(authMiddleware)

router.patch(
    '/username',
    validator(patchUsernameSchema, ContainerType.BODY),
    onboardingController.patchUsername
)

router.patch(
    '/avatar',
    validator(patchAvatarSchema, ContainerType.HEADERS),
    onboardingController.patchAvatar
)

export default router
