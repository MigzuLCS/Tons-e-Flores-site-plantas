/**
 * Tons & Flores • Catálogo Botânico & Gestão de Plantas
 * Copyright (c) 2026 Miguel Luiz (@MigzuLCS). Todos os direitos reservados.
 * 
 * LICENÇA DE USO ACADÊMICO / ACADEMIC VIEW-ONLY LICENSE
 * Este código-fonte é disponibilizado publicamente exclusivamente para fins de consulta
 * acadêmica e avaliação técnica de portfólio. É proibida qualquer cópia, alteração,
 * distribuição, uso comercial ou derivação deste código sem autorização expressa prévia.
 * O software é fornecido "COMO ESTÁ" (AS IS), sem garantias de qualquer tipo.
 * Consulte o arquivo LICENSE na raiz do projeto para obter os termos integrais.
 */

import React from 'react';
import { Sun, CloudSun, Cloud, Droplets, AlertTriangle, Heart } from 'lucide-react';
import type { LightRequirement, WateringFrequency } from '../types/plant';

interface CareBadgeProps {
  type: 'light' | 'watering' | 'pets';
  value?: LightRequirement | WateringFrequency | boolean;
}

export const CareBadge: React.FC<CareBadgeProps> = React.memo(({ type, value }) => {
  if (type === 'light') {
    const lightVal = value as LightRequirement;
    if (lightVal === 'sol-pleno') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-surface-subtle text-brand-text border border-brand-border text-xs font-medium">
          <Sun className="w-3.5 h-3.5 text-brand-olive shrink-0" />
          Sol Pleno
        </span>
      );
    }
    if (lightVal === 'meia-sombra') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-surface-subtle text-brand-text border border-brand-border text-xs font-medium">
          <CloudSun className="w-3.5 h-3.5 text-brand-olive shrink-0" />
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
          <Droplets className="w-3.5 h-3.5 text-brand-olive shrink-0" />
          Pouca Rega
        </span>
      );
    }
    if (waterVal === 'moderada') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-surface-subtle text-brand-text border border-brand-border text-xs font-medium">
          <Droplets className="w-3.5 h-3.5 text-brand-olive shrink-0" />
          Rega 1-2x/sem
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-brand-surface-subtle text-brand-text border border-brand-border text-xs font-medium">
        <Droplets className="w-3.5 h-3.5 text-brand-olive shrink-0" />
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
        <AlertTriangle className="w-3.5 h-3.5 text-brand-nude shrink-0" />
        Tóxica para Pets
      </span>
    );
  }

  return null;
});
