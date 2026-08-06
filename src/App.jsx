import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Showcase from './components/Showcase';
import ReleaseNotes from './components/ReleaseNotes';
import Pricing from './components/Pricing';
import SupportCard from './components/SupportCard';
import Installation from './components/Installation';
import Reviews from './components/Reviews';
import Footer from './components/Footer';

function App() {
  return (
    <>
      <div className="glow-bg"></div>
      <Header />
      <main>
        <Hero />
        <Showcase />
        <ReleaseNotes />
        <Pricing />
        <SupportCard />
        <Installation />
        <Reviews />
      </main>
      <Footer />
    </>
  );
}

export default App;
