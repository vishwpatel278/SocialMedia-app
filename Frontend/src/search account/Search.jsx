import React, { useState } from "react";
import Navbar from "../home/Navbar";
import {
  getProfile,
  getAccountPrivacy,
  followUser,
  unfollowUser,
  sendFollowRequest,
  cancelFollowRequest,
} from "../utils/AuthUtils";
import { useNavigate } from "react-router-dom";

const Search = () => {
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e) => {
    const value = e.target.value;

    setSearch(value);

    if (value.trim() === "") {
      setUsers([]);
      return;
    }

    try {
      setLoading(true);

      const response = await getProfile(value);

      if (response) {
        setUsers(response.data);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (e, userid, profileid) => {
    e.stopPropagation();

    try {
      const currentUser = users.find(
        (u) => String(u?.profile?.user) === String(userid)
      );

      let newStatus = currentUser?.isfollowing;

      // Follow
      if (currentUser?.isfollowing === 0) {
        const response = await getAccountPrivacy(profileid);

        const isPrivate = response?.data?.isPrivate;

        if (isPrivate) {
          await sendFollowRequest(userid);
          newStatus = 1; // Requested
        } else {
          await followUser(userid);
          newStatus = 2; // Following
        }
      }

      // Cancel Request
      else if (currentUser?.isfollowing === 1) {
        await cancelFollowRequest(userid);
        newStatus = 0;
      }

      // Unfollow
      else if (currentUser?.isfollowing === 2) {
        await unfollowUser(userid);
        newStatus = 0;
      }

      setUsers((prev) =>
        prev.map((user) =>
          String(user?.profile?.user) === String(userid)
            ? {
                ...user,
                isfollowing: newStatus,
              }
            : user
        )
      );
    } catch (e) {
      console.log(e);
    }
  };

  const handleProfileNavigation = (user) => {
    if (user?.isfollowing === null) {
      navigate("/profile");
    } else {
      navigate(`/profile/${String(user?.profile?.user)}`);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">
      <Navbar />

      <div className="pt-28 max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">
          Search Users
        </h1>

        <div className="bg-[#1e293b] p-4 rounded-2xl border border-slate-700">
          <input
            type="text"
            placeholder="Search account..."
            value={search}
            onChange={handleSearch}
            className="w-full bg-transparent outline-none text-white text-lg"
          />
        </div>

        {loading && (
          <p className="mt-4 text-gray-400">
            Searching...
          </p>
        )}

        <div className="mt-6 flex flex-col gap-4">
          {users.length > 0 ? (
            users.map((user) => (
              <div
                key={user?.profile?._id}
                onClick={() => handleProfileNavigation(user)}
                className="bg-[#1e293b] p-4 rounded-xl flex items-center justify-between hover:bg-slate-700 transition cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={
                      user?.profile?.profilePicURL
                        ? user.profile.profilePicURL
                        : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                    }
                    alt="profile"
                    className="w-14 h-14 rounded-full object-cover"
                  />

                  <div>
                    <h2 className="font-semibold text-lg">
                      {user?.username}
                    </h2>

                    <p className="text-gray-400 text-sm">
                      {user?.profile?.bio || "No Bio"}
                    </p>
                  </div>
                </div>

                {user?.isfollowing !== null && (
                  <button
                    onClick={(e) =>
                      handleFollow(
                        e,
                        String(user?.profile?.user),
                        String(user?.profile?._id)
                      )
                    }
                    className={`px-5 py-2 rounded-lg font-semibold transition ${
                      user?.isfollowing === 2
                        ? "bg-slate-600 hover:bg-slate-500 text-white"
                        : user?.isfollowing === 1
                        ? "bg-transparent border border-slate-500 text-white hover:bg-slate-700"
                        : "bg-cyan-500 hover:bg-cyan-400 text-black"
                    }`}
                  >
                    {user?.isfollowing === 2
                      ? "Following"
                      : user?.isfollowing === 1
                      ? "Requested"
                      : "Follow"}
                  </button>
                )}
              </div>
            ))
          ) : (
            search &&
            !loading && (
              <p className="text-gray-400 mt-4">
                No users found
              </p>
            )
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;