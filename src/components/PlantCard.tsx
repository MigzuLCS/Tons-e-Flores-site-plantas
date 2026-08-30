import React from 'react';
import { MapPin, ArrowRight } from 'lucide-react';
import type { Plant } from '../types/plant';
import { CareBadge } from './CareBadge';

interface PlantCardProps {
  plant: Plant;
  onSelect: (plant: Plant) => void;
  priority?: boolean;
}

export const PlantCard: React.FC<PlantCardProps> = React.memo(({ plant, onSelect, priority = false }) => {
  return (
    <div 
      onClick={() => onSelect(plant)}
      className="bg-brand-surface rounded-2xl border border-brand-border shadow-xs overflow-hidden hover:shadow-md hover:border-brand-olive/50 transition-[border-color,box-shadow,transform] duration-200 ease-out group flex flex-col justify-between cursor-pointer"
      style={{ contentVisibility: 'auto', containIntrinsicSize: '0 380px' }}
    >
      <div>
        {/* Imagem do Vaso com priorização LCP */}
        <div className="relative h-52 bg-brand-surface-subtle overflow-hidden">
          <img 
            src={plant.imageUrl || 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=600&q=80'} 
            alt={plant.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200 ease-out"
            loading={priority ? 'eager' : 'lazy'}
            fetchPriority={priority ? 'high' : 'auto'}
            decoding="async"
          />
          
          <div className="absolute top-3 left-3 bg-brand-surface/95 text-brand-text text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg shadow-xs border border-brand-border pointer-events-none">
            #{plant.id}
          </div>

          <div className="absolute top-3 right-3 pointer-events-none">
            {plant.status === 'disponivel' && (
              <span className="bg-brand-olive-light/95 dark:bg-brand-olive text-brand-olive-text dark:text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs border border-brand-olive-border dark:border-brand-olive/40">
                Disponível
              </span>
            )}
            {plant.status === 'reservada' && (
              <span className="bg-[#9E6738] dark:bg-[#7D4D24] text-[#FDF6F0] text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs border border-[#C2854F]/40">
                Reservada
              </span>
            )}
            {plant.status === 'vendida' && (
              <span className="bg-brand-nude text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs border border-brand-nude-hover/40">
                Vendida
              </span>
            )}
          </div>

          <div className="absolute bottom-3 left-3 bg-brand-surface/95 text-brand-text text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1.5 max-w-[85%] truncate border border-brand-border shadow-xs pointer-events-none">
            <MapPin className="w-3 h-3 text-brand-olive shrink-0" />
            <span className="truncate">{plant.location}</span>
          </div>
        </div>

        {/* Informações da Planta */}
        <div className="p-5 space-y-2">
          <div className="flex items-center justify-between gap-1">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-[11px] font-bold text-brand-olive uppercase tracking-wider truncate">
                {plant.category}
              </span>
              {plant.cultivation && plant.cultivation !== 'Tradicional' && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-brand-olive-subtle text-brand-olive border border-brand-olive/20 shrink-0">
                  {plant.cultivation}
                </span>
              )}
            </div>
            <span className="text-xs text-brand-text-muted font-medium shrink-0">{plant.potSize}</span>
          </div>

          <div className="flex items-baseline justify-between gap-2">
            <h3 className="text-lg font-bold text-brand-text font-serif-title leading-snug group-hover:text-brand-olive transition-colors duration-200">
              {plant.name}
            </h3>
            <span className="text-lg font-extrabold text-brand-text shrink-0 font-sans">
              R$ {plant.price.toFixed(2).replace('.', ',')}
            </span>
          </div>

          <p className="text-xs text-brand-text-muted italic truncate">
            {plant.scientificName}
          </p>

          {/* Badges de Cuidados Rápidos */}
          <div className="flex flex-wrap gap-1.5 pt-2">
            <CareBadge type="light" value={plant.light} />
            <CareBadge type="watering" value={plant.watering} />
          </div>
        </div>
      </div>

      {/* Botão de Ver Detalhes */}
      <div className="p-5 pt-0">
        <button 
          type="button"
          className="w-full bg-brand-olive-light group-hover:bg-brand-olive text-brand-olive-text group-hover:text-white border border-brand-olive-border text-xs font-semibold py-2.5 rounded-xl transition-colors duration-200 flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
        >
          <span>Ver Ficha & Cuidados</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
        </button>
      </div>
    </div>
  );
});
