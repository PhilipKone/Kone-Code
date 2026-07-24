import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const DEFAULT_SEO = {
  title: "Kone Code | Software Engineering & Technical Development",
  description: "Professional software engineering, technical development, automated compilers, and cloud-integrated workspaces for the Kone ecosystem.",
  keywords: "Kone Code, software engineering, technical development, web compiler, cloud IDE, software development Ghana",
  schema: [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "Kone Code",
      "url": "https://code.koneacademy.io/",
      "parentOrganization": {
        "@type": "Organization",
        "name": "Kone Academy",
        "url": "https://www.koneacademy.io/"
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
  },
  '/sitemap': {
    title: "Kone Code Sitemap | Technical Directory",
    description: "Technical directory and sitemap for Kone Code. Find the interactive web IDE, software engineering workspace, and developer integrations.",
    keywords: "Kone Code sitemap, developer sitemap, software engineering index"
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
    updateMetaTag('og:image', activeSEO.image || 'https://code.koneacademy.io/og-image.png', true);

    // Update Twitter Card Tags
    updateMetaTag('twitter:title', activeSEO.title);
    updateMetaTag('twitter:description', activeSEO.description);
    updateMetaTag('twitter:image', activeSEO.image || 'https://code.koneacademy.io/og-image.png');

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
