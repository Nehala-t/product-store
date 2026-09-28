"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/Auth";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import api from "../../lib/api";

export default function Cart() {
  const { user, authLoading } = useAuth();
  const router = useRouter();

  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [selectedCartProduct, setSelectedCartProduct] = useState(null);
  const [removeLoading, setRemoveLoading] = useState(false);

  // FETCH CART
  const fetchCart = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("accessToken");

      const response = await api.get("/viewCart", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Cart response:", response.data);

      setCartItems(response.data.data || []);
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  // FETCH CART WHEN PAGE LOADS
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    fetchCart();
  }, [user, authLoading, router]);

  // UPDATE QUANTITY
  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      return;
    }

    try {
      const response = await api.post(
        "/addCart",
        {
          productId: productId,
          quantity: newQuantity,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              "accessToken"
            )}`,
          },
        }
      );

      setCartItems((prevItems) =>
        prevItems.map((item) =>
          item.productId?._id === productId
            ? {
                ...item,
                quantity: response.data.data.quantity,
              }
            : item
        )
      );
    } catch (error) {
      console.error("Quantity update error:", error);
      toast.error("Failed to update quantity");
    }
  };

  // REMOVE PRODUCT
  const removeFromCart = async (productId) => {
    try {
      const response = await api.delete(
        `/removeCart/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              "accessToken"
            )}`,
          },
        }
      );

      toast.success(
        response.data.message ||
          "Product removed successfully"
      );

      await fetchCart();

      return true;
    } catch (error) {
      console.error("Remove cart error:", error);

      toast.error(
        error.response?.data?.message ||
          "Failed to remove product"
      );

      return false;
    }
  };

  // CLEAR COMPLETE CART
  const clearCart = async () => {
    if (cartItems.length === 0) {
      toast.info("Cart is already empty");
      return;
    }

    try {
      const response = await api.delete("/clearCart", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem(
            "accessToken"
          )}`,
        },
      });

      toast.success(
        response.data.message ||
          "Cart cleared successfully"
      );

      await fetchCart();
    } catch (error) {
      console.error("Clear cart error:", error);
      toast.error("Failed to clear cart");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="cart-loading">
        <div className="spinner-border" role="status"></div>
        <p>Loading your cart...</p>
      </div>
    );
  }

  const totalPrice = cartItems.reduce((total, item) => {
    return (
      total +
      (item.productId?.price || 0) * item.quantity
    );
  }, 0);

  return (
    <div className="cart-page">

      <ToastContainer />

      <div className="container">

        {/* HEADER */}
        <div className="cart-header">

          <div>
            <h2>My Cart</h2>

            <p>
              {cartItems.length}{" "}
              {cartItems.length === 1
                ? "product"
                : "products"}{" "}
              in your cart
            </p>
          </div>

          {cartItems.length > 0 && (
            <button
              className="clear-cart-btn"
              onClick={clearCart}
            >
              Clear Cart
            </button>
          )}

        </div>

        {/* EMPTY CART */}
        {cartItems.length === 0 ? (

          <div className="empty-cart">

            <div className="empty-cart-icon">
              🛒
            </div>

            <h3>Your cart is empty</h3>

            <p>
              Looks like you haven`t added anything
              to your cart yet.
            </p>

            <button
              className="continue-shopping-btn"
              onClick={() => router.push("/product")}
            >
              Continue Shopping
            </button>

          </div>

        ) : (

          <>

            {/* PRODUCTS */}
            <div className="cart-list">

              {cartItems.map((item) => {

                const product = item.productId;

                const subtotal =
                  (product?.price || 0) *
                  item.quantity;

                return (
                  <div
                    className="cart-product"
                    key={item._id}
                  >

                    {/* IMAGE */}
                    <div className="cart-image-wrapper">

                      <img
                        src={`http://localhost:5000${product?.image}`}
                        alt={product?.title}
                        className="cart-product-image"
                      />

                    </div>

                    {/* PRODUCT INFORMATION */}
                    <div className="cart-product-info">

                      <h3>
                        {product?.title}
                      </h3>

                      <p className="cart-product-description">
                        {product?.description}
                      </p>

                      <p className="cart-price">
                        ₹{product?.price}
                      </p>

                      {/* QUANTITY */}
                      <div className="quantity-row">

                        <span className="quantity-label">
                          Quantity
                        </span>

                        <div className="quantity-control">

                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.productId._id,
                                item.quantity - 1
                              )
                            }
                            disabled={
                              item.quantity <= 1
                            }
                          >
                            −
                          </button>

                          <span>
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.productId._id,
                                item.quantity + 1
                              )
                            }
                          >
                            +
                          </button>

                        </div>

                      </div>

                    </div>

                    {/* RIGHT SECTION */}
                    <div className="cart-product-right">

                      <p className="subtotal-label">
                        Subtotal
                      </p>

                      <h4>
                        ₹{subtotal}
                      </h4>

                      <button
                        className="remove-cart-btn"
                        onClick={() => {
                          setSelectedCartProduct(product);
                          setShowRemoveModal(true);
                        }}
                      >
                        Remove
                      </button>

                    </div>

                  </div>
                );
              })}

            </div>

            {/* REMOVE CONFIRMATION MODAL */}
            {showRemoveModal &&
              selectedCartProduct && (

                <div
                  className="remove-modal-overlay"
                  onClick={() => {
                    if (!removeLoading) {
                      setShowRemoveModal(false);
                      setSelectedCartProduct(null);
                    }
                  }}
                >

                  <div
                    className="remove-modal-dialog"
                    onClick={(e) =>
                      e.stopPropagation()
                    }
                  >

                    <div className="remove-modal-content">

                      {/* HEADER */}
                      <div className="remove-modal-header">

                        <div>

                          <h5 className="remove-modal-title">
                            Remove Product
                          </h5>

                          <p className="remove-modal-subtitle">
                            Please confirm your action
                          </p>

                        </div>

                      </div>

                      {/* BODY */}
                      <div className="remove-modal-body">

                        <p>
                          Are you sure you want to
                          remove{" "}
                          <strong>
                            {selectedCartProduct.title}
                          </strong>{" "}
                          from your cart?
                        </p>

                      </div>

                      {/* FOOTER */}
                      <div className="remove-modal-footer">

                        <button
                          type="button"
                          className="remove-cancel-btn"
                          disabled={removeLoading}
                          onClick={() => {
                            setShowRemoveModal(false);
                            setSelectedCartProduct(null);
                          }}
                        >
                          Cancel
                        </button>

                        <button
                          type="button"
                          className="remove-confirm-btn"
                          disabled={removeLoading}
                          onClick={async () => {

                            setRemoveLoading(true);

                            const success =
                              await removeFromCart(
                                selectedCartProduct._id
                              );

                            if (success) {
                              setShowRemoveModal(false);
                              setSelectedCartProduct(null);
                            }

                            setRemoveLoading(false);
                          }}
                        >
                          {removeLoading
                            ? "Removing..."
                            : "Remove"}
                        </button>

                      </div>

                    </div>

                  </div>

                </div>
              )}

            {/* TOTAL */}
            <div className="cart-summary">

              <div>
                <span>Total</span>

                <h2>
                  ₹{totalPrice}
                </h2>
              </div>

              <button
                className="checkout-btn"
                onClick={() =>
                  router.push("/checkout")
                }
              >
                Proceed to Checkout
              </button>

            </div>

          </>
        )}

      </div>

    </div>
  );
}