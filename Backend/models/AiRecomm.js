const mongoose = require('mongoose');

const AiSchema = new mongoose.Schema({
    user : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User'
    },
    interest : [
        {type : String}
    ]
})

const Ai = mongoose.model('AiRecomm',AiSchema);

module.exports = Ai;