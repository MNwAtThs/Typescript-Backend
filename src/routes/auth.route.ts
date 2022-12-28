import { Router } from 'express'
import validator, { ContainerType } from '../middlewares/validator.middleware'

import {
    phoneAuthSchema,
    phoneAuth,
    verifyPhoneSchema,
    verifyPhoneAuth,
} from '../controllers/auth.controller'

const router = Router()

router.post('/phone', validator(phoneAuthSchema, ContainerType.BODY), phoneAuth)

router.post(
    '/phone/verify',
    validator(verifyPhoneSchema, ContainerType.BODY),
    verifyPhoneAuth
)

export default router
