import { Phone, Star, MapPin, Clock3, MessageCircle } from 'lucide-react';
import type { Restaurant } from '../types/restaurant';
import { computeRestaurantStatus, formatOpeningHours } from '../utils/openingHours';

function statusStyles(status: 'open' | 'closed' | 'busy') {
  switch (status) {
    case 'open':
      return { bg: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' };
    case 'busy':
      return { bg: 'bg-amber-100 text-amber-700', dot: 'bg-amber-500' };
    default:
      return { bg: 'bg-slate-100 text-slate-600', dot: 'bg-slate-500' };
  }
}

const statusCopy: Record<'open' | 'closed' | 'busy', string> = {
  open: 'مفتوح الآن',
  busy: 'مشغول الآن',
  closed: 'مغلق الآن',
};

export function RestaurantHeader({ restaurant }: { restaurant: Restaurant }) {
  const status = computeRestaurantStatus(restaurant.opening_hours, restaurant.status_override);
  const styles = statusStyles(status);
  const address =
    restaurant.area && restaurant.city
      ? `${restaurant.area} - ${restaurant.city}`
      : restaurant.city || restaurant.area || restaurant.cuisine_summary || '';
  const hoursText = formatOpeningHours(restaurant.opening_hours);
  const shortLine = restaurant.short_description || restaurant.description;
  const longLine = restaurant.long_description;

  const telHref = restaurant.phone_number ? `tel:${restaurant.phone_number}` : undefined;
  const waHref = restaurant.whatsapp_number
    ? `https://wa.me/${restaurant.whatsapp_number.replace(/\D/g, '')}`
    : undefined;

  return (
    <section dir="rtl" className="relative rounded-[28px] bg-white shadow-header border border-white/70">
      <div className="absolute inset-x-8 -top-2 h-1 rounded-full bg-gradient-to-l from-primary-dark to-primary" />
      <div className="px-5 sm:px-8 py-6 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-primary-light/60 flex items-center justify-center overflow-hidden border border-primary/20 shadow-pill">
              {restaurant.logo_url ? (
                <img src={restaurant.logo_url} alt={restaurant.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl text-primary font-bold">{restaurant.name?.charAt(0) || '?'}</span>
              )}
            </div>
            <div className="space-y-2 text-right">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{restaurant.name}</h1>
                <span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold ${styles.bg}`}>
                  <span className={`w-2 h-2 rounded-full ${styles.dot}`} />
                  {statusCopy[status]}
                </span>
                {Number(restaurant.rating) > 0 && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-orange-100 shadow-pill text-sm text-orange-600">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    {Number(restaurant.rating).toFixed(1)}
                    <span className="text-secondary">({restaurant.rating_count} تقييم)</span>
                  </span>
                )}
              </div>
              {shortLine && <p className="text-base text-secondary font-medium">{shortLine}</p>}
              {longLine && <p className="text-sm text-secondary/80">{longLine}</p>}
            </div>
          </div>
          <div className="flex items-center gap-3 self-start">
            {telHref && (
              <a
                href={telHref}
                className="w-12 h-12 rounded-full border border-slate-100 bg-white shadow-pill flex items-center justify-center text-primary hover:scale-105 transition"
              >
                <Phone className="w-5 h-5" />
              </a>
            )}
            {waHref && (
              <a
                href={waHref}
                target="_blank"
                rel="noreferrer"
                className="w-12 h-12 rounded-full bg-emerald-500 text-white shadow-pill flex items-center justify-center hover:bg-emerald-600"
              >
                <MessageCircle className="w-5 h-5" />
              </a>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-sm text-secondary">
          {address && (
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              <span className="font-semibold text-slate-900">{address}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Clock3 className="w-4 h-4 text-primary" />
            <span>{hoursText}</span>
          </div>
          {restaurant.cuisine_summary && (
            <div className="px-4 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
              {restaurant.cuisine_summary}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default RestaurantHeader;
