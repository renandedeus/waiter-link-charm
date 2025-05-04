
import { supabase } from '@/integrations/supabase/client';

export const logAccess = async (action: string, userId?: string | null, isAdmin: boolean = false) => {
  try {
    console.log(`Logging access: ${action} for user ${userId || 'anonymous'}`);
    
    // Define the fields we're going to send
    const logEntry = {
      action,
      // Usar strings vazias em vez de null para evitar problemas de tipo
      user_id: userId || '',
      // Adicionamos campos tipo string que são seguros
      user_type: isAdmin ? 'admin' : 'restaurant',
      ip_address: 'client-side',
      user_agent: navigator.userAgent
    };
    
    const { error } = await supabase
      .from('access_logs')
      .insert([logEntry]);
    
    if (error) {
      console.error('Failed to log access:', error);
    }
  } catch (error) {
    console.error('Failed to log access:', error);
  }
};
