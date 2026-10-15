import React, { useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import StylesGallery from './components/StylesGallery';
import WorkflowStudio from './components/WorkflowStudio';
import VideoBreakdown from './components/VideoBreakdown';
import Pricing from './components/Pricing';
import Installation from './components/Installation';
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
        {/* 01: Hero Section — Cinematic Product Output */}
        <Hero />

        {/* 02: 6 Authentic Signature Caption Styles Visual Gallery */}
        <StylesGallery />

        {/* 03: 5-Stage Connected Production Sequence */}
        <WorkflowStudio />

        {/* 04: Real Feature Breakdown Video & Editorial Capabilities */}
        <VideoBreakdown />

        {/* 05: Transparent Lifetime Pricing & Checkout */}
        <Pricing />

        {/* 06: 4-Step Installation Setup, Direct Support & FAQs */}
        <Installation />
      </main>

      {/* 07: Compact Editorial Footer */}
      <Footer />
    </>
  );
}

export default App;
