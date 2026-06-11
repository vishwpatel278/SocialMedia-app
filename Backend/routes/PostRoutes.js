const express = require('express');
const {jwtAuthMiddleWare} = require('../jwt')

const router = express.Router();

const multer = require('multer');
const Upload = require('../helper/upload');
const Profile = require('../models/profile');
const User = require('../models/user');
const Post = require('../models/posts');
const Reels = require('../models/reels');
const predict = require('../cache/Ai');

var uploader = multer({
    storage : multer.diskStorage({}),
    limits : {fileSize : 50000000000}
});

router.post(
  "/upload-post",
  uploader.single("postPic"),
  async (req, res) => {

    try {

      const userid = req.user.id;

      const caption = req.body.caption;

      if (!req.file) {
        return res.status(400).json("No file uploaded");
      }

      const filepath = req.file.path;

      const mediaType = req.file.mimetype.startsWith("video")
        ? "video"
        : "image";

      const user = await User.findById(userid);

      // let upload = null;

      const upload = await Upload.uploadfile(filepath);

      // Upload to cloudinary

      // if (user.isPrivate) {

      //   upload = await Upload.uploadfileForPrivate(filepath);

      // } else {

      //   upload = await Upload.uploadfile(filepath);

      // }

      if (!upload.secure_url) {
        return res.status(500).json("Upload failed");
      }

      // Create post
      const post = new Post({

        user: userid,

        caption: caption,

        postURL: upload.secure_url,

        public_id : upload.public_id,
        
        mediaType: mediaType,

        cloudinaryType : upload.type
      });

      if (!user.isPrivate && post.mediaType === "video") {
          try {
              const category = predict(post.caption);

              await Reels.create({
                  category : category,
                  post: post._id,
                  videoUrl : post.postURL,
                  caption : post.caption
              });

          } catch (err) {
              console.error("Video categorization failed:", err);
          }
      }

      await post.save();

      return res.status(200).json({
        message: "Post uploaded successfully",
        post,
      });

    } catch (e) {

      console.log(e);

      return res.status(500).json({
        message: e.message,
      });

    }
  }
);

router.get('/get-posts',async (req,res) => {
    try{
        const userid = req.user.id;

        const posts = await Post.find({
            user : userid
        })

        return res.status(200).json(posts);

    }catch(e){
        console.log(e.message);
    }
})

router.get('/posts/:id',async (req,res) => {
    try{
        const postuserid = req.params.id;

        const userid = req.user.id;

        const postuser = await User.findById(postuserid);

        if(postuser.isPrivate){
            const postuserProfile = await Profile.findOne({
                user : postuser
            })

            let isFollow = false;
            for(let id of postuserProfile.followers){
                if(id===userid){
                    isFollow = true;
                    break;
                }
            }

            if(isFollow){
                const posts = await Post.find({
                    user : postuserid
                })
                return res.status(200).json(posts);
            }
            else return res.status(403).json("access denied!!!");
        }
        const posts = await Post.find({
            user : postuserid
        })

        return res.status(200).json(posts);

    }catch(e){
        console.log(e.message);
    }
})

router.get('/get-comments/:postid',async (req,res) => {
    try{
        const postid = req.params.postid;

        const post = await Post.findById(postid)

        let arr = []
        for(let user of post.comments){
          const userc = await User.findOne(user.user);
          arr.push({user,username : userc.username});
        }

        return res.status(200).json({
            comments : arr,
        });
        
    }catch(e){
        console.log(e.message);
    }
})

router.put('/like/:postid',async (req,res) => {
    try{
        const userid = req.user.id;
        const postid = req.params.postid;

        const post = await Post.findById(postid)

        let flag = 0;
        for(let id of post.likes){
          // console.log(id);
          // console.log(userid);
          if(id.toString() === userid){
            post.likes.remove(userid);
            flag = 1;
            break;
          }
        }

        if(!flag)post.likes.push(userid);
        
        const category = predict(post.caption)

        await User.findByIdAndUpdate(
            userid,
            {
                $inc: {
                    [`moreLikedVideos.${category}`]: 1
                }
            }
        );

        post.score = (post.likes.length * 2) + (post.comments.length * 3) + (post.views);

        await post.save();

        return res.status(200).json({
            message : 'like added successfully',
            likes : post.likes.length
        });
        
    }catch(e){
        console.log(e.message);
    }
})

