import * as yup from "yup";

export const addressSchema = yup.object({
  firstName: yup
    .string()
    .trim()
    .required("First name is required")
    .min(2, "First name must be at least 2 characters"),

  lastName: yup
    .string()
    .trim()
    .required("Last name is required")
    .min(1, "Last name is required"),

  phone: yup
    .string()
    .required("Phone number is required")
    .matches(
      /^[6-9]\d{9}$/,
      "Enter a valid 10-digit phone number"
    ),

  address: yup
    .string()
    .trim()
    .required("Address is required")
    .min(5, "Address must be at least 5 characters"),

  city: yup
    .string()
    .trim()
    .required("City is required"),

  state: yup
    .string()
    .trim()
    .required("State is required"),

  pincode: yup
    .string()
    .required("Pincode is required")
    .matches(
      /^[1-9][0-9]{5}$/,
      "Enter a valid 6-digit pincode"
    ),
});