
import { supabase } from '@/integrations/supabase/client';

export const logAccess = async (action: string, userId?: string, isAdmin: boolean = false) => {
  try {
    await supabase.from('access_logs').insert({
      user_type: isAdmin ? 'admin' : 'restaurant',
      user_id: userId || null,
      action,
      ip_address: 'client-side',
      user_agent: navigator.userAgent
    });
  } catch (error) {
    console.error('Failed to log access:', error);
  }
};