router.get('/reels', async (req, res) => {

    try {

        const userId = req.user.id;

        const limit = 20;
        const skip = (Number(req.query.skip) || 0) * limit;

        const user = await User.findById(userId);

        const categories = user.moreLikedVideos;

        const favoriteCategory = Object.keys(categories).reduce(
            (a, b) =>
                categories[a] > categories[b]
                    ? a
                    : b
        );

        // Favorite category reels
        const favoriteReels = await Reels.find({
            category: favoriteCategory
        }).populate("post");

        const favoritePostIds = favoriteReels.map(
            reel => reel.post._id
        );

        // Other reels
        const otherPosts = await Post.find({
            mediaType: "video",
            _id: { $nin: favoritePostIds }
        })
        .sort({ score: -1 });

        const finalReels = [
            ...favoriteReels.map(
                reel => reel.post
            ),
            ...otherPosts
        ];


        const paginatedReels = finalReels.slice(
            skip,
            skip + limit
        );

        const profile = await Profile.findOne({
          user : user
        })

        // profile.visited = []

        // await profile.save();
        const VisitedPost = profile.visited.map(
            item => item.post._id.toString()
        );
        
        const filteredReels = paginatedReels.filter(
            post => !VisitedPost.includes(
                post._id.toString()
            )
        );

        filteredReels.map(reels => (
          profile.visited.push({
            post : reels.post,
          })
        ))

        await profile.save();

        for(let i of filteredReels){
          await Post.findByIdAndUpdate(
            i.post,
            {
              $inc : {
                views : 1,
                score : 1
              }
            }
          )
        }

        if(filteredReels.length === 0 ){
          const reelsWithUsername = await Promise.all(
              paginatedReels.map(async (reel) => {

                  const user = await User.findById(
                      reel.user
                  );

                  return {
                      ...reel.toObject(),
                      username: user?.username
                  };

              })
          );
          return res.status(200).json(
              reelsWithUsername
          );
        }
        
        const reelsWithUsername = await Promise.all(
              filteredReels.map(async (reel) => {

                  const user = await User.findById(
                      reel.user
                  );

                  return {
                      ...reel.toObject(),
                      username: user?.username
                  };

              })
          );
        return res.status(200).json(
            reelsWithUsername
        );

    } catch (e) {

        console.log(e.message);

        return res.status(500).json({
            message: "Internal Server Error"
        });

    }
});

router.post('/comments/:postid', async (req, res) => {

    try {

        const userid = req.user.id;
        const postid = req.params.postid;
        const text = req.body.text;

        const post = await Post.findById(postid);
        const user = await User.findById(userid);

        if (!post) {

            return res.status(404).json({
                message: "post not found",
            });

        }

        post.comments.push({
            user: userid,
            text: text
        });

        post.score =
            (post.likes.length * 2) +
            (post.comments.length * 3) +
            post.views;

        await post.save();

        const addedComment =
            post.comments[
                post.comments.length - 1
            ];

        const io = req.app.get("io");

        io.to(postid).emit(
            "new-comment",
            {
                _id: addedComment._id,
                username: user.username,
                userId: userid,
                text: addedComment.text,
                createdAt: addedComment.createdAt,
                postid
            }
        );

        return res.status(200).json({
            message: "comment added successfully",
        });

    } catch (e) {

        console.log(e.message);

    }

});

router.delete('/comments/:postid',async (req,res) => {
    try{
        const userid = req.user.id;
        const postid = req.params.postid;
        const commentUsername = req.body.username
        const commentid = req.body.id

        const post = await Post.findById(postid)
        const user = await User.findById(userid);

        if(commentUsername != user.username)return res.status(403).json({mesage : "request denied..."})

        if(!post){
          return res.status(404).json({
            message : "post not found",
          });
        }
        post.comments.pull({_id : commentid})

        post.score = (post.likes.length * 2) + (post.comments.length * 3) + (post.views);

        await post.save();

        return res.status(200).json({
          message : "comment deleted successfully",
        });
        
    }catch(e){
        console.log(e.message);
    }
})

router.get('/likes/:postid',async (req,res) => {
    try{
        const postid = req.params.postid;

        const post = await Post.findById(postid)

        if(!post){
          return res.status(404).json({
            message : "post not found",
          });
        }

        return res.status(200).json(post.likes.length);
        
    }catch(e){
        console.log(e.message);
    }
})

router.delete('/:postid',async (req,res) => {
    try{
        const postid = req.params.postid;

        const id = req.user.id

        const post = await Post.findByIdAndDelete(postid)

        if(!post){
          return res.status(404).json({
            message : "post not found",
          });
        }

        if(post.user._id.toString() === id){
            if(post.public_id){
              await Upload.deletePost(post.public_id,post.mediaType)
            }
            else{
              return res.status(500).json({
                message : "internal error",
              });
            }
        }
        else{
          return res.status(403).json("forbidden");
        }

        return res.status(200).json("post deleted successfully");
        
    }catch(e){
        console.log(e.message);
    }
})

module.exports = router;