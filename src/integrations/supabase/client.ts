
// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://fgpsfqjellkukgnqhmdh.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZncHNmcWplbGxrdWtnbnFobWRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYzMDI5MjEsImV4cCI6MjA2MTg3ODkyMX0.6mo95QL84cLRx8HZA7F0yM5yjoWF39tQ8i96XZLL9CM";

// Get the current site URL dynamically instead of hardcoding localhost
const getSiteURL = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'http://localhost:5173'; // Fallback for SSR or tests
};

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(
  SUPABASE_URL, 
  SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true
    }
  }
);

// Debug logging for authentication events
supabase.auth.onAuthStateChange((event, session) => {
  console.log('[Auth Debug] Event:', event);
  
  if (session) {
    console.log('[Auth Debug] Session:', {
      user: session.user?.email,
      token_expires: new Date(session.expires_at ? session.expires_at * 1000 : 0).toLocaleString(),
      hasExpired: session.expires_at ? Date.now() / 1000 > session.expires_at : false
    });
  } else {
    console.log('[Auth Debug] No session');
  }
});

// Initial session check
supabase.auth.getSession().then(({ data, error }) => {
  if (error) {
    console.error('[Auth Debug] Error getting session:', error);
  } else {
    console.log('[Auth Debug] Initial session:', data.session ? 'Authenticated' : 'Not authenticated');
    if (data.session) {
      console.log('[Auth Debug] User:', data.session.user?.email);
      console.log('[Auth Debug] Expires at:', new Date(data.session.expires_at * 1000).toLocaleString());
    }
  }
});
