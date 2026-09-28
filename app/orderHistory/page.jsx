"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import   {addressSchema}   from "../../schema/addressSchema.js";
import { useAuth } from "../../context/Auth";
import api from "../../lib/api";

import "react-toastify/dist/ReactToastify.css";

export default function OrderHistory() {
  const router = useRouter();
  const { user, authLoading } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingOrderId, setCancellingOrderId] = useState(null);

  const {
  register,
  handleSubmit,
  setValue,
  formState: { errors },
} = useForm({
  resolver: yupResolver(addressSchema),
  defaultValues: {
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  },
});

  // --------------------------------
  // FETCH ORDERS
  // --------------------------------
const fetchOrders = async () => {
  try {
    setLoading(true);

    const response = await api.get("/checkout/viewCheckout");

    console.log("ORDER HISTORY:", response.data);

    if (Array.isArray(response.data?.data)) {
      setOrders(response.data.data);
    } else {
      setOrders([]);
    }
  } catch (error) {
    console.error(
      "FETCH ORDERS ERROR:",
      error.response?.data || error.message
    );

    toast.error(
      error.response?.data?.message ||
        "Failed to load order history"
    );
  } finally {
    setLoading(false);
  }
};

  // --------------------------------
  // AUTH + FETCH
  // --------------------------------

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    if (user.role !== "user") {
      router.push("/");
      return;
    }

    fetchOrders();
  }, [user, authLoading]);

  // --------------------------------
  // GET OVERALL ORDER STATUS
  // --------------------------------

  const getOrderStatus = (order) => {
    const products = order.products || [];

    if (products.length === 0) {
      return "pending";
    }

    const statuses = products.map(
      (item) => item.orderStatus || "pending"
    );

    // All products cancelled
    if (
      statuses.every(
        (status) => status === "cancelled"
      )
    ) {
      return "cancelled";
    }

    // All products delivered
    if (
      statuses.every(
        (status) => status === "delivered"
      )
    ) {
      return "delivered";
    }

    // Any product shipped
    if (
      statuses.some(
        (status) => status === "shipped"
      )
    ) {
      return "shipped";
    }

    // Any product confirmed
    if (
      statuses.some(
        (status) => status === "confirmed"
      )
    ) {
      return "confirmed";
    }

    // Otherwise pending
    return "pending";
  };

  // --------------------------------
  // CANCEL ORDER
  // --------------------------------

  const cancelOrder = async (orderId) => {
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this order?"
    );

    if (!confirmCancel) {
      return;
    }

    try {
      setCancellingOrderId(orderId);

      const response = await api.patch(
        `/checkout/cancelOrder/${orderId}`
      );

      console.log(
        "CANCEL ORDER:",
        response.data
      );

      toast.success(
        response.data?.message ||
          "Order cancelled successfully"
      );

      // Update product-level status
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId
            ? {
                ...order,
                products: order.products.map(
                  (item) => {
                    if (
                      item.orderStatus === "pending" ||
                      item.orderStatus === "confirmed"
                    ) {
                      return {
                        ...item,
                        orderStatus: "cancelled",
                      };
                    }

                    return item;
                  }
                ),
              }
            : order
        )
      );
    } catch (error) {
      console.error(
        "CANCEL ORDER ERROR:",
        error.response?.data ||
          error.message
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to cancel order"
      );
    } finally {
      setCancellingOrderId(null);
    }
  };

  // --------------------------------
  // FORMAT DATE
  // --------------------------------

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // --------------------------------
  // STATUS CLASS
  // --------------------------------

  const getStatusClass = (status) => {
    switch (status) {
      case "pending":
        return "status-pending";

      case "confirmed":
        return "status-confirmed";

      case "shipped":
        return "status-shipped";

      case "delivered":
        return "status-delivered";

      case "cancelled":
        return "status-cancelled";

      default:
        return "";
    }
  };

  // --------------------------------
  // LOADING
  // --------------------------------

  if (authLoading || loading) {
    return (
      <div className="order-history-loading">
        <p>Loading orders...</p>
      </div>
    );
  }

  // --------------------------------
  // EMPTY ORDERS
  // --------------------------------

  if (orders.length === 0) {
    return (
      <>
        <div className="order-history-empty">
          <h2>No Orders Yet</h2>

          <p>
            You haven't placed any orders yet.
          </p>

          <button
            type="button"
            onClick={() =>
              router.push("/product")
            }
          >
            Start Shopping
          </button>
        </div>

        <ToastContainer position="top-right" />
      </>
    );
  }

  // --------------------------------
  // ORDER HISTORY
  // --------------------------------

  return (
    <>
      <div className="order-history-page">

        {/* HEADER */}

        <div className="order-history-header">
          <h1>My Orders</h1>

          <p>
            View and manage your orders
          </p>
        </div>

        {/* ORDERS */}

        <div className="order-history-container">

          {orders.map((order) => {
            const currentStatus =
              getOrderStatus(order);

            return (
              <div
                className="order-card"
                key={order._id}
              >

                {/* ORDER HEADER */}

                <div className="order-card-header">

                  <div>
                    <h2>
                      Order #
                      {order._id.slice(-8)}
                    </h2>

                    <p>
                      Placed on{" "}
                      {formatDate(
                        order.createdAt
                      )}
                    </p>
                  </div>

                  <span
                    className={`order-status ${getStatusClass(
                      currentStatus
                    )}`}
                  >
                    {currentStatus}
                  </span>

                </div>

                {/* PRODUCTS */}

                <div className="order-products">

                  {order.products?.map(
                    (item, index) => {

                      const product =
                        item.productId;

                      const price =
                        Number(
                          item.price || 0
                        );

                      const quantity =
                        Number(
                          item.quantity || 1
                        );

                      const itemTotal =
                        price * quantity;

                      const imageUrl = product?.image
                    ? `${process.env.NEXT_PUBLIC_API_URL}${product.image}`
                    : "/images/placeholder.png";

                      return (
                        <div
                          className="order-product"
                          key={
                            product?._id ||
                            index
                          }
                        >

                          {/* IMAGE */}
{/* PRODUCT IMAGE */}
<div className="order-product-image">
  <img
    src={imageUrl}
    alt={product?.title || "Product"}
    onLoad={() => {
      console.log("IMAGE LOADED:", imageUrl);
    }}
    onError={() => {
      console.log("IMAGE FAILED:", imageUrl);
    }}
  />
</div>

                          {/* PRODUCT INFO */}

                          <div className="order-product-info">

                            <h3>
                              {product?.title ||
                                "Product"}
                            </h3>

                            {product?.category && (
                              <p>
                                {product.category}
                              </p>
                            )}

                            <span>
                              ₹
                              {price.toLocaleString(
                                "en-IN"
                              )}
                            </span>

                          </div>

                          {/* QUANTITY */}

                          <div className="order-product-quantity">

                            <span>
                              Qty
                            </span>

                            <strong>
                              {quantity}
                            </strong>
        

                          </div>

                          {/* TOTAL */}

                          <div className="order-product-total">

                            ₹
                            {itemTotal.toLocaleString(
                              "en-IN"
                            )}

                          </div>

                        </div>
                      );
                    }
                  )}

                </div>

                {/* ADDRESS */}

                {order.shippingAddress && (
                  <div className="order-address">

                    <h3>
                      Delivery Address
                    </h3>

                    <p>
                      {
                        order.shippingAddress
                          .firstName
                      }{" "}
                      {
                        order.shippingAddress
                          .lastName
                      }
                    </p>

                    <p>
                      {
                        order.shippingAddress
                          .address
                      }
                    </p>

                    <p>
                      {
                        order.shippingAddress
                          .city
                      }
                      ,{" "}
                      {
                        order.shippingAddress
                          .state
                      }{" "}
                      -{" "}
                      {
                        order.shippingAddress
                          .pincode
                      }
                    </p>

                    <p>
                      Phone:{" "}
                      {
                        order.shippingAddress
                          .phone
                      }
                    </p>

                  </div>
                )}

                {/* FOOTER */}

                <div className="order-card-footer">

                  <div className="order-payment">

                    <span>
                      Payment
                    </span>

                    <strong>
                      {order.paymentMethod}
                    </strong>

                  </div>

                  <div className="order-total">

                    <span>
                      Total
                    </span>

                    <strong>
                      ₹
                      {Number(
                        order.totalAmount || 0
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </strong>

                  </div>

                  {/* CANCEL BUTTON */}

                  {(currentStatus === "pending" ||
                    currentStatus === "confirmed") && (
                    <button
                      type="button"
                      className="cancel-order-btn"
                      onClick={() =>
                        cancelOrder(
                          order._id
                        )
                      }
                      disabled={
                        cancellingOrderId ===
                        order._id
                      }
                    >
                      {cancellingOrderId ===
                      order._id
                        ? "Cancelling..."
                        : "Cancel Order"}
                    </button>
                  )}

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