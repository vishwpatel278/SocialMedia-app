import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { resetPassword } from "../utils/AuthUtils";

const ResetPass = () => {
  const navigate = useNavigate();

  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!emailOrUsername.trim()) {
      return setError("Email or Username is required");
    }

    if (!password.trim()) {
      return setError("Password is required");
    }

    if (password.length < 4) {
      return setError("Password must be at least 4 characters");
    }

    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }

    try {
      setLoading(true);

      const response = await resetPassword(
        emailOrUsername,
        password
      );

      setMessage(
        response?.data?.message ||
          "Password updated successfully"
      );

      setEmailOrUsername("");
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate("/api/login");
      }, 1500);
    } catch (e) {
      setError(
        e?.response?.data?.message ||
          "Failed to reset password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-slate-800 rounded-xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center text-cyan-400 mb-6">
          Reset Password
        </h1>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-white mb-2">
              Email or Username
            </label>

            <input
              type="text"
              value={emailOrUsername}
              onChange={(e) =>
                setEmailOrUsername(e.target.value)
              }
              placeholder="Enter email or username"
              className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white outline-none border border-slate-600 focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-white mb-2">
              New Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Enter new password"
              className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white outline-none border border-slate-600 focus:border-cyan-400"
            />
          </div>

          <div>
            <label className="block text-white mb-2">
              Confirm Password
            </label>

            <input
              type="password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              placeholder="Confirm new password"
              className="w-full px-4 py-3 rounded-lg bg-slate-700 text-white outline-none border border-slate-600 focus:border-cyan-400"
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm">
              {error}
            </div>
          )}

          {message && (
            <div className="text-green-400 text-sm">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-500 hover:bg-cyan-600 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50"
          >
            {loading
              ? "Updating Password..."
              : "Reset Password"}
          </button>

          <button
            type="button"
            onClick={() => navigate("/api/login")}
            className="w-full border border-slate-600 text-white py-3 rounded-lg hover:bg-slate-700 transition"
          >
            Back to Login
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPass;