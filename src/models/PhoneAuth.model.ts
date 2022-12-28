import { Schema, model } from 'mongoose'
import moment from 'moment'

export interface IPhoneAuth {
    phonenumber: string
    code: string
    created: Date
    expires: Date
}

const phoneAuthSchema = new Schema<IPhoneAuth>(
    {
        phonenumber: {
            type: String,
            required: true,
            unique: true,
        },
        code: {
            type: String,
            default: () => {
                return Math.random().toString().slice(2, 8).toString()
            },
            minlength: 6,
            select: false,
        },
        expires: {
            type: Date,
            readonly: true,
            default: () => {
                return moment(Date.now()).add(5, 'minutes').toDate()
            },
        },
    },
    { timestamps: true, versionKey: false }
)

phoneAuthSchema.index({ createdAt: 1 }, { expireAfterSeconds: 300 })

phoneAuthSchema.set('toJSON', {
    transform: function (_doc, ret, _opt) {
        delete ret.code
        delete ret.createdAt
        delete ret.updatedAt
        delete ret._id
        return ret
    },
    virtuals: true,
})

const PhoneAuth = model<IPhoneAuth>('PhoneAuth', phoneAuthSchema)

export default PhoneAuth
