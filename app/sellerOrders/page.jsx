"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";

import { useAuth } from "../../context/Auth";
import api from "../../lib/api.js";

import "react-toastify/dist/ReactToastify.css";

export default function SellerOrders() {
  const router = useRouter();
  const { user, authLoading } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      router.push("/login");
      return;
    }

    if (user.role !== "seller") {
      router.push("/product");
      return;
    }

    fetchSellerOrders();
  }, [user, authLoading]);

  const fetchSellerOrders = async () => {
    try {
      setLoading(true);

      const token = localStorage.getItem("accessToken");

      const response = await api.get("/checkout/sellerOrders", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("SELLER ORDERS:", response.data);

      setOrders(response.data?.data || []);
    } catch (error) {
      console.log(
        "SELLER ORDERS ERROR:",
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.message || "Failed to load orders"
      );
    } finally {
      setLoading(false);
    }
  };

  // Update status of a specific product
 const updateOrderStatus = async (
  orderId,
  productId,
  orderStatus
) => {
  try {
    const token = localStorage.getItem("accessToken");

    const response = await api.patch(
      `/checkout/updateOrderStatus/${orderId}`,
      {
        productId,
        orderStatus,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    console.log("STATUS UPDATED:", response.data);

    toast.success(
      `Order ${orderStatus} successfully`
    );

    setOrders((prevOrders) =>
      prevOrders.map((order) => {
        if (order._id !== orderId) {
          return order;
        }

        return {
          ...order,
          products: order.products.map((item) => {
            if (
              item.productId?._id !== productId
            ) {
              return item;
            }

            return {
              ...item,
              orderStatus,
            };
          }),
        };
      })
    );
  } catch (error) {
    console.log(
      "STATUS ERROR:",
      error.response?.data || error.message
    );

    toast.error(
      error.response?.data?.message ||
        "Failed to update order status"
    );
  }
};

  if (authLoading || loading) {
    return (
      <div className="seller-orders-page">
        <h2>Loading orders...</h2>
      </div>
    );
  }

  return (
    <div className="seller-orders-page">
      <ToastContainer position="top-right" />

      <div className="seller-orders-header">
        <button
          className="back-btn"
          onClick={() =>
            router.push("/sellerDashBoard")
          }
        >
          ← Back
        </button>

        <h1>Seller Orders</h1>
      </div>

      {orders.length === 0 ? (
        <div className="no-orders">
          <h3>No orders found</h3>

          <p>
            You don't have any orders for your
            products yet.
          </p>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div
              className="seller-order-card"
              key={order._id}
            >
              {/* ORDER HEADER */}
              <div className="order-header">
                <div>
                  <h3>
                    Order #{order._id}
                  </h3>

                  <p>
                    Customer:{" "}
                    {order.userId?.firstName}{" "}
                    {order.userId?.lastName}
                  </p>

                  <p>
                    Payment:{" "}
                    {order.paymentMethod}
                  </p>
                </div>
              </div>

              {/* PRODUCTS */}
              <div className="order-products">
                {order.products?.map((item) => {
                  const product =
                    item.productId;

                    console.log("PRODUCT:", product);
console.log("PRODUCT IMAGE:", product?.image);
console.log(
  "IMAGE URL:",
  product?.image
    ? `${process.env.NEXT_PUBLIC_API_URL}${product.image}`
    : "/images/placeholder.png"
);

                  const imageUrl = product?.image
                    ? `${process.env.NEXT_PUBLIC_API_URL}${product.image}`
                    : "/images/placeholder.png";

                  return (
                    <div
                      className="order-product"
                      key={
                        product?._id ||
                        item._id
                      }
                    >
                      {/* PRODUCT IMAGE */}
                      <div className="order-product-image">
                        <img
                          src={imageUrl}
                          alt={
                            product?.title ||
                            "Product"
                          }
                        />
                      </div>

                      {/* PRODUCT DETAILS */}
                      <div className="order-product-details">
                        <h4>
                          {product?.title}
                        </h4>

                        <p>
                          Quantity:{" "}
                          {item.quantity}
                        </p>

                        <p>
                          Price: ₹
                          {item.price}
                        </p>

                        <p>
                          Category:{" "}
                          {product?.category}
                        </p>
                      </div>

                      {/* PRODUCT STATUS */}
                      <div className="product-status-section">
                        <span
                          className={`order-status ${item.orderStatus}`}
                        >
                          {item.orderStatus}
                        </span>

                        <div className="status-actions">
                         {item.orderStatus === "pending" && (
  <>
    <button
      className="confirm-btn"
      onClick={() =>
        updateOrderStatus(
          order._id,
          item.productId._id,
          "confirmed"
        )
      }
    >
      Accept Order
    </button>

    <button
      className="cancel-btn"
      onClick={() =>
        updateOrderStatus(
          order._id,
          item.productId._id,
          "cancelled"
        )
      }
    >
      Cancel
    </button>
  </>
)}

                          {item.orderStatus ===
                            "confirmed" && (
                            <button
                              className="ship-btn"
                               onClick={() =>
    updateOrderStatus(
      order._id,
      item.productId._id,
      "shipped"
    )
  }
                            >
                              Mark as Shipped
                            </button>
                          )}

                          {item.orderStatus ===
                            "shipped" && (
                            <button
                              className="deliver-btn"
                              onClick={() =>
    updateOrderStatus(
      order._id,
      item.productId._id,
      "delivered"
    )
  }
                            >
                              Mark as Delivered
                            </button>
                          )}

                          {item.orderStatus ===
                            "delivered" && (
                            <span className="completed-text">
                              ✓ Delivered
                            </span>
                          )}

                          {item.orderStatus ===
                            "cancelled" && (
                            <span className="cancelled-text">
                              Cancelled
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* ORDER TOTAL */}
              <div className="order-footer">
                <strong>
                  Seller Total: ₹
                  {order.totalAmount}
                </strong>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}