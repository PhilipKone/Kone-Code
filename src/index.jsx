import React from 'react'
import { hydrateRoot, createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import ErrorBoundary from './components/ErrorBoundary'

const rootElement = document.getElementById('root');

if (rootElement.hasChildNodes()) {
    hydrateRoot(
        rootElement,
        <React.StrictMode>
            <ErrorBoundary appName="Kone-Code">
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </ErrorBoundary>
        </React.StrictMode>
    );
} else {
    const root = createRoot(rootElement);
    root.render(
        <React.StrictMode>
            <ErrorBoundary appName="Kone-Code">
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </ErrorBoundary>
        </React.StrictMode>
    );
}
