
import React from 'react';
import { Review } from '@/types';

interface ReviewItemProps {
  review: Review;
  isSelected: boolean;
  onClick: () => void;
}

const ReviewItem: React.FC<ReviewItemProps> = ({ review, isSelected, onClick }) => {
  return (
    <div 
      onClick={onClick} 
      className={`p-4 border rounded-md cursor-pointer transition-colors ${
        isSelected ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
      }`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">{review.author || 'Anônimo'}</h3>
          <p className="text-sm text-gray-500">
            {new Date(review.date).toLocaleDateString('pt-BR')}
          </p>
        </div>
        <div className="flex">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`${
                star <= review.rating ? 'text-yellow-400' : 'text-gray-300'
              } text-lg`}
            >
              ★
            </span>
          ))}
        </div>
      </div>
      <p className="mt-2 text-sm">{review.content}</p>
      
      {review.response && (
        <div className="mt-3 bg-gray-50 p-3 rounded-md">
          <p className="text-xs font-medium text-gray-500 mb-1">Sua resposta:</p>
          <p className="text-sm">{review.response}</p>
        </div>
      )}
    </div>
  );
};

export default ReviewItem;
