"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState, AppDispatch } from "../app/store";
import { setUser, logoutUser } from "../app/GlobalRedux/Features/User/userSlice";
import Cookies from "js-cookie";

export default function Home() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  const { username, email, role } = useSelector((state: RootState) => state.user);

  // Combined state object
  const [userDetail, setUserDetail] = useState({
    currentPage: 1,
    selectedRole: "",
    sortBy: "username",
    sortDirection: "ASC",
    filteredUsers: [] as any[],
  });

  const getPageOptions = () => {
    if (userDetail.selectedRole === "ADMIN") return [1];
    if (userDetail.selectedRole === "USER" || userDetail.selectedRole === "GUEST") return [1, 2];
    return [1, 2, 3];
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = Cookies.get("authToken");
        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch("http://localhost:8080/user", {
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
        console.log("Fetched logged-in user:", userData);
        dispatch(setUser(userData));
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, [dispatch, router]);

  const fetchUsersPage = async () => {
    try {
      const token = Cookies.get("authToken");
      const { currentPage, selectedRole, sortBy, sortDirection } = userDetail;
      const query = selectedRole ? `&role=${selectedRole}` : "";
      const sortQuery = `&sortBy=${sortBy}&direction=${sortDirection}`;
      const response = await fetch(
        `http://localhost:8080/admin/users?page=${currentPage - 1}&size=10${query}${sortQuery}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const userData = await response.json();
      console.log("Fetched filtered user data:", userData);
      setUserDetail((prev) => ({ ...prev, filteredUsers: userData.content }));
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handlePageChange = (page: number) => {
    setUserDetail((prev) => ({
      ...prev,
      currentPage: page,
    }));
  };

  const handleLogout = () => {
    Cookies.remove("authToken");
    dispatch(logoutUser());
    router.push("/login");
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedRole = e.target.value;
    setUserDetail((prev) => ({
      ...prev,
      selectedRole,
      sortDirection: "ASC",
      currentPage: 1,
    }));
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const direction = e.target.value;
    setUserDetail((prev) => ({
      ...prev,
      sortDirection: direction,
    }));
  };

  const handleSortByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const column = e.target.value;
    setUserDetail((prev) => ({
      ...prev,
      sortBy: column,
      currentPage: 1,
    }));
  };

  useEffect(() => {
    fetchUsersPage();
  }, [userDetail.currentPage, userDetail.selectedRole, userDetail.sortBy, userDetail.sortDirection]);

  return (
    <div className="min-h-screen bg-gray-900 text-yellow-400 p-6 font-sans">
      {username ? (
        <div>
          <h1 className="text-4xl font-bold mb-6 text-yellow-300">Welcome, {username}</h1>
          <p className="text-yellow-500">Email: {email}</p>
          <p className="mb-4 text-yellow-500">Role: {role}</p>

          {role === "ADMIN" && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-4">
                <select
                  className="bg-gray-800 text-yellow-300 px-4 py-2 rounded shadow"
                  value={userDetail.selectedRole}
                  onChange={handleRoleChange}
                >
                  <option value="">All Roles</option>
                  <option value="ADMIN">Admin</option>
                  <option value="USER">User</option>
                  <option value="GUEST">Guest</option>
                </select>
                <select
                  className="bg-gray-800 text-yellow-300 px-4 py-2 rounded shadow"
                  value={userDetail.currentPage}
                  onChange={(e) => handlePageChange(Number(e.target.value))}
                >
                  {getPageOptions().map((page) => (
                    <option key={page} value={page}>
                      Page {page}
                    </option>
                  ))}
                </select>
                <select
                  className="bg-gray-800 text-yellow-300 px-4 py-2 rounded shadow"
                  value={userDetail.sortBy}
                  onChange={handleSortByChange}
                >
                  <option value="username">Username</option>
                  <option value="email">Email</option>
                  <option value="role">Role</option>
                </select>
                <select
                  className="bg-gray-800 text-yellow-300 px-4 py-2 rounded shadow"
                  value={userDetail.sortDirection}
                  onChange={handleSortChange}
                >
                  <option value="ASC">A-Z</option>
                  <option value="DESC">Z-A</option>
                </select>
              </div>

              <table className="w-full table-auto bg-zinc-900 text-yellow-200 shadow-xl rounded-lg">
                <thead className="bg-zinc-800">
                  <tr>
                    <th className="py-2 px-4 text-center text-yellow-300">Username</th>
                    <th className="py-2 px-4 text-center text-yellow-300">Email</th>
                    <th className="py-2 px-4 text-center text-yellow-300">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {userDetail.filteredUsers.map((user) => (
                    <tr
                      key={user.id}
                      className={`${
                        user.username === username
                          ? "bg-green-600 hover:bg-green-700 text-gray-900"
                          : user.role === "ADMIN"
                          ? "bg-yellow-500 hover:bg-yellow-600 text-black"
                          : user.role === "GUEST"
                          ? "bg-zinc-700 hover:bg-zinc-800 text-white"
                          : "bg-zinc-700 hover:bg-zinc-600 text-yellow-300"
                      } transition-all duration-200`}
                    >
                      <td className="py-2 px-4 text-center">{user.username}</td>
                      <td className="py-2 px-4 text-center">{user.email}</td>
                      <td className="py-2 px-4 text-center">{user.role}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="mt-6 bg-red-600 text-yellow-200 px-4 py-2 rounded shadow hover:bg-red-700"
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
