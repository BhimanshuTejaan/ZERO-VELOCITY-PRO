import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Showcase from './components/Showcase';
import ReleaseNotes from './components/ReleaseNotes';
import Roadmap from './components/Roadmap';
import Reviews from './components/Reviews';
import Pricing from './components/Pricing';
import Installation from './components/Installation';
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
        <Roadmap />
        <Reviews />
        <Pricing />
        <Installation />
      </main>
      <Footer />
    </>
  );
}

export default App;
