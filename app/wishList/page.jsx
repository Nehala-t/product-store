"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { useAuth } from "../../context/Auth";
import api from "../../lib/api";

export default function Wishlist() {
  const router = useRouter();
  const { user, authLoading } = useAuth();

  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchWishlist = async () => {
    try {
      setLoading(true);

      const response = await api.get("/wishlist/viewWishList");

      console.log("Wishlist:", response.data);

      const wishlistData = response.data.data?.[0];

      setWishlist(wishlistData?.products || []);
      // Success toast
    toast.success(
      response.data?.message || "Wishlist fetched successfully"
    );
    } catch (error) {
      console.error("Wishlist error:", error);

      toast.error(
        error.response?.data?.message || "Failed to load wishlist"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    fetchWishlist();
  }, [user, authLoading]);

  const removeFromWishlist = async (productId) => {
    try {
      const response = await api.delete(
        `/wishlist/removeWishList/${productId}`
      );

      toast.success(
        response.data?.message || "Removed from wishlist"
      );

      setWishlist((prev) =>
        prev.filter((item) => {
          const id =
            item.productId?._id ||
            item.productId ||
            item._id;

          return id !== productId;
        })
      );
    } catch (error) {
      console.error("Remove wishlist error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to remove item"
      );
    }
  };

 const addToCart = async (productId) => {
  try {
    const response = await api.post("/addCart", {
      productId,
      quantity: 1,
      action: "add",
    });

    console.log("Add cart response:", response.data);

    // Soft delete from wishlist after successfully adding to cart
    await api.delete(
      `/wishlist/removeWishList/${productId}`
    );

    // Remove from wishlist UI
    setWishlist((prev) =>
      prev.filter((product) => product._id !== productId)
    );

    toast.success(
      response.data?.message || "Product added to cart"
    );
  } catch (error) {
    console.error(
      "Add cart error:",
      error.response?.data || error.message
    );

    toast.error(
      error.response?.data?.message ||
        "Failed to add product to cart"
    );
  }
};

  const clearWishlist = async () => {
    if (wishlist.length === 0) return;

    const confirmClear = window.confirm(
      "Are you sure you want to clear your wishlist?"
    );

    if (!confirmClear) return;

    try {
      await api.delete("/wishlist/clearWishList");

      setWishlist([]);

      toast.success("Wishlist cleared");
    } catch (error) {
      console.error("Clear wishlist error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to clear wishlist"
      );
    }
  };

  if (authLoading || loading) {
    return (
      <div className="wishlist-loading">
        <div className="wishlist-spinner"></div>
        <p>Loading your wishlist...</p>
      </div>
    );
  }

  if (wishlist.length === 0) {
    return (
      <>
        <div className="wishlist-page">
          <div className="wishlist-empty">
            <div className="empty-icon">♡</div>

            <h1>Your Wishlist is Empty</h1>

            <p>
              Save products you love and come back to them
              anytime.
            </p>

            <button
              className="shop-btn"
              onClick={() => router.push("/product")}
            >
              Continue Shopping
            </button>
          </div>
        </div>

        <ToastContainer position="top-right" />
      </>
    );
  }

  return (
    <>
      <div className="wishlist-page">

        <div className="wishlist-header">
          <div>
            <span className="wishlist-label">
              SAVED ITEMS
            </span>

            <h1>My Wishlist</h1>

            <p>
              {wishlist.length}{" "}
              {wishlist.length === 1 ? "item" : "items"} saved
            </p>
          </div>

          <button
            className="clear-btn"
            onClick={clearWishlist}
          >
            🗑 Clear All
          </button>
        </div>

        <div className="wishlist-grid">

          {wishlist.map((product) => {
            const productId = product._id;
            

            const image = product.image
              ? `${process.env.NEXT_PUBLIC_BACKEND_URL}${product.image}`
              : "/images/product-placeholder.png";

            return (
              <div
                className="wishlist-card"
                key={productId}
              >

                <div className="wishlist-image-container">
                  

                  <img
                    src={`http://localhost:5000${product?.image}`}
                    alt={product.title || "Product"}
                    className="wishlist-image"
                  />

                  <button
                    className="remove-icon"
                    onClick={() =>
                      removeFromWishlist(productId)
                    }
                  >
                    ×
                  </button>

                </div>

                <div className="wishlist-content">

                  <h2>
                    {product.title}
                  </h2>

                  {product.category && (
                    <span className="product-category">
                      {product.category}
                    </span>
                  )}

                  <p className="product-description">
                    {product.description
                      ? product.description.length > 90
                        ? `${product.description.substring(
                            0,
                            90
                          )}...`
                        : product.description
                      : "No description available"}
                  </p>

                  <div className="wishlist-bottom">

                    <span className="product-price">
                      ₹{product.price}
                    </span>

                    <button
                      className="cart-btn"
                      onClick={() =>
                        addToCart(productId)
                      }
                    >
                      🛒 Add to Cart
                    </button>

                  </div>

                  <button
                    className="remove-text-btn"
                    onClick={() =>
                      removeFromWishlist(productId)
                    }
                  >
                    Remove
                  </button>

                </div>

              </div>
            );
          })}

        </div>

      </div>

      <ToastContainer position="top-right" />
    </>
  );
}