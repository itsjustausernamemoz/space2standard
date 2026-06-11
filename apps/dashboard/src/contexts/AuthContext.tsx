import React, { createContext, useContext, useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_CACHE_KEY = 's2s_admin_uid';

function getCachedAdminUid(): string | null {
  try { return sessionStorage.getItem(ADMIN_CACHE_KEY); } catch { return null; }
}
function setCachedAdminUid(uid: string | null) {
  try {
    if (uid) sessionStorage.setItem(ADMIN_CACHE_KEY, uid);
    else sessionStorage.removeItem(ADMIN_CACHE_KEY);
  } catch {}
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();

        if (!mounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (!session?.user) {
          setCachedAdminUid(null);
          setIsAdmin(false);
          setLoading(false);
          return;
        }

        // If this user's UID is cached as admin, show the app immediately
        // and validate in the background.
        const cachedUid = getCachedAdminUid();
        if (cachedUid === session.user.id) {
          setIsAdmin(true);
          setLoading(false);
          // Background validation — clears cache if role was revoked
          verifyAdminRole(session.user.id, false);
        } else {
          // First visit or different user — must wait for DB check
          await verifyAdminRole(session.user.id, true);
        }
      } catch (err) {
        console.error('AuthContext init error:', err);
        if (mounted) setLoading(false);
      }
    };

    const verifyAdminRole = async (userId: string, block: boolean) => {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', userId)
          .single();

        if (!mounted) return;

        if (error && error.code === 'PGRST116') {
          // Profile doesn't exist — auto-create as customer (safe default)
          const { data: userData } = await supabase.auth.getUser();
          if (userData?.user) {
            await supabase.from('profiles').insert({
              id: userId,
              email: userData.user.email,
              role: 'customer',
            });
          }
          setCachedAdminUid(null);
          if (mounted) { setIsAdmin(false); if (block) setLoading(false); }
        } else if (error) {
          throw error;
        } else {
          const adminConfirmed = data?.role === 'admin';
          setCachedAdminUid(adminConfirmed ? userId : null);
          if (mounted) {
            setIsAdmin(adminConfirmed);
            if (block) setLoading(false);
          }
        }
      } catch (err) {
        console.error('AuthContext: role check error:', err);
        if (mounted && block) setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      setSession(session);
      setUser(session?.user ?? null);

      if (!session?.user) {
        setCachedAdminUid(null);
        setIsAdmin(false);
        setLoading(false);
        return;
      }

      // On SIGNED_IN always re-verify (don't trust stale cache for a fresh login)
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await verifyAdminRole(session.user.id, true);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    setCachedAdminUid(null);
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, isAdmin, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
