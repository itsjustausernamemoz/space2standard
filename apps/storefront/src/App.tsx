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
import { About } from './pages/About';
import { Contact } from './pages/Contact';
import { SettingsProvider } from './contexts/SettingsContext';
import { CartProvider } from './contexts/CartContext';
import { CartDrawer } from './components/CartDrawer';

function App() {
  return (
    <Router>
      <SettingsProvider>
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
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
              </Routes>
            </main>
            <Footer />
            <WhatsAppFAB />
          </div>
        </CartProvider>
      </SettingsProvider>
    </Router>
  );
}

export default App;
