import { useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Hero from './components/Hero';
import Projects from './components/Projects';
import TechStack from './components/TechStack';
import Contact from './components/Contact';
import SiteControls from './components/SiteControls';
import { initLenis } from './lib/lenis';
import './App.css';

export default function App() {
  useEffect(() => {
    initLenis();
  }, []);

  return (
    <>
      <div className="grid-texture" />
      <Sidebar />
      <SiteControls />
      <main className="main-content">
        <Hero />
        <Projects />
        <TechStack />
        <Contact />
      </main>
    </>
  );
}
