import React from 'react';
import { 
  Baby, 
  Coffee, 
  CreditCard, 
  HelpCircle, 
  Layers, 
  MapPin, 
  Smile, 
  Train, 
  Utensils, 
  Accessibility as AccessIcon, 
  Briefcase,
  UserCheck,
  FlameKindling,
  Cigarette,
  Shield,
  Clock,
  LogOut,
  Sparkles
} from 'lucide-react';

export default function FacilityIcon({ type, name = '', size = 16, className = '' }) {
  const normType = type.toLowerCase().trim();
  const normName = name.toLowerCase().trim();

  // Match based on explicit type first, then fallback to name substrings
  if (normType === 'restroom' || normType === 'toilet' || normName.includes('restroom') || normName.includes('toilet') || normName.includes('washroom')) {
    return <Smile size={size} className={`${className} text-pink-400`} />;
  }
  if (normType === 'food_court' || normType === 'restaurant' || normType === 'eatery' || normName.includes('food') || normName.includes('canteen') || normName.includes('restaurant') || normName.includes('court')) {
    return <Utensils size={size} className={`${className} text-amber-400`} />;
  }
  if (normType === 'coffee_shop' || normType === 'coffee_store' || normType === 'cafe' || normName.includes('coffee') || normName.includes('cafe') || normName.includes('tea')) {
    return <Coffee size={size} className={`${className} text-yellow-500`} />;
  }
  if (normType === 'atm' || normType === 'bank' || normName.includes('atm') || normName.includes('cash') || normName.includes('bank')) {
    return <CreditCard size={size} className={`${className} text-emerald-400`} />;
  }
  if (normType === 'waiting_area' || normType === 'waiting_lounge' || normType === 'lounge' || normName.includes('waiting') || normName.includes('lounge')) {
    return <Clock size={size} className={`${className} text-indigo-400`} />;
  }
  if (normType === 'accessibility' || normType === 'elevator' || normType === 'ramp' || normName.includes('elevator') || normName.includes('ramp') || normName.includes('wheelchair') || normName.includes('lift')) {
    return <AccessIcon size={size} className={`${className} text-blue-400`} />;
  }
  if (normType === 'ticket_counter' || normType === 'booking' || normName.includes('ticket') || normName.includes('counter') || normName.includes('booking')) {
    return <Briefcase size={size} className={`${className} text-teal-400`} />;
  }
  if (normType === 'platform' || normName.includes('platform')) {
    return <Layers size={size} className={`${className} text-violet-400`} />;
  }
  if (normName.includes('police') || normName.includes('security') || normName.includes('helpdesk')) {
    return <Shield size={size} className={`${className} text-red-400`} />;
  }
  if (normName.includes('water') || normName.includes('drinking')) {
    return <Sparkles size={size} className={`${className} text-cyan-400`} />;
  }

  // Default fallback
  return <MapPin size={size} className={`${className} text-slate-400`} />;
}
