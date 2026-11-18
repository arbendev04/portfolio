import { useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Hero from './components/Hero';
import Projects from './components/Projects';
import TechStack from './components/TechStack';
import Certifications from './components/Certifications';
import Contact from './components/Contact';
import SiteControls from './components/SiteControls';
import { initLenis } from './lib/lenis';
import { PRERENDERED_ATTR } from './seo/prerender';
import './App.css';

export default function App() {
  useEffect(() => {
    initLenis();
    // The build prerenders static markup into #root and index.html keeps it
    // hidden while marked; by now React has replaced it, so reveal the root.
    document.getElementById('root')?.removeAttribute(PRERENDERED_ATTR);
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
        <Certifications />
        <Contact />
      </main>
    </>
  );
}
