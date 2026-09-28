"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast, ToastContainer } from "react-toastify";

import { useAuth } from "../../context/Auth";
import api from "../../lib/api";

import "react-toastify/dist/ReactToastify.css";

export default function CheckOut() {
  const router = useRouter();
  const { user, authLoading } = useAuth();

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placingOrder, setPlacingOrder] = useState(false);

  const [isEditingAddress, setIsEditingAddress] = useState(false);

  const [address, setAddress] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
  });

  const [paymentMethod, setPaymentMethod] = useState("COD");



  

  // --------------------------------
  // FETCH CART
  // --------------------------------


    const fetchCart = async () => {
    try {
      setLoading(true);

      const response = await api.get("/viewCart");

      console.log("CART RESPONSE:", response.data);

      const cartData = response.data?.data;

      if (Array.isArray(cartData)) {
        setCart(cartData);
      } else if (cartData?.products) {
        setCart(cartData.products);
      } else {
        setCart([]);
      }
    } catch (error) {
      console.error(
        "FETCH CART ERROR:",
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to load cart"
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

  fetchCart();
  fetchDefaultAddress();
}, [user, authLoading]);

  

  // --------------------------------
  // HANDLE ADDRESS
  // --------------------------------

  const handleAddressChange = (e) => {
    const { name, value } = e.target;

    setAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const fetchDefaultAddress = async () => {
  try {
    const response = await api.get(
      "/users/defaultAddress"
    );

    console.log(
      "DEFAULT ADDRESS:",
      response.data
    );

    if (response.data?.data) {
      setAddress(response.data.data);
    }
  } catch (error) {
    console.error(
      "FETCH ADDRESS ERROR:",
      error.response?.data || error.message
    );
  }
};


const saveAddress = async () => {
  if (
    !address.firstName ||
    !address.lastName ||
    !address.phone ||
    !address.address ||
    !address.city ||
    !address.state ||
    !address.pincode
  ) {
    toast.error("Please fill all address fields");
    return;
  }

  try {
    const response = await api.put(
      "/users/defaultAddress",
      address
    );

    console.log(
      "ADDRESS SAVED:",
      response.data
    );

    setAddress(response.data.data);

    setIsEditingAddress(false);

    toast.success(
      "Address saved successfully"
    );
  } catch (error) {
    console.error(
      "SAVE ADDRESS ERROR:",
      error.response?.data || error.message
    );

    toast.error(
      error.response?.data?.message ||
        "Failed to save address"
    );
  }
};
  // --------------------------------
  // TOTAL
  // --------------------------------

  const getProduct = (item) => {
    return item?.productId || item?.product || item;
  };

  const subtotal = cart.reduce((total, item) => {
    const product = getProduct(item);

    const price = Number(product?.price || 0);
    const quantity = Number(item?.quantity || 1);

    return total + price * quantity;
  }, 0);

  const shipping = subtotal > 0 ? 0 : 0;

  const totalAmount = subtotal + shipping;

  // --------------------------------
  // PLACE ORDER
  // --------------------------------

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (
      !address.firstName.trim() ||
      !address.lastName.trim() ||
      !address.phone.trim() ||
      !address.address.trim() ||
      !address.city.trim() ||
      !address.state.trim() ||
      !address.pincode.trim()
    ) {
      toast.error("Please complete your shipping address");
      setIsEditingAddress(true);
      return;
    }

    try {
      setPlacingOrder(true);

      const response = await api.post("/checkout/createCheckout", {
        shippingAddress: address,
        paymentMethod,
      });

      console.log("CHECKOUT RESPONSE:", response.data);

      toast.success(
        response.data?.message ||
          "Order placed successfully!"
      );

      // Give toast time to display
      setTimeout(() => {
        router.push("/orderHistory");
      }, 1000);
    } catch (error) {
      console.error(
        "CHECKOUT ERROR:",
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to place order"
      );
    } finally {
      setPlacingOrder(false);
    }
  };



  // --------------------------------
  // LOADING
  // --------------------------------

  if (authLoading || loading) {
    return (
      <div className="checkout-loading">
        <p>Loading checkout...</p>
      </div>
    );
  }

  // --------------------------------
  // EMPTY CART
  // --------------------------------

  if (cart.length === 0) {
    return (
      <>
        <div className="checkout-empty">
          <h2>Your cart is empty</h2>

          <p>
            Add some products to your cart before
            proceeding to checkout.
          </p>

          <button
            onClick={() => router.push("/product")}
          >
            Continue Shopping
          </button>
        </div>

        <ToastContainer position="top-right" />
      </>
    );
  }

  return (
    <>
      <div className="checkout-page">

        {/* PAGE TITLE */}

        <div className="checkout-header">
          <h1>Checkout</h1>

          <p>
            Complete your order by providing your
            delivery details.
          </p>
        </div>

        <div className="checkout-container">

          {/* LEFT SIDE */}

          <div className="checkout-left">

            {/* ADDRESS */}

            <section className="checkout-card">

              <div className="checkout-card-header">
                <div>
                  <h2>Delivery Address</h2>

                  <p>
                    Where should we deliver your order?
                  </p>
                </div>

                {!isEditingAddress && (
                  <button
                    type="button"
                    className="edit-address-btn"
                    onClick={() =>
                      setIsEditingAddress(true)
                    }
                  >
                    Edit
                  </button>
                )}
              </div>

              {!isEditingAddress ? (
                <div className="address-display">

                  {address.firstName ||
                  address.lastName ? (
                    <>
                      <h3>
                        {address.firstName}{" "}
                        {address.lastName}
                      </h3>

                      <p>
                        {address.address}
                      </p>

                      <p>
                        {address.city},{" "}
                        {address.state} -{" "}
                        {address.pincode}
                      </p>

                      <p>
                        Phone: {address.phone}
                      </p>
                    </>
                  ) : (
                    <div className="no-address">
                      <p>
                        No delivery address added.
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          setIsEditingAddress(true)
                        }
                      >
                        Add Address
                      </button>
                    </div>
                  )}

                </div>
              ) : (
                <div className="address-form">

                  <div className="form-row">

                    <div className="form-group">
                      <label>First Name</label>

                      <input
                        type="text"
                        name="firstName"
                        value={address.firstName}
                        onChange={handleAddressChange}
                        placeholder="Enter first name"
                      />
                    </div>

                    <div className="form-group">
                      <label>Last Name</label>

                      <input
                        type="text"
                        name="lastName"
                        value={address.lastName}
                        onChange={handleAddressChange}
                        placeholder="Enter last name"
                      />
                    </div>

                  </div>

                  <div className="form-group">
                    <label>Phone Number</label>

                    <input
                      type="tel"
                      name="phone"
                      value={address.phone}
                      onChange={handleAddressChange}
                      placeholder="Enter phone number"
                      maxLength={10}
                    />
                  </div>

                  <div className="form-group">
                    <label>Address</label>

                    <textarea
                      name="address"
                      value={address.address}
                      onChange={handleAddressChange}
                      placeholder="House number, street, area"
                      rows={3}
                    />
                  </div>

                  <div className="form-row">

                    <div className="form-group">
                      <label>City</label>

                      <input
                        type="text"
                        name="city"
                        value={address.city}
                        onChange={handleAddressChange}
                        placeholder="Enter city"
                      />
                    </div>

                    <div className="form-group">
                      <label>State</label>

                      <input
                        type="text"
                        name="state"
                        value={address.state}
                        onChange={handleAddressChange}
                        placeholder="Enter state"
                      />
                    </div>

                  </div>

                  <div className="form-group">
                    <label>Pincode</label>

                    <input
                      type="text"
                      name="pincode"
                      value={address.pincode}
                      onChange={handleAddressChange}
                      placeholder="Enter pincode"
                      maxLength={6}
                    />
                  </div>

                  <div className="address-form-actions">

                    <button
                      type="button"
                      className="save-address-btn"
                      onClick={saveAddress}
                    >
                      Save Address
                    </button>

                    <button
                      type="button"
                      className="cancel-address-btn"
                      onClick={() =>
                        setIsEditingAddress(false)
                      }
                    >
                      Cancel
                    </button>

                  </div>

                </div>
              )}

            </section>

            {/* PRODUCTS */}

            <section className="checkout-card">

              <div className="checkout-card-header">
                <div>
                  <h2>Your Order</h2>

                  <p>
                    {cart.length}{" "}
                    {cart.length === 1
                      ? "item"
                      : "items"}
                  </p>
                </div>
              </div>

              <div className="checkout-products">

                {cart.map((item, index) => {
                  const product = getProduct(item);

                  const quantity =
                    Number(item?.quantity || 1);

                  const price =
                    Number(product?.price || 0);

                  const itemTotal =
                    price * quantity;

                  const image = product?.image
                    ? `${`http://localhost:5000${product?.image}`}`
                    : "/images/product-placeholder.png";

                  return (
                    <div
                      className="checkout-product"
                      key={
                        product?._id ||
                        item?._id ||
                        index
                      }
                    >

                      <div className="checkout-product-image">
                        <img
                          src={image}
                          alt={
                            product?.title ||
                            "Product"
                          }
                        />
                      </div>

                      <div className="checkout-product-info">

                        <h3>
                          {product?.title ||
                            "Product"}
                        </h3>

                        {product?.category && (
                          <p className="product-category">
                            {product.category}
                          </p>
                        )}

                        <p className="product-price">
                          ₹
                          {price.toLocaleString(
                            "en-IN"
                          )}
                        </p>

                      </div>

                      <div className="checkout-product-quantity">
                        <span>Qty</span>
                        <strong>
                          {quantity}
                        </strong>
                      </div>

                      <div className="checkout-product-total">
                        ₹
                        {itemTotal.toLocaleString(
                          "en-IN"
                        )}
                      </div>

                    </div>
                  );
                })}

              </div>

            </section>

            {/* PAYMENT */}

            <section className="checkout-card">

              <div className="checkout-card-header">
                <div>
                  <h2>Payment Method</h2>

                  <p>
                    Select how you want to pay.
                  </p>
                </div>
              </div>

              <div className="payment-options">

                <label
                  className={`payment-option ${
                    paymentMethod === "COD"
                      ? "payment-selected"
                      : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={
                      paymentMethod === "COD"
                    }
                    onChange={(e) =>
                      setPaymentMethod(
                        e.target.value
                      )
                    }
                  />

                  <div>
                    <strong>
                      Cash on Delivery
                    </strong>

                    <span>
                      Pay when your order arrives
                    </span>
                  </div>
                </label>

                <label
                  className={`payment-option ${
                    paymentMethod === "ONLINE"
                      ? "payment-selected"
                      : ""
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="ONLINE"
                    checked={
                      paymentMethod === "ONLINE"
                    }
                    onChange={(e) =>
                      setPaymentMethod(
                        e.target.value
                      )
                    }
                  />

                  <div>
                    <strong>
                      Online Payment
                    </strong>

                    <span>
                      Pay securely online
                    </span>
                  </div>
                </label>

              </div>

            </section>

          </div>

          {/* RIGHT SIDE */}

          <aside className="checkout-right">

            <div className="order-summary">

              <h2>Order Summary</h2>

              <div className="summary-row">
                <span>
                  Subtotal
                </span>

                <strong>
                  ₹
                  {subtotal.toLocaleString(
                    "en-IN"
                  )}
                </strong>
              </div>

              <div className="summary-row">
                <span>
                  Shipping
                </span>

                <strong>
                  {shipping === 0
                    ? "FREE"
                    : `₹${shipping}`}
                </strong>
              </div>

              <div className="summary-divider"></div>

              <div className="summary-total">
                <span>Total</span>

                <strong>
                  ₹
                  {totalAmount.toLocaleString(
                    "en-IN"
                  )}
                </strong>
              </div>

              <button
                type="button"
                className="place-order-btn"
                onClick={handlePlaceOrder}
                disabled={placingOrder}
              >
                {placingOrder
                  ? "Placing Order..."
                  : "Place Order"}
              </button>

              <button
                type="button"
                className="continue-shopping-btn"
                onClick={() =>
                  router.push("/product")
                }
              >
                Continue Shopping
              </button>

            </div>

          </aside>

        </div>
      </div>

      <ToastContainer position="top-right" />
    </>
  );
}