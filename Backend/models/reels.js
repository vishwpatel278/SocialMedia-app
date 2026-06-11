const mongoose = require('mongoose');

const ReelsSchema = new mongoose.Schema({
    post : {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        required: true
    },

    videoUrl: {
        type: String,
        required: true
    },

    category: {
        type: String,
        enum: [
            "animal",
            "sports",
            "food",
            "travel",
            "technology",
            "education",
            "music",
            "other"
        ],
        default: "other"
    },

    // tags: [{
    //     type: String
    // }],
    caption : {
        type : String
    }
}, {
    timestamps: true
});

const Reels = mongoose.model('Reels',ReelsSchema);

module.exports = Reels;