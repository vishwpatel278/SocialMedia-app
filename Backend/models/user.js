const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    email : {
        required : true,
        unique : true,
        type : String,
    },
    password : {
        required : true,
        type : String
    },
    roles : {
        type : String,
        enum : ['Admin','User'],
        default : 'User'
    },
    username : {
        type : String,
        unique : true,
        required : true
    },
    isPrivate : {
        type : Boolean,
        default : false
    },
    otp : String,
    otpExpiry : String,
    isVerified : Boolean,
    moreLikedVideos: {
        animal: {
            type: Number,
            default: 0
        },
        sports: {
            type: Number,
            default: 0
        },
        food: {
            type: Number,
            default: 0
        },
        travel: {
            type: Number,
            default: 0
        },
        technology: {
            type: Number,
            default: 0
        },
        education: {
            type: Number,
            default: 0
        },
        music: {
            type: Number,
            default: 0
        },
        other: {
            type: Number,
            default: 0
        }
    }

})

userSchema.pre('save', async function () {

    const person = this;

    if (!person.isModified('password')) {
        return;
    }

    try {

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(
            person.password,
            salt
        );

        person.password = hashPassword;

    } catch (err) {
        throw err;
    }
});

userSchema.methods.comparePassword = async function (candidatePassword) {
    try{
        const ismatch = await bcrypt.compare(candidatePassword,this.password);
        return ismatch;
    }catch(err){
        throw err;
    }
}

const User = mongoose.model('User',userSchema);

module.exports = User;