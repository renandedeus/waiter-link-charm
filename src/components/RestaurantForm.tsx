
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Restaurant } from '@/types';
import { useToast } from "@/components/ui/use-toast";

interface RestaurantFormProps {
  restaurant: Restaurant;
  onSave: (name: string, googleReviewUrl: string) => void;
}

export const RestaurantForm = ({ restaurant, onSave }: RestaurantFormProps) => {
  const [name, setName] = useState(restaurant.name);
  const [googleReviewUrl, setGoogleReviewUrl] = useState(restaurant.googleReviewUrl);
  const [errors, setErrors] = useState<{ name?: string; url?: string }>({});
  const { toast } = useToast();

  const validateUrl = (url: string) => {
    // Simple validation for Google review URL format
    return url.includes('google.com');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: { name?: string; url?: string } = {};
    
    if (!name) {
      newErrors.name = "Restaurant name is required";
    }
    
    if (!googleReviewUrl) {
      newErrors.url = "Google Review URL is required";
    } else if (!validateUrl(googleReviewUrl)) {
      newErrors.url = "Please enter a valid Google URL";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSave(name, googleReviewUrl);
    toast({
      title: "Restaurant information saved",
      description: "Your restaurant details have been updated successfully.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Restaurant Information</CardTitle>
        <CardDescription>
          Add your restaurant details and Google review link
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="restaurant-name">Restaurant Name</Label>
            <Input
              id="restaurant-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter restaurant name"
            />
            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="review-url">Google Review URL</Label>
            <Input
              id="review-url"
              value={googleReviewUrl}
              onChange={(e) => setGoogleReviewUrl(e.target.value)}
              placeholder="https://g.page/r/..."
            />
            {errors.url && <p className="text-sm text-red-500">{errors.url}</p>}
          </div>
          
          <Button type="submit">Save Restaurant Info</Button>
        </form>
      </CardContent>
    </Card>
  );
};
