"use client";

import { useState } from "react";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    console.log(formData);

    alert("Message sent successfully!");

    setFormData({
      name: "",
      email: "",
      subject: "",
      message: "",
    });
  };

  return (
    <div className="contact-page">

      {/* Header */}
      <section className="contact-hero">
        <h1>Contact Us</h1>

        <p>
          Have a question? We`d love to hear from you.
        </p>
      </section>

      {/* Contact Content */}
      <section className="contact-section">

        <div className="contact-container">

          {/* Contact Information */}
          <div className="contact-info">

            <h2>Get In Touch</h2>

            <p>
              If you have any questions about our products, orders,
              delivery, or anything else, feel free to contact us.
            </p>

            <div className="contact-details">

              <div className="contact-detail-item">
                <img
                  src="/images/ic_round-email.png"
                  alt="Email"
                />

                <p>support@example.com</p>
              </div>

              <div className="contact-detail-item">
                <img
                  src="/images/fluent_call-24-filled.png"
                  alt="Phone"
                />

                <p>+91 98765 43210</p>
              </div>

              <div className="contact-detail-item">
                <img
                  src="/images/typcn_location.png"
                  alt="Location"
                />

                <p>Kerala, India</p>
              </div>

            </div>

          </div>

          {/* Contact Form */}
          <div className="contact-form">

            <h2>Send Us a Message</h2>

            <form onSubmit={handleSubmit}>

              <div className="form-group">
                <label htmlFor="name">Name</label>

                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email</label>

                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">Message</label>

                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Write your message..."
                  rows="5"
                  required
                ></textarea>
              </div>

              <button
                type="submit"
                className="contact-button"
              >
                Send Message
              </button>

            </form>

          </div>

        </div>

      </section>

    </div>
  );
}