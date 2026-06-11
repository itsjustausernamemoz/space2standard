import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const AuthGuard: React.FC = () => {
  const { user, loading, isAdmin } = useAuth();

  if (loading) {
    return (
      <div
        style={{ minHeight: '100vh', background: '#060b18', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}
      >
        <img src="/s2s-square.png" alt="Space2Standard" style={{ height: 48, width: 48, objectFit: 'contain', opacity: 0.7 }} />
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: '50%',
            border: '2px solid rgba(201,164,106,0.25)',
            borderTopColor: '#c9a46a',
            animation: 'spin 0.8s linear infinite',
          }}
        />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!user || !isAdmin) return <Navigate to="/login" replace />;

  return <Outlet />;
};
