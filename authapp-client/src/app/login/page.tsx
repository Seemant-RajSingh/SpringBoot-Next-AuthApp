"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8080/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }), 
      });

      if (!response.ok) {
        const errorData = await response.text();
        setError(errorData || "An error occurred");
        return;
      }

      const tokenWithBearer = await response.text();
      const token = tokenWithBearer.replace("Bearer ", ""); 
      console.log("token is: ", tokenWithBearer, " ", token);

      if (token) {
        Cookies.set("authToken", token, { expires: 1, secure: true }); 

        router.push("/");
      }
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError("An error occurred: " + error.message);
      } else {
        setError("An unknown error occurred");
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-900">
      <div className="w-full max-w-md p-6 bg-zinc-800 shadow-lg rounded-lg">
        <h2 className="text-2xl font-semibold text-center text-yellow-500 mb-6">
          Login to Your Account
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300">Email</label> 
            <input
              type="email" 
              placeholder="Enter your email"
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 mt-1 bg-zinc-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-100"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300">Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 mt-1 bg-zinc-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-100"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="flex justify-between items-center">
            <button
              type="submit"
              className="w-full py-3 px-4 bg-yellow-500 text-black font-semibold rounded-md focus:outline-none hover:bg-yellow-600"
            >
              Login
            </button>
          </div>
        </form>

        <div className="mt-4 text-center">
          <p>
            <span className="text-gray-300">New here? </span>
            <Link href="/register" className="text-yellow-500 hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
