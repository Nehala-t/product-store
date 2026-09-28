import * as yup from "yup";

export const productSchema = yup.object({
  title: yup
    .string()
    .trim()
    .required("Product title is required"),

  category: yup
    .string()
    .required("Please select a category"),

  price: yup
    .number()
    .typeError("Price must be a number")
    .positive("Price must be greater than 0")
    .required("Price is required"),

  imageURL: yup
    .mixed()
    .test(
      "required",
      "Product image is required",
      (value) => {
        return value && value.length > 0;
      }
    ),

  description: yup
    .string()
    .trim()
    .required("Description is required")
    .min(50, "Description must be at least 50 characters")
    .max(500, "Description must not exceed 500 characters"),
});