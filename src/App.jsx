import React, { useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import StylesGallery from './components/StylesGallery';
import StylingControls from './components/StylingControls';
import WorkflowStudio from './components/WorkflowStudio';
import VersionComparison from './components/VersionComparison';
import VideoBreakdown from './components/VideoBreakdown';
import Installation from './components/Installation';
import Pricing from './components/Pricing';
import Reviews from './components/Reviews';
import SupportCard from './components/SupportCard';
import Footer from './components/Footer';
import EditorBackground from './components/EditorBackground';

function App() {
  // Global safeguard: restore scroll wheel if no modal overlay is active
  useEffect(() => {
    const ensureScrollUnlocked = () => {
      const activeModal = document.querySelector('.license-modal-overlay, .admin-overlay, .processing-overlay-container, .modal-backdrop');
      if (!activeModal && document.body.style.overflow === 'hidden') {
        document.body.style.removeProperty('overflow');
        document.body.style.removeProperty('contain');
        document.documentElement.style.removeProperty('overflow');
        document.documentElement.style.removeProperty('contain');
      }
    };

    window.addEventListener('focus', ensureScrollUnlocked);
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') ensureScrollUnlocked();
    });

    return () => {
      window.removeEventListener('focus', ensureScrollUnlocked);
    };
  }, []);

  return (
    <>
      <EditorBackground />
      <Header />
      <main>
        {/* 01: Hero Section */}
        <Hero />

        {/* 02: 6 Authentic Signature Styles Gallery */}
        <StylesGallery />

        {/* 03: Deeper Typography & Styling Controls */}
        <StylingControls />

        {/* 04: Unified 5-Stage Workflow Studio */}
        <WorkflowStudio />

        {/* 05: Version 1.2 Full Feature Breakdown Video */}
        <VideoBreakdown />

        {/* 06: Version 1.0 vs Version 1.2 Comparison */}
        <VersionComparison />

        {/* 06: Fast 4-Step Installation Setup */}
        <Installation />

        {/* 07: Honest Lifetime Pricing & Checkout */}
        <Pricing />

        {/* 08: Editor Advantages, Ratings & Guarantee */}
        <Reviews />

        {/* 09: Priority Creator Support */}
        <SupportCard />
      </main>

      {/* 10: Comprehensive Footer */}
      <Footer />
    </>
  );
}

export default App;
