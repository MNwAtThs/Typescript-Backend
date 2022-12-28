import { Schema, model } from 'mongoose'
import jwt from 'jsonwebtoken'

export const AvatarSizes = [800, 400, 200, 100]

export interface IPublicUser {
    username?: string
    avatar?: string
    avatarDescription?: AvatarDescription
}

export interface IUser extends IPublicUser {
    _id: string
    phonenumber: string
    tokens: [IUserToken]
    avatar?: string
    avatarPreview?: string
    needsOnboarding: () => [OnboardingProperty]
    generateJWT: () => Promise<string>
    asPublic: () => IPublicUser
}

export interface IUserToken {
    jwt: string
}

export enum OnboardingProperty {
    USERNAME = 'USERNAME',
    AVATAR = 'AVATAR',
}

export interface AvatarDescription {
    baseFilename: string
    sizes: {
        [size: number]: {
            filename: string
            url: string
        }
    }
}

const userSchema = new Schema<IUser>(
    {
        phonenumber: {
            type: String,
            required: true,
            unique: true,
        },
        username: {
            type: String,
            minlength: 3,
        },
        avatar: String,
        avatarPreview: String,
        tokens: {
            type: [
                {
                    jwt: {
                        type: String,
                        required: true,
                    },
                    createdAt: {
                        type: Date,
                        default: Date.now,
                        readonly: true,
                    },
                },
            ],
            default: [],
        },
    },
    { timestamps: true, versionKey: false }
)

userSchema.set('toJSON', {
    transform: function (_doc, ret, _opt) {
        delete ret.createdAt
        delete ret.updatedAt
        delete ret.tokens
        delete ret._id
        delete ret.avatar
        return ret
    },
    virtuals: true,
})

userSchema.set('toObject', { virtuals: true })

userSchema.virtual('needsOnboarding').get(function () {
    var needsOnboarding: [OnboardingProperty?] = []

    if (this.username == undefined) {
        needsOnboarding.push(OnboardingProperty.USERNAME)
    }

    if (this.avatar == undefined) {
        needsOnboarding.push(OnboardingProperty.AVATAR)
    }

    return needsOnboarding
})

userSchema.virtual('avatarDescription').get(function () {
    if (!this.avatar) {
        return undefined
    }

    const PUBLIC_IMAGE_URL = process.env.PUBLIC_IMAGE_URL!
    let self: IUser = this

    let sizes = AvatarSizes.reduce((obj, item) => {
        return {
            ...obj,
            [item]: {
                filename: `${self.avatar}_${item}.jpg`,
                url: `${PUBLIC_IMAGE_URL}/${self.avatar}_${item}.jpg`,
            },
        }
    }, {})

    return {
        baseFilename: self.avatar,
        baseURL: PUBLIC_IMAGE_URL + '/',
        sizes,
    }
})

userSchema.methods.asPublic = function (): IPublicUser {
    var copy = this.toJSON()
    delete copy.phonenumber
    delete copy.isOnboarded
    return copy
}

userSchema.methods.generateJWT = async function (): Promise<string> {
    const { JWT_SECRET } = process.env
    let signedToken = jwt.sign({ userId: this._id }, JWT_SECRET!)
    this.tokens.push({
        jwt: signedToken,
    })
    await this.save()
    return signedToken
}

const User = model<IUser>('User', userSchema)

export default User
