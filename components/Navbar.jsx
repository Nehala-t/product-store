"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../context/Auth";
import { Package } from "lucide-react";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  const { user, logout, authLoading } = useAuth();

  const handleLogout = (e) => {
    e.preventDefault();
    logout();
    console.log("Logout");

    router.push("/login");
  };

  const handleLogin = (e) => {
    e.preventDefault();
    router.push("/login");
  };

  if (authLoading) {
    return null;
  }

  const isActive = (path) => pathname === path;

  return (
    <div className="navbar">

      {/* Logo */}
      <div className="image">
        <Link href="/">
          <img src="/images/logo-logomark.png" alt="Logo" />
        </Link>
      </div>

      <div className="menu-items">

        {/* Navigation Links */}
        <div className={`right-section ${menuOpen ? "active" : ""}`}>

          <Link
            href="/"
            className={`item ${isActive("/") ? "active-item" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            Home
          </Link>

          <Link
            href="/about"
            className={`item ${isActive("/about") ? "active-item" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            About
          </Link>

          <Link
            href="/contact"
            className={`item ${isActive("/contact") ? "active-item" : ""}`}
            onClick={() => setMenuOpen(false)}
          >
            Contact
          </Link>

          {/* User / Seller Navigation */}
          {user?.role === "user" ? (
            <Link
              href="/product"
              className={`item ${isActive("/product") ? "active-item" : ""
                }`}
              onClick={() => setMenuOpen(false)}
            >
              Product
            </Link>
          ) : user?.role === "seller" ? (
            <Link
              href="/sellerDashBoard"
              className={`item ${isActive("/sellerDashBoard") ? "active-item" : ""
                }`}
              onClick={() => setMenuOpen(false)}
            >
              Seller Dashboard
            </Link>
          ) : null}

        </div>

        {/* cart Section */}
        <div className="profile">

          {/* Cart - User only */}
          {user?.role === "user" && (
            <div
              className="cart-icon"
              onClick={() => router.push("/wishList")}
            >
              <img src="/images/wishlist-icon.jpeg" alt="wish-list" />
            </div>
          )}

          {/* wishlist Section */}
        <div className="profile">

          {/* wishlis - User only */}
          {user?.role === "user" && (
            <div
              className="cart-icon"
              onClick={() => router.push("/cart")}
            >
              <img src="/images/cart.png" alt="Cart" />
            </div>
          )}

          {/* Sign Up - Logged out only */}
          {!user && (
            <div>
              <button onClick={() => router.push("/signUp")}>
                SIGN UP
              </button>
            </div>
          )}

          {/* Login / Logout */}
          <div>
            <button
              onClick={!user ? handleLogin : handleLogout}
            >
              {!user ? "LOGIN" : "LOGOUT"}
            </button>
          </div>
<div
  className="order-history-icon"
  onClick={() => router.push("/orderHistory")}
  title="Order History"
>
  <Package size={22} />
</div>       
  


        </div>
        </div>

        {/* Hamburger */}
        <div
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </div>

      </div>
    </div>
  );
};

export default Navbar;