import React, { useState } from 'react';
import { Star, MapPin, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import { RESTAURANT } from '../data/restaurant';

// still exported for Checkout / StickyFooter
export type DeliveryMode = "dine-in" | "delivery" | "pickup";


const PROMO_IMAGES = [
  'https://images.pexels.com/photos/4106483/pexels-photo-4106483.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/4106482/pexels-photo-4106482.jpeg?auto=compress&cs=tinysrgb&w=1200',
];

export const RestaurantInfoBar: React.FC = () => {
  return (
    <div className="mx-auto mt-2 w-full max-w-5xl space-y-1 px-4 text-[11px] leading-relaxed text-slate-700">
      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
        <span className="inline-flex items-center gap-1">
          <Star className="h-3 w-3 text-amber-400" />
          <span>{RESTAURANT.rating}</span>
        </span>
        <span className="inline-flex items-center gap-1">
          <MapPin className="h-3 w-3 text-slate-500" />
          <span>{RESTAURANT.location}</span>
        </span>
        <span className="inline-flex items-center gap-1">
          <Clock className="h-3 w-3 text-slate-500" />
          <span>{RESTAURANT.openHours}</span>
        </span>
      </div>
      <p>{RESTAURANT.bio}</p>
    </div>
  );
};

// HERO = promo slider only
export const RestaurantHero: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const next = () =>
    setCurrentSlide((prev) => (prev + 1) % PROMO_IMAGES.length);

  const prev = () =>
    setCurrentSlide((prev) =>
      prev === 0 ? PROMO_IMAGES.length - 1 : prev - 1
    );

  return (
    <section className="mb-6 mt-4">
      {/* App.tsx already has the max-width + horizontal padding.
          Here we let the slider take the full safe width. */}
      <div className="w-full">
        <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-slate-900/90 shadow-sm">
          <img
            src={PROMO_IMAGES[currentSlide]}
            alt={`عرض رقم ${currentSlide + 1}`}
            className="h-48 w-full object-cover sm:h-56 md:h-64"
          />

          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />

          {/* controls */}
          <button
            type="button"
            onClick={prev}
            className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white shadow-sm backdrop-blur hover:bg-black/60"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute left-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-black/40 text-white shadow-sm backdrop-blur hover:bg-black/60"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* dots */}
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1">
            {PROMO_IMAGES.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setCurrentSlide(index)}
                className={`h-1.5 w-4 rounded-full transition ${
                  currentSlide === index
                    ? 'bg-amber-400'
                    : 'bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
