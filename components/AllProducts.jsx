"use client";

import React, { useState, useEffect } from "react";
import Products from "../components/ProductGrid";
import { ToastContainer, toast } from 'react-toastify';
import { useRouter } from "next/navigation";
import { useAuth } from "../context/Auth";
import api from "../lib/api";
import ProductGrid from "../components/ProductGrid";

import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { productSchema } from "../schema/productSchema";


export default function AllProducts()  {

  
  const router = useRouter();
  const {user,authLoading} = useAuth();

const [loading, setLoading] = useState(false);
const [search, setSearch] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [prod, setProd] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const productsPerPage = 8;
  const [showSellerActions, setShowSellerActions] = useState(true);
  const [cartQuantities, setCartQuantities] = useState({});

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(productSchema),
    mode: "onChange",
  });
  

useEffect(() => {

  if (authLoading) return;
  if (!user) {
    router.push("/login");
    return;
  }

  const token = localStorage.getItem("accessToken");
   if (!token) {
    router.push("/login");
    return;
  }

  const endpoint =
    user.role === "seller" && showSellerActions
      ? "/viewSellerProducts"
      : "/AllProducts";

api.get(endpoint, {
  params: {
    page: currentPage,
    limit: productsPerPage,
    search: search,
  },
  headers: {
    Authorization: `Bearer ${token}`,
  },
})
    .then((response) => {
  console.log("Products:", response.data);

  if (typeof response.data === "string") {
    console.error("Backend returned HTML instead of JSON");
    setProd([]);
    setTotalPages(1);
    return;
  }

  setProd(response.data?.data || []);
  setTotalPages(response.data?.pagination?.totalPages || 1);
})
    .catch((error) => {
      console.log(
        "Product error:",
        error.response?.data || error.message
      );
    });
}, [currentPage, user, showSellerActions,authLoading,router,search]
)



