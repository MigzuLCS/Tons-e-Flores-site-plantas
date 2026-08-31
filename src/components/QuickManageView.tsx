import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Search, 
  MapPin, 
  Tag, 
  CheckCircle2, 
  Clock, 
  ShoppingBag, 
  RotateCcw, 
  X, 
  Check, 
  Camera,
  Sparkles,
  QrCode,
  AlertCircle
} from 'lucide-react';
import { Html5Qrcode } from 'html5-qrcode';
import type { Plant, PlantStatus } from '../types/plant';
import { configService } from '../services/configService';

interface QuickManageViewProps {
  plants: Plant[];
  isLoading?: boolean;
  activeLocationFilter?: string | null;
  onUpdatePlant: (plant: Plant) => Promise<void> | void;
  onRefresh: () => void;
}

export const QuickManageView: React.FC<QuickManageViewProps> = ({
  plants,
  isLoading = false,
  activeLocationFilter,
  onUpdatePlant,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocationFilter, setSelectedLocationFilter] = useState<string>(activeLocationFilter || 'all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (activeLocationFilter) {
      setSelectedLocationFilter(activeLocationFilter);
    }
  }, [activeLocationFilter]);
  
  // Modais de Edição Rápida
  const [priceModalPlant, setPriceModalPlant] = useState<Plant | null>(null);
  const [tempPrice, setTempPrice] = useState<string>('');

  const [locationModalPlant, setLocationModalPlant] = useState<Plant | null>(null);

  // Scanner de Câmera / QR Code
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [scannerError, setScannerError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const html5QrCodeRef = useRef<Html5Qrcode | null>(null);

  // Notificação Toast Visual
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  // Planta em destaque recente (ex: após leitura de QR Code)
  const [highlightedPlantId, setHighlightedPlantId] = useState<string | null>(null);

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const locations = useMemo(() => configService.getLocations(), []);

  // Filtragem rápida
  const filteredPlants = useMemo(() => {
    return plants.filter((plant) => {
      const matchesSearch = 
        plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (plant.scientificName && plant.scientificName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        plant.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (plant.location && plant.location.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesLocation = 
        selectedLocationFilter === 'all' || 
        plant.location === selectedLocationFilter;

      const matchesStatus = 
        statusFilter === 'all' || 
        plant.status === statusFilter;

      return matchesSearch && matchesLocation && matchesStatus;
    });
  }, [plants, searchTerm, selectedLocationFilter, statusFilter]);

  // Contadores
  const stats = useMemo(() => {
    const total = plants.length;
    const disponiveis = plants.filter(p => p.status === 'disponivel').length;
    const reservadas = plants.filter(p => p.status === 'reservada').length;
    const vendidas = plants.filter(p => p.status === 'vendida').length;
    return { total, disponiveis, reservadas, vendidas };
  }, [plants]);

  // Ação de Alterar Status Instantâneo
  const handleStatusChange = async (plant: Plant, newStatus: PlantStatus) => {
    if (plant.status === newStatus) return;

    const updated: Plant = {
      ...plant,
      status: newStatus,
      updatedAt: new Date().toISOString()
    };

    await onUpdatePlant(updated);
    
    const statusLabels: Record<PlantStatus, string> = {
      disponivel: 'Disponível na Loja',
      reservada: 'Reservada',
      vendida: 'Vendida'
    };

    showToast(`${plant.name}: ${statusLabels[newStatus]}`);
  };

  // Abrir Modal de Preço
  const openPriceModal = (plant: Plant) => {
    setPriceModalPlant(plant);
    setTempPrice(plant.price ? plant.price.toFixed(2) : '0.00');
  };

  // Salvar Preço
  const handleSavePrice = async () => {
    if (!priceModalPlant) return;
    const parsedPrice = parseFloat(tempPrice.replace(',', '.'));
    if (isNaN(parsedPrice) || parsedPrice < 0) {
      alert('Por favor, informe um valor de preço válido.');
      return;
    }

    const updated: Plant = {
      ...priceModalPlant,
      price: parsedPrice,
      updatedAt: new Date().toISOString()
    };

    await onUpdatePlant(updated);
    showToast(`Preço de "${priceModalPlant.name}" atualizado para R$ ${parsedPrice.toFixed(2).replace('.', ',')}!`);
    setPriceModalPlant(null);
  };

  // Ajustes rápidos de preço (+5, +10, -5, etc)
  const adjustPrice = (amount: number) => {
    const current = parseFloat(tempPrice.replace(',', '.')) || 0;
    const next = Math.max(0, current + amount);
    setTempPrice(next.toFixed(2));
  };

  // Salvar Localização/Bancada
  const handleSaveLocation = async (newLocation: string) => {
    if (!locationModalPlant) return;

    const updated: Plant = {
      ...locationModalPlant,
      location: newLocation,
      updatedAt: new Date().toISOString()
    };

    await onUpdatePlant(updated);
    showToast(`"${locationModalPlant.name}" movida para: ${newLocation}`);
    setLocationModalPlant(null);
  };

  // ─── LEITOR DE QR CODE / CÂMERA ─────────────────────────────────────────────
  const stopQrScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        if (html5QrCodeRef.current.isScanning) {
          await html5QrCodeRef.current.stop();
        }
        await html5QrCodeRef.current.clear();
      } catch (err) {
        console.error('Erro ao parar câmera do scanner:', err);
      } finally {
        html5QrCodeRef.current = null;
        setIsCameraActive(false);
      }
    }
  };

  const startQrScanner = async () => {
    setScannerError(null);
    setIsCameraActive(false);

    try {
      // Pequeno delay para garantir montagem do container DOM
      await new Promise((resolve) => setTimeout(resolve, 150));
      const element = document.getElementById('qr-camera-reader');
      if (!element) return;

      const html5QrCode = new Html5Qrcode('qr-camera-reader');
      html5QrCodeRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        (decodedText) => {
          // Sucesso na decodificação do QR Code
          handleQrCodeScanned(decodedText);
        },
        () => {
          // Erros de frame contínuo normais antes de enquadrar o código - ignorar
        }
      );

      setIsCameraActive(true);
    } catch (err: any) {
      console.error('Erro ao inicializar scanner de câmera:', err);
      setScannerError(
        'Não foi possível acessar a câmera. Verifique se concedeu permissão de câmera no navegador do celular.'
      );
      setIsCameraActive(false);
    }
  };

  const handleQrCodeScanned = async (decodedText: string) => {
    // Vibração tátil sutil se suportado no celular
    if (navigator.vibrate) {
      navigator.vibrate([40, 30, 40]);
    }

    // 1. Verifica se é um QR Code de Bancada/Setor da Loja (ex: #bancada=... ou #local=... ou nome direto)
    const bancadaMatch = decodedText.match(/[#&?](?:bancada|local)=([^&]+)/i);
    let scannedLocation: string | null = null;

    if (bancadaMatch) {
      scannedLocation = decodeURIComponent(bancadaMatch[1].replace(/\+/g, ' '));
    } else {
      // Verifica se o texto lido corresponde exatamente a alguma bancada cadastrada
      const matchedLoc = locations.find(
        (loc) => loc.toLowerCase() === decodedText.trim().toLowerCase()
      );
      if (matchedLoc) {
        scannedLocation = matchedLoc;
      }
    }

    if (scannedLocation) {
      await stopQrScanner();
      setIsQrScannerOpen(false);
      setSelectedLocationFilter(scannedLocation);
      setSearchTerm('');
      setStatusFilter('all');
      const count = plants.filter((p) => p.location === scannedLocation).length;
      showToast(`📍 Setor identificado: ${scannedLocation} (${count} vasos)`);
      return;
    }

    // 2. Extrai o código da planta (Ex: "TF-001" de "#p-TF-001" ou "https://site.com/#p-TF-001")
    const match = decodedText.match(/TF-\d+/i) || decodedText.match(/#p-(TF-\d+)/i);
    const plantId = match ? (match[1] || match[0]).toUpperCase() : decodedText.trim().toUpperCase();

    const foundPlant = plants.find(
      (p) => p.id.toUpperCase() === plantId || p.id.toUpperCase().includes(plantId)
    );

    await stopQrScanner();
    setIsQrScannerOpen(false);

    if (foundPlant) {
      setHighlightedPlantId(foundPlant.id);
      setSearchTerm(foundPlant.id);
      setSelectedLocationFilter('all');
      setStatusFilter('all');
      showToast(`🪴 Vaso identificado: ${foundPlant.name} (${foundPlant.id})`);
      
      // Remove o destaque após 8 segundos
      setTimeout(() => {
        setHighlightedPlantId(null);
      }, 8000);
    } else {
      showToast(`Código "${plantId}" não corresponde a nenhuma planta ou bancada.`, 'info');
    }
  };

  useEffect(() => {
    if (isQrScannerOpen) {
      startQrScanner();
    } else {
      stopQrScanner();
    }
    return () => {
      stopQrScanner();
    };
  }, [isQrScannerOpen]);

  return (
    <div className="min-h-screen bg-brand-bg text-brand-text pb-28 pt-2 sm:pt-4 transition-colors font-sans">
      
      {/* Toast Notificação Flutuante com paleta da marca */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3 bg-brand-surface text-brand-text rounded-2xl shadow-xl backdrop-blur-md flex items-center gap-3 border border-brand-border text-xs sm:text-sm font-semibold animate-in fade-in slide-in-from-top-4 duration-300">
          <Sparkles className="w-4 h-4 text-brand-olive shrink-0" />
          <span>{toastMessage.text}</span>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-3.5 sm:px-6 space-y-4">
        
        {/* CABEÇALHO DA TELA DE MANEJO */}
        <div className="bg-brand-surface p-4 sm:p-5 rounded-2xl border border-brand-border shadow-xs space-y-3.5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-olive"></span>
                <h1 className="text-lg sm:text-xl font-bold font-serif-title text-brand-text">
                  Manejo Rápido da Loja
                </h1>
              </div>
              <p className="text-xs text-brand-text-muted mt-0.5">
                Altere preços, bancadas ou registre vendas com toques rápidos no vaso.
              </p>
            </div>

            <button
              onClick={onRefresh}
              disabled={isLoading}
              title="Atualizar dados do banco"
              className="p-2.5 rounded-xl bg-brand-surface-subtle text-brand-text-muted hover:text-brand-text hover:bg-brand-border-subtle border border-brand-border transition-all cursor-pointer shrink-0 active:scale-95 disabled:opacity-50"
            >
              <RotateCcw className={`w-4 h-4 ${isLoading ? 'animate-spin text-brand-olive' : ''}`} />
            </button>
          </div>

          {/* BOTÃO PRINCIPAL: APONTAR CÂMERA PARA O VASO (QR CODE) */}
          <button
            onClick={() => setIsQrScannerOpen(true)}
            className="w-full py-3.5 px-4 bg-brand-olive hover:bg-brand-olive-hover active:scale-[0.99] text-white font-semibold rounded-xl shadow-xs flex items-center justify-center gap-2.5 transition-all cursor-pointer text-sm"
          >
            <Camera className="w-5 h-5" />
            <span>Apontar Câmera para o Vaso (QR Code)</span>
          </button>

          {/* Cards de Filtro Rápido de Status */}
          <div className="grid grid-cols-3 gap-2 pt-1 border-t border-brand-border-subtle">
            {/* Disponíveis */}
            <button
              onClick={() => setStatusFilter(statusFilter === 'disponivel' ? 'all' : 'disponivel')}
              className={`p-2 rounded-xl text-center transition-all cursor-pointer border ${
                statusFilter === 'disponivel' 
                  ? 'bg-brand-olive-light border-brand-olive text-brand-olive-text font-bold shadow-xs' 
                  : 'bg-brand-surface-subtle border-brand-border text-brand-text-muted hover:bg-brand-surface'
              }`}
            >
              <span className="block text-base sm:text-lg font-bold leading-tight text-brand-olive-text dark:text-brand-olive">
                {stats.disponiveis}
              </span>
              <span className="text-[10px] sm:text-xs">Disponíveis</span>
            </button>

            {/* Reservadas */}
            <button
              onClick={() => setStatusFilter(statusFilter === 'reservada' ? 'all' : 'reservada')}
              className={`p-2 rounded-xl text-center transition-all cursor-pointer border ${
                statusFilter === 'reservada' 
                  ? 'bg-amber-100/90 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 font-bold shadow-xs' 
                  : 'bg-brand-surface-subtle border-brand-border text-brand-text-muted hover:bg-brand-surface'
              }`}
            >
              <span className="block text-base sm:text-lg font-bold leading-tight text-amber-800 dark:text-amber-300">
                {stats.reservadas}
              </span>
              <span className="text-[10px] sm:text-xs">Reservadas</span>
            </button>

            {/* Vendidas */}
            <button
              onClick={() => setStatusFilter(statusFilter === 'vendida' ? 'all' : 'vendida')}
              className={`p-2 rounded-xl text-center transition-all cursor-pointer border ${
                statusFilter === 'vendida' 
                  ? 'bg-brand-nude-light border-brand-nude text-brand-nude-text font-bold shadow-xs' 
                  : 'bg-brand-surface-subtle border-brand-border text-brand-text-muted hover:bg-brand-surface'
              }`}
            >
              <span className="block text-base sm:text-lg font-bold leading-tight text-brand-nude-text dark:text-brand-nude">
                {stats.vendidas}
              </span>
              <span className="text-[10px] sm:text-xs">Vendidas</span>
            </button>
          </div>
        </div>

        {/* BARRA DE BUSCA & FILTRO POR BANCADA */}
        <div className="space-y-2">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-text-light" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar planta por nome ou código (ex: TF-001)..."
              className="w-full pl-10 pr-9 py-2.5 bg-brand-surface rounded-xl border border-brand-border shadow-xs text-xs sm:text-sm text-brand-text placeholder-brand-text-light focus:outline-none focus:border-brand-olive transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-brand-text-light hover:text-brand-text"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filtro Rápido de Bancada (Scroll Horizontal) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 hide-scrollbar text-xs">
            <span className="text-brand-text-light font-medium px-1 shrink-0 flex items-center gap-1">
              <MapPin className="w-3 h-3" /> Setor:
            </span>
            <button
              onClick={() => setSelectedLocationFilter('all')}
              className={`px-3 py-1.5 rounded-lg shrink-0 font-medium transition-all cursor-pointer border ${
                selectedLocationFilter === 'all'
                  ? 'bg-brand-olive text-white border-transparent shadow-xs font-bold'
                  : 'bg-brand-surface text-brand-text-muted border-brand-border hover:bg-brand-surface-subtle'
              }`}
            >
              Todas ({plants.length})
            </button>
            {locations.map((loc) => {
              const count = plants.filter(p => p.location === loc).length;
              return (
                <button
                  key={loc}
                  onClick={() => setSelectedLocationFilter(selectedLocationFilter === loc ? 'all' : loc)}
                  className={`px-3 py-1.5 rounded-lg shrink-0 font-medium transition-all cursor-pointer border ${
                    selectedLocationFilter === loc
                      ? 'bg-brand-olive text-white border-transparent font-bold shadow-xs'
                      : 'bg-brand-surface text-brand-text-muted border-brand-border hover:bg-brand-surface-subtle'
                  }`}
                >
                  {loc} <span className="opacity-70 text-[10px]">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* LISTAGEM DE VASOS */}
        {filteredPlants.length === 0 ? (
          <div className="bg-brand-surface p-8 rounded-2xl text-center border border-brand-border shadow-xs space-y-2.5">
            <p className="text-sm font-semibold text-brand-text">
              Nenhuma planta encontrada
            </p>
            <p className="text-xs text-brand-text-muted max-w-xs mx-auto">
              Verifique os termos da busca ou limpe os filtros de status e bancada.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedLocationFilter('all');
                setStatusFilter('all');
              }}
              className="px-3.5 py-1.5 bg-brand-olive text-white text-xs font-semibold rounded-lg hover:bg-brand-olive-hover transition-colors"
            >
              Ver Todas as Plantas
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredPlants.map((plant) => {
              const isAvailable = plant.status === 'disponivel';
              const isReserved = plant.status === 'reservada';
              const isSold = plant.status === 'vendida';
              const isHighlighted = highlightedPlantId === plant.id;

              return (
                <div
                  key={plant.id}
                  id={`plant-card-${plant.id}`}
                  className={`bg-brand-surface p-3.5 rounded-2xl border transition-all shadow-xs ${
                    isHighlighted
                      ? 'ring-2 ring-brand-olive border-brand-olive bg-brand-olive-light/20'
                      : isSold 
                      ? 'opacity-65 border-brand-border-subtle bg-brand-surface-subtle' 
                      : isReserved
                      ? 'border-amber-300/60 dark:border-amber-800/40 bg-amber-50/30 dark:bg-amber-950/20'
                      : 'border-brand-border hover:border-brand-olive/50'
                  }`}
                >
                  {/* Topo do Card: Foto + Detalhes */}
                  <div className="flex items-start gap-3">
                    {/* Foto da Planta com Badge do ID */}
                    <div className="relative w-18 h-18 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-brand-surface-subtle border border-brand-border shrink-0">
                      <img
                        src={plant.imageUrl || 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=400&q=80'}
                        alt={plant.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <span className="absolute bottom-1 right-1 bg-black/75 text-white text-[9px] px-1 py-0.2 rounded font-mono font-bold">
                        #{plant.id}
                      </span>
                    </div>

                    {/* Informações da Planta */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className="text-[10px] font-bold text-brand-olive uppercase tracking-wider block truncate">
                            {plant.category || 'Geral'}
                          </span>
                          <h3 className="text-sm sm:text-base font-bold text-brand-text font-serif-title leading-tight truncate mt-0.5">
                            {plant.name}
                          </h3>
                          {plant.scientificName && (
                            <p className="text-[11px] text-brand-text-muted italic truncate">
                              {plant.scientificName}
                            </p>
                          )}
                        </div>

                        {/* Botão de Preço com Toque Direto */}
                        <button
                          onClick={() => openPriceModal(plant)}
                          title="Toque para alterar o preço"
                          className="px-2.5 py-1.5 bg-brand-olive-light hover:bg-brand-olive-border/40 border border-brand-olive-border text-brand-olive-text rounded-xl flex items-center gap-1 shadow-xs transition-transform active:scale-95 cursor-pointer shrink-0"
                        >
                          <span className="text-[10px] font-semibold opacity-75">R$</span>
                          <span className="text-sm sm:text-base font-bold font-sans">
                            {plant.price ? plant.price.toFixed(2).replace('.', ',') : '0,00'}
                          </span>
                          <Tag className="w-3 h-3 opacity-60 ml-0.5" />
                        </button>
                      </div>

                      {/* Botão de Bancada / Localização */}
                      <div className="mt-2">
                        <button
                          onClick={() => setLocationModalPlant(plant)}
                          className="w-full text-left flex items-center justify-between px-2.5 py-1.5 bg-brand-surface-subtle hover:bg-brand-border-subtle text-brand-text rounded-lg border border-brand-border text-xs transition-colors cursor-pointer active:scale-[0.99]"
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <MapPin className="w-3 h-3 text-brand-olive shrink-0" />
                            <span className="font-medium truncate text-[11px]">
                              {plant.location || 'Sem bancada definida'}
                            </span>
                          </div>
                          <span className="text-[10px] font-semibold text-brand-olive shrink-0 ml-1">
                            Mudar ▾
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Barra de Status de 1 Toque (Disponível, Reservada, Vendida) */}
                  <div className="grid grid-cols-3 gap-1.5 mt-2.5 pt-2.5 border-t border-brand-border-subtle">
                    {/* Disponível */}
                    <button
                      onClick={() => handleStatusChange(plant, 'disponivel')}
                      className={`py-2 px-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer active:scale-95 border ${
                        isAvailable
                          ? 'bg-brand-olive text-white border-brand-olive shadow-xs font-bold'
                          : 'bg-brand-surface-subtle text-brand-text-muted border-brand-border hover:bg-brand-olive-light hover:text-brand-olive-text'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Disponível</span>
                    </button>

                    {/* Reservada */}
                    <button
                      onClick={() => handleStatusChange(plant, 'reservada')}
                      className={`py-2 px-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer active:scale-95 border ${
                        isReserved
                          ? 'bg-amber-100/95 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-800 shadow-xs font-bold'
                          : 'bg-brand-surface-subtle text-brand-text-muted border-brand-border hover:bg-amber-50 dark:hover:bg-amber-950/30'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>Reservar</span>
                    </button>

                    {/* Vendida */}
                    <button
                      onClick={() => handleStatusChange(plant, 'vendida')}
                      className={`py-2 px-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all cursor-pointer active:scale-95 border ${
                        isSold
                          ? 'bg-brand-nude text-white border-brand-nude shadow-xs font-bold'
                          : 'bg-brand-surface-subtle text-brand-text-muted border-brand-border hover:bg-brand-nude-light'
                      }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Vendido</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* ======================================================== */}
      {/* MODAL SCANNER DE CÂMERA (LEITOR DE QR CODE)             */}
      {/* ======================================================== */}
      {isQrScannerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-brand-surface rounded-2xl border border-brand-border p-4 sm:p-5 shadow-2xl space-y-3.5 animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between pb-2.5 border-b border-brand-border">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-brand-olive" />
                <h3 className="text-sm font-bold text-brand-text font-serif-title">
                  Apontar para o Vaso
                </h3>
              </div>
              <button
                onClick={() => setIsQrScannerOpen(false)}
                className="p-1.5 rounded-lg text-brand-text-muted hover:text-brand-text hover:bg-brand-surface-subtle"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-brand-text-muted text-center">
              Aponte a câmera para a etiqueta com QR Code no vaso da planta:
            </p>

            {/* Container do Visor de Câmera */}
            <div className="relative rounded-xl overflow-hidden bg-black aspect-square flex items-center justify-center border border-brand-border">
              <div id="qr-camera-reader" className="w-full h-full"></div>
              
              {!isCameraActive && !scannerError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-stone-300 gap-2 bg-black/60">
                  <div className="w-6 h-6 border-2 border-brand-olive border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-medium">Iniciando câmera...</span>
                </div>
              )}

              {scannerError && (
                <div className="absolute inset-0 p-4 flex flex-col items-center justify-center text-center text-white bg-black/80 gap-2">
                  <AlertCircle className="w-6 h-6 text-brand-nude" />
                  <p className="text-xs leading-relaxed text-stone-300">{scannerError}</p>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsQrScannerOpen(false)}
              className="w-full py-2.5 bg-brand-surface-subtle hover:bg-brand-border-subtle text-brand-text text-xs font-semibold rounded-xl transition-colors cursor-pointer border border-brand-border"
            >
              Fechar Câmera
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: ALTERAÇÃO RÁPIDA DE PREÇO                        */}
      {/* ======================================================== */}
      {priceModalPlant && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-brand-surface rounded-t-2xl sm:rounded-2xl p-5 border border-brand-border shadow-2xl space-y-4 animate-in slide-in-from-bottom-6 duration-300">
            
            <div className="flex items-center justify-between pb-2.5 border-b border-brand-border">
              <div>
                <span className="text-[10px] font-bold text-brand-olive uppercase tracking-wider">
                  Alterar Preço
                </span>
                <h3 className="text-base font-bold text-brand-text font-serif-title truncate">
                  {priceModalPlant.name}
                </h3>
              </div>
              <button
                onClick={() => setPriceModalPlant(null)}
                className="p-1.5 rounded-lg text-brand-text-muted hover:text-brand-text hover:bg-brand-surface-subtle"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Entrada de Preço */}
            <div className="text-center py-1">
              <label className="block text-xs text-brand-text-muted mb-1">
                Novo valor do vaso (R$):
              </label>
              <div className="relative inline-flex items-center justify-center">
                <span className="text-xl sm:text-2xl font-bold text-brand-olive mr-1.5">R$</span>
                <input
                  type="number"
                  step="0.50"
                  inputMode="decimal"
                  value={tempPrice}
                  onChange={(e) => setTempPrice(e.target.value)}
                  className="w-40 text-2xl sm:text-3xl font-extrabold text-brand-text bg-brand-surface-subtle border border-brand-border rounded-xl py-1.5 px-3 text-center focus:outline-none focus:border-brand-olive"
                  autoFocus
                />
              </div>
            </div>

            {/* Atalhos Rápidos (+5, +10, -5) */}
            <div className="grid grid-cols-4 gap-1.5">
              <button
                onClick={() => adjustPrice(-5)}
                className="py-1.5 bg-brand-surface-subtle hover:bg-brand-border-subtle text-brand-text font-medium rounded-lg text-xs border border-brand-border active:scale-95"
              >
                - R$ 5
              </button>
              <button
                onClick={() => adjustPrice(5)}
                className="py-1.5 bg-brand-surface-subtle hover:bg-brand-border-subtle text-brand-text font-medium rounded-lg text-xs border border-brand-border active:scale-95"
              >
                + R$ 5
              </button>
              <button
                onClick={() => adjustPrice(10)}
                className="py-1.5 bg-brand-surface-subtle hover:bg-brand-border-subtle text-brand-text font-medium rounded-lg text-xs border border-brand-border active:scale-95"
              >
                + R$ 10
              </button>
              <button
                onClick={() => adjustPrice(20)}
                className="py-1.5 bg-brand-surface-subtle hover:bg-brand-border-subtle text-brand-text font-medium rounded-lg text-xs border border-brand-border active:scale-95"
              >
                + R$ 20
              </button>
            </div>

            {/* Botão de Salvar */}
            <button
              onClick={handleSavePrice}
              className="w-full py-3 bg-brand-olive hover:bg-brand-olive-hover active:scale-98 text-white text-sm font-semibold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Check className="w-4 h-4" />
              <span>Salvar Novo Preço</span>
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL: MUDANÇA DE BANCADA / LOCALIZAÇÃO                 */}
      {/* ======================================================== */}
      {locationModalPlant && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm max-h-[85vh] bg-brand-surface rounded-t-2xl sm:rounded-2xl p-5 border border-brand-border shadow-2xl flex flex-col space-y-3 animate-in slide-in-from-bottom-6 duration-300">
            
            <div className="flex items-center justify-between pb-2.5 border-b border-brand-border shrink-0">
              <div>
                <span className="text-[10px] font-bold text-brand-olive uppercase tracking-wider">
                  Mover de Bancada
                </span>
                <h3 className="text-base font-bold text-brand-text font-serif-title truncate">
                  {locationModalPlant.name}
                </h3>
              </div>
              <button
                onClick={() => setLocationModalPlant(null)}
                className="p-1.5 rounded-lg text-brand-text-muted hover:text-brand-text hover:bg-brand-surface-subtle"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-brand-text-muted shrink-0">
              Escolha a bancada onde este vaso foi colocado:
            </p>

            {/* Lista de Bancadas da Loja */}
            <div className="space-y-1.5 overflow-y-auto max-h-[48vh] pr-1">
              {locations.map((loc) => {
                const isCurrent = locationModalPlant.location === loc;
                return (
                  <button
                    key={loc}
                    onClick={() => handleSaveLocation(loc)}
                    className={`w-full p-2.5 rounded-xl flex items-center justify-between text-left transition-all cursor-pointer border text-xs ${
                      isCurrent
                        ? 'bg-brand-olive-light border-brand-olive text-brand-olive-text font-bold shadow-xs'
                        : 'bg-brand-surface-subtle border-brand-border text-brand-text hover:bg-brand-border-subtle'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <MapPin className={`w-3.5 h-3.5 shrink-0 ${isCurrent ? 'text-brand-olive' : 'text-brand-text-muted'}`} />
                      <span className="truncate">{loc}</span>
                    </div>
                    {isCurrent && <Check className="w-3.5 h-3.5 text-brand-olive shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setLocationModalPlant(null)}
              className="w-full py-2.5 bg-brand-surface-subtle hover:bg-brand-border-subtle text-brand-text text-xs font-semibold rounded-xl transition-colors shrink-0 border border-brand-border"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
