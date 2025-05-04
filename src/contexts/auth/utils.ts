
import { supabase } from '@/integrations/supabase/client';

export const logAccess = async (action: string, userId?: string | null, isAdmin: boolean = false) => {
  try {
    // Check if we have a valid userId before trying to log
    if (!userId && action !== 'payment_page_accessed') {
      console.log(`Skipping access log for action '${action}' - no user ID provided`);
      return;
    }
    
    await supabase.from('access_logs').insert({
      user_type: isAdmin ? 'admin' : 'restaurant',
      user_id: userId || null,
      action,
      ip_address: 'client-side',
      user_agent: navigator.userAgent,
    });
  } catch (error) {
    console.error('Failed to log access:', error);
  }
};
