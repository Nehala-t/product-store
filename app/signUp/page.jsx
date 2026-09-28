"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import { useAuth } from "../../context/Auth";
import api from "../../lib/api";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { signupSchema } from "../../schema/signupSchema";


export default function SignUp() {
  const router = useRouter();

  const { user, setUser } = useAuth();

  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);

  const {
  register,
  handleSubmit,
  reset,
  formState: { errors },
} = useForm({
  resolver: yupResolver(signupSchema),
  mode: "onChange",
});

  /* =========================
     REDIRECT IF ALREADY LOGGED IN
  ========================= */

  useEffect(() => {
    if (user) {
      if (user.role === "seller") {
        router.push("/sellerDashBoard");
      } else {
        router.push("/product");
      }
    }
  }, [user, router]);




  /* =========================
     SUBMIT
  ========================= */

  const onSubmit = async (formData) => {
  try {
    setLoading(true);

    console.log("FORM DATA:", formData);

    const response = await api.post(
      "/users/register",
      {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: role || "user",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    console.log("STATUS:", response.status);
    console.log("BACKEND RESPONSE:", response.data);

    const data = response.data;

    // Success message
    toast.success("Account created successfully!");

    const userData = data.data;

    // Save user
    localStorage.setItem(
      "loggedInUser",
      JSON.stringify(userData)
    );

    // Save token
    localStorage.setItem(
      "accessToken",
      data.accessToken
    );

    // Update AuthContext
    setUser(userData);

    // Clear React Hook Form
    reset();

    // Clear role
    setRole("");

  } catch (error) {
    console.error("Signup error:", error);

    console.log("STATUS:", error.response?.status);
    console.log("BACKEND ERROR:", error.response?.data);

    const message =
      error.response?.data?.message ||
      error.message ||
      "Something went wrong";

    toast.error(message);

  } finally {
    setLoading(false);
  }
};

  return (
    <div className="signup-page">

      <ToastContainer position="top-right" />

      <div className="signup-card">

        {/* Header */}

        <div className="signup-header">

          <div className="signup-icon">
            ✨
          </div>

          <h1>Create Account</h1>

          <p>
            Join us and start shopping today
          </p>

        </div>


        {/* Form */}

        <form onSubmit={handleSubmit(onSubmit)}>

          {/* First Name */}

          <div className="signup-field">

            <label htmlFor="firstName">
              First Name
            </label>

            <input
              id="firstName"
              type="text"
              placeholder="Enter your first name"
              {...register("firstName")}
              className={errors.firstName ? "input-error" : ""}
            />

            {errors.firstName && (
  <span className="validation-error">
    {errors.firstName.message}
  </span>
            )}

          </div>


          {/* Last Name */}

          <div className="signup-field">

            <label htmlFor="lastName">
              Last Name
            </label>

            <input
              id="lastName"
              type="text"
              placeholder="Enter your last name"
              className={
                errors.lastName
                  ? "input-error"
                  : ""
              }
              {...register("lastName")}
            />

            {errors.lastName && (
              <span className="validation-error">
                {errors.lastName.message}
              </span>
            )}

          </div>


          {/* Email */}

          <div className="signup-field">

            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="Enter your email"
              className={
                errors.email
                  ? "input-error"
                  : ""
              }
              {...register("email")}
            />

            {errors.email && (
              <span className="validation-error">
                {errors.email.message}
              </span>
            )}

          </div>


          {/* Password */}

          <div className="signup-field">

            <label htmlFor="password">
              Password
            </label>

            <input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="Create a strong password"
              className={
                errors.password
                  ? "input-error"
                  : ""
              }
              {...register("password")}
            />

            {errors.password && (
              <span className="validation-error">
                {errors.password.message}
              </span>
            )}

            <small className="password-hint">
              Minimum 8 characters, 1 capital letter and
              1 special character
            </small>

          </div>


          {/* Role */}

          <div className="signup-field role-field">

            <label>
              Create account as
            </label>

            <div className="role-options">

              {/* Customer */}

              <button
                type="button"
                className={`role-card ${
                  role === "user" ? "active" : ""
                }`}
                onClick={() => setRole("user")}
              >

                <div className="role-icon">
                  👤
                </div>

                <div className="role-content">

                  <h6>Customer</h6>

                  <p>
                    Browse and purchase products
                  </p>

                </div>

                <div className="role-check">
                  {role === "user" ? "✓" : ""}
                </div>

              </button>


              {/* Seller */}

              <button
                type="button"
                className={`role-card ${
                  role === "seller" ? "active" : ""
                }`}
                onClick={() => setRole("seller")}
              >

                <div className="role-icon">
                  🏪
                </div>

                <div className="role-content">

                  <h6>Seller</h6>

                  <p>
                    Sell and manage your products
                  </p>

                </div>

                <div className="role-check">
                  {role === "seller" ? "✓" : ""}
                </div>

              </button>

            </div>

          </div>


          {/* Submit */}

          <button
            type="submit"
            className="signup-button"
            disabled={loading}
          >
            {loading
              ? "Creating account..."
              : "Create Account"}
          </button>


          {/* Login */}

          <div className="signup-login-link">

            <span>
              Already have an account?
            </span>

            <button
              type="button"
              onClick={() => router.push("/login")}
            >
              Login
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}