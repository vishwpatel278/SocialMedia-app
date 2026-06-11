import React, { useEffect, useState } from "react";
import {
  Heart,
  MessageCircle,
  Send,
  X,
} from "lucide-react";

import {
  getReels,
  likePost,
  getLikes,
  getComments,
  addComment,
  deleteComment,
} from "../utils/AuthUtils";

import socket from "../utils/socket";
import { getUserId } from "../utils/AuthUtils";

const Reels = () => {

  const [reels, setReels] = useState([]);
  const [skip, setSkip] = useState(0);
  const [loading, setLoading] = useState(true);
  const [fetchingMore, setFetchingMore] = useState(false);

  const [showComments, setShowComments] = useState(false);

  const [comments, setComments] = useState([]);

  const [commentText, setCommentText] = useState("");

  const [selectedPostId, setSelectedPostId] = useState("");

  const [currentUserId, setCurrentUserId] = useState("");

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
  // Initial Load
  useEffect(() => {

    const fetchReels = async () => {

      try {

        const response = await getReels(0);

        setReels(response.data);

      } catch (e) {

        console.log(e);

      } finally {

        setLoading(false);
      }
    };

    fetchReels();

  }, []);

  // Infinite Scroll
  useEffect(() => {

    const handleScroll = async () => {

      if (fetchingMore) return;

      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 200
      ) {

        try {

          setFetchingMore(true);

          const nextSkip = skip + 1;

          const response =
            await getReels(nextSkip);

          setReels((prev) => [
            ...prev,
            ...response.data,
          ]);

          setSkip(nextSkip);

        } catch (e) {

          console.log(e);

        } finally {

          setFetchingMore(false);
        }
      }
    };

    window.addEventListener(
      "scroll",
      handleScroll
    );

    return () =>
      window.removeEventListener(
        "scroll",
        handleScroll
      );

  }, [skip, fetchingMore]);

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

    setReels((prev) =>
      prev.map((reel) => {

        if (
          reel._id === selectedPostId
        ) {

          return {
            ...reel,
            comments: (
              reel.comments || []
            ).filter(
              (comment) =>
                comment._id !== commentid
            )
          };

        }

        return reel;

      })
    );

  } catch (e) {

    console.log(e);

  }

};
  // Like
  const handleLike = async (postid) => {

    try {

      await likePost(postid);

      const likesResponse =
        await getLikes(postid);

      const updatedLikes =
        likesResponse.data;

      setReels((prev) =>
        prev.map((reel) => {

          if (reel._id === postid) {

            return {
              ...reel,
              likes: new Array(updatedLikes).fill(
                "liked"
              ),
            };
          }

          return reel;
        })
      );

    } catch (e) {

      console.log(e);
    }
  };

  // Open Comments
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

const closeComments = () => {

  socket.emit(
    "leave-post",
    selectedPostId
  );

  socket.disconnect();

  setShowComments(false);

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

      setReels((prev) =>
        prev.map((reel) => {

          if (
            reel._id === comment.postid
          ) {

            return {
              ...reel,
              comments: [
                ...(reel.comments || []),
                {
                  _id: comment._id,
                  text: comment.text
                }
              ]
            };

          }

          return reel;

        })
      );

    }
  );

  return () => {

    socket.off("new-comment");

  };

}, []);

  // Add Comment
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

  if (loading) {

    return (
      <div className="h-screen flex items-center justify-center bg-black text-white text-2xl">
        Loading Reels...
      </div>
    );
  }

  return (
  <>
    {showComments && (

      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 backdrop-blur-sm">

        <div className="bg-[#111827] w-[450px] max-h-[700px] rounded-3xl border border-slate-700 p-5 flex flex-col">

          <div className="flex items-center justify-between mb-5">

            <h2 className="text-xl font-bold text-white">
              Comments
            </h2>

            <X
              className="cursor-pointer text-white"
              onClick={closeComments}
            />

          </div>

          <div className="flex-1 overflow-y-auto">

            {comments.length === 0 ? (

              <p className="text-gray-400">
                No Comments Yet
              </p>

            ) : (

              comments.map(
  (comment, index) => (

    <div
      key={index}
      className="border-b border-slate-700 py-3 flex justify-between items-center"
    >

      <div>

        <p className="text-cyan-400 font-semibold text-sm">
          {comment.username || "User"}
        </p>

        <p className="text-gray-300 mt-1">
          {comment.user?.text}
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
  )
)
            )}

          </div>

          <div className="mt-4 flex gap-2">

            <input
              type="text"
              placeholder="Add a comment..."
              value={commentText}
              onChange={(e) =>
                setCommentText(
                  e.target.value
                )
              }
              className="flex-1 bg-[#0f172a] px-4 py-3 rounded-xl outline-none text-white"
            />

            <button
              onClick={handleAddComment}
              className="bg-cyan-500 hover:bg-cyan-600 px-5 rounded-xl font-semibold"
            >
              Send
            </button>

          </div>

        </div>

      </div>

    )}

    <div className="bg-black min-h-screen">

      {reels.map((reel) => (

        <div
          key={reel._id}
          className="relative h-screen w-full snap-start"
        >

          {/* Video */}
          <video
            src={reel.postURL}
            autoPlay
            loop
            muted
            playsInline
            className="h-full w-full object-cover"
          />

          {/* Bottom Gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

          {/* User + Caption */}
          <div className="absolute bottom-8 left-5 text-white max-w-md">

            <div className="flex items-center gap-3 mb-3 cursor-pointer">

              <img
                src={`https://ui-avatars.com/api/?name=${
                  reel.username || "User"
                }&background=0D8ABC&color=fff`}
                alt="profile"
                className="w-12 h-12 rounded-full border-2 border-white"
              />

              <div>

                <h2 className="font-bold text-lg">
                  @{reel.username || "user"}
                </h2>

              </div>

            </div>

            <p className="text-sm md:text-base leading-relaxed">
              {reel.caption}
            </p>

          </div>

          {/* Right Side Actions */}
          <div className="absolute right-4 bottom-28 flex flex-col items-center gap-6 text-white">

            <button
              onClick={() =>
                handleLike(reel._id)
              }
              className="flex flex-col items-center"
            >

              <Heart className="w-9 h-9 hover:text-red-500 transition" />

              <span className="text-xs mt-1">
                {reel.likes.length}
              </span>

            </button>

            <button
              onClick={() =>
                handleComments(reel._id)
              }
              className="flex flex-col items-center"
            >

              <MessageCircle className="w-9 h-9 hover:text-cyan-400 transition" />

              <span className="text-xs mt-1">
                {reel.comments.length}
              </span>

            </button>

            <button className="flex flex-col items-center">

              <Send className="w-9 h-9 hover:text-green-400 transition" />

              <span className="text-xs mt-1">
                Share
              </span>

            </button>

          </div>

        </div>

      ))}

      {fetchingMore && (

        <div className="fixed bottom-5 left-1/2 -translate-x-1/2 bg-black/70 px-4 py-2 rounded-full text-white">

          Loading More Reels...

        </div>

      )}

    </div>
  </>
);
};

export default Reels;