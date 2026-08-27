import React, { useState, useRef } from 'react';
import { 
  Printer, 
  CheckSquare, 
  Square, 
  Flower2, 
  Droplets, 
  Sun, 
  Sparkles, 
  Download
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import type { Plant } from '../types/plant';

interface TagsPrintViewProps {
  plants: Plant[];
  selectedPlantId?: string | null;
}

export const TagsPrintView: React.FC<TagsPrintViewProps> = ({ plants, selectedPlantId }) => {
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    if (selectedPlantId) {
      return [selectedPlantId];
    }
    return plants.filter(p => p.status !== 'vendida').map(p => p.id);
  });

  const [printMode, setPrintMode] = useState<'niimbot' | 'sheet_a4'>('niimbot');
  const [showPrice, setShowPrice] = useState(true);
  const [showCareIcons, setShowCareIcons] = useState(true);
  const tagRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  const toggleSelectAll = () => {
    const activePlants = plants.filter(p => p.status !== 'vendida');
    if (selectedIds.length === activePlants.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(activePlants.map(p => p.id));
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

  // Baixar imagem individual para o App Niimbot
  const downloadTagImage = (plant: Plant) => {
    const svgElement = document.getElementById(`qr-svg-${plant.id}`) as SVGElement | null;
    if (!svgElement) return;

    // Criar um canvas em alta resolução no formato 50x30mm (proporção 500x300px)
    const canvas = document.createElement('canvas');
    const width = 500;
    const height = 300;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fundo Branco
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // Borda preta fina
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 4;
    ctx.strokeRect(6, 6, width - 12, height - 12);

    // Texto: Tons & Flores
    ctx.fillStyle = '#000000';
    ctx.font = 'bold 22px Arial, sans-serif';
    ctx.fillText('TONS & FLORES', 20, 36);

    // Tag ID
    ctx.font = 'bold 20px monospace';
    ctx.fillText(`#${plant.id}`, 20, 64);

    // Nome da Planta
    ctx.font = 'bold 26px Arial, sans-serif';
    ctx.fillText(plant.name.slice(0, 18), 20, 115);

    // Nome Científico / Vaso
    ctx.font = 'italic 18px Arial, sans-serif';
    ctx.fillText(`${plant.potSize}`, 20, 145);

    // Dicas
    ctx.font = '16px Arial, sans-serif';
    const lightText = plant.light === 'sol-pleno' ? 'Sol Pleno' : plant.light === 'meia-sombra' ? 'Meia Sombra' : 'Sombra';
    const waterText = plant.watering === 'baixa' ? 'Pouca Rega' : plant.watering === 'moderada' ? 'Rega 1-2x/sem' : 'Solo Úmido';
    ctx.fillText(`• ${lightText}`, 20, 190);
    ctx.fillText(`• ${waterText}`, 20, 220);

    // Preço
    if (showPrice) {
      ctx.font = 'bold 30px Arial, sans-serif';
      ctx.fillText(`R$ ${plant.price.toFixed(2).replace('.', ',')}`, 20, 275);
    }

    // Converter QR Code SVG para imagem e desenhar no Canvas
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const URL = window.URL || window.webkitURL || window;
    const blobURL = URL.createObjectURL(svgBlob);
    const img = new Image();

    img.onload = () => {
      // Desenhar QR Code à direita (180x180px)
      ctx.drawImage(img, 300, 35, 180, 180);
      
      ctx.font = 'bold 13px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ESCANEIE O QR', 390, 240);

      // Fazer download do PNG
      const pngUrl = canvas.toDataURL('image/png');
      const downloadLink = document.createElement('a');
      downloadLink.download = `Etiqueta_Niimbot_50x30_${plant.id}.png`;
      downloadLink.href = pngUrl;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      downloadLink.remove();
      URL.revokeObjectURL(blobURL);
    };

    img.src = blobURL;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in">
      
      {/* Estilos específicos para impressão térmica Niimbot B1 (50x30mm) */}
      <style>{`
        @media print {
          @page {
            size: ${printMode === 'niimbot' ? '50mm 30mm' : 'A4 portrait'};
            margin: 0;
          }
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          .thermal-page-break {
            page-break-after: always;
            break-after: page;
            width: 50mm !important;
            height: 30mm !important;
            margin: 0 auto !important;
            padding: 2mm !important;
            box-sizing: border-box !important;
          }
        }
      `}</style>

      {/* Barra de Controle de Impressão */}
      <div className="no-print bg-brand-surface p-6 rounded-3xl border border-brand-border shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-brand-olive">
                Impressora Térmica & Etiquetas
              </span>
              <span className="bg-brand-olive-light text-brand-olive-text border border-brand-olive-border text-[10px] font-bold px-2 py-0.5 rounded-full">
                Niimbot B1 (50mm x 30mm)
              </span>
            </div>
            <h2 className="text-2xl font-bold font-serif-title text-brand-text mt-0.5">
              Gerador de Tags com QR Code
            </h2>
            <p className="text-xs text-brand-text-muted">
              Pronto para imprimir na sua <strong>Niimbot B1</strong> ou baixar as imagens em PNG para o aplicativo Bluetooth.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button 
              onClick={handlePrint}
              disabled={plantsToPrint.length === 0}
              className="bg-brand-olive hover:bg-brand-olive-hover disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-2xl shadow-xs flex items-center justify-center gap-2 text-sm transition-all shrink-0 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Imprimir {plantsToPrint.length} Etiquetas
            </button>
          </div>
        </div>

        {/* Configurações de Formato e Exibição */}
        <div className="pt-3 border-t border-brand-border flex flex-wrap items-center justify-between gap-4 text-xs">
          
          {/* Seletor de Modo de Impressão */}
          <div className="flex items-center gap-2 bg-brand-surface-subtle p-1 rounded-xl border border-brand-border">
            <button
              onClick={() => setPrintMode('niimbot')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                printMode === 'niimbot' ? 'bg-white shadow-xs text-brand-olive font-bold' : 'text-brand-text-muted hover:text-brand-text'
              }`}
            >
              🏷️ Térmica Niimbot (50x30mm)
            </button>
            <button
              onClick={() => setPrintMode('sheet_a4')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                printMode === 'sheet_a4' ? 'bg-white shadow-xs text-brand-olive font-bold' : 'text-brand-text-muted hover:text-brand-text'
              }`}
            >
              📄 Grade Folha A4
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <label className="flex items-center gap-1.5 font-medium text-brand-text cursor-pointer">
              <input 
                type="checkbox" 
                checked={showPrice} 
                onChange={e => setShowPrice(e.target.checked)}
                className="rounded text-brand-olive focus:ring-brand-olive" 
              />
              Exibir Preço
            </label>

            <label className="flex items-center gap-1.5 font-medium text-brand-text cursor-pointer">
              <input 
                type="checkbox" 
                checked={showCareIcons} 
                onChange={e => setShowCareIcons(e.target.checked)}
                className="rounded text-brand-olive focus:ring-brand-olive" 
              />
              Exibir Cuidados
            </label>

            <button 
              onClick={toggleSelectAll}
              className="flex items-center gap-1.5 font-bold text-brand-text hover:text-brand-olive cursor-pointer ml-2"
            >
              {selectedIds.length === plants.filter(p => p.status !== 'vendida').length ? (
                <CheckSquare className="w-4 h-4 text-brand-olive" />
              ) : (
                <Square className="w-4 h-4 text-brand-text-muted" />
              )}
              {selectedIds.length === plants.filter(p => p.status !== 'vendida').length ? 'Desmarcar Todas' : 'Selecionar Todas'}
            </button>
          </div>

          <div className="text-brand-text-muted text-xs">
            <strong>{plantsToPrint.length}</strong> etiquetas selecionadas
          </div>
        </div>

        {/* Seleção rápida por chips */}
        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-brand-surface-subtle rounded-xl border border-brand-border">
          {plants.filter(p => p.status !== 'vendida').map(plant => (
            <button
              key={plant.id}
              onClick={() => toggleSelectPlant(plant.id)}
              className={`text-[11px] px-2.5 py-1 rounded-lg border font-medium transition-all cursor-pointer ${
                selectedIds.includes(plant.id)
                  ? 'bg-brand-olive-light border-brand-olive-border text-brand-olive-text font-bold shadow-xs'
                  : 'bg-white border-brand-border text-brand-text hover:bg-brand-olive-light'
              }`}
            >
              #{plant.id} - {plant.name}
            </button>
          ))}
        </div>
      </div>

      {/* Visualização e Área de Impressão */}
      <div className="bg-brand-surface p-6 sm:p-10 rounded-3xl shadow-sm border border-brand-border max-w-4xl mx-auto">
        
        {plantsToPrint.length > 0 ? (
          <div className={printMode === 'niimbot' ? 'space-y-6' : 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6'}>
            {plantsToPrint.map((plant) => {
              const plantUrl = `${window.location.origin}${window.location.pathname}#p-${plant.id}`;

              if (printMode === 'niimbot') {
                // Layout Exato Niimbot B1 (Proporção 50mm x 30mm)
                return (
                  <div 
                    key={plant.id}
                    ref={el => { tagRefs.current[plant.id] = el; }}
                    className="thermal-page-break border-2 border-stone-900 rounded-lg p-2 bg-white flex items-center justify-between gap-2 max-w-[340px] mx-auto shadow-xs relative group"
                    style={{ width: '100%', aspectRatio: '50/30' }}
                  >
                    
                    {/* Lado Esquerdo: Textos e Informações */}
                    <div className="flex-1 flex flex-col justify-between h-full pr-1 overflow-hidden text-left">
                      <div>
                        <div className="flex items-center justify-between text-[10px] font-extrabold text-stone-900 leading-tight">
                          <span className="uppercase tracking-tighter">TONS & FLORES</span>
                          <span className="font-mono">#{plant.id}</span>
                        </div>
                        <div className="font-bold text-[13px] text-stone-950 leading-tight mt-0.5 truncate font-serif-title">
                          {plant.name}
                        </div>
                        <div className="text-[9px] text-stone-600 italic truncate">
                          {plant.potSize}
                        </div>
                      </div>

                      {showCareIcons && (
                        <div className="text-[8px] text-stone-700 font-semibold space-y-0.5 pt-0.5">
                          <div>• {plant.light === 'sol-pleno' ? 'Sol Pleno' : plant.light === 'meia-sombra' ? 'Meia Sombra' : 'Sombra'}</div>
                          <div>• {plant.watering === 'baixa' ? 'Pouca Rega' : plant.watering === 'moderada' ? 'Rega 1-2x/sem' : 'Solo Úmido'}</div>
                        </div>
                      )}

                      {showPrice && (
                        <div className="font-extrabold text-[14px] text-stone-950 leading-none pt-0.5">
                          R$ {plant.price.toFixed(2).replace('.', ',')}
                        </div>
                      )}
                    </div>

                    {/* Lado Direito: QR Code SVG Nítido */}
                    <div className="flex flex-col items-center justify-center shrink-0">
                      <div className="p-0.5 bg-white border border-stone-800 rounded">
                        <QRCodeSVG 
                          id={`qr-svg-${plant.id}`}
                          value={plantUrl} 
                          size={78} 
                          level="M" 
                          includeMargin={false}
                        />
                      </div>
                      <span className="text-[7px] font-bold text-stone-800 mt-0.5 tracking-tighter">
                        ESCANEIE O QR
                      </span>
                    </div>

                    {/* Botão flutuante para baixar PNG para App Niimbot (Some na impressão) */}
                    <button 
                      onClick={() => downloadTagImage(plant)}
                      title="Baixar imagem PNG 50x30mm para o app Niimbot"
                      className="no-print absolute -top-3 -right-3 bg-brand-green-950 hover:bg-brand-rose-600 text-white p-1.5 rounded-full shadow-md transition-all cursor-pointer opacity-80 group-hover:opacity-100"
                    >
                      <Download className="w-3.5 h-3.5" />
                    </button>

                  </div>
                );
              }

              // Layout Folha A4 em Grade
              return (
                <div 
                  key={plant.id}
                  className="border-2 border-dashed border-brand-border p-4 rounded-2xl flex flex-col items-center justify-between text-center bg-white space-y-2.5 relative break-inside-avoid hover:border-brand-olive/50 transition-colors shadow-xs"
                >
                  <div className="w-full flex items-center justify-between text-[11px] font-bold text-brand-olive border-b border-brand-border pb-1.5">
                    <div className="flex items-center gap-1 uppercase tracking-wide">
                      <Flower2 className="w-3.5 h-3.5 text-brand-olive" />
                      Tons & Flores
                    </div>
                    <span className="font-mono text-brand-text-muted bg-brand-surface-subtle border border-brand-border px-1.5 py-0.5 rounded text-[10px]">
                      #{plant.id}
                    </span>
                  </div>

                  <div className="p-1.5 bg-white border border-brand-border rounded-xl shadow-xs">
                    <QRCodeSVG 
                      id={`qr-svg-${plant.id}`}
                      value={plantUrl} 
                      size={105} 
                      level="M" 
                      includeMargin={false}
                    />
                  </div>

                  <div className="w-full space-y-0.5">
                    <div className="font-bold text-sm text-brand-text leading-tight font-serif-title">
                      {plant.name}
                    </div>
                    <div className="text-[10px] text-brand-text-muted italic truncate max-w-full">
                      {plant.scientificName} • {plant.potSize}
                    </div>
                  </div>

                  {showCareIcons && (
                    <div className="flex items-center justify-center gap-2 text-[10px] text-brand-text pt-0.5">
                      <span className="flex items-center gap-0.5 font-medium bg-amber-50 text-amber-900 px-1.5 py-0.5 rounded border border-amber-200">
                        <Sun className="w-3 h-3 text-amber-500" />
                        {plant.light === 'sol-pleno' ? 'Sol' : plant.light === 'meia-sombra' ? 'Meia Sombra' : 'Sombra'}
                      </span>
                      <span className="flex items-center gap-0.5 font-medium bg-blue-50 text-blue-900 px-1.5 py-0.5 rounded border border-blue-200">
                        <Droplets className="w-3 h-3 text-blue-500" />
                        {plant.watering === 'baixa' ? 'Pouca' : plant.watering === 'moderada' ? 'Moderada' : 'Frequente'}
                      </span>
                    </div>
                  )}

                  <div className="w-full pt-1.5 border-t border-brand-border flex items-center justify-between text-xs">
                    <span className="text-[9px] text-brand-text-light font-medium">Escaneie o QR Code</span>
                    {showPrice && (
                      <span className="font-extrabold text-brand-text text-sm">
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
