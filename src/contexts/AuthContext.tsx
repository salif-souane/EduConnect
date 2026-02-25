import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData: {
    firstName: string;
    lastName: string;
    role: 'admin' | 'teacher' | 'student' | 'parent';
  }) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        loadProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      (async () => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          await loadProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  // wait for auth.user row to replicate before touching dependent tables
  // supabase can have eventual consistency delays; retry with exponential backoff
  const ensureAuthUser = async () => {
    await new Promise((r) => setTimeout(r, 2500));
  };

  const signUp = async (
    email: string,
    password: string,
    userData: {
      firstName: string;
      lastName: string;
      role: 'admin' | 'teacher' | 'student' | 'parent';
    }
  ) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;
    if (!data.user) throw new Error('No user returned');

    // give the auth system time to persist the row before referencing it
    await ensureAuthUser();

    // Insert profile with retry logic for FK errors
    let profileError: any = null;
    const retryDelays = [3500, 5000, 7000]; // exponential backoff
    for (let attempt = 0; attempt <= retryDelays.length; attempt++) {
      const { error: err } = await supabase.from('profiles').insert({
        id: data.user.id,
        email,
        first_name: userData.firstName,
        last_name: userData.lastName,
        role: userData.role,
      });
      if (!err) {
        profileError = null;
        break;
      }
      if (err.code === '23503') {
        // FK error - retry with delay
        if (attempt < retryDelays.length) {
          const delay = retryDelays[attempt];
          console.warn(`FK error on attempt ${attempt + 1}, retrying in ${delay}ms...`, err.details);
          await new Promise((r) => setTimeout(r, delay));
        } else {
          profileError = err;
          console.error('FK error persists after all retries:', err.details);
        }
      } else {
        // non-FK error, don't retry
        profileError = err;
        break;
      }
    }
    if (profileError) throw profileError;

    if (userData.role === 'student') {
      await supabase.from('students').insert({
        id: data.user.id,
        date_of_birth: new Date().toISOString().split('T')[0],
      });
    } else if (userData.role === 'teacher') {
      await supabase.from('teachers').insert({
        id: data.user.id,
      });
    } else if (userData.role === 'parent') {
      await supabase.from('parents').insert({
        id: data.user.id,
      });
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
