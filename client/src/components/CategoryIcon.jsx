import {
  Beef, CakeSlice, CupSoda, Drumstick, IceCreamCone, Salad, Sandwich, Users, UtensilsCrossed, Utensils,
} from 'lucide-react';

const MAP = {
  drumstick: Drumstick,
  beef: Beef,
  sandwich: Sandwich,
  fries: UtensilsCrossed,
  'cup-soda': CupSoda,
  'ice-cream': IceCreamCone,
  cake: CakeSlice,
  salad: Salad,
  users: Users,
};

export function CategoryIcon({ name, className = 'h-5 w-5' }) {
  const Icon = MAP[name] ?? Utensils;
  return <Icon className={className} aria-hidden="true" />;
}
