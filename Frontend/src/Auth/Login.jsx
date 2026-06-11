import { useState } from "react";
import { LoginApi } from "../utils/AuthUtils";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [data, setData] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  const handleClick = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await LoginApi(data);

      console.log(response);

      // Save token if backend sends token
      if (response?.token) {
        localStorage.setItem("token", response.token);
      }

      alert("Login Successful");

      navigate("/");
    } catch (error) {
      console.log(error);
      alert("Invalid Email or Password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-zinc-900 p-8 rounded-2xl shadow-2xl">
        <h1 className="text-4xl font-bold text-white text-center mb-2">
          InstaClone
        </h1>

        <p className="text-gray-400 text-center mb-8">
          Login to continue
        </p>

        <form className="space-y-5" onSubmit={handleClick}>
          <div>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={data.email}
              onChange={handleChange}
              className="w-full bg-zinc-800 text-white px-4 py-3 rounded-xl outline-none border border-zinc-700 focus:border-pink-500"
              required
            />
          </div>

          <div>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={data.password}
              onChange={handleChange}
              className="w-full bg-zinc-800 text-white px-4 py-3 rounded-xl outline-none border border-zinc-700 focus:border-pink-500"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-xl font-semibold hover:opacity-90 transition duration-300 disabled:opacity-50"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* Forgot Password */}
          <div className="text-right">
            <button
              type="button"
              onClick={() => navigate("/reset-pass")}
              className="text-sm text-pink-500 hover:text-pink-400 hover:underline transition"
            >
              Forgot Password?
            </button>
          </div>
        </form>

        <p className="text-gray-400 text-center mt-6">
          Don&apos;t have an account?{" "}
          <Link
            to="/api/signup"
            className="text-pink-500 hover:underline"
          >
            Signup
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;