const express = require('express');
const {jwtAuthMiddleWare} = require('../jwt')

const router = express.Router();

const multer = require('multer');
const Upload = require('../helper/upload');
const Profile = require('../models/profile');
const User = require('../models/user');
const {isFollowing} = require('./SearchRoutes');

var uploader = multer({
    storage : multer.diskStorage({}),
    limits : {fileSize : 500000}
});


router.post('/upload-profile', uploader.single("profile"), async (req, res) => {
    try {

        const userid = req.user.id;

        const profile = await Profile.findOne({
            user: userid
        });

        if (!profile) {
            return res.status(404).json({
                message: "Profile not found"
            });
        }

        const upload = await Upload.uploadfile(req.file.path);
        
        profile.profilePicURL = upload.secure_url;

        await profile.save();

        res.status(200).json({
            message: "Profile picture updated successfully",
            profile
        });

    } catch (err) {
        console.log(err);

        res.status(500).json({
            message: "Server Error"
        });
    }
});

router.post('/update-bio', async (req, res) => {
    try {
        const userid = req.user.id;
        const profile = await Profile.findOne({
            user: userid
        });
        if (!profile) {
            return res.status(404).json({
                message: "Profile not found"
            });
        }
        profile.bio = req.body.bio;

        await profile.save();

        res.status(200).json({
            message: "Bio updated successfully",
            profile
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Server Error"
        });
    }
});

router.delete('/followers/:follower_id', async (req, res) => {
    try {
        const follower_id= req.params.follower_id;
        const userid = req.user.id;

        const profile = await Profile.findOne({
            user: userid
        });

        const followrs_profile = await Profile.findOne({
            user: follower_id
        });

        if (!profile) {
            return res.status(404).json({
                message: "Profile not found"
            });
        }

        if (!followrs_profile) {
            return res.status(404).json({
                message: "Profile not found"
            });
        }

        const follower_user = await User.findById(follower_id);
        const user = await User.findById(userid);

        profile.followers.remove(follower_user);
        followrs_profile.following.remove(user);

        // profile.followers.push(follower_user);
        // followrs_profile.following.push(user);

        await profile.save();
        await followrs_profile.save();

        res.status(200).json({
            message: "followers updated successfully",
            profile
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Server Error"
        });
    }
});

router.put('/following/:following_id', async (req, res) => {
    try {
        const following_id= req.params.following_id;
        const userid = req.user.id;

        const profile = await Profile.findOne({
            user: userid
        });

        const following_profile = await Profile.findOne({
            user: following_id
        });

        if (!profile) {
            return res.status(404).json({
                message: "Profile not found"
            });
        }

        if (!following_profile) {
            return res.status(404).json({
                message: "Following Profile not found"
            });
        }

        
        const following_user = await User.findById(following_id);
        const user = await User.findById(userid);

        profile.following.push(following_user);
        following_profile.followers.push(user);
        
        
        await profile.save();
        await following_profile.save();

        res.status(200).json({
            message: "following updated successfully",
            profile
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Server Error"
        });
    }
});

router.delete('/following/:following_id', async (req, res) => {
    try {
        const following_id= req.params.following_id;
        const userid = req.user.id;

        const profile = await Profile.findOne({
            user: userid
        });

        const following_profile = await Profile.findOne({
            user: following_id
        });

        if (!profile) {
            return res.status(404).json({
                message: "Profile not found"
            });
        }

        if (!following_profile) {
            return res.status(404).json({
                message: "Following Profile not found"
            });
        }

        
        const following_user = await User.findById(following_id);
        const user = await User.findById(userid);

        profile.following.remove(following_user);
        following_profile.followers.remove(user);
        
        await profile.save();
        await following_profile.save();

        res.status(200).json({
            message: "following updated successfully",
            profile
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Server Error"
        });
    }
});

