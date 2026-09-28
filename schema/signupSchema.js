import * as yup from "yup";

export const signupSchema = yup.object({
  firstName: yup
    .string()
    .trim()
    .required("Please enter your first name")
    .matches(
      /^[A-Za-z]+(?: [A-Za-z]+)*$/,
      "First name should contain only letters"
    ),

  lastName: yup
    .string()
    .trim()
    .required("Please enter your last name")
    .matches(
      /^[A-Za-z]+(?: [A-Za-z]+)*$/,
      "Last name should contain only letters"
    ),

  email: yup
    .string()
    .trim()
    .required("Please enter your email")
    .email("Please enter a valid email address"),

  password: yup
    .string()
    .required("Please enter your password")
    .min(8, "Password must be at least 8 characters")
    .matches(
      /[A-Z]/,
      "Password must contain at least 1 capital letter"
    )
    .matches(
      /[^A-Za-z0-9]/,
      "Password must contain at least 1 special character"
    ),
});