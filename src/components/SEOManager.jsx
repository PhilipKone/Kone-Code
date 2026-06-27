import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const DEFAULT_SEO = {
  title: "Kone Code | Professional Coding Bootcamps & STEM Training",
  description: "Accelerate your career in software development. Join our Python Masterclass, JavaScript Bootcamp, and hands-on coding courses in Accra and online.",
  keywords: "Kone Code, learn programming, Python bootcamps Ghana, coding school Accra, software developer training",
  schema: [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Kone Code Academy",
      "url": "https://code.koneacademy.io/",
      "parentOrganization": {
        "@type": "Organization",
        "name": "Kone Academy",
        "url": "https://www.koneacademy.io/"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "Course",
      "name": "Python Software Engineering Track",
      "description": "Master Python programming from syntax basics to database integrations, APIs, and Machine Learning models.",
      "provider": {
        "@type": "Organization",
        "name": "Kone Code Academy",
        "sameAs": "https://code.koneacademy.io/"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "Course",
      "name": "Full-Stack JavaScript & TypeScript Track",
      "description": "Complete software engineering track covering modern JavaScript, React, Node.js, and clean TypeScript code.",
      "provider": {
        "@type": "Organization",
        "name": "Kone Code Academy",
        "sameAs": "https://code.koneacademy.io/"
      }
    }
  ]
};

const ROUTE_SEO_MAP = {
  '/': DEFAULT_SEO,
  '/ide': {
    title: "Interactive Web IDE | Run Code Online - Kone Code",
    description: "Write, run, and test Python, JavaScript, and HTML/CSS directly in your browser with our integrated coding workspace.",
    keywords: "online IDE, browser compiler, practice coding, code sandbox"
  }
};

export const SEOManager = () => {
  const location = useLocation();

  useEffect(() => {
    // 1. Identify active config
    const path = location.pathname;
    const activeSEO = ROUTE_SEO_MAP[path] || DEFAULT_SEO;

    // 2. Update Document Meta Details
    document.title = activeSEO.title;

    // Helper to set/update meta tag content
    const updateMetaTag = (name, content, isProperty = false) => {
      const attribute = isProperty ? 'property' : 'name';
      let tag = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!tag) {
        tag = document.createElement('meta');
        tag.setAttribute(attribute, name);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content);
    };

    // Update main description & keyword tags
    updateMetaTag('description', activeSEO.description);
    updateMetaTag('keywords', activeSEO.keywords);

    // Update Open Graph (Social Sharing) Tags
    updateMetaTag('og:title', activeSEO.title, true);
    updateMetaTag('og:description', activeSEO.description, true);
    updateMetaTag('og:url', `https://code.koneacademy.io${location.pathname}`, true);

    // Update Twitter Card Tags
    updateMetaTag('twitter:title', activeSEO.title);
    updateMetaTag('twitter:description', activeSEO.description);

    // Update Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', `https://code.koneacademy.io${location.pathname}`);

    // 3. Update Dynamic JSON-LD Schema
    const SCHEMA_SCRIPT_ID = 'seo-dynamic-jsonld';
    let schemaScript = document.getElementById(SCHEMA_SCRIPT_ID);
    if (schemaScript) {
      schemaScript.remove();
    }

    if (activeSEO.schema) {
      schemaScript = document.createElement('script');
      schemaScript.id = SCHEMA_SCRIPT_ID;
      schemaScript.setAttribute('type', 'application/ld+json');
      schemaScript.innerHTML = JSON.stringify(activeSEO.schema);
      document.head.appendChild(schemaScript);
    }
  }, [location]);

  return null; // Side-effect component, renders nothing
};

export default SEOManager;
