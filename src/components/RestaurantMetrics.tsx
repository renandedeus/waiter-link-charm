
import { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Restaurant } from '@/types';
import { 
  ChartPie, 
  Star, 
  TrendingUp, 
  MessageSquare, 
  ThumbsUp, 
  ThumbsDown 
} from 'lucide-react';
import { setRestaurantInfo, updateRestaurantFeedback, getTotalClicks, getTotalConversions } from '@/services/waiterService';
import { useToast } from "@/components/ui/use-toast";

interface RestaurantMetricsProps {
  restaurant: Restaurant;
  onUpdate: (updatedRestaurant: Restaurant) => void;
}

export const RestaurantMetrics = ({ restaurant, onUpdate }: RestaurantMetricsProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    totalReviews: restaurant.totalReviews || 0,
    initialRating: restaurant.initialRating || 4.0,
    currentRating: restaurant.currentRating || 4.0,
    positiveFeedback: restaurant.positiveFeedback || '',
    negativeFeedback: restaurant.negativeFeedback || ''
  });
  const [totalClicks, setTotalClicks] = useState(0);
  const [totalConversions, setTotalConversions] = useState(0);
  const [conversionRate, setConversionRate] = useState(0);
  const [newReviewsThisMonth, setNewReviewsThisMonth] = useState(0);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchMetrics = async () => {
      const clicks = await getTotalClicks();
      const conversions = await getTotalConversions();
      
      setTotalClicks(clicks);
      setTotalConversions(conversions);
      
      // Calculate conversion rate
      const rate = clicks > 0 ? (conversions / clicks) * 100 : 0;
      setConversionRate(rate);
      
      // Calculate new reviews this month (simulation - 30% of total clicks)
      setNewReviewsThisMonth(Math.floor(clicks * 0.3));
    };
    
    fetchMetrics();
  }, []);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'initialRating' || name === 'currentRating' || name === 'totalReviews' 
        ? parseFloat(value) 
        : value
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Update restaurant info
      const updatedRestaurant = await setRestaurantInfo(
        restaurant.name,
        restaurant.googleReviewUrl,
        formData.totalReviews,
        formData.initialRating,
        formData.currentRating
      );
      
      // Update feedback
      await updateRestaurantFeedback(
        formData.positiveFeedback,
        formData.negativeFeedback
      );
      
      onUpdate(updatedRestaurant);
      setIsEditing(false);
      
      toast({
        title: "Information updated",
        description: "Restaurant metrics have been updated successfully.",
      });
    } catch (error) {
      console.error('Error updating restaurant metrics:', error);
      toast({
        title: "Error",
        description: "Failed to update restaurant metrics.",
        variant: "destructive"
      });
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <ChartPie className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{restaurant.totalReviews || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{newReviewsThisMonth} this month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold">{restaurant.currentRating?.toFixed(1) || '0.0'}</span>
              <span className="text-xs text-muted-foreground">
                {restaurant.initialRating && restaurant.currentRating ? 
                  (restaurant.currentRating > restaurant.initialRating ? 
                    `+${(restaurant.currentRating - restaurant.initialRating).toFixed(1)}` : 
                    `${(restaurant.currentRating - restaurant.initialRating).toFixed(1)}`
                  ) : ''}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              From initial {restaurant.initialRating?.toFixed(1) || '0.0'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">QR Conversion</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              {totalConversions} conversions from {totalClicks} clicks
            </p>
          </CardContent>
        </Card>
      </div>
      
      {isEditing ? (
        <Card>
          <CardHeader>
            <CardTitle>Update Restaurant Metrics</CardTitle>
            <CardDescription>Update your restaurant's key metrics and feedback</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="totalReviews">Total Reviews</Label>
                  <Input 
                    id="totalReviews"
                    name="totalReviews"
                    type="number"
                    min="0"
                    step="1"
                    value={formData.totalReviews}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="initialRating">Initial Rating</Label>
                  <Input 
                    id="initialRating"
                    name="initialRating"
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={formData.initialRating}
                    onChange={handleChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="currentRating">Current Rating</Label>
                  <Input 
                    id="currentRating"
                    name="currentRating"
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={formData.currentRating}
                    onChange={handleChange}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="positiveFeedback">Positive Feedback (Optional)</Label>
                <Textarea 
                  id="positiveFeedback"
                  name="positiveFeedback"
                  placeholder="What are customers saying positively about your restaurant?"
                  value={formData.positiveFeedback}
                  onChange={handleChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="negativeFeedback">Areas for Improvement (Optional)</Label>
                <Textarea 
                  id="negativeFeedback"
                  name="negativeFeedback"
                  placeholder="What aspects could be improved according to customers?"
                  value={formData.negativeFeedback}
                  onChange={handleChange}
                />
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" type="button" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  Save Changes
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="flex items-center">
                  <ThumbsUp className="h-4 w-4 mr-2" />
                  Positive Feedback
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                {restaurant.positiveFeedback || "No positive feedback recorded yet."}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="flex items-center">
                  <ThumbsDown className="h-4 w-4 mr-2" />
                  Areas for Improvement
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                {restaurant.negativeFeedback || "No areas for improvement recorded yet."}
              </p>
            </CardContent>
          </Card>
          
          <Button 
            onClick={() => setIsEditing(true)} 
            className="md:col-span-2"
          >
            Edit Metrics & Feedback
          </Button>
        </div>
      )}
    </div>
  );
};
