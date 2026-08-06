import React from 'react';
import './Reviews.css';

export default function Reviews() {
  return (
    <section id="reviews" className="reviews section-padding">
      <div className="container">
        <div className="reviews-card glass-panel text-center">
          <div className="reviews-badge">
            <span className="star-icon">★</span>
            <span>Creator Testimonials</span>
          </div>

          <h2 className="reviews-title">Reviews are coming soon.</h2>
          <p className="reviews-subtitle">
            We're currently gathering feedback and showcase clips from early video editors and creators.
            Real testimonials and ratings will be featured here shortly.
          </p>

          {/* Clean Layout Structure Prepared for Future Testimonial Expansion */}
          <div className="reviews-placeholder-grid">
            <div className="placeholder-card">
              <div className="stars-row">★★★★★</div>
              <div className="text-skeleton skeleton-1"></div>
              <div className="text-skeleton skeleton-2"></div>
              <div className="user-skeleton">
                <div className="avatar-circle"></div>
                <div className="user-meta-skeleton"></div>
              </div>
            </div>

            <div className="placeholder-card featured-card">
              <div className="stars-row">★★★★★</div>
              <div className="text-skeleton skeleton-1"></div>
              <div className="text-skeleton skeleton-3"></div>
              <div className="user-skeleton">
                <div className="avatar-circle"></div>
                <div className="user-meta-skeleton"></div>
              </div>
            </div>

            <div className="placeholder-card">
              <div className="stars-row">★★★★★</div>
              <div className="text-skeleton skeleton-1"></div>
              <div className="text-skeleton skeleton-2"></div>
              <div className="user-skeleton">
                <div className="avatar-circle"></div>
                <div className="user-meta-skeleton"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
