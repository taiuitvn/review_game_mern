import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Rating from '../models/Ratings.js';

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MOVIE_REVIEWS_APP_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB', err));

async function convertRatings() {
  try {
    console.log('Starting rating conversion from 10-star to 5-star scale...');
    
    // Get all ratings
    const ratings = await Rating.find({});
    console.log(`Found ${ratings.length} ratings to convert`);
    
    let updatedCount = 0;
    
    // Process each rating
    for (const rating of ratings) {
      // Skip if already in 1-5 range or invalid value
      if (rating.value <= 5 || isNaN(rating.value)) {
        console.log(`Rating ID ${rating._id} already in 1-5 range or invalid (${rating.value}), skipping`);
        continue;
      }
      
      // Convert from 10-star to 5-star scale
      // Formula: newRating = Math.ceil(oldRating / 2)
      // This ensures ratings are rounded up to maintain positivity
      const oldValue = rating.value;
      const newValue = Math.ceil(oldValue / 2);
      
      // Validate new value
      if (isNaN(newValue) || newValue < 1 || newValue > 5) {
        console.log(`Skipping rating ID ${rating._id} due to invalid conversion result: ${newValue}`);
        continue;
      }
      
      // Update the rating
      try {
        rating.value = newValue;
        await rating.save();
        console.log(`Converted rating ID ${rating._id} from ${oldValue} to ${newValue}`);
        updatedCount++;
      } catch (err) {
        console.error(`Error saving rating ID ${rating._id}:`, err.message);
      }
    }
    
    console.log(`Conversion complete. Updated ${updatedCount} ratings.`);
  } catch (error) {
    console.error('Error converting ratings:', error);
  } finally {
    mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Run the conversion
convertRatings();