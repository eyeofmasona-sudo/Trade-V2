import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  role: 'LITE' | 'PRO' | 'ADMIN' | 'STUDENT' | 'INSTRUCTOR' | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signInMockAdmin: () => void;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  role: null,
  loading: true,
  signOut: async () => {},
  signInMockAdmin: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'LITE' | 'PRO' | 'ADMIN' | 'STUDENT' | 'INSTRUCTOR' | null>(null);
  const [loading, setLoading] = useState(true);

  const signInMockAdmin = () => {
    const mockUser = { id: 'admin-mock', email: 'BulAdm26352' } as User;
    const mockSession = { user: mockUser, access_token: 'mock-token', refresh_token: 'mock', expires_in: 9999, token_type: 'bearer' } as Session;
    setSession(mockSession);
    setUser(mockUser);
    setRole('ADMIN');
    setLoading(false);
  };

  useEffect(() => {
    const fetchRole = async (userId: string) => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('role')
          .eq('id', userId)
          .single();
        
        if (data) {
          setRole(data.role as any);
        } else {
          // Default role if not found
          setRole('STUDENT');
        }
      } catch (err) {
        setRole('STUDENT');
      }
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchRole(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      const newUser = session?.user ?? null;
      setUser(newUser);
      if (newUser) {
        fetchRole(newUser.id);
      } else {
        setRole(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Update loading only when role is also determined if user is logged in
  useEffect(() => {
    if (!session || (session && role)) {
      setLoading(false);
    }
  }, [session, role]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, role, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
