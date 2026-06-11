const express = require('express');
const {jwtAuthMiddleWare} = require('../jwt')

const router = express.Router();

const Profile = require('../models/profile');
const User = require('../models/user');

router.get('/', async (req, res) => {

    try {

        const username = req.query.username;

        const users = await User.find({
            username: {
                $regex: username,
                $options: "i"
            }
        }).limit(10);

        const profiles = [];

        for (let user of users) {

            const profile = await Profile.findOne({
                user: user._id
            });

            const ans = await isFollowing(req.user.id,user._id);

            profiles.push({
                profile,
                username: user.username,
                isfollowing : ans
            });
        }

        return res.status(200).json(profiles);

    } catch (e) {

        console.log(e.message);

        return res.status(500).json({
            message: e.message
        });
    }
});

router.get('/account/:profileid', async (req, res) => {

    try {

        const profileid = req.params.profileid;

        const profile = await Profile.findById(profileid);

        const user = await User.findById(profile.user);

        return res.status(200).json({isPrivate  : user.isPrivate});

    } catch (e) {

        console.log(e.message);

        return res.status(500).json({
            message: e.message
        });
    }
});

const isFollowing = async (userid,profileid) => {
    const user = await User.findById(userid);

    if(userid.toString() === profileid.toString()){
        return null;
    }
    
    const profile = await Profile.findOne({
        user : userid
    })

    const follwinglist = profile.following

    for(let userID of follwinglist){
        if(userID.toString() === profileid.toString()){
            return 2;
        }
    }

    const profileUser = await User.findById(profileid);

    const userProfile = await Profile.findOne({user : profileUser});

    const requestlist = userProfile.followRequests

    for(let reqUser of requestlist){
        if(reqUser.toString() === userid.toString()){
            return 1; 
        }
    }

    return 0;
}

module.exports = {
    router,
    isFollowing
};