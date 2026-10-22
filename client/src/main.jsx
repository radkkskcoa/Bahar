import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { ToastProvider } from './context/ToastContext.jsx';
import { I18nProvider } from './context/I18nContext.jsx';
import { CatalogProvider } from './context/CatalogContext.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { DestinationProvider } from './context/DestinationContext.jsx';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <I18nProvider>
        <ToastProvider>
          <CatalogProvider>
            <AuthProvider>
              <DestinationProvider>
                <CartProvider>
                  <App />
                </CartProvider>
              </DestinationProvider>
            </AuthProvider>
          </CatalogProvider>
        </ToastProvider>
      </I18nProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
