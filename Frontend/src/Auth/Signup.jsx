import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  SignUpApi,
  verifyOTP,
  resendOTP,
} from "../utils/AuthUtils";

import { X } from "lucide-react";

const Signup = () => {

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [showOtpModal, setShowOtpModal] =
    useState(false);

  const [otp, setOtp] = useState("");

  const [otpLoading, setOtpLoading] =
    useState(false);

  const [resendLoading, setResendLoading] =
    useState(false);

  const [data, setData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const handleChange = (e) => {

    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);

      const response =
        await SignUpApi(data);

      console.log(response);

      setShowOtpModal(true);

    } catch (error) {

      console.log(error);

      alert(
        error?.response?.data?.message ||
          "Signup Failed"
      );

    } finally {

      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {

    if (otp.length !== 6) {

      alert("Please enter 6 digit OTP");

      return;
    }

    try {

      setOtpLoading(true);

      const response =
        await verifyOTP(
          data.email,
          otp
        );

      alert(
        response.data.message
      );

      setShowOtpModal(false);

      navigate("/api/login");

    } catch (e) {

      console.log(e);

      alert(
        e?.response?.data?.message ||
          "OTP Verification Failed"
      );

    } finally {

      setOtpLoading(false);
    }
  };

  const handleResendOTP = async () => {

    try {

      setResendLoading(true);

      const response =
        await resendOTP(
          data.email
        );

      alert(
        response.data.message
      );

    } catch (e) {

      console.log(e);

      alert(
        e?.response?.data?.message ||
          "Failed To Resend OTP"
      );

    } finally {

      setResendLoading(false);
    }
  };

  return (
    <>
      {/* OTP MODAL */}

      {showOtpModal && (

        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">

          <div className="bg-zinc-900 border border-zinc-700 rounded-3xl p-8 w-[95%] max-w-md shadow-2xl relative">

            <button
              onClick={() =>
                setShowOtpModal(false)
              }
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >

              <X />

            </button>

            <div className="text-center">

              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 flex items-center justify-center mx-auto text-3xl mb-5">

                📧

              </div>

              <h2 className="text-3xl font-bold text-white mb-2">

                Verify OTP

              </h2>

              <p className="text-gray-400 mb-6">

                Enter the 6-digit code sent to

                <br />

                <span className="text-pink-400">

                  {data.email}

                </span>

              </p>

            </div>

            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) =>
                setOtp(
                  e.target.value.replace(
                    /\D/g,
                    ""
                  )
                )
              }
              placeholder="000000"
              className="w-full text-center text-3xl tracking-[12px] font-bold bg-zinc-800 border border-zinc-700 text-white px-4 py-4 rounded-2xl outline-none focus:border-pink-500"
            />

            <button
              onClick={handleVerifyOTP}
              disabled={otpLoading}
              className="w-full mt-5 bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-2xl font-semibold hover:opacity-90 transition"
            >

              {otpLoading
                ? "Verifying..."
                : "Verify OTP"}

            </button>

            <button
              onClick={handleResendOTP}
              disabled={resendLoading}
              className="w-full mt-4 text-pink-400 font-semibold hover:text-pink-300 transition"
            >

              {resendLoading
                ? "Resending..."
                : "Resend OTP"}

            </button>

          </div>

        </div>

      )}

      {/* SIGNUP PAGE */}

      <div className="min-h-screen bg-black flex items-center justify-center px-4">

        <div className="w-full max-w-md bg-zinc-900 rounded-2xl p-8 shadow-2xl">

          <h1 className="text-4xl font-bold text-white text-center mb-2">

            InstaClone

          </h1>

          <p className="text-gray-400 text-center mb-8">

            Create your account

          </p>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            <input
              type="text"
              name="username"
              placeholder="Enter username"
              value={data.username}
              onChange={handleChange}
              required
              className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-3 rounded-xl outline-none focus:border-pink-500"
            />

            <input
              type="email"
              name="email"
              placeholder="Enter email"
              value={data.email}
              onChange={handleChange}
              required
              className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-3 rounded-xl outline-none focus:border-pink-500"
            />

            <input
              type="password"
              name="password"
              placeholder="Enter password"
              value={data.password}
              onChange={handleChange}
              required
              className="w-full bg-zinc-800 border border-zinc-700 text-white px-4 py-3 rounded-xl outline-none focus:border-pink-500"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition"
            >

              {loading
                ? "Creating Account..."
                : "Signup"}

            </button>

          </form>

          <p className="text-gray-400 text-center mt-6">

            Already have an account?{" "}

            <Link
              to="/api/login"
              className="text-pink-500 hover:underline"
            >

              Login

            </Link>

          </p>

        </div>

      </div>
    </>
  );
};

export default Signup;