import { supabase } from '../lib/supabase';

const BUCKET_NAME = 'restaurant-images';
const BRANDING_FOLDER = 'branding';

/**
 * Upload a hero image to Supabase Storage
 * @param restaurantId - Restaurant ID
 * @param file - File to upload
 * @param index - Image index (0-9)
 * @returns Public URL of uploaded image
 */
export async function uploadHeroImage(restaurantId: string, file: File, index: number): Promise<string> {
  const fileExt = file.name.split('.').pop() || 'jpg';
  const fileName = `hero-${index}.${fileExt}`;
  const filePath = `${restaurantId}/${fileName}`;

  // Remove existing file if it exists
  await supabase.storage.from(BUCKET_NAME).remove([filePath]);

  // Upload new file
  const { error } = await supabase.storage.from(BUCKET_NAME).upload(filePath, file, {
    cacheControl: '3600',
    upsert: true,
  });

  if (error) {
    console.error('Error uploading image:', error);
    throw new Error('فشل رفع الصورة');
  }

  // Get public URL
  const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

  return urlData.publicUrl;
}

async function uploadRestaurantAsset(restaurantId: string, file: File, assetName: 'logo' | 'cover'): Promise<string> {
  const fileExt = (file.name.split('.').pop() || 'png').toLowerCase();
  const filePath = `${restaurantId}/${BRANDING_FOLDER}/${assetName}.${fileExt}`;

  const { error } = await supabase.storage.from(BUCKET_NAME).upload(filePath, file, {
    cacheControl: '3600',
    upsert: true,
  });

  if (error) {
    console.error(`Error uploading ${assetName}:`, error);
    throw new Error('فشل رفع الصورة، تحقق من الاتصال وحجم الملف.');
  }

  const { data: urlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(filePath);

  return urlData.publicUrl;
}

export async function uploadRestaurantLogo(restaurantId: string, file: File): Promise<string> {
  return uploadRestaurantAsset(restaurantId, file, 'logo');
}

export async function uploadRestaurantCoverImage(restaurantId: string, file: File): Promise<string> {
  return uploadRestaurantAsset(restaurantId, file, 'cover');
}

/**
 * Delete a hero image from Supabase Storage
 * @param restaurantId - Restaurant ID
 * @param index - Image index (0-9)
 */
export async function deleteHeroImage(restaurantId: string, index: number): Promise<void> {
  const fileExt = 'jpg'; // Default extension
  const fileName = `hero-${index}.${fileExt}`;
  const filePath = `${restaurantId}/${fileName}`;

  const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);

  if (error) {
    console.error('Error deleting image:', error);
    // Don't throw - file might not exist
  }
}

/**
 * Delete a hero image by URL (extracts index from URL or deletes all matching files)
 * @param restaurantId - Restaurant ID
 * @param imageUrl - Full URL of the image
 */
export async function deleteHeroImageByUrl(restaurantId: string, imageUrl: string): Promise<void> {
  // Try to extract the filename from the URL
  const urlParts = imageUrl.split('/');
  const fileName = urlParts[urlParts.length - 1];

  if (fileName && fileName.startsWith('hero-')) {
    const filePath = `${restaurantId}/${fileName}`;
    const { error } = await supabase.storage.from(BUCKET_NAME).remove([filePath]);
    if (error) {
      console.error('Error deleting image:', error);
    }
  } else {
    // If we can't extract the filename, try to delete all hero images for this restaurant
    // This is a fallback - not ideal but handles edge cases
    console.warn('Could not extract filename from URL, skipping deletion');
  }
}

