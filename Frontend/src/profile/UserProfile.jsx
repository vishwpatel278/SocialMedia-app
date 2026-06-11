import React, { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import {
  getProfileById,
  getPostsById,
  getAccountPrivacy,
  followUser,
  unfollowUser,
  sendFollowRequest,
  cancelFollowRequest
} from "../utils/AuthUtils";

import {
  Grid3X3,
  Heart,
  MessageCircle
} from "lucide-react";

import Navbar from "../home/Navbar";

const UserProfile = () => {

  const { id } = useParams();

  const [userdata, setUserdata] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchUserProfile = async () => {

      try {

        const profileResponse = await getProfileById(id);

        const postsResponse = await getPostsById(id);

        setUserdata(profileResponse.data);

        setPosts(postsResponse.data);

      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();

  }, [id]);

  // Follow / Unfollow
  const handleFollow = async () => {

  try {

    let newStatus = userdata?.isfollowing;

    // Follow
    if (userdata?.isfollowing === 0) {

      const response = await getAccountPrivacy(
        userdata?.profile?._id
      );

      const isPrivate = response?.data?.isPrivate;

      if (isPrivate) {

        await sendFollowRequest(id);

        newStatus = 1;

      } else {

        await followUser(id);

        newStatus = 2;
      }
    }

    // Cancel Request
    else if (userdata?.isfollowing === 1) {

      await cancelFollowRequest(id);

      newStatus = 0;
    }

    // Unfollow
    else if (userdata?.isfollowing === 2) {

      await unfollowUser(id);

      newStatus = 0;
    }

    setUserdata((prev) => ({
      ...prev,
      isfollowing: newStatus,
      profile: {
        ...prev.profile,
        followers:
          newStatus === 2 && prev.isfollowing !== 2
            ? [...prev.profile.followers, "temp"]
            : newStatus === 0 && prev.isfollowing === 2
            ? prev.profile.followers.slice(0, -1)
            : prev.profile.followers,
      },
    }));

  } catch (e) {

    console.log(e);
  }
};

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

          {/* Profile */}
          <div className="bg-[#1e293b] border border-slate-700 rounded-3xl p-8 shadow-xl">

            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">

              {/* Profile Image */}
              <img
                src={profilePic}
                alt="profile"
                className="w-36 h-36 rounded-full border-4 border-cyan-400 object-cover"
              />

              {/* Details */}
              <div className="flex-1">

                <div className="flex items-center justify-between flex-wrap gap-4">

                  <h1 className="text-4xl font-bold text-cyan-400">
                    @{userdata.username}
                  </h1>

                  {/* Follow Button */}
                  {userdata?.isfollowing !== null && (

  <button
    onClick={handleFollow}
    className={`px-6 py-2 rounded-xl font-semibold transition ${
      userdata?.isfollowing === 2
        ? "bg-slate-600 hover:bg-slate-500 text-white"
        : userdata?.isfollowing === 1
        ? "bg-transparent border border-slate-500 text-white hover:bg-slate-700"
        : "bg-cyan-500 hover:bg-cyan-400 text-black"
    }`}
  >

    {userdata?.isfollowing === 2
      ? "Following"
      : userdata?.isfollowing === 1
      ? "Requested"
      : "Follow"}

  </button>

)}

                </div>

                {/* Bio */}
                <p className="text-gray-300 mt-4 text-lg">
                  {profileData?.bio || "No bio added yet."}
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
                      {profileData?.followers?.length || 0}
                    </h2>

                    <p className="text-gray-400 text-sm">
                      Followers
                    </p>
                  </div>

                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-green-400">
                      {profileData?.following?.length || 0}
                    </h2>

                    <p className="text-gray-400 text-sm">
                      Following
                    </p>
                  </div>

                </div>

              </div>
            </div>
          </div>

          {/* Posts */}
          <div className="mt-10">

            {posts.length === 0 ? (

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
                    className="bg-[#1e293b] border border-slate-700 rounded-2xl overflow-hidden"
                  >

                    {/* Image */}
                    <img
                      src={post.postURL}
                      alt="post"
                      className="w-full h-[300px] object-cover"
                    />

                    {/* Content */}
                    <div className="p-4">

                      <p className="text-gray-300 mb-4">
                        {post.caption}
                      </p>

                      <div className="flex items-center gap-6 text-sm text-gray-400">

                        <div className="flex items-center gap-2">
                          <Heart className="w-5 h-5 text-red-500" />
                          {post.likes.length}
                        </div>

                        <div className="flex items-center gap-2">
                          <MessageCircle className="w-5 h-5 text-cyan-400" />
                          {post.comments.length}
                        </div>

                      </div>
                    </div>
                  </div>

                ))}

              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default UserProfile;