const addProduct = async (data) => {

  // Prevent double submission
  if (loading) return;
  console.log("FORM DATA:", data);

  // // Stop API request if validation fails
  // if (Object.keys(newErrors).length > 0) {
  //   return;
  // }

  setLoading(true);

  const formData = new FormData();

  formData.append("title", data.title.trim());
  formData.append("price", Number(data.price));
  formData.append("description", data.description.trim());
  formData.append("category", data.category);
  

  // File input gives a FileList
  const imageFile = data.imageURL?.[0];

  if (imageFile) {
    formData.append("image", imageFile);
  }

   // Check what is actually being sent
  for (const [key, value] of formData.entries()) {
    console.log(key, value);
  }
  console.log("image =====>",data.imageURL)

  const token = localStorage.getItem("accessToken");

  try {
    const response = await api.post("/AddProducts", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  
    console.log("Product added:", response.data);
      // Add newly created product to React state
      setProd((prevProducts) => [
        ...prevProducts,
        response.data.data,
      ]);

      toast.success("Added successfully!");

      reset();

      // Close modal
      setShowForm(false);
    }
    catch(error)  {
      console.log(
        "Error:",
        error.response?.data || error.message
      );

      toast.error(
        error.response?.data?.message ||
          "Failed to add product!"
      );
    }
    finally {
      setLoading(false);
    }
};


  const deleteProduct = (id)=>{
    console.log("Product ID:", id);
    const token = localStorage.getItem("accessToken");
  api
    .delete(`/deleteProduct/${id}`,{
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then((response) => {
      console.log("Deleted:", response.data);
      toast.success("deleted successfully!");
      setProd((prevProducts) =>
        prevProducts.filter((product) => product._id !== id)
      );
    })
    .catch((error) => {
      toast.error("Failed to delete product!");
      console.log("Status:", error.response?.status);
    });
  }

  const editProduct = (id, product) => {
  console.log("Sending:", id, product);

  const token = localStorage.getItem("accessToken");

  const formData = new FormData();

  formData.append("title", product.title);
  formData.append("price", product.price);
  formData.append("description", product.description);
  formData.append("category", product.category);

  // Only append image if a new file was selected
  if (product.image instanceof File) {
    formData.append("image", product.image);
  }

  // Check FormData
  for (let [key, value] of formData.entries()) {
    console.log(key, value);
  }

  api.post(`/update/${id}`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  })
    .then((response) => {
      console.log("Updated:", response.data);

      toast.success("Product updated successfully");

      setProd((prevProducts) =>
        prevProducts.map((item) =>
          item._id === id ? response.data.data : item
        )
      );
    })
    .catch((error) => {
      console.log("STATUS:", error.response?.status);
      console.log("ERROR:", error.response?.data);

      toast.error("Failed to update product!");
    });
};


  const viewProduct = async (id) => {
    router.push(`/productdetails/${id}`);
 
};



const addCart = async (id, quantity = 1) => {
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

    console.log("ADD CART RESPONSE:", response.data);

    const updatedCart = response.data.data;

    setCartQuantities((prev) => ({
      ...prev,
      [id]: updatedCart.quantity,
    }));

    toast.success("Product added to cart successfully!");

  } catch (error) {
    console.error(
      "ADD CART ERROR:",
      error.response?.data || error.message
    );

    toast.error(
      error.response?.data?.message || "Failed to add product"
    );
  }
};



const addWishList = async (productId) => {
    try {
        const response = await api.post(
            "/wishlist/addWishList",
            {
                productId: productId,
            }
        );

        console.log("Wishlist:", response.data);

        if (response.data.action === "added") {
            toast.success("Added to wishlist!");
            return { added: true };
        }

        if (response.data.action === "removed") {
            toast.info("Removed from wishlist!");
            return { removed: true };
        }

    } catch (error) {
        console.log(
            "Wishlist error:",
            error.response?.data || error.message
        );

        toast.error(
            error.response?.data?.message ||
            "Failed to update wishlist"
        );

        return null;
    }
};

  


  return (
    <div className="products">
 
      <ToastContainer />

      <h1>All Products</h1>

      <div className="product-search">
  <input
    type="text"
    placeholder="Search products..."
    value={search}
    onChange={(e) => {
      setSearch(e.target.value);
      setCurrentPage(1);
    }}
  />

  {search && (
    <button
      type="button"
      className="clear-search-btn"
      onClick={() => {
        setSearch("");
        setCurrentPage(1);
      }}
    >
      ×
    </button>
  )}
</div>

   {user?.role === "seller" ? (
  <div className="seller-products-layout">

    {/* LEFT PANEL - SELLER ONLY */}
    <div className="seller-product-actions">

      <button
        type="button"
        className={`seller-product-btn ${
          showSellerActions
            ? "seller-product-btn-active"
            : ""
        }`}
        onClick={() => {
          setShowSellerActions(true);
          setCurrentPage(1);
        }}
      >
        My Products
      </button>

      <button
        type="button"
        className={`seller-product-btn ${
          !showSellerActions
            ? "seller-product-btn-active"
            : ""
        }`}
        onClick={() => {
          setShowSellerActions(false);
          setCurrentPage(1);
        }}
      >
        All Products
      </button>

      <button
        type="button"
        className="seller-product-btn seller-product-btn-add"
        onClick={() => setShowForm(true)}
      >
        + Add Product
      </button>

       <button
    type="button"
    className="seller-product-btn seller-orders-btn"
    onClick={() => router.push("/sellerOrders")}
  >
    📦 Seller Orders
  </button>

    </div>

    {/* PRODUCTS */}
    <div className="seller-products-content">
      <ProductGrid
        curruntProducts={prod}
        deleteProduct={deleteProduct}
        editProduct={editProduct}
        viewProduct={viewProduct}
        showSellerActions={showSellerActions}
        addCart={addCart}
        cartQuantities={cartQuantities}
        
      />
    </div>

  </div>
) : (
  /* NORMAL USER */
  <ProductGrid
    curruntProducts={prod}
    deleteProduct={deleteProduct}
    editProduct={editProduct}
    viewProduct={viewProduct}
    showSellerActions={false}
    addCart={addCart}
    cartQuantities={cartQuantities}
    addWishList={addWishList}
  />
)}

      {/* <Products 
      curruntProducts={prod}
       deleteProduct={deleteProduct}
      editProduct={editProduct} 
      viewProduct={viewProduct} 
      showSellerActions={showSellerActions} 
      addCart={addCart}
      cartQuantities={cartQuantities}/> */}

     {showForm && (
  <div
    className="modal fade show d-block"
    tabIndex="-1"
    style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
  >
    <div className="modal-dialog modal-dialog-centered">
      <div className="modal-content">

        <form className="product-form" onSubmit={handleSubmit(addProduct)}>

          {/* Header */}
          <div className="modal-header">
            <h5 className="modal-title">
              Add Product
            </h5>
          </div>

          {/* Body */}
          <div className="modal-body">

            {/* Title */}
            <div className="form-group mb-3">
              <label className="form-label">
                Title
              </label>

              <input
                type="text"
                className="form-control"
                placeholder="Enter product title"
                {...register("title")}
              />

              {errors.title && (
  <small className="validation-error">
    {errors.title.message}
  </small>
)}
            </div>


            {/* Category */}
            <div className="form-group mb-3">
              <label className="form-label">
                Category
              </label>

              <select
                className="form-control"
                {...register("category")}
              >
                <option value="">
                  Select category
                </option>
                <option value="Electronics">
                  Electronics
                </option>
                <option value="Clothing">
                  Clothing
                </option>
                <option value="Shoes">
                  Shoes
                </option>
                <option value="Beauty">
                  Beauty
                </option>
                <option value="Home">
                  Home & Kitchen
                </option>
                <option value="Books">
                  Books
                </option>
                <option value="Sports">
                  Sports
                </option>
                <option value="Other">
                  Other
                </option>
              </select>

              {errors.category && (
  <small className="validation-error">
    {errors.category.message}
  </small>
)}
            </div>


            {/* Price */}
            <div className="form-group mb-3">
              <label className="form-label">
                Price
              </label>

              <input
                type="number"
                className="form-control"
                placeholder="Enter product price"
                {...register("price")}
              />

              {errors.price && (
  <small className="validation-error">
    {errors.price.message}
  </small>
)}
            </div>


            {/* Image */}
            <div className="form-group mb-3">
              <label className="form-label">
                Product Image
              </label>

              <input
                type="file"
                accept="image/*"
                className="form-control"
                {...register("imageURL")}
                // onChange={(e) => {
                //   setImageURL(e.target.files[0]);

                //   if (errors.imageURL) {
                //     setErrors((prev) => ({
                //       ...prev,
                //       imageURL: "",
                //     }));
                //   }
                // }}
              />

              {errors.imageURL && (
  <small className="validation-error">
    {errors.imageURL.message}
  </small>
)}
            </div>


            {/* Description */}
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
                {...register("description")}
               
              ></textarea>

              {errors.description && (
  <small className="validation-error">
    {errors.description.message}
  </small>
)}
            </div>

          </div>


          {/* Footer */}
          <div className="modal-footer">

            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setShowForm(false);
                setErrors({});
              }}
              disabled={loading}
            >
              Close
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Adding Product..." : "Add Product"}
            </button>

          </div>

        </form>

      </div>
    </div>
  </div>
)}
   <nav aria-label="Product pagination">
  <ul className="pagination">

    {/* Previous */}
    <li
      className={`page-item ${
        currentPage === 1 ? "disabled" : ""
      }`}
    >
      <button
        className="page-link"
        onClick={() => setCurrentPage(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Previous
      </button>
    </li>

    {/* Page numbers */}
    {Array.from({ length: totalPages }, (_, index) => (
      <li
        key={index + 1}
        className={`page-item ${
          currentPage === index + 1 ? "active" : ""
        }`}
      >
        <button
          className="page-link"
          onClick={() => setCurrentPage(index + 1)}
        >
          {index + 1}
        </button>
      </li>
    ))}

    {/* Next */}
    <li
      className={`page-item ${
        currentPage === totalPages ? "disabled" : ""
      }`}
    >
      <button
        className="page-link"
        onClick={() => setCurrentPage(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </li>

  </ul>
</nav>
    </div>
  );
};


