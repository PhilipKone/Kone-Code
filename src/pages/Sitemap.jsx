import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaChevronLeft, FaExternalLinkAlt, FaCode, FaLaptopCode, FaGlobe } from 'react-icons/fa';
import './Sitemap.css';

const Sitemap = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const SCHEMA_ID = 'sitemap-breadcrumb-jsonld';
    let script = document.getElementById(SCHEMA_ID);
    if (script) script.remove();

    script = document.createElement('script');
    script.id = SCHEMA_ID;
    script.type = 'application/ld+json';
    script.innerHTML = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Kone Code",
          "item": "https://code.koneacademy.io/"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Sitemap",
          "item": "https://code.koneacademy.io/sitemap"
        }
      ]
    });
    document.head.appendChild(script);

    return () => {
      const scriptToRemove = document.getElementById(SCHEMA_ID);
      if (scriptToRemove) scriptToRemove.remove();
    };
  }, []);

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="code-sitemap-page">
      {/* Header action bar */}
      <div className="code-sitemap-header">
        <button onClick={handleBack} className="code-sitemap-back-btn">
          <FaChevronLeft /> Back
        </button>
        <span className="code-sitemap-brand">Kone Code Index</span>
      </div>

      <div className="code-sitemap-container">
        <div className="code-sitemap-card">
          <h1 className="code-sitemap-title">Kone Code Sitemap</h1>
          <p className="code-sitemap-subtitle">
            Local platform index for the web-based interactive compiler sandbox and software engineering platform.
          </p>

          <div className="code-sitemap-grid">
            {/* Column 1: Core Platform Routes */}
            <div className="code-sitemap-column">
              <div className="code-sitemap-col-header">
                <FaCode className="code-sitemap-icon" />
                <h2>Platform Routes</h2>
              </div>
              <div className="code-sitemap-list">
                <div className="code-sitemap-item">
                  <a href="/" className="code-sitemap-link">
                    Platform Landing Page
                  </a>
                  <p className="code-sitemap-desc">Kone Code homepage detailing curriculum, features, and sandbox capabilities.</p>
                </div>
                <div className="code-sitemap-item">
                  <a href="/ide" className="code-sitemap-link">
                    Interactive IDE Sandbox
                  </a>
                  <p className="code-sitemap-desc">Web-based code editor and compiler supporting dynamic debugging and coding tasks.</p>
                </div>
              </div>
            </div>

            {/* Column 2: Ecosystem & External Hubs */}
            <div className="code-sitemap-column">
              <div className="code-sitemap-col-header">
                <FaGlobe className="code-sitemap-icon" />
                <h2>Ecosystem Indexes</h2>
              </div>
              <div className="code-sitemap-list">
                <div className="code-sitemap-item">
                  <a href="https://www.koneacademy.io" className="code-sitemap-link" target="_blank" rel="noopener noreferrer">
                    Kone Academy Main Hub <FaExternalLinkAlt className="code-external-icon" />
                  </a>
                  <p className="code-sitemap-desc">Parent company landing page containing central index protocols and specs.</p>
                </div>
                <div className="code-sitemap-item">
                  <a href="https://www.koneacademy.io/sitemap" className="code-sitemap-link" target="_blank" rel="noopener noreferrer">
                    Central Sitemap Hub <FaExternalLinkAlt className="code-external-icon" />
                  </a>
                  <p className="code-sitemap-desc">Central map connecting all 11 subdomains and their dynamic page networks.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sitemap;
