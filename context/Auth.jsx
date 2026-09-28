"use client";

import {
  createContext,
  useState,
  useEffect,
  useContext,
} from "react";

import { ToastContainer, toast } from "react-toastify";
import api from "../lib/api";

import "react-toastify/dist/ReactToastify.css";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Check localStorage when app starts
  useEffect(() => {
    const storedUser = localStorage.getItem("loggedInUser");
    const storedToken = localStorage.getItem("accessToken");

    if (storedUser && storedToken) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.log("Invalid stored user:", error);

        localStorage.removeItem("loggedInUser");
        localStorage.removeItem("accessToken");
      }
    }

    setAuthLoading(false);
  }, []);

  // Login
 const login = async (email, password) => {
  try {
    const response = await api.post("/users/login", {
      email,
      password,
    });

    console.log("Login response:", response.data);

    if (response.data.success) {
      const userData = response.data.data;
      const token = response.data.accessToken;

      console.log("SETTING USER:", userData);

      setUser(userData);

      localStorage.setItem(
        "loggedInUser",
        JSON.stringify(userData)
      );

      localStorage.setItem(
        "accessToken",
        token
      );

      toast.success("Login successful 🎉");

      return true;
    }

    return false;
  } catch (error) {
    console.log("Login error:", error);

    toast.error(
      error.response?.data?.message ||
      "Invalid email or password"
    );

    return false;
  }
};

  // Logout
  const logout = () => {
    setUser(null);

    localStorage.removeItem("loggedInUser");
    localStorage.removeItem("accessToken");
    // Clear frontend-accessible cookies 
    document.cookie = 
    "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"; 
    document.cookie = "role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    toast.info("Logged out successfully!");
  };

  return (
    <>
      <AuthContext.Provider
        value={{
          user,
          setUser,
          login,
          logout,
          authLoading,
        }}
      >
        {children}
      </AuthContext.Provider>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        theme="colored"
      />
    </>
  );
};

// Custom hook
export const useAuth = () => {
  return useContext(AuthContext);
};