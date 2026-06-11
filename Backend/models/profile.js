const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    profilePicURL : {
        type : String,
        default : ""
    },
    bio : {
        type : String,
        default : ""
    },
    followers: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }
    ],
    followRequests: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }
    ],
    following: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        }
    ],
    visited : [
        {
            post : {
                type : mongoose.Schema.Types.ObjectId,
                ref : "Post"
            },
            created_at : {
                type : Date,
                default : Date.now
            }
        }
    ],
    
})

const Profile = mongoose.model('Profile',profileSchema);

module.exports = Profile;