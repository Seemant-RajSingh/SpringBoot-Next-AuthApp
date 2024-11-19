"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation"; 
import { RootState, AppDispatch } from "../app/store";
import { setUser } from "../app/GlobalRedux/Features/User/userSlice";
import Cookies from "js-cookie";

export default function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter(); 

  const { username, email, role } = useSelector((state: RootState) => state.user);

  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        console.log("in fetchUserData");
        const token = Cookies.get("authToken"); 
        console.log("token: ", token);
        if (!token) {
          router.push("/login");
        }

        const response = await fetch("http://localhost:8080/users", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });

        if (!response.ok) {
          throw new Error("Failed to fetch user data");
        }

        const userData = await response.json();
        console.log("userData: ", userData);

        if (Array.isArray(userData)) {
          setUsers(userData[1]); 
          dispatch(setUser(userData[0])); 
        } else {
          dispatch(setUser(userData)); 
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [dispatch, router]);

  const handleLogout = () => {
    Cookies.remove("authToken");
    dispatch(setUser({ username: null, email: null, password: null, role: null }));
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-black-800 text-yellow-400 p-6">
      {username ? (
        <div>
          <h1 className="text-3xl font-semibold mb-4">Welcome {username}</h1>
          <p className="mb-2">Email: {email}</p>
          <p className="mb-4">Role: {role}</p>

          {role === "ADMIN" ? (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-black-700 border border-black-600 rounded-lg">
                <thead>
                  <tr>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Username</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Password</th>
                    <th className="px-6 py-3 text-left text-sm font-semibold">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr
                      key={index}
                      className={`border-t border-black-600 ${
                        user.role === "ADMIN" ? "bg-yellow-200 text-zinc-800" : ""
                      }`} 
                    >
                      <td className="px-6 py-3 text-sm">{user.username}</td>
                      <td className="px-6 py-3 text-sm">{user.email}</td>
                      <td className="px-6 py-3 text-sm">{user.password}</td>
                      <td className="px-6 py-3 text-sm">{user.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="bg-black-700 p-4 rounded-lg mt-6">
              <h2 className="text-xl font-semibold">Your Details</h2>
              <p className="mt-2">Username: {username}</p>
              <p>Email: {email}</p>
              <p>Role: {role}</p>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="mt-6 px-6 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
          >
            Logout
          </button>
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
}
