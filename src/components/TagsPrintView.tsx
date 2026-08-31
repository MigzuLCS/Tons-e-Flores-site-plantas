import React, { useState, useRef, useMemo } from 'react';
import { 
  Printer, 
  CheckSquare, 
  Square, 
  Flower2, 
  Sparkles, 
  Download, 
  MapPin, 
  Layers,
  FileSpreadsheet,
  FileText,
  HelpCircle,
  Archive,
  Loader2,
  X,
  Table
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import type { Plant } from '../types/plant';
import { configService } from '../services/configService';
import { labelExportService, type BancadaExportItem } from '../services/labelExportService';

interface TagsPrintViewProps {
  plants: Plant[];
  selectedPlantId?: string | null;
}

export const TagsPrintView: React.FC<TagsPrintViewProps> = ({ plants, selectedPlantId }) => {
  // Aba ativa: 'plants' (Etiquetas de Vasos) vs 'bancadas' (Placas de Bancadas / Setores)
  const [activeTab, setActiveTab] = useState<'plants' | 'bancadas'>('plants');

  // ── Estados para Etiquetas de Vasos ──────────────────────────
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    if (selectedPlantId) {
      return [selectedPlantId];
    }
    return plants.filter(p => p.status !== 'vendida').map(p => p.id);
  });

  const [showPrice, setShowPrice] = useState(true);
  const [showCareIcons, setShowCareIcons] = useState(true);
  const tagRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Estados de exportação
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [zipProgress, setZipProgress] = useState<{ current: number; total: number } | null>(null);
  const [showNiimbotGuide, setShowNiimbotGuide] = useState(false);

  // ── Estados para Placas de Bancadas ─────────────────────────
  const allLocations = useMemo(() => {
    const configuredLocs = configService.getLocations();
    const plantLocs = plants.map(p => p.location).filter(Boolean);
    const merged = Array.from(new Set([...configuredLocs, ...plantLocs]));
    return merged.sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [plants]);

  const [selectedBancada, setSelectedBancada] = useState<string>(() => {
    return allLocations[0] || 'Bancada Central • Estufa 01';
  });

  const [bancadaFormat, setBancadaFormat] = useState<'display_a5' | 'niimbot'>('display_a5');

  // Vasos na bancada selecionada
  const bancadaPlants = useMemo(() => {
    return plants.filter(p => p.location === selectedBancada && p.status !== 'vendida');
  }, [plants, selectedBancada]);

  // Lista estruturada de todas as bancadas para exportação em lote
  const bancadasList: BancadaExportItem[] = useMemo(() => {
    const baseUrl = `${window.location.origin}${window.location.pathname}`;
    return allLocations.map(loc => ({
      name: loc,
      count: plants.filter(p => p.location === loc && p.status !== 'vendida').length,
      url: `${baseUrl}#bancada=${encodeURIComponent(loc)}`
    }));
  }, [allLocations, plants]);

  // Ações de seleção de vasos
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

  const plantsToPrint = useMemo(() => {
    return plants.filter(p => selectedIds.includes(p.id));
  }, [plants, selectedIds]);

  // ── Exportações de Vasos ──────────────────────────────────────
  const handleExportXls = () => {
    labelExportService.exportToXls(plantsToPrint);
  };

  const handleExportCsv = () => {
    labelExportService.exportToCsv(plantsToPrint);
  };

  const handleExportPdf = async () => {
    if (!plantsToPrint.length) return;
    setIsExportingPdf(true);
    try {
      await labelExportService.exportThermalPdf(plantsToPrint, showPrice, showCareIcons);
    } catch (err) {
      console.error('Erro ao gerar PDF térmico:', err);
      alert('Houve um problema ao gerar o PDF térmico.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleExportZip = async () => {
    if (!plantsToPrint.length) return;
    setIsExportingZip(true);
    setZipProgress({ current: 0, total: plantsToPrint.length });
    try {
      await labelExportService.exportZipImages(
        plantsToPrint,
        showPrice,
        showCareIcons,
        (current, total) => setZipProgress({ current, total })
      );
    } catch (err) {
      console.error('Erro ao gerar arquivo ZIP:', err);
      alert('Houve um problema ao empacotar as imagens.');
    } finally {
      setIsExportingZip(false);
      setZipProgress(null);
    }
  };

  // ── Exportações de Bancadas ──────────────────────────────────
  const handleExportBancadasXls = () => {
    labelExportService.exportBancadasXls(bancadasList);
  };

  const handleExportBancadasCsv = () => {
    labelExportService.exportBancadasCsv(bancadasList);
  };

  const handleExportBancadasPdf = async () => {
    setIsExportingPdf(true);
    try {
      if (bancadaFormat === 'display_a5') {
        await labelExportService.exportBancadasDisplayA5Pdf(bancadasList);
      } else {
        await labelExportService.exportBancadasThermalPdf(bancadasList);
      }
    } catch (err) {
      console.error('Erro ao gerar PDF de bancadas:', err);
      alert('Houve um problema ao gerar o PDF de bancadas.');
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleExportBancadasZip = async () => {
    setIsExportingZip(true);
    setZipProgress({ current: 0, total: bancadasList.length });
    try {
      await labelExportService.exportBancadasZip(
        bancadasList,
        bancadaFormat,
        (current, total) => setZipProgress({ current, total })
      );
    } catch (err) {
      console.error('Erro ao gerar ZIP de bancadas:', err);
      alert('Houve um problema ao gerar o arquivo ZIP de bancadas.');
    } finally {
      setIsExportingZip(false);
      setZipProgress(null);
    }
  };

  // Baixar imagem individual de Vaso para o App Niimbot
  const downloadTagImage = (plant: Plant) => {
    const svgElement = document.getElementById(`qr-svg-${plant.id}`) as SVGElement | null;
    if (!svgElement) return;

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
    ctx.font = 'bold 20px Arial, sans-serif';
    ctx.fillText('TONS & FLORES', 20, 36);

    // Tag ID
    ctx.font = 'bold 18px monospace';
    ctx.fillText(`#${plant.id}`, 20, 62);

    // Nome da Planta
    ctx.font = 'bold 24px Arial, sans-serif';
    ctx.fillText(plant.name.slice(0, 18), 20, 110);

    // Nome Científico / Vaso / Cultivo
    ctx.font = 'italic 16px Arial, sans-serif';
    const subDesc = `${plant.potSize || ''}${plant.cultivation && plant.cultivation !== 'Tradicional' ? ` • ${plant.cultivation}` : ''}`;
    ctx.fillText(subDesc.slice(0, 22), 20, 138);

    // Dicas
    if (showCareIcons) {
      ctx.font = '15px Arial, sans-serif';
      const lightText = plant.light === 'sol-pleno' ? 'Sol Pleno' : plant.light === 'meia-sombra' ? 'Meia Sombra' : 'Sombra';
      const waterText = plant.watering === 'baixa' ? 'Pouca Rega' : plant.watering === 'moderada' ? 'Rega 1-2x/sem' : 'Solo Úmido';
      ctx.fillText(`• ${lightText}`, 20, 185);
      ctx.fillText(`• ${waterText}`, 20, 212);
    }

    // Preço
    if (showPrice) {
      ctx.font = 'bold 28px Arial, sans-serif';
      ctx.fillText(`R$ ${plant.price.toFixed(2).replace('.', ',')}`, 20, 272);
    }

    // Converter QR Code SVG para imagem e desenhar no Canvas
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const URL = window.URL || window.webkitURL || window;
    const blobURL = URL.createObjectURL(svgBlob);
    const img = new Image();

    img.onload = () => {
      ctx.drawImage(img, 300, 35, 180, 180);
      ctx.font = 'bold 12px Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('ESCANEIE O QR', 390, 235);

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

  // Baixar imagem individual de Placa de Bancada
  const downloadBancadaPlate = () => {
    const svgElement = document.getElementById(`qr-svg-bancada`) as SVGElement | null;
    if (!svgElement) return;

    const isDisplay = bancadaFormat === 'display_a5';
    const width = isDisplay ? 700 : 500;
    const height = isDisplay ? 1000 : 300;

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    if (isDisplay) {
      ctx.strokeStyle = '#181514';
      ctx.lineWidth = 8;
      ctx.strokeRect(16, 16, width - 32, height - 32);

      ctx.strokeStyle = '#5E6B56';
      ctx.lineWidth = 2;
      ctx.strokeRect(26, 26, width - 52, height - 52);

      ctx.fillStyle = '#5E6B56';
      ctx.font = 'bold 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('TONS & FLORES', width / 2, 75);

      ctx.fillStyle = '#8C827A';
      ctx.font = 'italic 16px serif';
      ctx.fillText('Boutique de Plantas • Catálogo Físico', width / 2, 105);

      ctx.strokeStyle = '#E6E2DE';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(80, 130);
      ctx.lineTo(width - 80, 130);
      ctx.stroke();

      ctx.fillStyle = '#181514';
      ctx.font = 'bold 36px serif';
      ctx.fillText(selectedBancada.slice(0, 26), width / 2, 190);

      ctx.fillStyle = '#5E6B56';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText(`🌿 ${bancadaPlants.length} vasos disponíveis neste espaço`, width / 2, 230);

      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const URL = window.URL || window.webkitURL || window;
      const blobURL = URL.createObjectURL(svgBlob);
      const img = new Image();

      img.onload = () => {
        const qrSize = 360;
        ctx.drawImage(img, (width - qrSize) / 2, 270, qrSize, qrSize);

        ctx.strokeStyle = '#181514';
        ctx.lineWidth = 4;
        ctx.strokeRect((width - qrSize) / 2 - 6, 270 - 6, qrSize + 12, qrSize + 12);

        ctx.fillStyle = '#181514';
        ctx.font = 'bold 24px sans-serif';
        ctx.fillText('APONTE A CÂMERA DO CELULAR', width / 2, 695);

        ctx.fillStyle = '#665F59';
        ctx.font = '16px sans-serif';
        ctx.fillText('Consulte preços, necessidades de luz e regas desta bancada', width / 2, 735);

        ctx.fillStyle = '#5E6B56';
        ctx.font = 'bold 14px monospace';
        ctx.fillText('tons-e-flores.com', width / 2, 940);

        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `Placa_Bancada_${selectedBancada.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
        downloadLink.href = pngUrl;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        downloadLink.remove();
        URL.revokeObjectURL(blobURL);
      };

      img.src = blobURL;

    } else {
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 4;
      ctx.strokeRect(6, 6, width - 12, height - 12);

      ctx.fillStyle = '#000000';
      ctx.font = 'bold 20px Arial, sans-serif';
      ctx.fillText('TONS & FLORES', 20, 36);

      ctx.font = 'bold 16px monospace';
      ctx.fillText('📍 BANCADA', 20, 64);

      ctx.font = 'bold 22px Arial, sans-serif';
      ctx.fillText(selectedBancada.slice(0, 18), 20, 115);

      ctx.font = '14px Arial, sans-serif';
      ctx.fillText(`• ${bancadaPlants.length} vasos aqui`, 20, 160);
      ctx.fillText('• Aponte a câmera', 20, 195);
      ctx.fillText('• Veja preços e rega', 20, 230);

      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const URL = window.URL || window.webkitURL || window;
      const blobURL = URL.createObjectURL(svgBlob);
      const img = new Image();

      img.onload = () => {
        ctx.drawImage(img, 300, 35, 180, 180);
        ctx.font = 'bold 13px Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('ESCANEIE A BANCADA', 390, 240);

        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `Faixa_Bancada_Niimbot_${selectedBancada.replace(/[^a-zA-Z0-9]/g, '_')}.png`;
        downloadLink.href = pngUrl;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        downloadLink.remove();
        URL.revokeObjectURL(blobURL);
      };

      img.src = blobURL;
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const bancadaUrl = `${window.location.origin}${window.location.pathname}#bancada=${encodeURIComponent(selectedBancada)}`;

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in">
      
      {/* Estilos específicos para impressão padrão do navegador */}
      <style>{`
        @media print {
          @page {
            size: ${activeTab === 'plants' ? '50mm 30mm' : (bancadaFormat === 'niimbot' ? '50mm 30mm' : 'A5 portrait')};
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
          .bancada-display-print {
            page-break-after: always;
            break-after: page;
            width: 148mm !important;
            height: 210mm !important;
            margin: 0 auto !important;
            padding: 10mm !important;
            box-sizing: border-box !important;
          }
        }
      `}</style>

      {/* Navegação entre Sub-Abas de Identificação */}
      <div className="no-print flex items-center gap-2 p-1.5 bg-brand-surface-subtle border border-brand-border rounded-2xl max-w-md mx-auto shadow-xs">
        <button
          onClick={() => setActiveTab('plants')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'plants'
              ? 'bg-brand-olive text-white shadow-xs'
              : 'text-brand-text-muted hover:text-brand-text hover:bg-brand-surface'
          }`}
        >
          <span>🏷️ Etiquetas de Vasos</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
            activeTab === 'plants' ? 'bg-white/20 text-white' : 'bg-brand-border text-brand-text-muted'
          }`}>
            {plants.filter(p => p.status !== 'vendida').length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('bancadas')}
          className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'bancadas'
              ? 'bg-brand-olive text-white shadow-xs'
              : 'text-brand-text-muted hover:text-brand-text hover:bg-brand-surface'
          }`}
        >
          <span>📍 Placas de Bancada</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
            activeTab === 'bancadas' ? 'bg-white/20 text-white' : 'bg-brand-border text-brand-text-muted'
          }`}>
            {allLocations.length}
          </span>
        </button>
      </div>

      {/* ── ABA 1: ETIQUETAS DE VASOS ─────────────────────────────── */}
      {activeTab === 'plants' && (
        <>
          {/* Barra de Controle e Exportação */}
          <div className="no-print bg-brand-surface p-6 rounded-3xl border border-brand-border shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-olive">
                  Identificação Individual de Vasos
                </span>
                <h2 className="text-2xl font-bold font-serif-title text-brand-text mt-0.5">
                  Gerador de Etiquetas & Exportação
                </h2>
                <p className="text-xs text-brand-text-muted mt-0.5">
                  Exporte para o LibreOffice Calc / Niimbot em lote ou gere PDFs e imagens em 50x30mm.
                </p>
              </div>

              {/* Botão de Ajuda Niimbot */}
              <button
                onClick={() => setShowNiimbotGuide(true)}
                className="self-start lg:self-center flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-all cursor-pointer"
              >
                <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Como usar no App Niimbot?</span>
              </button>
            </div>

            {/* Barra de Ações de Exportação */}
            <div className="p-4 bg-brand-surface-subtle border border-brand-border rounded-2xl space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-brand-text">
                <span className="flex items-center gap-1.5">
                  <Table className="w-4 h-4 text-brand-olive" />
                  Opções de Exportação em Lote ({plantsToPrint.length} selecionadas):
                </span>
                
                {/* Opções de visualização integradas */}
                <div className="flex items-center gap-4 text-xs font-normal">
                  <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                    <input 
                      type="checkbox" 
                      checked={showPrice} 
                      onChange={e => setShowPrice(e.target.checked)}
                      className="rounded text-brand-olive focus:ring-brand-olive" 
                    />
                    Preço
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer font-medium">
                    <input 
                      type="checkbox" 
                      checked={showCareIcons} 
                      onChange={e => setShowCareIcons(e.target.checked)}
                      className="rounded text-brand-olive focus:ring-brand-olive" 
                    />
                    Cuidados
                  </label>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                {/* Exportar XLS / LibreOffice */}
                <button
                  onClick={handleExportXls}
                  disabled={plantsToPrint.length === 0}
                  title="Gera planilha compatível com LibreOffice Calc e o recurso de Importação em Lote do Niimbot"
                  className="bg-brand-olive hover:bg-brand-olive-hover disabled:opacity-50 text-white font-bold px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-2 text-xs transition-all cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Planilha Excel / LibreOffice (.xls)</span>
                </button>

                {/* Exportar CSV */}
                <button
                  onClick={handleExportCsv}
                  disabled={plantsToPrint.length === 0}
                  title="Gera arquivo CSV com codificação UTF-8 e delimitador ';'"
                  className="bg-brand-surface hover:bg-white disabled:opacity-50 text-brand-text font-bold px-4 py-2.5 rounded-xl border border-brand-border shadow-xs flex items-center gap-2 text-xs transition-all cursor-pointer"
                >
                  <Table className="w-4 h-4 text-brand-olive" />
                  <span>Planilha CSV (.csv)</span>
                </button>

                {/* Exportar PDF Térmico 50x30mm */}
                <button
                  onClick={handleExportPdf}
                  disabled={plantsToPrint.length === 0 || isExportingPdf}
                  title="Gera arquivo PDF com tamanho exato de 50x30mm por página para abrir no Niimbot"
                  className="bg-brand-surface hover:bg-white disabled:opacity-50 text-brand-text font-bold px-4 py-2.5 rounded-xl border border-brand-border shadow-xs flex items-center gap-2 text-xs transition-all cursor-pointer"
                >
                  {isExportingPdf ? (
                    <Loader2 className="w-4 h-4 text-brand-olive animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4 text-brand-olive" />
                  )}
                  <span>PDF Térmico 50x30mm</span>
                </button>

                {/* Baixar Pacote ZIP */}
                <button
                  onClick={handleExportZip}
                  disabled={plantsToPrint.length === 0 || isExportingZip}
                  title="Baixa todas as etiquetas selecionadas em um arquivo ZIP com imagens PNG individuais"
                  className="bg-brand-surface hover:bg-white disabled:opacity-50 text-brand-text font-bold px-4 py-2.5 rounded-xl border border-brand-border shadow-xs flex items-center gap-2 text-xs transition-all cursor-pointer"
                >
                  {isExportingZip ? (
                    <Loader2 className="w-4 h-4 text-brand-olive animate-spin" />
                  ) : (
                    <Archive className="w-4 h-4 text-brand-olive" />
                  )}
                  <span>
                    {isExportingZip && zipProgress 
                      ? `Gerando ZIP (${zipProgress.current}/${zipProgress.total})...` 
                      : 'Baixar Todas em ZIP (.png)'}
                  </span>
                </button>

                {/* Impressão Direta */}
                <button 
                  onClick={handlePrint}
                  disabled={plantsToPrint.length === 0}
                  title="Imprime diretamente na impressora padrão configurada no navegador"
                  className="bg-brand-olive hover:bg-brand-olive-hover disabled:opacity-50 text-white font-bold px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-2 text-xs transition-all ml-auto cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir ({plantsToPrint.length})</span>
                </button>
              </div>
            </div>

            {/* Barra de Seleção de Vasos */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <button 
                onClick={toggleSelectAll}
                className="flex items-center gap-1.5 font-bold text-xs text-brand-text hover:text-brand-olive cursor-pointer"
              >
                {selectedIds.length === plants.filter(p => p.status !== 'vendida').length ? (
                  <CheckSquare className="w-4 h-4 text-brand-olive" />
                ) : (
                  <Square className="w-4 h-4 text-brand-text-muted" />
                )}
                {selectedIds.length === plants.filter(p => p.status !== 'vendida').length ? 'Desmarcar Todas' : 'Selecionar Todas'}
              </button>

              <span className="text-xs text-brand-text-muted">
                <strong>{plantsToPrint.length}</strong> de {plants.filter(p => p.status !== 'vendida').length} vasos selecionados
              </span>
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

          {/* Visualização das Etiquetas de Vasos */}
          <div className="bg-brand-surface p-6 sm:p-10 rounded-3xl shadow-sm border border-brand-border max-w-4xl mx-auto">
            {plantsToPrint.length > 0 ? (
              <div className="space-y-6">
                {plantsToPrint.map((plant) => {
                  const plantUrl = `${window.location.origin}${window.location.pathname}#p-${plant.id}`;

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
                            {plant.potSize}{plant.cultivation && plant.cultivation !== 'Tradicional' ? ` • ${plant.cultivation}` : ''}
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

                      {/* Botão flutuante para baixar PNG individual */}
                      <button 
                        onClick={() => downloadTagImage(plant)}
                        title="Baixar imagem PNG 50x30mm individual"
                        className="no-print absolute -top-3 -right-3 bg-brand-green-950 hover:bg-brand-rose-600 text-white p-1.5 rounded-full shadow-md transition-all cursor-pointer opacity-80 group-hover:opacity-100"
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>
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
        </>
      )}

      {/* ── ABA 2: PLACAS DE BANCADA (SETORES) ──────────────────────── */}
      {activeTab === 'bancadas' && (
        <div className="space-y-6">
          {/* Painel de Controle de Placas de Bancada */}
          <div className="no-print bg-brand-surface p-6 rounded-3xl border border-brand-border shadow-xs space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-brand-olive">
                  Identificação de Setores & Espaço Físico
                </span>
                <h2 className="text-2xl font-bold font-serif-title text-brand-text mt-0.5">
                  Gerador de Placas para Bancadas
                </h2>
                <p className="text-xs text-brand-text-muted mt-0.5">
                  Gere displays de mesa ou faixas térmicas adesivas. Ao escanear o QR, o cliente abre o catálogo filtrado por setor.
                </p>
              </div>

              {/* Botão de Ajuda Niimbot */}
              <button
                onClick={() => setShowNiimbotGuide(true)}
                className="self-start lg:self-center flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold transition-all cursor-pointer"
              >
                <HelpCircle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Como usar no App Niimbot?</span>
              </button>
            </div>

            {/* Barra de Ações de Exportação de Bancadas */}
            <div className="p-4 bg-brand-surface-subtle border border-brand-border rounded-2xl space-y-3">
              <div className="text-xs font-bold text-brand-text flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Table className="w-4 h-4 text-brand-olive" />
                  Opções de Exportação das Bancadas ({bancadasList.length} setores):
                </span>
                <span className="text-[11px] text-brand-text-muted font-normal">
                  Exporte todas as bancadas cadastradas
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                {/* Exportar XLS / LibreOffice */}
                <button
                  onClick={handleExportBancadasXls}
                  title="Gera planilha com todas as bancadas para LibreOffice Calc e Niimbot"
                  className="bg-brand-olive hover:bg-brand-olive-hover text-white font-bold px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-2 text-xs transition-all cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Planilha Bancadas (.xls)</span>
                </button>

                {/* Exportar CSV */}
                <button
                  onClick={handleExportBancadasCsv}
                  title="Gera arquivo CSV com os links de todas as bancadas"
                  className="bg-brand-surface hover:bg-white text-brand-text font-bold px-4 py-2.5 rounded-xl border border-brand-border shadow-xs flex items-center gap-2 text-xs transition-all cursor-pointer"
                >
                  <Table className="w-4 h-4 text-brand-olive" />
                  <span>Planilha CSV (.csv)</span>
                </button>

                {/* Exportar PDF Térmico / A5 */}
                <button
                  onClick={handleExportBancadasPdf}
                  disabled={isExportingPdf}
                  title="Gera arquivo PDF com todas as bancadas no formato selecionado"
                  className="bg-brand-surface hover:bg-white text-brand-text font-bold px-4 py-2.5 rounded-xl border border-brand-border shadow-xs flex items-center gap-2 text-xs transition-all cursor-pointer"
                >
                  {isExportingPdf ? (
                    <Loader2 className="w-4 h-4 text-brand-olive animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4 text-brand-olive" />
                  )}
                  <span>
                    {bancadaFormat === 'display_a5' ? 'PDF Display (A5)' : 'PDF Térmico (50x30mm)'}
                  </span>
                </button>

                {/* Baixar Pacote ZIP */}
                <button
                  onClick={handleExportBancadasZip}
                  disabled={isExportingZip}
                  title="Baixa todas as bancadas em imagens PNG compactadas em ZIP"
                  className="bg-brand-surface hover:bg-white text-brand-text font-bold px-4 py-2.5 rounded-xl border border-brand-border shadow-xs flex items-center gap-2 text-xs transition-all cursor-pointer"
                >
                  {isExportingZip ? (
                    <Loader2 className="w-4 h-4 text-brand-olive animate-spin" />
                  ) : (
                    <Archive className="w-4 h-4 text-brand-olive" />
                  )}
                  <span>
                    {isExportingZip && zipProgress 
                      ? `Gerando ZIP (${zipProgress.current}/${zipProgress.total})...` 
                      : 'Baixar Todas em ZIP (.png)'}
                  </span>
                </button>

                {/* Baixar Imagem Individual */}
                <button
                  onClick={downloadBancadaPlate}
                  className="bg-brand-surface hover:bg-white text-brand-text font-bold px-4 py-2.5 rounded-xl border border-brand-border shadow-xs flex items-center gap-2 text-xs transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4 text-brand-olive" />
                  <span>Baixar Esta Placa (PNG)</span>
                </button>

                {/* Imprimir no Navegador */}
                <button 
                  onClick={handlePrint}
                  className="bg-brand-olive hover:bg-brand-olive-hover text-white font-bold px-4 py-2.5 rounded-xl shadow-xs flex items-center gap-2 text-xs transition-all ml-auto cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir no Navegador</span>
                </button>
              </div>
            </div>

            {/* Controles de Formato e Seleção da Bancada */}
            <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Seletor da Bancada */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-brand-text flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-brand-olive" />
                  Selecione a Bancada / Setor para Visualizar:
                </label>
                <select
                  value={selectedBancada}
                  onChange={(e) => setSelectedBancada(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-brand-surface-subtle border border-brand-border rounded-xl text-sm font-bold text-brand-text focus:ring-2 focus:ring-brand-olive focus:outline-none"
                >
                  {allLocations.map((loc) => {
                    const count = plants.filter(p => p.location === loc && p.status !== 'vendida').length;
                    return (
                      <option key={loc} value={loc}>
                        {loc} ({count} {count === 1 ? 'vaso' : 'vasos'})
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Seletor de Formato da Placa */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-brand-text flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-brand-olive" />
                  Formato da Placa:
                </label>
                <div className="grid grid-cols-2 gap-2 bg-brand-surface-subtle p-1 rounded-xl border border-brand-border">
                  <button
                    onClick={() => setBancadaFormat('display_a5')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      bancadaFormat === 'display_a5'
                        ? 'bg-white shadow-xs text-brand-olive font-bold'
                        : 'text-brand-text-muted hover:text-brand-text'
                    }`}
                  >
                    🖼️ Display de Mesa (A5)
                  </button>
                  <button
                    onClick={() => setBancadaFormat('niimbot')}
                    className={`py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      bancadaFormat === 'niimbot'
                        ? 'bg-white shadow-xs text-brand-olive font-bold'
                        : 'text-brand-text-muted hover:text-brand-text'
                    }`}
                  >
                    🏷️ Faixa Térmica (50x30mm)
                  </button>
                </div>
              </div>
            </div>

            {/* Informações da Bancada Selecionada */}
            <div className="p-3 bg-brand-olive-light/60 border border-brand-olive-border rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-brand-olive-text">Link do QR Code:</span>
                <code className="px-2 py-0.5 bg-white rounded font-mono text-[11px] text-brand-olive-text border border-brand-olive-border">
                  {bancadaUrl}
                </code>
              </div>
              <div className="text-brand-olive-text font-bold">
                {bancadaPlants.length} vasos vinculados neste setor
              </div>
            </div>
          </div>

          {/* Pré-Visualização da Placa de Bancada */}
          <div className="bg-brand-surface p-6 sm:p-12 rounded-3xl shadow-sm border border-brand-border max-w-2xl mx-auto text-center">
            
            {bancadaFormat === 'display_a5' ? (
              /* Modelo Display de Mesa / Acrílico A5 */
              <div className="bancada-display-print bg-white border-4 border-stone-900 rounded-3xl p-8 sm:p-12 space-y-6 shadow-md max-w-lg mx-auto text-stone-900">
                
                <div className="space-y-1">
                  <div className="flex items-center justify-center gap-2 text-xs font-extrabold uppercase tracking-widest text-brand-olive">
                    <Flower2 className="w-4 h-4" />
                    TONS & FLORES
                  </div>
                  <p className="text-xs text-stone-500 font-serif italic">Boutique de Plantas • Catálogo Físico</p>
                </div>

                <div className="w-24 h-px bg-stone-300 mx-auto" />

                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-stone-100 text-stone-800 rounded-full text-xs font-bold">
                    <MapPin className="w-3.5 h-3.5 text-brand-olive" />
                    Setor da Loja
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold font-serif-title text-stone-950 leading-tight">
                    {selectedBancada}
                  </h3>
                  <p className="text-xs font-semibold text-stone-600">
                    🌿 {bancadaPlants.length} vasos disponíveis neste espaço
                  </p>
                </div>

                {/* QR Code de Alta Resolução */}
                <div className="p-4 bg-white border-2 border-stone-900 rounded-2xl inline-block shadow-xs">
                  <QRCodeSVG 
                    id="qr-svg-bancada"
                    value={bancadaUrl} 
                    size={220} 
                    level="H" 
                    includeMargin={false}
                  />
                </div>

                <div className="space-y-1 max-w-xs mx-auto">
                  <div className="font-extrabold text-sm sm:text-base text-stone-950 tracking-wide uppercase">
                    Aponte a Câmera do Celular
                  </div>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    Consulte preços, necessidades de luz e instruções de rega de todos os vasos desta bancada.
                  </p>
                </div>

                <div className="pt-2 text-[11px] font-mono text-stone-400">
                  tons-e-flores.com
                </div>

              </div>
            ) : (
              /* Modelo Faixa Niimbot (50x30mm) */
              <div 
                className="thermal-page-break border-2 border-stone-900 rounded-lg p-2 bg-white flex items-center justify-between gap-2 max-w-[340px] mx-auto shadow-xs text-left"
                style={{ width: '100%', aspectRatio: '50/30' }}
              >
                <div className="flex-1 flex flex-col justify-between h-full pr-1 overflow-hidden">
                  <div>
                    <div className="flex items-center justify-between text-[10px] font-extrabold text-stone-900 leading-tight">
                      <span className="uppercase tracking-tighter">TONS & FLORES</span>
                    </div>
                    <div className="font-extrabold text-[11px] font-mono text-stone-700 mt-0.5">
                      📍 BANCADA
                    </div>
                    <div className="font-bold text-[13px] text-stone-950 leading-tight mt-0.5 truncate font-serif-title">
                      {selectedBancada}
                    </div>
                  </div>

                  <div className="text-[8px] text-stone-700 font-semibold space-y-0.5 pt-0.5">
                    <div>• {bancadaPlants.length} vasos nesta bancada</div>
                    <div>• Escaneie para ver valores</div>
                  </div>

                  <div className="text-[9px] font-bold text-stone-900 pt-0.5">
                    Catálogo Físico
                  </div>
                </div>

                <div className="flex flex-col items-center justify-center shrink-0">
                  <div className="p-0.5 bg-white border border-stone-800 rounded">
                    <QRCodeSVG 
                      id="qr-svg-bancada"
                      value={bancadaUrl} 
                      size={78} 
                      level="M" 
                      includeMargin={false}
                    />
                  </div>
                  <span className="text-[7px] font-bold text-stone-800 mt-0.5 tracking-tighter">
                    ESCANEIE O QR
                  </span>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* ── MODAL: GUIA PASSO A PASSO NIIMBOT B1 & LIBREOFFICE ─────── */}
      {showNiimbotGuide && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-brand-border space-y-6 animate-in zoom-in-95">
            
            <div className="flex items-start justify-between gap-4 border-b border-brand-border pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest bg-brand-olive-light text-brand-olive px-2.5 py-1 rounded-full">
                    Guia Prático Niimbot B1
                  </span>
                </div>
                <h3 className="text-xl font-bold font-serif-title text-brand-text mt-1">
                  Como Imprimir em Lote no App Niimbot com LibreOffice
                </h3>
              </div>
              <button
                onClick={() => setShowNiimbotGuide(false)}
                className="p-1.5 rounded-full hover:bg-stone-100 text-stone-400 hover:text-stone-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs text-brand-text leading-relaxed">
              
              {/* Passo 1 */}
              <div className="flex items-start gap-3 p-3.5 bg-brand-surface-subtle rounded-2xl border border-brand-border">
                <div className="w-7 h-7 rounded-xl bg-brand-olive text-white font-black flex items-center justify-center shrink-0 text-sm">
                  1
                </div>
                <div className="space-y-1 flex-1">
                  <div className="font-bold text-sm text-brand-text">
                    Baixe a Planilha (.xls ou .csv)
                  </div>
                  <p className="text-brand-text-muted">
                    No topo desta tela, clique no botão verde <strong>"Planilha Excel / LibreOffice (.xls)"</strong> ou <strong>"Planilha CSV (.csv)"</strong>. Você pode abrir o arquivo direto no LibreOffice Calc para conferir ou editar antes de imprimir.
                  </p>
                </div>
              </div>

              {/* Passo 2 */}
              <div className="flex items-start gap-3 p-3.5 bg-brand-surface-subtle rounded-2xl border border-brand-border">
                <div className="w-7 h-7 rounded-xl bg-brand-olive text-white font-black flex items-center justify-center shrink-0 text-sm">
                  2
                </div>
                <div className="space-y-1 flex-1">
                  <div className="font-bold text-sm text-brand-text">
                    Crie o Modelo de Etiqueta no App Niimbot PC
                  </div>
                  <p className="text-brand-text-muted">
                    Abra o programa da Niimbot no computador e inicie um novo rótulo com dimensões <strong>50mm de largura x 30mm de altura</strong>.
                  </p>
                  <div className="grid grid-cols-2 gap-2 pt-1 font-mono text-[11px]">
                    <div className="p-2 bg-white rounded-lg border border-brand-border">
                      • Inserir <strong>Texto</strong> para o Nome / Bancada
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-brand-border">
                      • Inserir <strong>Código QR</strong> para o Link
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-brand-border">
                      • Inserir <strong>Texto</strong> para Cuidados/Vaso
                    </div>
                    <div className="p-2 bg-white rounded-lg border border-brand-border">
                      • Inserir <strong>Texto</strong> para o Preço
                    </div>
                  </div>
                </div>
              </div>

              {/* Passo 3 */}
              <div className="flex items-start gap-3 p-3.5 bg-brand-surface-subtle rounded-2xl border border-brand-border">
                <div className="w-7 h-7 rounded-xl bg-brand-olive text-white font-black flex items-center justify-center shrink-0 text-sm">
                  3
                </div>
                <div className="space-y-1 flex-1">
                  <div className="font-bold text-sm text-brand-text">
                    Importar Dados da Planilha (Mala Direta)
                  </div>
                  <p className="text-brand-text-muted">
                    No menu superior do Niimbot, clique em <strong>"Importar Dados"</strong> (ou <em>Excel Batch Print</em>) e selecione o arquivo baixado. Em seguida, vincule cada campo aos dados:
                  </p>
                  <ul className="list-disc list-inside space-y-0.5 pt-1 text-stone-700">
                    <li>Vincule o texto do Nome à coluna <code>Nome</code> (ou <code>Bancada</code>)</li>
                    <li>Vincule o QR Code à coluna <code>Link_QR_Code</code></li>
                    <li>Vincule o texto de Preço à coluna <code>Preco_Formatado</code></li>
                  </ul>
                </div>
              </div>

              {/* Passo 4 */}
              <div className="flex items-start gap-3 p-3.5 bg-amber-50 rounded-2xl border border-amber-200">
                <div className="w-7 h-7 rounded-xl bg-amber-600 text-white font-black flex items-center justify-center shrink-0 text-sm">
                  💡
                </div>
                <div className="space-y-1 flex-1 text-amber-950">
                  <div className="font-bold text-sm">
                    Dica de Ouro: Salve o arquivo .jpcs
                  </div>
                  <p className="text-xs leading-relaxed">
                    Depois de desenhar o modelo uma vez no Niimbot, clique em <strong>Salvar Como</strong> e guarde o arquivo <code>Modelo_Tons_Flores.jpcs</code> no seu computador. Nas próximas vezes, basta abrir esse arquivo e só importar a nova planilha!
                  </p>
                </div>
              </div>

            </div>

            <div className="pt-2 flex items-center justify-end gap-3 border-t border-brand-border">
              <button
                onClick={() => setShowNiimbotGuide(false)}
                className="px-6 py-2.5 bg-brand-olive hover:bg-brand-olive-hover text-white font-bold rounded-xl text-xs transition-all cursor-pointer shadow-xs"
              >
                Entendi, voltar às etiquetas
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
