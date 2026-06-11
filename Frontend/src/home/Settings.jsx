import React, { useEffect, useState } from "react";
import Navbar from "./Navbar";
import { useNavigate } from "react-router-dom";

import {
  getPrivateStatus,
  updatePrivateStatus,
  logoutUser,
} from "../utils/AuthUtils";

const Settings = () => {

  const navigate = useNavigate();

  const [isPrivate, setIsPrivate] = useState(false);

  const [loading, setLoading] = useState(true);

  const [updating, setUpdating] = useState(false);

  const [showLogoutModal, setShowLogoutModal] =
    useState(false);

  const [logoutLoading, setLogoutLoading] =
    useState(false);

  useEffect(() => {

    fetchPrivacyStatus();

  }, []);

  const fetchPrivacyStatus = async () => {

    try {

      const response =
        await getPrivateStatus();

      if (response) {

        setIsPrivate(
          response.data
        );
      }

    } catch (e) {

      console.log(e);

    } finally {

      setLoading(false);
    }
  };

  const handlePrivacyChange = async (
    newValue
  ) => {

    try {

      setUpdating(true);

      await updatePrivateStatus(
        newValue
      );

      setIsPrivate(newValue);

    } catch (e) {

      console.log(e);

    } finally {

      setUpdating(false);
    }
  };

  const handleLogout = async () => {

    try {

      setLogoutLoading(true);

      await logoutUser();

      localStorage.removeItem(
        "token"
      );

      navigate("/api/login");

    } catch (e) {

      console.log(e);

      alert(
        "Failed to logout"
      );

    } finally {

      setLogoutLoading(false);

      setShowLogoutModal(
        false
      );
    }
  };

  return (
    <>
      <Navbar />

      {/* Logout Confirmation Modal */}

      {showLogoutModal && (

        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">

          <div className="bg-slate-800 rounded-2xl p-8 w-[90%] max-w-md border border-slate-700 shadow-2xl">

            <h2 className="text-2xl font-bold text-white mb-3">

              Logout

            </h2>

            <p className="text-slate-300 mb-6">

              Are you sure you want to
              logout from your account?

            </p>

            <div className="flex gap-3">

              <button
                onClick={() =>
                  setShowLogoutModal(
                    false
                  )
                }
                disabled={
                  logoutLoading
                }
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-xl font-semibold transition"
              >

                Cancel

              </button>

              <button
                onClick={
                  handleLogout
                }
                disabled={
                  logoutLoading
                }
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold transition"
              >

                {logoutLoading
                  ? "Logging Out..."
                  : "Logout"}

              </button>

            </div>

          </div>

        </div>

      )}

      <div className="min-h-screen bg-slate-900 pt-28 px-4">

        <div className="max-w-xl mx-auto bg-slate-800 rounded-xl p-6 shadow-lg">

          <h1 className="text-3xl font-bold text-white mb-8">

            Settings

          </h1>

          {/* Privacy Section */}

          <div className="bg-slate-700 p-6 rounded-lg">

            <h2 className="text-xl font-semibold text-white mb-2">

              Account Privacy

            </h2>

            <p className="text-slate-300 mb-6">

              Choose who can view your
              profile and posts.

            </p>

            {loading ? (

              <div className="text-white">

                Loading...

              </div>

            ) : (

              <div className="space-y-5">

                <label className="flex items-start gap-3 text-white cursor-pointer">

                  <input
                    type="radio"
                    name="privacy"
                    checked={
                      isPrivate ===
                      false
                    }
                    disabled={
                      updating
                    }
                    onChange={() =>
                      handlePrivacyChange(
                        false
                      )
                    }
                    className="mt-1"
                  />

                  <div>

                    <div className="font-semibold">

                      Public Account

                    </div>

                    <div className="text-sm text-slate-300">

                      Anyone can view
                      your profile and
                      posts.

                    </div>

                  </div>

                </label>

                <label className="flex items-start gap-3 text-white cursor-pointer">

                  <input
                    type="radio"
                    name="privacy"
                    checked={
                      isPrivate ===
                      true
                    }
                    disabled={
                      updating
                    }
                    onChange={() =>
                      handlePrivacyChange(
                        true
                      )
                    }
                    className="mt-1"
                  />

                  <div>

                    <div className="font-semibold">

                      Private Account

                    </div>

                    <div className="text-sm text-slate-300">

                      Only approved
                      followers can
                      view your profile
                      and posts.

                    </div>

                  </div>

                </label>

                {updating && (

                  <p className="text-cyan-400 text-sm">

                    Updating account
                    privacy...

                  </p>

                )}

              </div>

            )}

          </div>

          {/* Logout Section */}

          <div className="mt-6 bg-slate-700 p-6 rounded-lg">

            <h2 className="text-xl font-semibold text-white mb-2">

              Account

            </h2>

            <p className="text-slate-300 mb-5">

              Logout from your current
              account.

            </p>

            <button
              onClick={() =>
                setShowLogoutModal(
                  true
                )
              }
              className="w-full bg-red-500 hover:bg-red-600 text-white py-3 rounded-xl font-semibold transition"
            >

              Logout

            </button>

          </div>

        </div>

      </div>
    </>
  );
};

export default Settings;