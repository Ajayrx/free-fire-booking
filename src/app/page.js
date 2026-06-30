import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="home-wrapper">
      <div className="home-bg-graphics"></div>

      {/* HERO SECTION - 50vh */}
      <section className="home-hero-section">
        <div className="home-hero-text">
          <h1 className="hero-play">JOIN.</h1>
          <h1 className="hero-compete">BATTLE.</h1>
          <h1 className="hero-win">WIN BIG.</h1>
          <p>
            Join exciting Free Fire tournaments,<br/>
            compete with the best and win amazing rewards!
          </p>
          <div className="home-hero-buttons">
            <Link href="/booking" className="btn-book">
              🏆 BOOK TOURNAMENT
            </Link>
            <Link href="/business-registration" className="btn-book">
              📄 Business Registration
            </Link>
          </div>
        </div>
      </section>

      {/* CHARACTER (ABSOLUTE) */}
      <div className="home-character">
        <picture>
          <source srcSet="/gc.webp" type="image/webp" />
          <img src="/gc.png" alt="Hero Character" width={450} height={478} fetchPriority="high" loading="eager" decoding="sync" />
        </picture>
      </div>

      {/* DIAGONAL BANNER - 10vh */}
      <div className="home-banner-container">
        <div className="home-banner">
          <div className="marquee">
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} className="marquee-item">
                <picture>
                  <source srcSet="/f.webp" type="image/webp" />
                  <img src="/f.png" alt="Free Fire" width={400} height={88} loading="lazy" decoding="async" className="marquee-f-img" />
                </picture>
                <span className="marquee-heart">❤️</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ORGANIZER SECTION */}
      <section className="home-organizer-section">
        <div className="organizer-details-wrapper">
          <div className="organizer-desktop-row">
            <div className="contact-item contact-phone">
              <span className="contact-icon">📞</span> 
              <span className="contact-text">+91 8917398750</span>
            </div>
            <div className="contact-item contact-email">
              <span className="contact-icon">✉️</span> 
              <span className="contact-text">balaesports@gmail.com</span>
            </div>
          </div>
          <div className="organizer-title">
            BALA ESPORTS TOURNAMENTS
          </div>
        </div>
      </section>
    </div>
  );
}
