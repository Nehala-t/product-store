


export default function About() {
  return (
    <div className="about-page">

      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-content">
          <h1>About Us</h1>
          <p>
            Welcome to our platform. We are dedicated to providing
            simple, reliable and high-quality solutions for our customers.
          </p>
        </div>
      </section>

      {/* About Section */}
      <section className="about-section">

        <div className="about-content">
          <div className="about-text">
            <h2>Who We Are</h2>

            <p>
              We are a passionate team focused on building useful and
              user-friendly digital experiences. Our goal is to make
              technology simple and accessible for everyone.
            </p>

            <p>
              We believe in quality, innovation and customer satisfaction.
              Every feature we create is designed with our users in mind.
            </p>

            <button className="about-button">
              Learn More
            </button>
          </div>

          <div className="about-image">
            <img
              src="/images/about-us.jpeg"
              alt="About Us"
            />
          </div>

        </div>

      </section>

      {/* Features Section */}
      <section className="about-features">

        <h2>Why Choose Us?</h2>

        <div className="feature-container">

          <div className="feature-card">
            <h3>Quality</h3>
            <p>
              We focus on delivering high-quality products and services.
            </p>
          </div>

          <div className="feature-card">
            <h3>Innovation</h3>
            <p>
              We continuously improve our solutions using modern technology.
            </p>
          </div>

          <div className="feature-card">
            <h3>Support</h3>
            <p>
              Our customers are always our priority.
            </p>
          </div>

        </div>

      </section>

    </div>
  );
}
