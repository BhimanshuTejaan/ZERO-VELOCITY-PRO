import React from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Showcase from './components/Showcase';
import Roadmap from './components/Roadmap';
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
        <Roadmap />
        <Pricing />
        <Installation />
      </main>
      <Footer />
    </>
  );
}

export default App;
