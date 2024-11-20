"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Register() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("http://localhost:8080/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData.message || "An error occurred");
        return;
      }

      router.push("/login");
    } catch (error) {
      setError("An error occurred: " + error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-900">
      <div className="w-full max-w-md p-6 bg-zinc-800 shadow-lg rounded-lg">
        <h2 className="text-2xl font-semibold text-center text-yellow-500 mb-6">
          Create a New Account
        </h2>

        {error && (
          <div className="mb-4 text-red-500 text-center">{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300">Username</label>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Choose a username"
              className="w-full p-3 mt-1 bg-zinc-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-100"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full p-3 mt-1 bg-zinc-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-100"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full p-3 mt-1 bg-zinc-700 border border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-500 text-gray-100"
            />
          </div>

          <div className="flex justify-between items-center">
            <button
              type="submit"
              className="w-full py-3 px-4 bg-yellow-500 text-black font-semibold rounded-md focus:outline-none hover:bg-yellow-600"
            >
              Register
            </button>
          </div>
        </form>

        <div className="mt-4 text-center">
          <p>
            <span className="text-gray-300">Already a user? </span>
            <Link href="/login" className="text-yellow-500 hover:underline">
              Login here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
