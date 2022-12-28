import { Schema, model, Types } from 'mongoose'
import moment from 'moment'

export interface IPost {
    user: Types.ObjectId
    title: string
}

const postSchema = new Schema<IPost>(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            populate: false,
        },
        title: {
            type: String,
            require: true,
        },
    },
    { timestamps: true, versionKey: false }
)

postSchema.index({ createdAt: 1 })

postSchema.set('toJSON', {
    transform: function (_doc, ret, _opt) {
        delete ret.createdAt
        delete ret.updatedAt
        delete ret._id
        return ret
    },
    virtuals: true,
})

const Post = model<IPost>('Post', postSchema)

export default Post
