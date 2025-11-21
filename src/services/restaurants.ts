import { supabase } from '../lib/supabase';
import type { Restaurant, RestaurantReview } from '../types/restaurant';
import { normalizeCoverImages } from '../utils/coverImages';
import { DEMO_RESTAURANT, DEMO_RESTAURANT_ID, DEMO_REVIEWS } from '../data/demoMenu';

export async function getRestaurantById(id: string): Promise<Restaurant | null> {
  const { data, error } = await supabase
    .from('restaurants')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching restaurant:', error);
    if (id === DEMO_RESTAURANT_ID) {
      const coverImagesClone = Array.isArray(DEMO_RESTAURANT.cover_images)
        ? DEMO_RESTAURANT.cover_images.map((cover) =>
            typeof cover === 'string' ? cover : { ...cover }
          )
        : undefined;
      return { ...DEMO_RESTAURANT, cover_images: coverImagesClone } as Restaurant;
    }
    return null;
  }

  const restaurant = data as unknown as Restaurant;
  
  // Normalize cover_images if present (migrate from string[] to CoverImage[])
  if (restaurant.cover_images) {
    restaurant.cover_images = normalizeCoverImages(restaurant.cover_images);
  }

  return restaurant;
}

export async function getRestaurantReviews(restaurantId: string): Promise<RestaurantReview[]> {
  const { data, error } = await supabase
    .from('restaurant_reviews')
    .select('*')
    .eq('restaurant_id', restaurantId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching reviews:', error);
    if (restaurantId === DEMO_RESTAURANT_ID) {
      return DEMO_REVIEWS.map((review) => ({ ...review }));
    }
    return [];
  }

  if (!data || data.length === 0) {
    if (restaurantId === DEMO_RESTAURANT_ID) {
      return DEMO_REVIEWS.map((review) => ({ ...review }));
    }
    return [];
  }

  return data as RestaurantReview[];
}
