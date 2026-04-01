import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { WhatsAppFAB } from './components/WhatsAppFAB';
import { Home } from './pages/Home';
import { Products } from './pages/Products';
import { ProductDetail } from './pages/ProductDetail';
import { OrderForm } from './pages/OrderForm';
import { Contact } from './pages/Contact';
import { SettingsProvider } from './contexts/SettingsContext';
import { CartProvider } from './contexts/CartContext';
import { StorefrontAuthProvider } from './contexts/StorefrontAuthContext';
import { Auth } from './pages/Auth';
import { AccountSettings } from './pages/AccountSettings';
import { CartDrawer } from './components/CartDrawer';

function App() {
  return (
    <Router>
      <SettingsProvider>
        <StorefrontAuthProvider>
          <CartProvider>
            <div className="flex flex-col min-h-screen relative overflow-x-hidden">
            <Toaster 
              position="top-center" 
              toastOptions={{
                style: {
                  background: '#3d2314', // walnut-800
                  color: '#e8d5b7', // gold-300
                  border: '1px solid #c9a84c20', // gold-500/20
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '13px',
                  padding: '16px 24px',
                },
              }} 
            />
            <Navbar />
            <CartDrawer />
            <main className="flex-grow">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:id" element={<ProductDetail />} />
                <Route path="/order" element={<OrderForm />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/settings" element={<AccountSettings />} />
              </Routes>
            </main>
            <Footer />
            <WhatsAppFAB />
          </div>
          </CartProvider>
        </StorefrontAuthProvider>
      </SettingsProvider>
    </Router>
  );
}

export default App;
