const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    comments: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
            },

            text: {
                type: String,
                required: true,
            },

            createdAt: {
                type: Date,
                default: Date.now,
            }
        }
    ],
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }
    ],
    postURL : {
        type : String,
        default : ""
    },
    mediaType: {
        type: String,
        enum: ["image", "video"],
        default: "image"
    },
    // cloudinaryType : {
    //     type : String,
    //     default : ""
    // },
    public_id : {
        type : String,
        default : ""
    },
    createdAt : {
        type : Date,
        default : Date.now
    },
    caption: {
        type: String,
        default : ""
    },
    score : {
        type : Number,
        default : 0
    },
    views : {
        type : Number,
        default : 0
    },
    PostType : {
        type : String
    }
})

const Post = mongoose.model('Post',postSchema);

module.exports = Post;