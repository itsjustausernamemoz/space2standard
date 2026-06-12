import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { AuthGuard } from './components/AuthGuard';
import { Layout } from './components/Layout';

// Eagerly load Login — needed before auth resolves
import { Login } from './pages/Login';

// Lazy-load all protected pages — only fetched after auth passes
const Dashboard   = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Gallery     = lazy(() => import('./pages/Gallery').then(m => ({ default: m.Gallery })));
const Products    = lazy(() => import('./pages/Products').then(m => ({ default: m.Products })));
const ProductForm = lazy(() => import('./pages/ProductForm').then(m => ({ default: m.ProductForm })));
const Categories  = lazy(() => import('./pages/Categories').then(m => ({ default: m.Categories })));
const Orders      = lazy(() => import('./pages/Orders').then(m => ({ default: m.Orders })));
const Invoices    = lazy(() => import('./pages/Invoices').then(m => ({ default: m.Invoices })));
const InvoiceForm = lazy(() => import('./pages/InvoiceForm').then(m => ({ default: m.InvoiceForm })));
const Inventory   = lazy(() => import('./pages/Inventory').then(m => ({ default: m.Inventory })));
const Settings    = lazy(() => import('./pages/Settings').then(m => ({ default: m.Settings })));
const Messages    = lazy(() => import('./pages/Messages').then(m => ({ default: m.Messages })));
const Clients      = lazy(() => import('./pages/Clients').then(m => ({ default: m.Clients })));
const Production   = lazy(() => import('./pages/Production').then(m => ({ default: m.Production })));
const Suppliers    = lazy(() => import('./pages/Suppliers').then(m => ({ default: m.Suppliers })));
const Expenses     = lazy(() => import('./pages/Expenses').then(m => ({ default: m.Expenses })));
const Appointments     = lazy(() => import('./pages/Appointments').then(m => ({ default: m.Appointments })));
const WebsiteContent   = lazy(() => import('./pages/WebsiteContent').then(m => ({ default: m.WebsiteContent })));

const sfText = 'SF Pro Text, system-ui, -apple-system, sans-serif';

// Page-level suspense fallback — matches the app shell so there's no jarring flash
const PageFallback = () => (
  <div
    className="flex-1 flex items-center justify-center"
    style={{ minHeight: '60vh' }}
  >
    <div
      className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
      style={{ borderColor: '#c9a46a', borderTopColor: 'transparent' }}
    />
  </div>
);

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
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 40, background: '#060b18', minHeight: '100vh', fontFamily: sfText }}>
          <p style={{ color: '#c9a46a', fontSize: 14, marginBottom: 16 }}>Something went wrong.</p>
          <pre style={{ color: '#ef4444', fontSize: 12, whiteSpace: 'pre-wrap' }}>
            {this.state.error?.message}
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
                background: '#0d1220',
                color: '#ffffff',
                border: '1px solid rgba(201,164,106,0.15)',
                fontFamily: sfText,
                fontSize: '14px',
                padding: '12px 20px',
                borderRadius: '12px',
              },
            }}
          />
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<AuthGuard />}>
              <Route path="/" element={<Layout><Suspense fallback={<PageFallback />}><Dashboard /></Suspense></Layout>} />
              <Route path="/gallery" element={<Layout><Suspense fallback={<PageFallback />}><Gallery /></Suspense></Layout>} />
              <Route path="/categories" element={<Layout><Suspense fallback={<PageFallback />}><Categories /></Suspense></Layout>} />
              <Route path="/products" element={<Layout><Suspense fallback={<PageFallback />}><Products /></Suspense></Layout>} />
              <Route path="/clients" element={<Layout><Suspense fallback={<PageFallback />}><Clients /></Suspense></Layout>} />
              <Route path="/products/new" element={<Layout><Suspense fallback={<PageFallback />}><ProductForm /></Suspense></Layout>} />
              <Route path="/products/:id/edit" element={<Layout><Suspense fallback={<PageFallback />}><ProductForm /></Suspense></Layout>} />
              <Route path="/orders" element={<Layout><Suspense fallback={<PageFallback />}><Orders /></Suspense></Layout>} />
              <Route path="/invoices" element={<Layout><Suspense fallback={<PageFallback />}><Invoices /></Suspense></Layout>} />
              <Route path="/invoices/new" element={<Layout><Suspense fallback={<PageFallback />}><InvoiceForm /></Suspense></Layout>} />
              <Route path="/invoices/:id/edit" element={<Layout><Suspense fallback={<PageFallback />}><InvoiceForm /></Suspense></Layout>} />
              <Route path="/inventory" element={<Layout><Suspense fallback={<PageFallback />}><Inventory /></Suspense></Layout>} />
              <Route path="/settings" element={<Layout><Suspense fallback={<PageFallback />}><Settings /></Suspense></Layout>} />
              <Route path="/messages"      element={<Layout><Suspense fallback={<PageFallback />}><Messages /></Suspense></Layout>} />
              <Route path="/production"   element={<Layout><Suspense fallback={<PageFallback />}><Production /></Suspense></Layout>} />
              <Route path="/suppliers"    element={<Layout><Suspense fallback={<PageFallback />}><Suppliers /></Suspense></Layout>} />
              <Route path="/expenses"     element={<Layout><Suspense fallback={<PageFallback />}><Expenses /></Suspense></Layout>} />
              <Route path="/appointments" element={<Layout><Suspense fallback={<PageFallback />}><Appointments /></Suspense></Layout>} />
              <Route path="/content"      element={<Layout><Suspense fallback={<PageFallback />}><WebsiteContent /></Suspense></Layout>} />
            </Route>
          </Routes>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
