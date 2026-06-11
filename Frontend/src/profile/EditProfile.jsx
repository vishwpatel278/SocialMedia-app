import React, { useState } from "react";

import {
  uploadProfile,
  updateBio
} from "../utils/AuthUtils";

import Navbar from "../home/Navbar";

const EditProfile = () => {

  const [profilePic, setProfilePic] = useState(null);
  const [preview, setPreview] = useState("");
  const [bio, setBio] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle Image
  const handleImage = (e) => {

    const file = e.target.files[0];

    setProfilePic(file);

    if (file) {
      setPreview(URL.createObjectURL(file));
    }
  };

  // Save Profile
  const handleSave = async () => {

    try {

      setLoading(true);

      // Upload Profile Picture
      if (profilePic) {

        const formData = new FormData();

        formData.append("profile", profilePic);

        await uploadProfile(formData);
      }

      // Update Bio ONLY if bio is not empty
      if (bio.trim() !== "") {

        await updateBio(bio);
      }

      alert("Profile Updated Successfully");

    } catch (e) {

      console.log(e);

    } finally {

      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-[#0f172a] text-white pt-28 px-4 pb-10">

        <div className="max-w-2xl mx-auto bg-[#1e293b] border border-slate-700 rounded-3xl p-8 shadow-2xl">

          {/* Heading */}
          <h1 className="text-4xl font-bold text-cyan-400 mb-8 text-center">
            Edit Profile
          </h1>

          {/* Profile Preview */}
          <div className="flex justify-center mb-8">

            <img
              src={
                preview
                  ? preview
                  : "https://cdn-icons-png.flaticon.com/512/149/149071.png"
              }
              alt="profile"
              className="w-40 h-40 rounded-full border-4 border-cyan-400 object-cover"
            />

          </div>

          {/* Upload Image */}
          <div className="mb-6">

            <label className="block mb-2 text-lg font-semibold text-gray-300">
              Upload Profile Picture
            </label>

            <input
              type="file"
              accept="image/*"
              onChange={handleImage}
              className="w-full bg-[#0f172a] border border-slate-600 rounded-xl p-3 text-gray-300"
            />

          </div>

          {/* Bio */}
          <div className="mb-8">

            <label className="block mb-2 text-lg font-semibold text-gray-300">
              Bio
            </label>

            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Write your bio..."
              rows="5"
              className="w-full bg-[#0f172a] border border-slate-600 rounded-2xl p-4 outline-none focus:border-cyan-400 resize-none"
            />

          </div>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={loading || (!profilePic && bio.trim() === "")}
            className={`w-full py-4 rounded-2xl text-xl font-semibold transition ${
              loading || (!profilePic && bio.trim() === "")
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-cyan-500 hover:bg-cyan-600"
            }`}
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>

        </div>
      </div>
    </>
  );
};

export default EditProfile;