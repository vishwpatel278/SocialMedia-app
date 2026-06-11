import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MoreVertical, Trash2 } from "lucide-react";
import { deletePost } from "../utils/AuthUtils";

import {
  profile,
  getFollowers,
  getFollowing,
  getPosts,
  removeFollower,
  likePost,
  getComments,
  addComment,
  getLikes,
  getAccountPrivacy,
  followUser,
  unfollowUser,
  sendFollowRequest,
  cancelFollowRequest,
} from "../utils/AuthUtils";

import {
  Grid3X3,
  Users,
  UserPlus,
  Edit,
  Heart,
  MessageCircle,
  Search,
  X,
} from "lucide-react";

import Navbar from "../home/Navbar";
import socket from "../utils/socket";
import { getUserId, deleteComment } from "../utils/AuthUtils";

const Profile = () => {

  const navigate = useNavigate();

  const [openMenu, setOpenMenu] = useState(null);

  const [userdata, setUserdata] = useState(null);

  const [followers, setFollowers] = useState([]);

  const [following, setFollowing] = useState([]);

  const [posts, setPosts] = useState([]);

  const [activeTab, setActiveTab] = useState("posts");

  const [loading, setLoading] = useState(true);

  // comments modal
  const [showComments, setShowComments] = useState(false);

  const [comments, setComments] = useState([]);

  const [commentText, setCommentText] = useState("");

  const [selectedPostId, setSelectedPostId] = useState("");

  const [currentUserId, setCurrentUserId] = useState("");
  // ================= FETCH PROFILE =================

  useEffect(() => {

    const fetchProfile = async () => {

      try {

        const profileResponse = await profile();

        const followersResponse = await getFollowers();

        const followingResponse = await getFollowing();

        const postsResponse = await getPosts();

        setUserdata(profileResponse.data);

        setFollowers(followersResponse.data);

        setFollowing(followingResponse.data);

        setPosts(postsResponse.data);

      } catch (e) {

        console.log(e);

      } finally {

        setLoading(false);

      }
    };

    fetchProfile();

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
const handleDeleteComment = async (
  username,
  commentid
) => {

  try {

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
            comments: (
              post.comments || []
            ).filter(
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
  const handleDeletePost = async (postid) => {

    try {

      await deletePost(postid);

      setPosts((prev) =>
        prev.filter(
          (post) => post._id !== postid
        )
      );

      setOpenMenu(null);

    } catch (e) {

      console.log(e);
    }
  };
  // ================= FOLLOW / REMOVE =================

  const handleFollow = async (e, userid, profileid, type) => {
  e.stopPropagation();

  try {

    // Followers Tab
    if (type === "followers") {

        await removeFollower(userid);

        setFollowers((prev) =>
          prev.filter(
            (follower) =>
              String(follower.user._id) !== String(userid)
          )
        );

        return;
      }

    // Following Tab
    const currentUser = following.find(
      (user) => String(user.user._id) === String(userid)
    );

    let newStatus = currentUser?.isfollowing;

    if (currentUser?.isfollowing === 0) {

      const response = await getAccountPrivacy(profileid);

      const isPrivate = response?.data?.isPrivate;

      if (isPrivate) {

        await sendFollowRequest(userid);

        newStatus = 1;

      } else {

        await followUser(userid);

        newStatus = 2;
      }

    } else if (currentUser?.isfollowing === 1) {

      await cancelFollowRequest(userid);

      newStatus = 0;

    } else if (currentUser?.isfollowing === 2) {

      await unfollowUser(userid);

      newStatus = 0;
    }

    setFollowing((prev) =>
      prev.map((follow) =>
        String(follow.user._id) === String(userid)
          ? {
              ...follow,
              isfollowing: newStatus,
            }
          : follow
      )
    );

  } catch (e) {

    console.log(e);
  }
};

  // ================= LIKE POST =================

  const handleLike = async (postid) => {

  try {

    // add like
    await likePost(postid);

    // get updated likes count
    const likesResponse = await getLikes(postid);

      const updatedLikesCount = likesResponse.data;

      // update frontend instantly
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
useEffect(() => {

  socket.on(
    "new-comment",
    (comment) => {

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
                  _id: comment._id,
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

    socket.off("new-comment");

  };

}, []);

const closeComments = () => {

  socket.emit(
    "leave-post",
    selectedPostId
  );

  socket.disconnect();

  setShowComments(false);

};
// ================= GET COMMENTS =================

  const handleComments = async (postid) => {

  try {

    if (!socket.connected) {
      socket.connect();
    }

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

  } catch (e) {

    console.log(e);

  }

};

  // ================= ADD COMMENT =================

  const handleAddComment = async () => {

  if (!commentText.trim()) return;

  try {

    await addComment(
      selectedPostId,
      commentText
    );

    setCommentText("");

  } catch (e) {

    console.log(e);

  }

};

  // ================= LOADING =================

  if (loading) {

    return (

      <div className="h-screen flex items-center justify-center bg-[#0f172a]">

        <div className="text-cyan-400 text-2xl font-semibold">
          Loading Profile...
        </div>

      </div>
    );
  }

  const profileData = userdata?.profile;

  const profilePic =
    profileData?.profilePicURL &&
    profileData.profilePicURL !== ""
      ? profileData.profilePicURL
      : "https://cdn-icons-png.flaticon.com/512/149/149071.png";

  return (

    <>
      <Navbar />

      <div className="min-h-screen bg-[#0f172a] text-white pt-28 pb-10 px-4">

        <div className="max-w-5xl mx-auto">

          {/* PROFILE */}
          <div className="bg-[#1e293b] border border-slate-700 rounded-3xl p-8 shadow-xl">

            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">

              {/* Image */}
              <img
                src={profilePic}
                alt="profile"
                className="w-36 h-36 rounded-full border-4 border-cyan-400 object-cover"
              />

              {/* Details */}
              <div className="flex-1">

                <div className="flex items-center gap-4 flex-wrap">

                  <h1 className="text-4xl font-bold text-cyan-400">
                    @{userdata.username}
                  </h1>

                  <button
                    onClick={() =>
                      navigate("/profile/edit-profile")
                    }
                    className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 px-4 py-2 rounded-xl transition"
                  >

                    <Edit className="w-4 h-4" />

                    Edit Profile

                  </button>

                </div>

                {/* Bio */}
                <p className="text-gray-300 mt-4 text-lg">

                  {profileData?.bio &&
                  profileData.bio !== ""
                    ? profileData.bio
                    : "No bio added yet."}

                </p>

                {/* Stats */}
                <div className="flex gap-10 mt-6">

                  <div className="text-center">

                    <h2 className="text-2xl font-bold text-cyan-400">
                      {posts.length}
                    </h2>

                    <p className="text-gray-400 text-sm">
                      Posts
                    </p>

                  </div>

                  <div className="text-center">

                    <h2 className="text-2xl font-bold text-pink-400">
                      {followers.length}
                    </h2>

                    <p className="text-gray-400 text-sm">
                      Followers
                    </p>

                  </div>

                  <div className="text-center">

                    <h2 className="text-2xl font-bold text-green-400">
                      {following.length}
                    </h2>

                    <p className="text-gray-400 text-sm">
                      Following
                    </p>

                  </div>

                </div>

              </div>

            </div>

          </div>

          {/* TABS */}
          <div className="mt-8 bg-[#1e293b] border border-slate-700 rounded-2xl p-4">

            <div className="flex justify-around">

              <button
                onClick={() => setActiveTab("posts")}
                className={`flex items-center gap-2 font-semibold transition ${
                  activeTab === "posts"
                    ? "text-cyan-400"
                    : "text-gray-400"
                }`}
              >

                <Grid3X3 className="w-5 h-5" />

                Posts

              </button>

              <button
                onClick={() => setActiveTab("followers")}
                className={`flex items-center gap-2 font-semibold transition ${
                  activeTab === "followers"
                    ? "text-cyan-400"
                    : "text-gray-400"
                }`}
              >

                <Users className="w-5 h-5" />

                Followers

              </button>

              <button
                onClick={() => setActiveTab("following")}
                className={`flex items-center gap-2 font-semibold transition ${
                  activeTab === "following"
                    ? "text-cyan-400"
                    : "text-gray-400"
                }`}
              >

                <UserPlus className="w-5 h-5" />

                Following

              </button>

            </div>

          </div>

          {/* COMMENTS MODAL */}
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

                {/* Comments */}
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
                    onChange={(e) =>
                      setCommentText(e.target.value)
                    }
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

          {/* CONTENT */}
          <div className="mt-8">

            {/* POSTS */}
            {activeTab === "posts" && (

              posts.length === 0 ? (

                <div className="text-center text-gray-400 py-16">

                  <Grid3X3 className="w-16 h-16 mx-auto mb-4 opacity-50" />

                  <h2 className="text-2xl font-semibold">
                    No Posts Yet
                  </h2>

                </div>

              ) : (

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                  {posts.map((post) => (

  <div
    key={post._id}
    className="bg-[#1e293b] border border-slate-700 rounded-2xl overflow-hidden relative"
  >

    {/* Top Bar */}
    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700">

      <h3 className="font-semibold text-cyan-400">
        @{userdata.username}
      </h3>

      <div className="relative">

        <button
          onClick={() =>
            setOpenMenu(
              openMenu === post._id
                ? null
                : post._id
            )
          }
          className="p-1 rounded-full hover:bg-slate-700 transition"
        >

          <MoreVertical className="w-5 h-5" />

        </button>

        {openMenu === post._id && (

          <div className="absolute right-0 top-10 bg-[#0f172a] border border-slate-700 rounded-xl shadow-lg z-20 min-w-[150px]">

            <button
              onClick={() =>
                handleDeletePost(post._id)
              }
              className="w-full flex items-center gap-2 px-4 py-3 text-red-400 hover:bg-slate-800 transition"
            >

              <Trash2 className="w-4 h-4" />

              Delete Post

            </button>

          </div>

        )}

      </div>

    </div>

    {/* Media */}
    {post.mediaType === "video" ? (

      <video
        controls
        className="w-full h-[300px] object-cover"
      >

        <source
          src={post.postURL}
          type="video/mp4"
        />

      </video>

    ) : (

      <img
        src={post.postURL}
        alt="post"
        className="w-full h-[300px] object-cover"
      />

    )}

    {/* Caption */}
    <div className="p-4">

      <p className="text-gray-300 mb-4">
        {post.caption}
      </p>

      <div className="flex items-center gap-6 text-sm text-gray-400">

        <button
          onClick={() =>
            handleLike(post._id)
          }
          className="flex items-center gap-2 hover:text-red-500 transition"
        >

          <Heart className="w-5 h-5 text-red-500" />

          {post.likes.length}

        </button>

        <button
          onClick={() =>
            handleComments(post._id)
          }
          className="flex items-center gap-2 hover:text-cyan-400 transition"
        >

          <MessageCircle className="w-5 h-5 text-cyan-400" />

          {post.comments.length}

        </button>

      </div>

    </div>

  </div>

))}

                </div>

              )
            )}

            {/* FOLLOWERS */}
            {activeTab === "followers" && (

              <div className="grid gap-4">

                {followers.length === 0 ? (

                  <div className="text-center text-gray-400 py-10">
                    No Followers Found
                  </div>

                ) : (

                  followers.map((follower, index) => (

                    <div
                      key={index}
                      onClick={() => {

                        if (
                          follower.isfollowing === null
                        ) {

                          navigate("/profile");

                        } else {

                          navigate(
                            `/profile/${follower.user._id}`
                          );
                        }
                      }}
                      className="bg-[#1e293b] border border-slate-700 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:border-cyan-400 transition"
                    >

                      {/* Left */}
                      <div className="flex items-center gap-4">

                        <img
                          src={
                            follower.profilePicURL &&
                            follower.profilePicURL !== ""
                              ? follower.profilePicURL
                              : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                          }
                          alt="profile"
                          className="w-14 h-14 rounded-full object-cover"
                        />

                        <div>

                          <h2 className="text-lg font-semibold">
                            {follower.user.username}
                          </h2>

                          <p className="text-gray-400 text-sm">
                            {follower.user.email}
                          </p>

                        </div>

                      </div>

                      {/* Button */}
                      {follower.isfollowing !== null && (

                        <button
                          onClick={(e) =>
                            handleFollow(
                              e,
                              follower.user._id,
                              null,
                              "followers"
                            )
                          }
                          className="px-5 py-2 rounded-lg font-semibold bg-red-500 hover:bg-red-600 text-white transition"
                        >

                          Remove

                        </button>

                      )}

                    </div>

                  ))
                )}

              </div>
            )}

            {/* FOLLOWING */}
            {activeTab === "following" && (

              <div className="grid gap-4">

                {following.length === 0 ? (

                  <div className="text-center text-gray-400 py-10">
                    No Following Found
                  </div>

                ) : (

                  following.map((follow, index) => (

                    <div
                      key={index}
                      onClick={() => {

                        if (
                          follow.isfollowing === null
                        ) {

                          navigate("/profile");

                        } else {

                          navigate(
                            `/profile/${follow.user._id}`
                          );
                        }
                      }}
                      className="bg-[#1e293b] border border-slate-700 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:border-pink-400 transition"
                    >

                      {/* Left */}
                      <div className="flex items-center gap-4">

                        <img
                          src={
                            follow.profilePicURL &&
                            follow.profilePicURL !== ""
                              ? follow.profilePicURL
                              : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                          }
                          alt="profile"
                          className="w-14 h-14 rounded-full object-cover"
                        />

                        <div>

                          <h2 className="text-lg font-semibold">
                            {follow.user.username}
                          </h2>

                          <p className="text-gray-400 text-sm">
                            {follow.user.email}
                          </p>

                        </div>

                      </div>

                      {/* Button */}
                      {follow.isfollowing !== null && (

                        <button
                          onClick={(e) =>
                            handleFollow(
                              e,
                              follow.user._id,
                              follow.profile?._id,
                              "following"
                            )
                          }
                          className={`px-5 py-2 rounded-lg font-semibold transition ${
                            follow.isfollowing === 2
                              ? "bg-slate-600 hover:bg-slate-500 text-white"
                              : follow.isfollowing === 1
                              ? "bg-transparent border border-slate-500 text-white hover:bg-slate-700"
                              : "bg-cyan-500 hover:bg-cyan-400 text-black"
                          }`}
                        >

                         {follow.isfollowing === 2
                            ? "Following"
                            : follow.isfollowing === 1
                            ? "Requested"
                            : "Follow"}

                        </button>

                      )}

                    </div>

                  ))
                )}

              </div>
            )}

          </div>

        </div>

      </div>

    </>
  );
};

export default Profile;