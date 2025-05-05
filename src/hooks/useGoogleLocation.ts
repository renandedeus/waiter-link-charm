
import { useState, useEffect } from 'react';
import { useToast } from "@/components/ui/use-toast";

export interface BusinessLocation {
  id: string;
  name: string;
  address: string;
}

export interface UseGoogleLocationResult {
  locationName: string | null;
  selectedLocation: BusinessLocation | null;
  businessLocations: BusinessLocation[];
  setLocationName: (name: string) => void;
  handleSaveLocation: () => void;
  handleLocationSelect: (location: BusinessLocation) => void;
}

export const useGoogleLocation = (
  onRestaurantUpdate: (updatedRestaurant: any) => void, 
  restaurant: any
): UseGoogleLocationResult => {
  const { toast } = useToast();
  const [locationName, setLocationName] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<BusinessLocation | null>(null);
  const [businessLocations, setBusinessLocations] = useState<BusinessLocation[]>([]);
  
  // Load saved location name on mount
  useEffect(() => {
    const savedLocationName = localStorage.getItem('google_location_name');
    const savedLocationData = localStorage.getItem('google_selected_location');
    
    if (savedLocationName) {
      setLocationName(savedLocationName);
    }
    
    if (savedLocationData) {
      try {
        const parsedLocation = JSON.parse(savedLocationData);
        setSelectedLocation(parsedLocation);
      } catch (e) {
        console.error('Error parsing saved location data:', e);
      }
    }
    
    // Simulate fetching business locations from Google API
    // In a real implementation, this would come from the Google Places API
    setBusinessLocations([
      { 
        id: "place_id_1", 
        name: "Valentella Pizzeria", 
        address: "Rua Vitória, 21 Qd 09 Lt 09" 
      },
      { 
        id: "place_id_2", 
        name: "Valentella Pizzeria", 
        address: "RUA VITORIA, 21 QUADRA 09 LOTE 09" 
      },
      { 
        id: "place_id_3", 
        name: "Valentella Pizzeria - Unidade 2", 
        address: "Av. Central, 45 Qd 12 Lt 03" 
      }
    ]);
  }, []);
  
  const handleLocationSelect = (location: BusinessLocation) => {
    setSelectedLocation(location);
    setLocationName(location.name);
    localStorage.setItem('google_selected_location', JSON.stringify(location));
    localStorage.setItem('google_location_name', location.name);
    
    toast({
      title: "Local selecionado",
      description: `${location.name} foi selecionado.`,
    });
  };
  
  const handleSaveLocation = () => {
    if (selectedLocation) {
      localStorage.setItem('google_location_name', selectedLocation.name);
      
      const reviewUrl = "https://g.page/r/review-link-for-" + 
        selectedLocation.name.replace(/\s+/g, '-').toLowerCase();
      
      const updatedRestaurant = {
        ...restaurant,
        name: selectedLocation.name,
        address: selectedLocation.address,
        googleReviewUrl: reviewUrl,
        google_review_url: reviewUrl,
      };
      
      onRestaurantUpdate(updatedRestaurant);
      
      toast({
        title: "Local salvo",
        description: `${selectedLocation.name} foi configurado como seu negócio principal.`,
        variant: "default",
      });
    } else if (locationName) {
      localStorage.setItem('google_location_name', locationName);
      
      const reviewUrl = "https://g.page/r/review-link-for-" + 
        locationName.replace(/\s+/g, '-').toLowerCase();
      
      const updatedRestaurant = {
        ...restaurant,
        name: locationName,
        googleReviewUrl: reviewUrl,
        google_review_url: reviewUrl,
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
    selectedLocation,
    businessLocations,
    setLocationName,
    handleSaveLocation,
    handleLocationSelect
  };
};
