"use client";




import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "../../../lib/api";
import { toast, ToastContainer } from "react-toastify";
import { useAuth } from "../../../context/Auth";

export default function Productdetails ()  {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [cartQuantity, setCartQuantity] = useState(0);

  // Fetch product details
  useEffect(() => {
    api
      .get(`/ViewProduct?${id}`)
      .then((response) => {
        console.log("Product details:", response.data);
        setProduct(response.data.data);
      })
      .catch((error) => {
        console.log(error.response?.data);
      });
  }, [id]);

  // Add product to cart
  const handleAddCart = async () => {
    if (!user) {
      router.push("/login");
      return;
    }

    try {
      const response = await api.post(
        "/addCart",
        {
          productId: id,
          quantity: 1,
          action: "add",
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      console.log("Cart updated:", response.data);

      const updatedCart = response.data.data;

      setCartQuantity(updatedCart.quantity);

      toast.success("Product added to cart successfully!");
    } catch (error) {
      console.error(
        "Add cart error:",
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.message || "Failed to add product to cart"
      );
    }
  };

  if (!product) {
    return <h2>Loading...</h2>;
  }

  return (
    <div className="single-product-page">

      <ToastContainer />

      <div className="single-product-card">

        <div className="single-product-image-box">
          <img
            src={`${process.env.NEXT_PUBLIC_API_URL}${product.image}`}
            alt={product.title}
            className="single-product-image"
          />
        </div>

        <div className="single-product-info">

          <span className="single-product-category">
            {product.category}
          </span>

          <h2>{product.title}</h2>

          <p className="single-product-description">
            {product.description}
          </p>

          <p className="single-product-price">
            {product.price}
          </p>

          <div className="single-product-buttons">

            <button
              type="button"
              className="single-product-back"
              onClick={() => router.back()}
            >
              ← Go Back
            </button>

           {user?.role === "user" && (
  cartQuantity > 0 ? (
    <button
      type="button"
      className="cart-btn"
      onClick={() => router.push("/cart")}
    >
      Go to Cart
    </button>
  ) : (
    <button
      type="button"
      className="cart-btn"
      onClick={handleAddCart}
    >
      Add Cart
    </button>
  )
)}

          </div>

        </div>

      </div>

    </div>
  );
};

