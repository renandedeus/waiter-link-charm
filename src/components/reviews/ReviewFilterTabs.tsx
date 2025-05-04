
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Review } from '@/types';

interface ReviewFilterTabsProps {
  activeTab: 'all' | 'positive' | 'negative';
  setActiveTab: (tab: 'all' | 'positive' | 'negative') => void;
  reviews: Review[];
}

const ReviewFilterTabs: React.FC<ReviewFilterTabsProps> = ({ 
  activeTab, 
  setActiveTab, 
  reviews 
}) => {
  return (
    <div className="flex space-x-2">
      <Badge 
        variant={activeTab === 'all' ? "default" : "outline"} 
        onClick={() => setActiveTab('all')} 
        className="cursor-pointer"
      >
        Todas ({reviews.length})
      </Badge>
      <Badge 
        variant={activeTab === 'positive' ? "default" : "outline"} 
        onClick={() => setActiveTab('positive')} 
        className="cursor-pointer"
      >
        Positivas ({reviews.filter(r => r.rating >= 4).length})
      </Badge>
      <Badge 
        variant={activeTab === 'negative' ? "default" : "outline"} 
        onClick={() => setActiveTab('negative')} 
        className="cursor-pointer"
      >
        Negativas ({reviews.filter(r => r.rating <= 3).length})
      </Badge>
    </div>
  );
};

export default ReviewFilterTabs;
