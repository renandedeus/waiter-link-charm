
import { supabase } from '@/integrations/supabase/client';
import { Waiter } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export const getWaiters = async (restaurantId: string): Promise<Waiter[]> => {
  try {
    const { data, error } = await supabase
      .from('waiters')
      .select('*')
      .eq('restaurantId', restaurantId);
      
    if (error) throw error;
    
    return data as Waiter[];
  } catch (error) {
    console.error('Error fetching waiters:', error);
    throw error;
  }
};

export const createWaiter = async (waiterData: {
  name: string;
  email: string;
  whatsapp: string;
  restaurantId: string;
}): Promise<Waiter> => {
  try {
    const id = uuidv4();
    const trackingId = uuidv4();
    
    const baseUrl = window.location.origin;
    const trackingLink = `${baseUrl}/r/${trackingId}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(trackingLink)}`;
    
    const waiter: Waiter = {
      id,
      trackingId,
      restaurantId: waiterData.restaurantId,
      name: waiterData.name,
      email: waiterData.email,
      whatsapp: waiterData.whatsapp,
      trackingLink,
      qrCodeUrl,
      clicks: 0,
      createdAt: new Date().toISOString()
    };
    
    const { error } = await supabase.from('waiters').insert(waiter);
    
    if (error) throw error;
    
    return waiter;
  } catch (error) {
    console.error('Error creating waiter:', error);
    throw error;
  }
};

export const deleteWaiter = async (waiterId: string): Promise<void> => {
  try {
    const { error } = await supabase.from('waiters').delete().eq('id', waiterId);
    
    if (error) throw error;
  } catch (error) {
    console.error('Error deleting waiter:', error);
    throw error;
  }
};
