
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { UserSession } from '@/types';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signOut: () => Promise<void>;
  checkAdminStatus: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  isAdmin: false,
  isLoading: true,
  signIn: async () => ({ error: null }),
  signOut: async () => {},
  checkAdminStatus: async () => false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Use setTimeout to avoid potential deadlocks with Supabase's auth system
        if (session?.user) {
          setTimeout(() => {
            checkAdminStatus();
          }, 0);
        } else {
          setIsAdmin(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        checkAdminStatus();
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdminStatus = async (): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('id, email, role')
        .eq('email', user?.email)
        .single();

      if (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
        setIsLoading(false);
        return false;
      }

      const isUserAdmin = !!data;
      setIsAdmin(isUserAdmin);
      setIsLoading(false);
      return isUserAdmin;
    } catch (error) {
      console.error('Failed to check admin status:', error);
      setIsAdmin(false);
      setIsLoading(false);
      return false;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: 'Erro ao fazer login',
          description: error.message,
          variant: 'destructive',
        });
        return { error };
      }

      // Log this access
      await logAccess('login', data.user?.id);
      
      return { error: null };
    } catch (error) {
      console.error('Error during sign in:', error);
      toast({
        title: 'Erro ao fazer login',
        description: 'Ocorreu um erro inesperado',
        variant: 'destructive',
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      // Log this access before signing out
      await logAccess('logout', user?.id);
      
      await supabase.auth.signOut();
      setIsAdmin(false);
    } catch (error) {
      console.error('Error during sign out:', error);
      toast({
        title: 'Erro ao sair',
        description: 'Ocorreu um erro inesperado ao tentar sair',
        variant: 'destructive',
      });
    }
  };

  const logAccess = async (action: string, userId?: string) => {
    try {
      await supabase.from('access_logs').insert({
        user_type: isAdmin ? 'admin' : 'restaurant',
        user_id: userId,
        action,
        ip_address: 'client-side',
        user_agent: navigator.userAgent,
      });
    } catch (error) {
      console.error('Failed to log access:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        isAdmin,
        isLoading,
        signIn,
        signOut,
        checkAdminStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