router.put('/following/request/:following_id', async (req, res) => {
    try {
        const following_id= req.params.following_id;
        const userid = req.user.id;

        const profile = await Profile.findOne({
            user: userid
        });

        const following_profile = await Profile.findOne({
            user: following_id
        });

        if (!profile) {
            return res.status(404).json({
                message: "Profile not found"
            });
        }

        if (!following_profile) {
            return res.status(404).json({
                message: "Following Profile not found"
            });
        }

        const user = await User.findById(userid);

        following_profile.followRequests.push(user);
        
        await profile.save();
        await following_profile.save();

        res.status(200).json({
            message: "following updated successfully",
            profile
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Server Error"
        });
    }
});

router.delete('/following/request/:following_id', async (req, res) => {
    try {
        const following_id= req.params.following_id;
        const userid = req.user.id;

        const profile = await Profile.findOne({
            user: userid
        });

        const following_profile = await Profile.findOne({
            user: following_id
        });

        if (!profile) {
            return res.status(404).json({
                message: "Profile not found"
            });
        }

        if (!following_profile) {
            return res.status(404).json({
                message: "Following Profile not found"
            });
        }

        const user = await User.findById(userid);

        following_profile.followRequests.remove(user);
        
        await profile.save();
        await following_profile.save();

        res.status(200).json({
            message: "following updated successfully",
            profile
        });

    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Server Error"
        });
    }
});

router.get('/requests',async (req,res) => {
    try{
        const userid = req.user.id

        const user = await User.findById(userid);

        const profile = await Profile.findOne({
            user : user
        })

        if(!profile)res.status(404).json({message : "profile not found!!!"})

        const requests = []
        for(let user of profile.followRequests){
            const u = await User.findById(user);
            requests.push(u)
        }
        return res.status(200).json(requests);

    }catch(e){
        console.log(err);
        res.status(500).json({
            message: "Server Error"
        });
    }
})

router.get('/following', async (req, res) => {
    try {
        const userid = req.user.id;

        const user = await User.findById(userid)

        const profile = await Profile.findOne({
            user : userid
        })
        
        if(!profile){
            res.status(404).json({
                message: "profile not found!!!",
                profile
            });
        }
        
        let allusers = [];
        for(let userId of profile.following){
            const user = await User.findById(userId);
            const profile = await Profile.findOne({
                user : user
            })
            const ans = await isFollowing(userid,userId)
            allusers.push({user,profilePicURL : profile.profilePicURL,isfollowing : ans});
        }

        res.status(200).json(allusers);

    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Server Error"
        });
    }
});

router.get('/followers', async (req, res) => {
    try {
        const userid = req.user.id;

        const profile = await Profile.findOne({
            user : userid
        })
        
        if(!profile){
            res.status(404).json({
                message: "profile not found!!!",
                profile
            });
        }

        let allusers = [];
        for(let userId of profile.followers){
            const user = await User.findById(userId);
            const profile = await Profile.findOne({
                user : user
            })
            const ans = await isFollowing(userid,userId)
            allusers.push({user,profilePicURL : profile.profilePicURL,isfollowing : ans});
        }

        res.status(200).json(allusers);

    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Server Error"
        });
    }
});

router.get('/', async (req, res) => {
    try {
        const userid = req.user.id;

        const profile = await Profile.findOne({
            user : userid
        })
        
        const user = await User.findById(userid);

        if(!profile){
            res.status(404).json({
                message: "profile not found!!!",
                profile
            });
        }

        res.status(200).json({profile,username : user.username});

    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Server Error"
        });
    }
});

router.get('/profile/:id', async (req, res) => {
    try {
        const userid = req.params.id;

        const profile = await Profile.findOne({
            user : userid
        })
        
        const user = await User.findById(userid);
        
        if(!profile){
            res.status(404).json({
                message: "profile not found!!!",
                profile
            });
        }

        const isfollowing = await isFollowing(req.user.id,userid);
        res.status(200).json({profile,username : user.username,isfollowing : isfollowing});

    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Server Error"
        });
    }
});

