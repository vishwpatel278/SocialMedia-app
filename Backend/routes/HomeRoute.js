const express = require('express');
const {jwtAuthMiddleWare} = require('../jwt')

const router = express.Router();

const Profile = require('../models/profile');
const User = require('../models/user');
const Post = require('../models/posts');
const client = require('../cache/redis');
const { all } = require('axios');
const Reels = require('../models/reels');

router.get('/home-page',async (req ,res) => {
    try{
        const userid = req.user.id;

        if(!userid)return res.status(404).json("User Not Found!!!");

        const profile = await Profile.findOne({
            user : userid  
        })

        const following = profile.following;
        
        let allposts = [];

        // profile.visited = []
        // await profile.save()
        // return 
        
        let visitedPosts = profile.visited.map(
            item => item.post._id.toString()
        );

        for(let user of following){
            let posts = await Post.find({
                user: user,
                _id: {
                    $nin: visitedPosts
                },
            })
            .sort({ createdAt: -1 })
            .limit(8)
            .lean();

            posts = posts.filter(
                post =>
                    Date.now() - new Date(post.createdAt).getTime() <
                    60 * 24 * 60 * 60 * 1000
            );
            
            allposts = posts;
        }
        
        const twoMonthsAgo = new Date();

        twoMonthsAgo.setMonth(
            twoMonthsAgo.getMonth() - 2
        );

        profile.visited = profile.visited.filter(
            item => item.created_at > twoMonthsAgo
        );

        allposts.map(p => (
            visitedPosts.push(p._id.toString())
        ))

        const posts = await TrendingVideo(visitedPosts);

        let sortPost = [...allposts, ...posts]
            .sort((a, b) => b.score - a.score);

        sortPost.map(p => (
            profile.visited.push({
                post : p._id,
                created_at : p.createdAt
            })
        ))

        for(let i of sortPost){
            await Post.findByIdAndUpdate(
                i._id,
                {
                    $inc: { 
                        views: 1,
                        score: 1
                     }
                }
            );
        }
        await profile.save()

        if(sortPost.length==0){
            sortPost = await TrendingVideo2();
        }

        const postsWithUsername = await Promise.all(
            sortPost.map(async p => {
                const user = await User.findById(p.user);

                return {
                    ...p.toObject(),
                    username: user.username
                };
            })
        );
        
        return res.status(200).json(postsWithUsername)
        
    }catch(err){
        console.log(err.message);
    }
})

const TrendingVideo = async (visitedPosts) => {
    const publicUsers = await User.find({
            isPrivate: false
        }).select("_id");

        const publicUserIds = publicUsers.map(
            user => user._id.toString()
        );
        
        const posts = await Post.find({
            user: {
                $in: publicUserIds
            },
            _id : {
                $nin : visitedPosts
            }
        })
        .sort({ score: -1 }).limit(100);

        return posts;
}

const TrendingVideo2 = async () => {
    const publicUsers = await User.find({
            isPrivate: false
        }).select("_id");

        const publicUserIds = publicUsers.map(
            user => user._id.toString()
        );
        
        const posts = await Post.find({
            user: {
                $in: publicUserIds
            },
        })
        .sort({ score: -1 }).limit(100);

        return posts;
}

module.exports = router;