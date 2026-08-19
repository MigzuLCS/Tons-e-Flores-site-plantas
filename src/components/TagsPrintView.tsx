import React, { useState } from 'react';
import { Printer, CheckSquare, Square, Flower2, Droplets, Sun, Sparkles } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import type { Plant } from '../types/plant';

interface TagsPrintViewProps {
  plants: Plant[];
  selectedPlantId?: string | null;
}

export const TagsPrintView: React.FC<TagsPrintViewProps> = ({ plants, selectedPlantId }) => {
  // Se veio uma planta pré-selecionada, marca apenas ela ou todas
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    if (selectedPlantId) {
      return [selectedPlantId];
    }
    return plants.map(p => p.id);
  });

  const [showPrice, setShowPrice] = useState(true);
  const [showCareIcons, setShowCareIcons] = useState(true);

  const toggleSelectAll = () => {
    if (selectedIds.length === plants.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(plants.map(p => p.id));
    }
  };

  const toggleSelectPlant = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const plantsToPrint = plants.filter(p => selectedIds.includes(p.id));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in">
      
      {/* Barra de Controle de Impressão (Não aparece ao imprimir) */}
      <div className="no-print bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Folha de Impressão A4</span>
            </div>
            <h2 className="text-2xl font-bold font-serif-title text-stone-900 mt-0.5">
              Gerador de Etiquetas com QR Code
            </h2>
            <p className="text-xs text-stone-500">
              Selecione os vasos que deseja imprimir. O layout se ajusta automaticamente para folhas A4 (papel comum ou adesivo).
            </p>
          </div>

          <button 
            onClick={handlePrint}
            disabled={plantsToPrint.length === 0}
            className="bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-2xl shadow-md flex items-center justify-center gap-2 text-sm transition-all shrink-0 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Imprimir {plantsToPrint.length} Etiquetas
          </button>
        </div>

        {/* Opções de Customização das Etiquetas */}
        <div className="pt-3 border-t border-stone-100 flex flex-wrap items-center justify-between gap-4 text-xs">
          
          <div className="flex items-center gap-4">
            <button 
              onClick={toggleSelectAll}
              className="flex items-center gap-1.5 font-bold text-stone-700 hover:text-emerald-800 cursor-pointer"
            >
              {selectedIds.length === plants.length ? (
                <CheckSquare className="w-4 h-4 text-emerald-700" />
              ) : (
                <Square className="w-4 h-4 text-stone-400" />
              )}
              {selectedIds.length === plants.length ? 'Desmarcar Todas' : 'Selecionar Todas as Plantas'}
            </button>

            <span className="text-stone-300">|</span>

            <label className="flex items-center gap-1.5 font-medium text-stone-700 cursor-pointer">
              <input 
                type="checkbox" 
                checked={showPrice} 
                onChange={e => setShowPrice(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500" 
              />
              Exibir Preço na Etiqueta
            </label>

            <label className="flex items-center gap-1.5 font-medium text-stone-700 cursor-pointer">
              <input 
                type="checkbox" 
                checked={showCareIcons} 
                onChange={e => setShowCareIcons(e.target.checked)}
                className="rounded text-emerald-600 focus:ring-emerald-500" 
              />
              Exibir Ícones de Luz/Água
            </label>
          </div>

          <div className="text-stone-500 text-xs">
            <strong>{plantsToPrint.length}</strong> de {plants.length} etiquetas selecionadas
          </div>
        </div>

        {/* Seleção rápida por chips */}
        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-stone-50 rounded-xl border border-stone-200">
          {plants.map(plant => (
            <button
              key={plant.id}
              onClick={() => toggleSelectPlant(plant.id)}
              className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-all cursor-pointer ${
                selectedIds.includes(plant.id)
                  ? 'bg-emerald-100 border-emerald-300 text-emerald-900 font-bold'
                  : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-100'
              }`}
            >
              #{plant.id} - {plant.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grade de Etiquetas (Esta área é impressa perfeitamente no A4) */}
      <div className="bg-white p-6 sm:p-10 rounded-3xl shadow-sm border border-stone-200 max-w-4xl mx-auto">
        
        {plantsToPrint.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {plantsToPrint.map((plant) => {
              const plantUrl = `${window.location.origin}${window.location.pathname}#p-${plant.id}`;

              return (
                <div 
                  key={plant.id}
                  className="border-2 border-dashed border-stone-300 p-4 rounded-2xl flex flex-col items-center justify-between text-center bg-white space-y-2.5 relative break-inside-avoid hover:border-emerald-400 transition-colors"
                >
                  
                  {/* Cabeçalho da Etiqueta */}
                  <div className="w-full flex items-center justify-between text-[11px] font-bold text-emerald-800 border-b border-stone-100 pb-1.5">
                    <div className="flex items-center gap-1 uppercase tracking-wide">
                      <Flower2 className="w-3.5 h-3.5 text-emerald-600" />
                      Tons & Flores
                    </div>
                    <span className="font-mono text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded text-[10px]">
                      #{plant.id}
                    </span>
                  </div>

                  {/* QR Code SVG Nítido */}
                  <div className="p-1.5 bg-white border border-stone-200 rounded-xl shadow-xs">
                    <QRCodeSVG 
                      value={plantUrl} 
                      size={105} 
                      level="M" 
                      includeMargin={false}
                    />
                  </div>

                  {/* Nome da Planta e Espécie */}
                  <div className="w-full space-y-0.5">
                    <div className="font-bold text-sm text-stone-900 leading-tight font-serif-title">
                      {plant.name}
                    </div>
                    <div className="text-[10px] text-stone-500 italic truncate max-w-full">
                      {plant.scientificName} • {plant.potSize}
                    </div>
                  </div>

                  {/* Ícones de Cuidados Básicos (Opcional) */}
                  {showCareIcons && (
                    <div className="flex items-center justify-center gap-2 text-[10px] text-stone-600 pt-0.5">
                      <span className="flex items-center gap-0.5 font-medium bg-amber-50 text-amber-900 px-1.5 py-0.5 rounded">
                        <Sun className="w-3 h-3 text-amber-500" />
                        {plant.light === 'sol-pleno' ? 'Sol' : plant.light === 'meia-sombra' ? 'Meia Sombra' : 'Sombra'}
                      </span>
                      <span className="flex items-center gap-0.5 font-medium bg-blue-50 text-blue-900 px-1.5 py-0.5 rounded">
                        <Droplets className="w-3 h-3 text-blue-500" />
                        {plant.watering === 'baixa' ? 'Pouca' : plant.watering === 'moderada' ? 'Moderada' : 'Frequente'}
                      </span>
                    </div>
                  )}

                  {/* Rodapé da Etiqueta com Preço e Chamada */}
                  <div className="w-full pt-1.5 border-t border-stone-200 flex items-center justify-between text-xs">
                    <span className="text-[9px] text-stone-400 font-medium">Escaneie o QR Code</span>
                    {showPrice && (
                      <span className="font-extrabold text-emerald-800 text-sm">
                        R$ {plant.price.toFixed(2).replace('.', ',')}
                      </span>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-stone-400 space-y-2">
            <Sparkles className="w-8 h-8 mx-auto text-stone-300" />
            <p className="text-sm font-semibold text-stone-600">Nenhuma etiqueta selecionada para impressão.</p>
            <p className="text-xs">Selecione pelo menos uma planta na barra acima para visualizar.</p>
          </div>
        )}

      </div>
    </div>
  );
};
