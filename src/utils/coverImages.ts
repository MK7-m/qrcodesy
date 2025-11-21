import type { CoverImage } from '../types/restaurant';

/**
 * Normalize cover_images to CoverImage[] format
 * Handles migration from string[] to CoverImage[]
 */
export function normalizeCoverImages(coverImages: CoverImage[] | string[] | null | undefined): CoverImage[] {
  if (!coverImages || coverImages.length === 0) {
    return [];
  }

  // If already in CoverImage[] format
  if (typeof coverImages[0] === 'object' && 'url' in coverImages[0] && 'order' in coverImages[0]) {
    return (coverImages as CoverImage[]).sort((a, b) => a.order - b.order);
  }

  // Migrate from string[] to CoverImage[]
  return (coverImages as string[]).map((url, index) => ({
    url,
    order: index,
  }));
}

/**
 * Prepare cover_images for saving to database
 * Ensures all items have proper order values
 */
export function prepareCoverImagesForSave(coverImages: CoverImage[]): CoverImage[] {
  return coverImages
    .map((img, index) => ({
      url: img.url,
      order: index,
    }))
    .sort((a, b) => a.order - b.order);
}

