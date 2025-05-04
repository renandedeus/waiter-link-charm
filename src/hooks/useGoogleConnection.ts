
import { useGoogleAuth, UseGoogleAuthResult } from './useGoogleAuth';
import { useGoogleLocation, UseGoogleLocationResult } from './useGoogleLocation';

export interface UseGoogleConnectionResult extends UseGoogleAuthResult, UseGoogleLocationResult {
  // Combined interface from both hooks
}

export const useGoogleConnection = (
  onRestaurantUpdate: (updatedRestaurant: any) => void, 
  restaurant: any
): UseGoogleConnectionResult => {
  const auth = useGoogleAuth();
  const location = useGoogleLocation(onRestaurantUpdate, restaurant);
  
  return {
    ...auth,
    ...location
  };
};
