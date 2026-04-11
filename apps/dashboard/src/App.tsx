import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { AuthGuard } from './components/AuthGuard';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Gallery } from './pages/Gallery';
import { Products } from './pages/Products';
import { ProductForm } from './pages/ProductForm';
import { Categories } from './pages/Categories';
import { Orders } from './pages/Orders';
import { Invoices } from './pages/Invoices';
import { InvoiceForm } from './pages/InvoiceForm';
import { Inventory } from './pages/Inventory';
import { Settings } from './pages/Settings';
import { Messages } from './pages/Messages';
import { Clients } from './pages/Clients';

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, color: '#ef4444', fontFamily: 'monospace', background: '#0a0a0a', minHeight: '100vh' }}>
          <h1 style={{ color: '#c19b3a', marginBottom: 20 }}>⚠️ Dashboard Render Error</h1>
          <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', color: '#f87171' }}>
            {this.state.error?.message}
            {'\n\n'}
            {this.state.error?.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <Toaster 
            position="top-right" 
            toastOptions={{
              style: {
                background: '#121212',
                color: '#f5f0e8',
                border: '1px solid #c9a84c20',
                fontFamily: 'Inter, sans-serif',
                fontSize: '12px',
                padding: '12px 20px',
              },
            }} 
          />
          <Routes>
            <Route path="/login" element={<Login />} />
            
            <Route element={<AuthGuard />}>
              <Route path="/" element={<Layout><Dashboard /></Layout>} />
              <Route path="/gallery" element={<Layout><Gallery /></Layout>} />
              <Route path="/categories" element={<Layout><Categories /></Layout>} />
              <Route path="/products" element={<Layout><Products /></Layout>} />
              <Route path="/clients" element={<Layout><Clients /></Layout>} />
              <Route path="/products/new" element={<Layout><ProductForm /></Layout>} />
              <Route path="/products/:id/edit" element={<Layout><ProductForm /></Layout>} />
              <Route path="/orders" element={<Layout><Orders /></Layout>} />
              <Route path="/invoices" element={<Layout><Invoices /></Layout>} />
              <Route path="/invoices/new" element={<Layout><InvoiceForm /></Layout>} />
              <Route path="/invoices/:id/edit" element={<Layout><InvoiceForm /></Layout>} />
              <Route path="/inventory" element={<Layout><Inventory /></Layout>} />
              <Route path="/settings" element={<Layout><Settings /></Layout>} />
              <Route path="/messages" element={<Layout><Messages /></Layout>} />
            </Route>
          </Routes>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;

