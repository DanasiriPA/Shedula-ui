// ./src/app/my-appointments/components/Rating.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaStar } from 'react-icons/fa';

// Removed the empty interface as no specific props are currently passed to the component.
// If props are needed in the future, define them directly within the interface.

const RATING_STORAGE_KEY = 'appointment_rating'; // Example for single rating

// Changed React.FC<RatingProps> to React.FC as no props are currently used.
const Rating: React.FC = () => {
  const [rating, setRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [hasRated, setHasRated] = useState<boolean>(false);

  useEffect(() => {
    // In a real app, you'd fetch the rating for the specific appointment.
    // This example uses localStorage for a simple demo.
    if (typeof window !== 'undefined') {
      const storedRating = localStorage.getItem(RATING_STORAGE_KEY);
      if (storedRating) {
        setRating(parseInt(storedRating));
        setHasRated(true);
      }
    }
  }, []);

  const handleStarClick = (selectedRating: number) => {
    if (typeof window !== 'undefined') {
      setRating(selectedRating);
      localStorage.setItem(RATING_STORAGE_KEY, selectedRating.toString());
      setHasRated(true);
    }
  };

  return (
    <motion.div
      className="bg-white p-6 rounded-xl shadow-md border border-gray-200 mt-6 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h4 className="text-2xl font-bold text-blue-700 mb-4 flex items-center justify-center gap-2">
        <FaStar className="text-yellow-500" /> Rate Your Experience
      </h4>
      
      {!hasRated && (
        <div className="flex justify-center gap-1 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <motion.button
              key={star}
              className="text-gray-300 transition-colors"
              onClick={() => handleStarClick(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
            >
              <FaStar className={`text-4xl ${
                (hoverRating >= star || rating >= star) ? 'text-yellow-400' : 'text-gray-300'
              }`} />
            </motion.button>
          ))}
        </div>
      )}
      
      {rating > 0 && (
        <p className="text-lg text-gray-700">
          {hasRated ? "You have rated this appointment:" : "Your rating:"}
        </p>
      )}

      {rating > 0 && (
        <div className="flex justify-center gap-1 mt-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <FaStar
              key={star}
              className={`text-4xl ${rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}
            />
          ))}
        </div>
      )}

      {hasRated && <p className="text-green-600 font-semibold mt-4">Thank you for your feedback!</p>}
    </motion.div>
  );
};

export default Rating;
