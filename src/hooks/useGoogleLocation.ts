
import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";

export interface UseGoogleLocationResult {
  locationName: string | null;
  googleReviewUrl: string | null;
  setLocationName: (name: string) => void;
  setGoogleReviewUrl: (url: string) => void;
  handleSaveLocation: () => void;
}

export const useGoogleLocation = (
  onRestaurantUpdate: (updatedRestaurant: any) => void, 
  restaurant: any
): UseGoogleLocationResult => {
  const { toast } = useToast();
  const [locationName, setLocationName] = useState<string | null>(null);
  const [googleReviewUrl, setGoogleReviewUrl] = useState<string | null>(
    "https://g.page/r/CdSwPJZk5Ty6EBM/review"
  );
  
  // Load saved location name and URL on mount
  useEffect(() => {
    const savedLocationName = localStorage.getItem('google_location_name');
    const savedReviewUrl = localStorage.getItem('google_review_url') || "https://g.page/r/CdSwPJZk5Ty6EBM/review";
    
    if (savedLocationName) {
      setLocationName(savedLocationName);
    }
    
    if (savedReviewUrl) {
      setGoogleReviewUrl(savedReviewUrl);
    }
  }, []);
  
  const handleSaveLocation = () => {
    if (locationName) {
      localStorage.setItem('google_location_name', locationName);
      
      // Save the Google review URL
      if (googleReviewUrl) {
        localStorage.setItem('google_review_url', googleReviewUrl);
      }
      
      const updatedRestaurant = {
        ...restaurant,
        name: locationName,
        googleReviewUrl: googleReviewUrl || "https://g.page/r/CdSwPJZk5Ty6EBM/review",
        google_review_url: googleReviewUrl || "https://g.page/r/CdSwPJZk5Ty6EBM/review",
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
    googleReviewUrl,
    setLocationName,
    setGoogleReviewUrl,
    handleSaveLocation
  };
};
