import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import './RestaurantHero.css';
import type { Restaurant } from '../types/restaurant';
import { normalizeCoverImages } from '../utils/coverImages';

interface RestaurantHeroProps {
  restaurant: Restaurant;
}

export function RestaurantHero({ restaurant }: RestaurantHeroProps) {
  const coverImages = normalizeCoverImages(restaurant.cover_images);
  const hasImages = coverImages.length > 0;
  const hasMultipleImages = coverImages.length > 1;

  const displayImages = hasImages
    ? coverImages.map((img) => img.url)
    : restaurant.cover_image_url
      ? [restaurant.cover_image_url]
      : [];

  if (displayImages.length === 0) {
    return (
      <div className="w-full h-[300px] rounded-hero border border-white/70 shadow-card bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200 flex items-center justify-center" dir="rtl">
        <div className="text-center text-secondary">
          <span className="text-6xl mb-2 block">???</span>
          <p className="text-sm">لا توجد صور متاحة</p>
        </div>
      </div>
    );
  }

  if (displayImages.length === 1) {
    return (
      <div className="relative w-full h-[300px] rounded-hero overflow-hidden shadow-card border border-white/70" dir="rtl">
        <img src={displayImages[0]} alt={restaurant.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
      </div>
    );
  }

  return (
    <div className="relative w-full" dir="rtl">
      <Swiper
        modules={[Autoplay, Navigation, Pagination]}
        spaceBetween={0}
        slidesPerView={1}
        autoplay={
          hasMultipleImages
            ? {
                delay: 5000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }
            : false
        }
        navigation={hasMultipleImages}
        pagination={hasMultipleImages ? { clickable: true } : false}
        loop={hasMultipleImages}
        className="rounded-hero overflow-hidden shadow-card border border-white/70"
        style={{ height: '300px' }}
        dir="rtl"
      >
        {displayImages.map((url, index) => (
          <SwiperSlide key={index}>
            <div className="w-full h-full relative">
              <img
                src={url}
                alt={`${restaurant.name} - صورة ${index + 1}`}
                className="w-full h-full object-cover"
                loading={index === 0 ? 'eager' : 'lazy'}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

export default RestaurantHero;
