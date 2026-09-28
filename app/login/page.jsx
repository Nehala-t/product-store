"use client";

import React, {useEffect } from 'react'
import { useAuth } from '../../context/Auth';
import { useRouter } from "next/navigation";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { loginSchema } from "../../schema/loginSchema";

export default function Login() {

  const { login, user } = useAuth();
  const router = useRouter();

  const {
  register,
  handleSubmit,
  reset,
  formState: { errors },
} = useForm({
  resolver: yupResolver(loginSchema),
  mode: "onChange",
});

  console.log(user, '------------->>>>login page');
  useEffect(() => {
    console.log("USER CHANGED:", user);

    if (user) {
      console.log("REDIRECTING...");
      if (user.role === "seller") {
        router.push("/sellerDashBoard");
      } else {
        router.push("/product");
      }
    }
  }, [user, router]);


  const handleLogin = async (formData) => {
  console.log("LOGIN FORM DATA:", formData);

  await login(
    formData.email.trim(),
    formData.password
  );
};




  return (
    <>
      <div className="login-page">

         <form
  className="login-form"
  onSubmit={handleSubmit(
    handleLogin,
    (errors) => {
      console.log("LOGIN VALIDATION ERRORS:", errors);
    }
  )}
 >

          <div className="mb-3">
            <label htmlFor="email" className="form-label">
              Email
            </label>

            <input
              type="email"
              className="form-control"
              id="email"
              placeholder="Enter your email"
              {...register("email")}
            />

            {errors.email && (
              <span className="validation-error">
                {errors.email.message}
              </span>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="password" className="form-label">
              Password
            </label>

            <input
              type="password"
              className="form-control"
              id="password"
              placeholder="Enter your password"
              {...register("password")}
            />

            {errors.password && (
              <span className="validation-error">
                {errors.password.message}
              </span>
            )}
          </div>

          <button type="submit" className="btn btn-primary"  >
            Login
          </button>

        </form>
      </div>

    </>
  )
}

