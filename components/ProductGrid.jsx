"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "../context/Auth";
import { useRouter } from "next/navigation";
import api from "../lib/api";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { editProductSchema } from "../schema/editProductSchema";

export default function ProductGrid({
    curruntProducts = [],
    deleteProduct,
    editProduct,
    viewProduct,
    showSellerActions,
    addCart,
    cartQuantities = {},
    addWishList,
}) {
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [selectedProductId, setSelectedProductId] = useState(null);

    const [editLoading, setEditLoading] = useState(false);
    const [wishlistProducts, setWishlistProducts] = useState([]);

    const router = useRouter();
    const { user } = useAuth();

    const {
        register: registerEdit,
        handleSubmit: handleSubmitEdit,
        reset: resetEdit,
        watch: watchEdit,
        formState: { errors: editErrors },
    } = useForm({
        resolver: yupResolver(editProductSchema),
        mode: "onChange",
    });

    useEffect(() => {
    const fetchWishlist = async () => {
        try {
            if (user?.role !== "user") return;

            const response = await api.get(
                "/wishlist/viewWishList"
            );

            console.log("Wishlist:", response.data);

            const wishlistData = response.data?.data?.[0];

            const products = wishlistData?.products || [];

            const productIds = products.map(
                (product) => product._id
            );

            setWishlistProducts(productIds);

        } catch (error) {
            console.error(
                "Failed to fetch wishlist:",
                error.response?.data || error.message
            );
        }
    };

    if (user) {
        fetchWishlist();
    }
}, [user]);


    const descriptionValue = watchEdit("description") || "";

    const handleAddCart = async (productId) => {
        await addCart(productId, 1);
    };

    return (
        <div className="product-container">

            {/* PRODUCTS */}
            {curruntProducts?.map((products) => (
                <div
                    className="card products-map"
                    key={products._id}
                >

                    {/* IMAGE */}
                    <div className="product-image">
                        <img src={
                            products.image?.startsWith("http")
                                ? products.image
                                : `${process.env.NEXT_PUBLIC_API_URL}${products.image}`
                        }
                            alt={products.title}
                            onError={(e) => {
                                console.log("IMAGE URL:", e.target.src);
                                console.log("IMAGE PATH FROM DB:", products.image);
                            }} className="card-img-top" />

                       {user?.role === "user" && (
    <button
        type="button"
        className={`wishlist-btn ${
            wishlistProducts.includes(products._id)
                ? "wishlist-added"
                : ""
        }`}
        onClick={async () => {
            const result = await addWishList(products._id);

            if (result?.added) {
                setWishlistProducts((prev) => [
                    ...prev,
                    products._id,
                ]);
            }

            if (result?.removed) {
                setWishlistProducts((prev) =>
                    prev.filter(
                        (id) => id !== products._id
                    )
                );
            }
        }}
        title={
            wishlistProducts.includes(products._id)
                ? "Remove from Wishlist"
                : "Add to Wishlist"
        }
    >
        {wishlistProducts.includes(products._id) ? "♥" : "♡"}
    </button>
)}
                    </div>

                    {/* PRODUCT DETAILS */}
                    <div className="card-body product-details">

                        <h5 className="card-title">
                            {products.title}
                        </h5>

                        <p className="card-text product-description">
                            {products.description}
                        </p>

                        <div className="product-bottom">

                            <span className="price">
                                ₹{products.price}
                            </span>

                            <div className="product-actions">

                                {/* VIEW */}
                                <button
                                    type="button"
                                    className="btn btn-primary text-decoration-none view-btn"
                                    onClick={() => {
                                        console.log(
                                            "Selected product:",
                                            products._id
                                        );

                                        viewProduct(products._id);
                                    }}
                                >
                                    VIEW PRODUCT
                                </button>

                                {/* CART */}
                                {user?.role !== "seller" && (
                                    cartQuantities[products._id] > 0 ? (
                                        <button
                                            type="button"
                                            className="cart-btn"
                                            onClick={() =>
                                                router.push("/cart")
                                            }
                                        >
                                            Go to Cart
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            className="cart-btn"
                                            onClick={() =>
                                                handleAddCart(products._id)
                                            }
                                        >
                                            Add Cart
                                        </button>
                                    )
                                )}

                                {/* EDIT */}
                                {user?.role === "seller" && showSellerActions && (
                                    <Link
                                        href="#"
                                        className="btn btn-primary text-decoration-none edit-btn"
                                        onClick={(e) => {
                                            e.preventDefault();

                                            setSelectedProductId(products._id);
                                            setSelectedProduct(products);

                                            // Load selected product data into React Hook Form
                                            resetEdit({
                                                title: products.title || "",
                                                price: products.price || "",
                                                category: products.category || "",
                                                description: products.description || "",
                                                imageURL: null,
                                            });

                                            setShowEditModal(true);
                                        }}
                                    >
                                        EDIT
                                    </Link>
                                )}

                                {/* DELETE */}
                                {user?.role === "seller" && showSellerActions && (
                                    <Link
                                        href="#"
                                        className="btn btn-primary text-decoration-none delete-btn"
                                        onClick={(e) => {
                                            e.preventDefault();

                                            console.log(
                                                "Selected product:",
                                                products._id
                                            );

                                            setSelectedProductId(products._id);
                                            setSelectedProduct(products);
                                            setShowDeleteModal(true);
                                        }}
                                    >
                                        DELETE
                                    </Link>
                                )}

                            </div>
                        </div>
                    </div>
                </div>
            ))}

            {/* DELETE MODAL */}
            {showDeleteModal && (
                <div
                    className="modal fade show d-block delete-modal-overlay"
                    id="staticBackdrop"
                    data-bs-backdrop="static"
                    data-bs-keyboard="false"
                    tabIndex="-1"
                    aria-labelledby="staticBackdropLabel"
                    aria-hidden="true"
                >
                    <div className="modal-dialog delete-modal-dialog">

                        <div className="modal-content delete-modal-content">

                            <div className="modal-header delete-modal-header">

                                <div className="delete-icon">
                                    <span>!</span>
                                </div>

                                <div>
                                    <h5 className="modal-title">
                                        Delete Product
                                    </h5>

                                    <p className="delete-modal-subtitle">
                                        This action cannot be undone.
                                    </p>
                                </div>

                            </div>

                            <div className="modal-body delete-modal-body">
                                <p>
                                    Are you sure you want to delete this
                                    product?
                                </p>
                            </div>

                            <div className="modal-footer delete-modal-footer">

                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => {
                                        setShowDeleteModal(false);
                                        setSelectedProductId(null);
                                    }}
                                >
                                    Close
                                </button>

                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={() => {
                                        console.log(
                                            "Deleting ID:",
                                            selectedProductId
                                        );

                                        deleteProduct(
                                            selectedProductId
                                        );

                                        setShowDeleteModal(false);
                                        setSelectedProductId(null);
                                    }}
                                >
                                    Delete
                                </button>

                            </div>

                        </div>
                    </div>
                </div>
            )}

            {/* EDIT MODAL */}
            {showEditModal && selectedProduct && (
                <div
                    className="modal fade show d-block"
                    tabIndex="-1"
                    style={{
                        backgroundColor: "rgba(0, 0, 0, 0.5)",
                    }}
                >

                    <div className="modal-dialog modal-dialog-centered">

                        <div className="modal-content">

                            <form
                                className="product-form"
                                onSubmit={handleSubmitEdit(async (data) => {

                                    if (editLoading) return;

                                    const updatedProduct = {
                                        title: data.title.trim(),
                                        price: Number(data.price),
                                        category: data.category,
                                        description: data.description.trim(),
                                        image: data.imageURL?.[0] || null,
                                    };

                                    console.log(
                                        "Sending:",
                                        selectedProductId,
                                        updatedProduct
                                    );

                                    setEditLoading(true);

                                    try {
                                        await editProduct(
                                            selectedProductId,
                                            updatedProduct
                                        );

                                        setShowEditModal(false);
                                        setSelectedProductId(null);
                                        setSelectedProduct(null);

                                        resetEdit();

                                    } catch (error) {
                                        console.log("Edit error:", error);
                                    } finally {
                                        setEditLoading(false);
                                    }
                                })}
                            >

                                {/* HEADER */}
                                <div className="modal-header">
                                    <h5 className="modal-title">
                                        Update Product
                                    </h5>
                                </div>

                                {/* BODY */}
                                <div className="modal-body">

                                    {/* TITLE */}
                                    <div className="form-group mb-3">

                                        <label className="form-label">
                                            Title
                                        </label>

                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Enter product title"
                                            {...registerEdit("title")}
                                        />

                                        {editErrors.title && (
                                            <small className="validation-error">
                                                {editErrors.title.message}
                                            </small>
                                        )}

                                    </div>

                                    {/* PRICE */}
                                    <div className="form-group mb-3">

                                        <label className="form-label">
                                            Price
                                        </label>

                                        <input
                                            type="number"
                                            min="1"
                                            className="form-control"
                                            placeholder="Enter product price"
                                            {...registerEdit("price")}
                                        />

                                        {editErrors.price && (
                                            <small className="validation-error">
                                                {editErrors.price.message}
                                            </small>
                                        )}
                                    </div>

                                    {/* Category */}
                                    <div className="form-group mb-3">
                                        <label className="form-label">
                                            Category
                                        </label>

                                        <select
                                            {...registerEdit("category")}
                                            className="form-control"
                                        >
                                            <option value="">Select Category</option>
                                            <option value="Electronics">Electronics</option>
                                            <option value="Clothing">Clothing</option>
                                            <option value="Shoes">Shoes</option>
                                            <option value="Beauty">Beauty</option>
                                            <option value="Home">Home</option>
                                            <option value="Books">Books</option>
                                            <option value="Sports">Sports</option>
                                            <option value="Other">Other</option>
                                        </select>

                                        {editErrors.category && (
                                            <small className="validation-error">
                                                {editErrors.category.message}
                                            </small>
                                        )}
                                    </div>

                                    {/* IMAGE */}
                                    <div className="form-group mb-3">

                                        <label className="form-label">
                                            Product Image
                                        </label>

                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="form-control"
                                            {...registerEdit("imageURL")}
                                        />

                                        <small className="text-muted">
                                            Leave empty to keep the
                                            current image.
                                        </small>

                                    </div>

                                    {/* DESCRIPTION */}
                                    <div className="form-group mb-3">

                                        <label
                                            htmlFor="message-text"
                                            className="form-label"
                                        >
                                            Description
                                        </label>

                                        <textarea
                                            className="form-control"
                                            id="message-text"
                                            placeholder="Enter product description"
                                            rows="4"
                                            {...registerEdit("description")}
                                        />

                                        {editErrors.description && (
                                            <small className="validation-error">
                                                {editErrors.description.message}
                                            </small>
                                        )}

                                        <small className="text-muted">
                                            {descriptionValue.length}/500
                                        </small>

                                    </div>

                                </div>

                                {/* FOOTER */}
                                <div className="modal-footer">

                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        disabled={editLoading}
                                        onClick={() => {
                                            setShowEditModal(false);
                                            setSelectedProduct(null);
                                            setSelectedProductId(null);
                                            resetEdit();
                                        }}
                                    >
                                        Close
                                    </button>

                                    <button
                                        type="submit"
                                        className="btn btn-primary"
                                        disabled={editLoading}
                                    >
                                        {editLoading
                                            ? "Updating Product..."
                                            : "Update Product"}
                                    </button>

                                </div>

                            </form>

                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}