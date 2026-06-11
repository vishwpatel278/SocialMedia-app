import React, { useEffect, useState } from "react";
import Navbar from "../home/Navbar";
import {
  getFollowRequests,
  updateRequest,
} from "../utils/AuthUtils";
import { useNavigate } from "react-router-dom";

const Requests = () => {

  const navigate = useNavigate();

  const [requests, setRequests] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchRequests = async () => {

      try {

        const response =
          await getFollowRequests();

        setRequests(response.data);

      } catch (e) {

        console.log(e);

      } finally {

        setLoading(false);
      }
    };

    fetchRequests();

  }, []);

  const handleAccept = async (userid) => {

    try {

      await updateRequest(userid, true);

      setRequests((prev) =>
        prev.filter(
          (request) =>
            String(request._id) !== String(userid)
        )
      );

    } catch (e) {

      console.log(e);
    }
  };

  const handleReject = async (userid) => {

    try {

      await updateRequest(userid, false);

      setRequests((prev) =>
        prev.filter(
          (request) =>
            String(request._id) !== String(userid)
        )
      );

    } catch (e) {

      console.log(e);
    }
  };

  return (
    <>
      <Navbar />

      <div className="min-h-screen bg-[#0f172a] text-white pt-28 px-4">

        <div className="max-w-4xl mx-auto">

          <h1 className="text-3xl font-bold mb-8">
            Follow Requests
          </h1>

          {loading ? (

            <div className="text-center text-cyan-400">
              Loading Requests...
            </div>

          ) : requests.length === 0 ? (

            <div className="text-center text-gray-400">
              No Requests Found
            </div>

          ) : (

            <div className="space-y-4">

              {requests.map((request) => (

                <div
                  key={request._id}
                  className="bg-[#1e293b] border border-slate-700 rounded-xl p-4 flex items-center justify-between"
                >

                  {/* User Info */}
                  <div
                    onClick={() =>
                      navigate(
                        `/profile/${request._id}`
                      )
                    }
                    className="cursor-pointer"
                  >

                    <h2 className="font-semibold text-lg hover:text-cyan-400 transition">
                      {request.username}
                    </h2>

                    <p className="text-sm text-gray-400">
                      {request.email}
                    </p>

                  </div>

                  {/* Buttons */}
                  <div className="flex gap-3">

                    <button
                      onClick={() =>
                        handleAccept(request._id)
                      }
                      className="px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold transition"
                    >
                      Accept
                    </button>

                    <button
                      onClick={() =>
                        handleReject(request._id)
                      }
                      className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition"
                    >
                      Reject
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </div>
    </>
  );
};

export default Requests;