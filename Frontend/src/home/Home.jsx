import React, { useEffect, useState } from "react";

import {
  homepage,
  likePost,
  getComments,
  addComment,
  getLikes,
  isLogin,
  deleteComment,
  getUserId,
} from "../utils/AuthUtils";

import {
  Heart,
  MessageCircle,
  Bookmark,
  Send,
  MoreHorizontal,
  Search,
  X,
} from "lucide-react";

import socket from "../utils/socket";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";

const Home = () => {

  const navigate = useNavigate();

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // comments modal
  const [showComments, setShowComments] = useState(false);

  const [comments, setComments] = useState([]);

  const [commentText, setCommentText] = useState("");

  const [selectedPostId, setSelectedPostId] = useState("");

  const [currentUserId, setCurrentUserId] = useState("");
  // ================= FETCH POSTS =================

  useEffect(() => {

    const checkLogin = async () => {
    const ans = await isLogin();

    if (!ans) {
      navigate("/api/login");
    }
  };

    checkLogin();

    fetchHomePage();

  }, []);

  useEffect(() => {

  const fetchUserId = async () => {

    try {

      const userid = await getUserId();

      setCurrentUserId(userid);

    } catch (e) {

      console.log(e);

    }

  };

  fetchUserId();

}, []);

  useEffect(() => {

  socket.on(
    "new-comment",
    (comment) => {

      console.log(
      "New Comment Received:",
      comment
    );
      setComments((prev) => [
  ...prev,
  {
    username: comment.username,
    user: {
      _id: comment._id,
      user: comment.userId,
      text: comment.text,
      createdAt: comment.createdAt
    }
  }
]);

      setPosts((prevPosts) =>
        prevPosts.map((post) => {

          if (
            post._id === comment.postid
          ) {

            return {

              ...post,

              comments: [
                ...(post.comments || []),
                {
                  text: comment.text
                }
              ]

            };

          }

          return post;

        })
      );

    }
  );

  return () => {

    socket.off(
      "new-comment"
    );

  };

}, []);
  const fetchHomePage = async () => {

    try {

      const response = await homepage();

      setPosts(response.data);

    } catch (e) {

      console.log(e);

    } finally {

      setLoading(false);

    }
  };

  // ================= LIKE POST =================

  const handleDeleteComment = async (
  username,
  commentid
) => {

  try {

    console.log(commentid)
    await deleteComment(
      selectedPostId,
      username,
      commentid
    );

    setComments((prev) =>
      prev.filter(
        (comment) =>
          comment.user?._id !== commentid
      )
    );

    setPosts((prevPosts) =>
      prevPosts.map((post) => {

        if (post._id === selectedPostId) {

          return {
            ...post,
            comments: (post.comments || []).filter(
              (comment) =>
                comment._id !== commentid
            ),
          };
        }

        return post;

      })
    );

  } catch (e) {

    console.log(e);

  }

};
  const handleLike = async (postid) => {

  try {

    // like post
    await likePost(postid);

    // get updated likes count
    const likesResponse = await getLikes(postid);

    const updatedLikesCount = likesResponse.data;

    // update frontend
    setPosts((prevPosts) =>
      prevPosts.map((post) => {

        if (post._id === postid) {

          return {
            ...post,
            likes: new Array(updatedLikesCount).fill("liked"),
          };
        }

        return post;
      })
    );

  } catch (e) {

    console.log(e);
  }
};

  // ================= GET COMMENTS =================

  const handleComments = async (postid) => {

    socket.connect();

    socket.emit(
        "join-post",
        postid
    );

    const response =
        await getComments(postid);

    setComments(
        response.data.comments || []
    );

    setSelectedPostId(postid);

    setShowComments(true);
};

const closeComments = () => {

    socket.emit(
        "leave-post",
        selectedPostId
    );

    socket.disconnect();

    setShowComments(false);
};

  // ================= ADD COMMENT =================

  const handleAddComment = async () => {

  if (!commentText.trim()) return;

  try {

    await addComment(
      selectedPostId,
      commentText
    );

    console.log("Current User ID:", currentUserId);
    setCommentText("");

  } catch (e) {

    console.log(e);

  }

};

  // ================= LOADING =================

  if (loading) {

    return (

      <div className="h-screen flex items-center justify-center bg-[#0f172a]">

        <div className="text-2xl font-semibold text-cyan-400">
          Loading...
        </div>

      </div>
    );
  }

  return (

    <div className="min-h-screen bg-[#0f172a] text-white">

      {/* ================= NAVBAR ================= */}

      <div className="fixed top-0 left-0 w-full bg-[#1e293b] border-b border-slate-700 z-50">

        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">

          {/* Logo */}
          <h1 className="text-3xl font-bold text-cyan-400">
            SocialApp
          </h1>

          {/* Search */}
          <div className="hidden md:flex items-center bg-[#0f172a] px-4 py-2 rounded-xl w-[300px]">

            <Search className="w-5 h-5 text-gray-400" />

            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent outline-none px-3 w-full text-sm"
            />

          </div>

          <Navbar />

        </div>

      </div>

      {/* ================= COMMENTS MODAL ================= */}

      {showComments && (

        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">

          <div className="bg-[#1e293b] w-[400px] max-h-[600px] rounded-2xl p-5 flex flex-col">

            {/* Top */}
            <div className="flex items-center justify-between mb-5">

              <h2 className="text-xl font-bold">
                Comments
              </h2>

              <X
                  className="cursor-pointer"
                  onClick={closeComments}
              />

            </div>

            {/* Comments List */}
<div className="flex-1 overflow-y-auto">

  {comments.length === 0 ? (

    <p className="text-gray-400">
      No Comments
    </p>

  ) : (

    comments.map((comment, index) => (

      <div
        key={index}
        className="border-b border-slate-700 py-3 flex justify-between items-start"
      >

        <div>

          <p className="text-cyan-400 font-semibold text-sm mb-1">
            {comment.username || "User"}
          </p>

          <p className="text-gray-300 text-sm">
            {comment.user?.text}
          </p>

          <p className="text-xs text-gray-500 mt-1">
            {
              new Date(
                comment.user?.createdAt
              ).toLocaleDateString()
            }
          </p>

        </div>

        {comment.user?.user === currentUserId && (

          <button
            onClick={() =>
              handleDeleteComment(
                comment.username,
                comment.user?._id
              )
            }
            className="text-red-400 hover:text-red-500 text-sm font-semibold"
          >
            Delete
          </button>

        )}

      </div>

    ))
  )}

</div>
            {/* Add Comment */}
            <div className="mt-4 flex gap-2">

              <input
                type="text"
                placeholder="Add comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="flex-1 bg-[#0f172a] px-3 py-2 rounded-lg outline-none text-white"
              />

              <button
                onClick={handleAddComment}
                className="bg-cyan-500 hover:bg-cyan-600 px-4 py-2 rounded-lg font-semibold"
              >
                Send
              </button>

            </div>

          </div>

        </div>
      )}

      {/* ================= POSTS ================= */}

      <div className="pt-28 pb-10 px-4">

        <div className="max-w-3xl mx-auto flex flex-col gap-8">

          {posts.map((post) => {

            // detect video
            const isVideo =
              post.postURL?.includes(".mp4") ||
              post.postURL?.includes(".webm") ||
              post.postURL?.includes(".ogg");

            return (

              <div
                key={post._id}
                className="bg-[#1e293b] rounded-2xl overflow-hidden border border-slate-700"
              >

                {/* Top */}
                <div onClick={() => navigate(`/profile/${post.user}`)} className="flex items-center justify-between p-4">

                  <div className="flex items-center gap-3">

                    <img
                      src={`https://ui-avatars.com/api/?name=${post.username}&background=0D8ABC&color=fff`}
                      alt="profile"
                      className="w-12 h-12 rounded-full"
                    />

                    <div>

                      <h2 className="font-semibold text-lg">
                        {post.username}
                      </h2>

                      <p className="text-xs text-gray-400">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </p>

                    </div>

                  </div>

                  <MoreHorizontal className="w-5 h-5 text-gray-400 cursor-pointer" />

                </div>

                {/* Media */}
                {isVideo ? (

                  <video
                    src={post.postURL}
                    controls
                    autoPlay
                    muted
                    loop
                    className="w-full h-[450px] object-cover bg-black"
                  />

                ) : (

                  <img
                    src={post.postURL}
                    alt="post"
                    className="w-full h-[450px] object-cover"
                  />

                )}

                {/* Bottom */}
                <div className="p-4">

                  {/* Icons */}
                  <div className="flex justify-between items-center mb-4">

                    <div className="flex gap-4">

                      <Heart
                        onClick={() => handleLike(post._id)}
                        className="w-6 h-6 cursor-pointer hover:text-red-500 transition"
                      />

                      <MessageCircle
                        onClick={() => handleComments(post._id)}
                        className="w-6 h-6 cursor-pointer hover:text-cyan-400 transition"
                      />

                      <Send className="w-6 h-6 cursor-pointer hover:text-green-400 transition" />

                    </div>

                    <Bookmark className="w-6 h-6 cursor-pointer hover:text-yellow-400 transition" />

                  </div>

                  {/* Stats */}
                  <div className="flex gap-5 text-sm mb-3">

                    <p>
                      <span className="font-bold text-cyan-400">
                        {post.likes?.length || 0}
                      </span>{" "}
                      Likes
                    </p>

                    <p>
                      <span className="font-bold text-pink-400">
                        {post.comments?.length || 0}
                      </span>{" "}
                      Comments
                    </p>

                  </div>

                  {/* Caption */}
                  <p className="text-gray-300 text-sm leading-relaxed">

                    <span className="font-semibold text-cyan-300 mr-2">
                      caption :
                    </span>

                    {post.caption}

                  </p>

                </div>

              </div>
            );
          })}

        </div>

      </div>

    </div>
  );
};

export default Home;