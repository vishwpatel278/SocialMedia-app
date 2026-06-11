import React, { useEffect, useState } from "react";
import {
  House,
  Search,
  Clapperboard,
  User,
  SquarePlus,
  Settings,
  Bell,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import {
  profile,
  getFollowRequests,
} from "../utils/AuthUtils";

const Navbar = () => {

  const navigate = useNavigate();

  const [profilePic, setProfilePic] = useState("");

  const [userid, setUserid] = useState("");

  const [requestCount, setRequestCount] = useState(0);

  useEffect(() => {

    const fetchProfile = async () => {

      try {

        const response = await profile();

        const requestsResponse =
          await getFollowRequests();

        const pic = response?.data?.profilePicURL;

        setProfilePic(pic || "");

        setUserid(response?.data?.user);

        setRequestCount(
          requestsResponse?.data?.length || 0
        );

      } catch (e) {

        console.log(e);
      }
    };

    fetchProfile();

  }, []);

  return (
    <div className="fixed top-0 left-0 w-full bg-[#1e293b] border-b border-slate-700 z-50">

      <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-4">

        <h1
          className="text-3xl font-bold text-cyan-400 cursor-pointer"
          onClick={() => navigate("/")}
        >
          SocialApp
        </h1>

        <div className="flex items-center gap-6 text-white">

          <button
            className="hover:text-cyan-400 transition"
            onClick={() => navigate("/")}
          >
            <House className="w-7 h-7" />
          </button>

          <button
            className="hover:text-blue-400 transition"
            onClick={() => navigate("/search")}
          >
            <Search className="w-7 h-7" />
          </button>

          <button
            className="hover:text-pink-400 transition"
            onClick={() => navigate("/reels")}
          >
            <Clapperboard className="w-7 h-7" />
          </button>

          <button
            className="hover:text-yellow-400 transition"
            onClick={() => navigate("/post/createpost")}
          >
            <SquarePlus className="w-7 h-7" />
          </button>

          {/* Requests */}
          <button
            className="hover:text-red-400 transition relative"
            onClick={() => navigate("/requests")}
          >
            <Bell className="w-7 h-7" />

            {requestCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 rounded-full">
                {requestCount}
              </span>
            )}
          </button>

          <button
            className="hover:text-orange-400 transition"
            onClick={() => navigate("/settings")}
          >
            <Settings className="w-7 h-7" />
          </button>

          <button
            className="hover:text-green-400 transition"
            onClick={() =>
              navigate(`/profile`)
            }
          >
            {profilePic ? (
              <img
                src={profilePic}
                alt="profile"
                className="w-10 h-10 rounded-full object-cover border-2 border-cyan-400"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
            )}
          </button>

        </div>

      </div>

    </div>
  );
};

export default Navbar;