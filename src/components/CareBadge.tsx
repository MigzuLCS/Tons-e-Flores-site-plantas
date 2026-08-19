import React from 'react';
import { Sun, CloudSun, Cloud, Droplets, AlertTriangle, Heart } from 'lucide-react';
import type { LightRequirement, WateringFrequency } from '../types/plant';

interface CareBadgeProps {
  type: 'light' | 'watering' | 'pets';
  value?: LightRequirement | WateringFrequency | boolean;
}

export const CareBadge: React.FC<CareBadgeProps> = ({ type, value }) => {
  if (type === 'light') {
    const lightVal = value as LightRequirement;
    if (lightVal === 'sol-pleno') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200/80 text-xs font-semibold">
          <Sun className="w-3.5 h-3.5 text-amber-600" />
          Sol Pleno
        </span>
      );
    }
    if (lightVal === 'meia-sombra') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 text-orange-800 border border-orange-200/80 text-xs font-semibold">
          <CloudSun className="w-3.5 h-3.5 text-orange-500" />
          Meia Sombra
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700 border border-stone-200 text-xs font-semibold">
        <Cloud className="w-3.5 h-3.5 text-stone-500" />
        Sombra / Difusa
      </span>
    );
  }

  if (type === 'watering') {
    const waterVal = value as WateringFrequency;
    if (waterVal === 'baixa') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-200/80 text-xs font-semibold">
          <Droplets className="w-3.5 h-3.5 text-blue-400" />
          Pouca Rega
        </span>
      );
    }
    if (waterVal === 'moderada') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 border border-sky-200/80 text-xs font-semibold">
          <Droplets className="w-3.5 h-3.5 text-sky-600" />
          Rega 1-2x/sem
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200/80 text-xs font-semibold">
        <Droplets className="w-3.5 h-3.5 text-indigo-600" />
        Solo Úmido
      </span>
    );
  }

  if (type === 'pets') {
    const isPetFriendly = Boolean(value);
    if (isPetFriendly) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-semibold">
          <Heart className="w-3.5 h-3.5 text-emerald-600 fill-emerald-100" />
          Pet Friendly
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 text-xs font-semibold">
        <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
        Tóxica para Pets
      </span>
    );
  }

  return null;
};
