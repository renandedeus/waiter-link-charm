
import React, { useState, useEffect } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import AuthContext from './AuthContext';
import { logAccess } from './utils';

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
        console.log("Auth state changed:", _event, session?.user?.email);
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
      console.log("Initial session check:", session?.user?.email);
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
    if (!user) {
      setIsAdmin(false);
      setIsLoading(false);
      return false;
    }

    try {
      const userEmail = user.email || '';
      const { data, error } = await supabase
        .from('admin_users')
        .select('id, email, role')
        .eq('email', userEmail)
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
      console.log("Attempting sign in for:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Sign in error:", error.message);
        // Special handling for email not confirmed
        if (error.message.includes("Email not confirmed")) {
          // Attempt to sign up again which will resend the confirmation email
          const { error: signUpError } = await supabase.auth.signUp({
            email,
            password,
          });
          
          if (!signUpError) {
            toast({
              title: 'Email de confirmação reenviado',
              description: 'Por favor, verifique seu email e confirme sua conta.',
              variant: 'info',
            });
          } else {
            toast({
              title: 'Erro ao fazer login',
              description: error.message,
              variant: 'destructive',
            });
          }
        } else {
          toast({
            title: 'Erro ao fazer login',
            description: error.message,
            variant: 'destructive',
          });
        }
        return { error };
      }

      // Log this access
      await logAccess('login', data.user?.id, isAdmin);
      
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
      await logAccess('logout', user?.id, isAdmin);
      
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
