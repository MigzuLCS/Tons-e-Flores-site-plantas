import React from 'react';
import { MapPin, ArrowRight } from 'lucide-react';
import type { Plant } from '../types/plant';
import { CareBadge } from './CareBadge';

interface PlantCardProps {
  plant: Plant;
  onSelect: (plant: Plant) => void;
}

export const PlantCard: React.FC<PlantCardProps> = ({ plant, onSelect }) => {
  return (
    <div 
      onClick={() => onSelect(plant)}
      className="bg-white rounded-2xl border border-stone-200/80 shadow-sm overflow-hidden hover:shadow-md hover:border-emerald-300 transition-all group flex flex-col justify-between cursor-pointer"
    >
      <div>
        {/* Imagem do Vaso */}
        <div className="relative h-52 bg-stone-100 overflow-hidden">
          <img 
            src={plant.imageUrl || 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=600&q=80'} 
            alt={plant.name} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          
          <div className="absolute top-3 left-3 bg-stone-900/80 backdrop-blur-md text-white text-[11px] font-mono font-bold px-2 py-0.5 rounded-lg shadow-sm">
            #{plant.id}
          </div>

          <div className="absolute top-3 right-3">
            {plant.status === 'disponivel' && (
              <span className="bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                Disponível
              </span>
            )}
            {plant.status === 'reservada' && (
              <span className="bg-amber-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                Reservada
              </span>
            )}
            {plant.status === 'vendida' && (
              <span className="bg-stone-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-sm">
                Vendida
              </span>
            )}
          </div>

          <div className="absolute bottom-3 left-3 bg-stone-900/80 backdrop-blur-md text-white text-[11px] px-2.5 py-1 rounded-lg flex items-center gap-1.5 max-w-[85%] truncate">
            <MapPin className="w-3 h-3 text-emerald-400 shrink-0" />
            <span className="truncate">{plant.location}</span>
          </div>
        </div>

        {/* Informações da Planta */}
        <div className="p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
              {plant.category}
            </span>
            <span className="text-xs text-stone-500 font-medium">{plant.potSize}</span>
          </div>

          <div className="flex items-baseline justify-between gap-2">
            <h3 className="text-lg font-bold text-stone-900 font-serif-title leading-snug group-hover:text-emerald-800 transition-colors">
              {plant.name}
            </h3>
            <span className="text-lg font-extrabold text-stone-900 shrink-0">
              R$ {plant.price.toFixed(2).replace('.', ',')}
            </span>
          </div>

          <p className="text-xs text-stone-500 italic truncate">
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
          className="w-full bg-stone-900 group-hover:bg-emerald-800 text-white text-xs font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1.5 shadow-sm"
        >
          <span>Ver Ficha & Cuidados</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  );
};
