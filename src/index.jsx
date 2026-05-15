import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import ErrorBoundary from './components/ErrorBoundary'

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ErrorBoundary appName="Kone-Code">
            <HashRouter>
                <App />
            </HashRouter>
        </ErrorBoundary>
    </React.StrictMode>,
)