router.get('/following/:userId', async (req, res) => {
    try {
        const person_id = req.params.userId;
        const userid = req.user.id;

        const profile = await Profile.findOne({
            user: userid
        });

        const person_profile = await Profile.findOne({
            user: person_id
        });

        if (!profile) {
            return res.status(404).json({
                message: "Profile not found"
            });
        }

        if (!person_profile) {
            return res.status(404).json({
                message: "Following Profile not found"
            });
        }

        
        const person_user = await User.findById(person_id);
        
        if(person_user.isPrivate){
            let isFollow = false;

            for(let user of person_user.following){
                if(userid === user){
                    isFollow = true;
                    break;
                }
            }

            if(isFollow){
                let allusers = [];
                for(let userid of person_profile.following){
                    const user = await User.findById(userid);
                    const profile = await Profile.findOne({
                        user : user
                    })
                    allusers.push({user,profilePicURL : profile.profilePicURL});
                }
                return res.status(200).json(allusers)
            }
            else return res.status(403).json({message : "access denied"})
        }

        else{
            let allusers = [];
                for(let userid of person_profile.following){
                    const user = await User.findById(userid);
                    const profile = await Profile.findOne({
                        user : user
                    })
                    allusers.push({user,profilePicURL : profile.profilePicURL});
                }
            return res.status(200).json(allusers)
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Server Error"
        });
    }
});

router.get('/followers/:userId', async (req, res) => {
    try {
        const person_id = req.params.userId;
        const userid = req.user.id;

        const profile = await Profile.findOne({
            user: userid
        });

        const person_profile = await Profile.findOne({
            user: person_id
        });

        if (!profile) {
            return res.status(404).json({
                message: "Profile not found"
            });
        }

        if (!person_profile) {
            return res.status(404).json({
                message: "Following Profile not found"
            });
        }
        
        const person_user = await User.findById(person_id);

        if(person_user.isPrivate){
            let isFollow = false;

            for(let user of person_user.followers){
                if(userid === user){
                    isFollow = true;
                    break;
                }
            }

            if(isFollow){
                let allusers = [];
                for(let userid of person_profile.followers){
                    const user = await User.findById(userid);
                    const profile = await Profile.findOne({
                        user : user
                    })
                    allusers.push({user,profilePicURL : profile.profilePicURL});
                }
                return res.status(200).json(allusers)
            }
            else return res.status(403).json({message : "access denied"})
        }

        else{
            let allusers = [];
                for(let userid of person_profile.followers){
                    const user = await User.findById(userid);
                    const profile = await Profile.findOne({
                        user : user
                    })
                    allusers.push({user,profilePicURL : profile.profilePicURL});
                }
            return res.status(200).json(allusers)
        }
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: "Server Error"
        });
    }
});

const isuserAvailable = async (userid,arr) => {
    for(let user of arr){
        if(userid === user._id.toString()){
            return true;
        }
    }
    return false;
}

router.get('/follow-request',async (req,res) => {
    try{
        const userid = req.user.id;
        const user = await User.findById(userid);
        const profile = await Profile.findOne({
            user : user
        })
        if(!profile){
            return res.status(404).json("profile not found")
        }

        return res.status(200).json(profile.followRequests)
    }catch(e){
        return res.status(500).json("internal server error")
    }
})

router.post('/request/:userid',async (req,res) => {
    try{
        const id = req.user.id;
        const flag = req.body.flag;
        const userid = req.params.userid
        
        const user = await User.findById(userid);

        const iam = await User.findById(id);
        
        const iamprofile = await Profile.findOne({
            user : iam
        })

        const userProfile = await Profile.findOne({
            user : user
        })

        if(flag){
            iamprofile.followers.push(user);
            userProfile.following.push(iam)
        }

        iamprofile.followRequests.remove(user)

        await iamprofile.save();
        await userProfile.save();
        
        return res.status(200).json({message : "request updated successfully"})
    }catch(e){
        return res.status(500).json("internal server error")
    }
})

module.exports = router;