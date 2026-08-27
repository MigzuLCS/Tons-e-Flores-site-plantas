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
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-surface-subtle text-brand-text border border-brand-border text-xs font-medium">
          <Sun className="w-3.5 h-3.5 text-amber-500/90 shrink-0" />
          Sol Pleno
        </span>
      );
    }
    if (lightVal === 'meia-sombra') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-surface-subtle text-brand-text border border-brand-border text-xs font-medium">
          <CloudSun className="w-3.5 h-3.5 text-orange-400/90 shrink-0" />
          Meia Sombra
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-surface-subtle text-brand-text border border-brand-border text-xs font-medium">
        <Cloud className="w-3.5 h-3.5 text-brand-text-muted shrink-0" />
        Sombra / Difusa
      </span>
    );
  }

  if (type === 'watering') {
    const waterVal = value as WateringFrequency;
    if (waterVal === 'baixa') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-surface-subtle text-brand-text border border-brand-border text-xs font-medium">
          <Droplets className="w-3.5 h-3.5 text-sky-400 shrink-0" />
          Pouca Rega
        </span>
      );
    }
    if (waterVal === 'moderada') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-surface-subtle text-brand-text border border-brand-border text-xs font-medium">
          <Droplets className="w-3.5 h-3.5 text-blue-400 shrink-0" />
          Rega 1-2x/sem
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-surface-subtle text-brand-text border border-brand-border text-xs font-medium">
        <Droplets className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
        Solo Úmido
      </span>
    );
  }

  if (type === 'pets') {
    const isPetFriendly = Boolean(value);
    if (isPetFriendly) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-nude-light text-brand-nude-text border border-brand-nude-border text-xs font-semibold">
          <Heart className="w-3.5 h-3.5 text-brand-nude fill-brand-nude shrink-0" />
          Pet Friendly
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-surface-subtle text-brand-text-muted border border-brand-border text-xs font-medium">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        Tóxica para Pets
      </span>
    );
  }

  return null;
};
