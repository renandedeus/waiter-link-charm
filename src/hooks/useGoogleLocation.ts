
import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";

export interface UseGoogleLocationResult {
  locationName: string | null;
  setLocationName: (name: string) => void;
  handleSaveLocation: () => void;
}

export const useGoogleLocation = (
  onRestaurantUpdate: (updatedRestaurant: any) => void, 
  restaurant: any
): UseGoogleLocationResult => {
  const { toast } = useToast();
  const [locationName, setLocationName] = useState<string | null>(null);
  
  // Load saved location name on mount
  useEffect(() => {
    const savedLocationName = localStorage.getItem('google_location_name');
    if (savedLocationName) {
      setLocationName(savedLocationName);
    }
  }, []);
  
  const handleSaveLocation = () => {
    if (locationName) {
      localStorage.setItem('google_location_name', locationName);
      
      const updatedRestaurant = {
        ...restaurant,
        name: locationName,
        googleReviewUrl: "https://g.page/r/review-link-for-" + locationName.replace(/\s+/g, '-').toLowerCase(),
        google_review_url: "https://g.page/r/review-link-for-" + locationName.replace(/\s+/g, '-').toLowerCase(),
      };
      
      onRestaurantUpdate(updatedRestaurant);
      
      toast({
        title: "Local salvo",
        description: `${locationName} foi configurado como seu negócio principal.`,
        variant: "default",
      });
    }
  };

  return {
    locationName,
    setLocationName,
    handleSaveLocation
  };
};
