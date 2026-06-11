import React, { useState } from "react";
import Navbar from "../home/Navbar";
import { uploadPost } from "../utils/AuthUtils";

const CreatePost = () => {

  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(null);
  const [fileType, setFileType] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImage = (e) => {

    const file = e.target.files[0];

    setImage(file);

    if (file.type.startsWith("image")) {
      setFileType("image");
    } else if (file.type.startsWith("video")) {
      setFileType("video");
    }
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    if (!caption || !image) {
      alert("Please fill all fields");
      return;
    }

    try {

      setLoading(true);

      const formData = new FormData();

      // Send caption
      formData.append("caption", caption);

      // Send file
      formData.append("postPic", image);

      const response = await uploadPost(formData);

      console.log(response);

      alert("Post Uploaded Successfully");

      // Reset
      setCaption("");
      setImage(null);
      setFileType("");

    } catch (e) {

      console.log(e);

      alert("Failed to upload post");

    } finally {

      setLoading(false);

    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white">

      <Navbar />

      <div className="flex justify-center items-center pt-32 px-4">

        <div className="bg-[#1e293b] w-full max-w-xl p-8 rounded-2xl shadow-lg border border-slate-700">

          <h2 className="text-3xl font-bold mb-6 text-center text-cyan-400">
            Create Post
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Caption */}
            <div>

              <label className="block mb-2 text-sm text-gray-300">
                Caption
              </label>

              <textarea
                rows="4"
                placeholder="Write a caption..."
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                className="w-full bg-[#0f172a] border border-slate-600 rounded-xl p-3 outline-none focus:border-cyan-400"
              />

            </div>

            {/* Upload */}
            <div>

              <label className="block mb-2 text-sm text-gray-300">
                Upload Image / Video
              </label>

              <input
                type="file"
                accept="image/*,video/mp4"
                onChange={handleImage}
                className="w-full bg-[#0f172a] border border-slate-600 rounded-xl p-3"
              />

            </div>

            {/* Image Preview */}
            {image && fileType === "image" && (
              <img
                src={URL.createObjectURL(image)}
                alt="preview"
                className="w-full h-64 object-cover rounded-xl border border-slate-700"
              />
            )}

            {/* Video Preview */}
            {image && fileType === "video" && (
              <video
                controls
                className="w-full h-64 object-cover rounded-xl border border-slate-700"
              >
                <source
                  src={URL.createObjectURL(image)}
                  type="video/mp4"
                />
              </video>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-cyan-500 hover:bg-cyan-600 transition py-3 rounded-xl font-semibold disabled:opacity-50"
            >
              {loading ? "Uploading..." : "Upload Post"}
            </button>

          </form>

        </div>
      </div>
    </div>
  );
};

export default CreatePost;