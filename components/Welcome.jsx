import Link from "next/link";

const Welcome = () => {
  return (
    <div className="home-page">

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="row align-items-center">

            <div className="col-lg-6">
              <span className="hero-badge">
                ✨ New Collection
              </span>

              <h1 className="hero-title">
                Discover Products
                <br />
                You`ll <span>Love.</span>
              </h1>

              <p className="hero-text">
                Explore our latest collection of quality products,
                amazing deals, and everything you need in one place.
              </p>
            </div>

            <div className="col-lg-6">
              <div className="hero-image">
                <div className="hero-image-content">
                  <span>NEW</span>
                  <h3>Fresh Styles</h3>
                  <p>Made for you</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-section">
        <div className="container">
          <div className="features-flex">

            <div className="feature-card">
              <div className="feature-icon">🚚</div>
              <h5>Free Shipping</h5>
              <p>On orders above ₹999</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔒</div>
              <h5>Secure Payment</h5>
              <p>100% secure checkout</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">↩️</div>
              <h5>Easy Returns</h5>
              <p>Simple return process</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">💬</div>
              <h5>24/7 Support</h5>
              <p>We`re here to help</p>
            </div>

          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-content">

            <span>READY TO SHOP?</span>

            <h2>
              Find Something
              <br />
              <i>Perfect for You.</i>
            </h2>

            <p>
              Browse our collection and discover products
              you`ll love.
            </p>

            <Link href="/products" className="btn btn-light">
              Start Shopping →
            </Link>

          </div>
        </div>
      </section>

    </div>
  );
};

export default Welcome;