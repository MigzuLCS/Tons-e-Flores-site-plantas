import React, { useState, useMemo } from 'react';
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
  Sparkles
} from 'lucide-react';
import type { Plant, PlantStatus } from '../types/plant';
import { configService } from '../services/configService';

interface QuickManageViewProps {
  plants: Plant[];
  isLoading?: boolean;
  onUpdatePlant: (plant: Plant) => Promise<void> | void;
  onRefresh: () => void;
}

export const QuickManageView: React.FC<QuickManageViewProps> = ({
  plants,
  isLoading = false,
  onUpdatePlant,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocationFilter, setSelectedLocationFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Modais de Edição Rápida
  const [priceModalPlant, setPriceModalPlant] = useState<Plant | null>(null);
  const [tempPrice, setTempPrice] = useState<string>('');

  const [locationModalPlant, setLocationModalPlant] = useState<Plant | null>(null);

  // Notificação Toast Visual
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' } | null>(null);

  const showToast = (text: string, type: 'success' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
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
      disponivel: 'Disponível na Loja 🟢',
      reservada: 'Reservada 🟡',
      vendida: 'Vendida / Baixa no Estoque 🔴'
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
    showToast(`Preço de "${priceModalPlant.name}" atualizado para R$ ${parsedPrice.toFixed(2).replace('.', ',')}! 💰`);
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
    showToast(`"${locationModalPlant.name}" movida para: ${newLocation} 📍`);
    setLocationModalPlant(null);
  };

  return (
    <div className="min-h-screen bg-[#FBF9F5] dark:bg-[#12100F] text-stone-900 dark:text-stone-100 pb-28 pt-4 sm:pt-6 transition-colors font-sans">
      
      {/* Toast Notificação Flutuante */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-5 py-3.5 bg-stone-900/95 dark:bg-stone-100/95 text-white dark:text-stone-900 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-3 border border-stone-700/30 text-sm sm:text-base font-bold animate-in fade-in slide-in-from-top-4 duration-300">
          <Sparkles className="w-5 h-5 text-emerald-400 dark:text-emerald-600 shrink-0" />
          <span>{toastMessage.text}</span>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-3.5 sm:px-6 space-y-4">
        
        {/* Cabeçalho da Tela com Instrução Clara */}
        <div className="bg-white dark:bg-[#1A1615] p-4 sm:p-5 rounded-3xl border border-stone-200/80 dark:border-[#2F2926] shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                <h1 className="text-xl sm:text-2xl font-bold font-serif-title text-stone-800 dark:text-stone-100">
                  Manejo Rápido da Loja
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-stone-500 dark:text-stone-400 mt-1">
                Toque nos botões para alterar <strong className="text-emerald-700 dark:text-emerald-400">preços</strong>, mudar a <strong className="text-emerald-700 dark:text-emerald-400">bancada</strong> ou marcar como <strong className="text-emerald-700 dark:text-emerald-400">vendida</strong>.
              </p>
            </div>

            <button
              onClick={onRefresh}
              disabled={isLoading}
              title="Atualizar dados do banco"
              className="p-3 rounded-2xl bg-stone-100 dark:bg-[#251F1D] text-stone-700 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-[#2F2825] border border-stone-200 dark:border-[#352D29] transition-all cursor-pointer shrink-0 active:scale-95 disabled:opacity-50"
            >
              <RotateCcw className={`w-5 h-5 ${isLoading ? 'animate-spin text-emerald-500' : ''}`} />
            </button>
          </div>

          {/* Cards de Resumo Rápido */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 mt-4 pt-3.5 border-t border-stone-100 dark:border-[#26201D]">
            <button
              onClick={() => setStatusFilter(statusFilter === 'disponivel' ? 'all' : 'disponivel')}
              className={`p-2.5 sm:p-3 rounded-2xl text-center transition-all cursor-pointer border ${
                statusFilter === 'disponivel' 
                  ? 'bg-emerald-500/15 border-emerald-500 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/30' 
                  : 'bg-stone-50 dark:bg-[#221C1A] border-stone-200/60 dark:border-[#2F2724] text-stone-700 dark:text-stone-300'
              }`}
            >
              <span className="block text-base sm:text-xl font-bold leading-tight text-emerald-600 dark:text-emerald-400">
                {stats.disponiveis}
              </span>
              <span className="text-[11px] sm:text-xs font-semibold">Disponíveis</span>
            </button>

            <button
              onClick={() => setStatusFilter(statusFilter === 'reservada' ? 'all' : 'reservada')}
              className={`p-2.5 sm:p-3 rounded-2xl text-center transition-all cursor-pointer border ${
                statusFilter === 'reservada' 
                  ? 'bg-amber-500/15 border-amber-500 text-amber-700 dark:text-amber-300 ring-2 ring-amber-500/30' 
                  : 'bg-stone-50 dark:bg-[#221C1A] border-stone-200/60 dark:border-[#2F2724] text-stone-700 dark:text-stone-300'
              }`}
            >
              <span className="block text-base sm:text-xl font-bold leading-tight text-amber-600 dark:text-amber-400">
                {stats.reservadas}
              </span>
              <span className="text-[11px] sm:text-xs font-semibold">Reservadas</span>
            </button>

            <button
              onClick={() => setStatusFilter(statusFilter === 'vendida' ? 'all' : 'vendida')}
              className={`p-2.5 sm:p-3 rounded-2xl text-center transition-all cursor-pointer border ${
                statusFilter === 'vendida' 
                  ? 'bg-rose-500/15 border-rose-500 text-rose-700 dark:text-rose-300 ring-2 ring-rose-500/30' 
                  : 'bg-stone-50 dark:bg-[#221C1A] border-stone-200/60 dark:border-[#2F2724] text-stone-700 dark:text-stone-300'
              }`}
            >
              <span className="block text-base sm:text-xl font-bold leading-tight text-rose-600 dark:text-rose-400">
                {stats.vendidas}
              </span>
              <span className="text-[11px] sm:text-xs font-semibold">Vendidas</span>
            </button>
          </div>
        </div>

        {/* Barra de Busca Grande & Filtro por Bancada */}
        <div className="space-y-2.5">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-stone-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Digite o nome da planta ou código (ex: TF-001)..."
              className="w-full pl-12 pr-10 py-3.5 bg-white dark:bg-[#1A1615] rounded-2xl border border-stone-200/90 dark:border-[#2F2926] shadow-sm text-sm sm:text-base text-stone-900 dark:text-stone-100 placeholder-stone-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Filtro Rápido de Bancada (Scroll Horizontal Amigável) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 no-scrollbar text-xs">
            <span className="text-stone-400 font-semibold px-1 shrink-0 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" /> Bancada:
            </span>
            <button
              onClick={() => setSelectedLocationFilter('all')}
              className={`px-3 py-2 rounded-xl shrink-0 font-bold transition-all cursor-pointer border ${
                selectedLocationFilter === 'all'
                  ? 'bg-stone-800 dark:bg-stone-200 text-white dark:text-stone-900 border-transparent shadow-xs'
                  : 'bg-white dark:bg-[#1E1917] text-stone-600 dark:text-stone-300 border-stone-200 dark:border-[#2D2522]'
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
                  className={`px-3 py-2 rounded-xl shrink-0 font-medium transition-all cursor-pointer border ${
                    selectedLocationFilter === loc
                      ? 'bg-emerald-600 text-white border-transparent font-bold shadow-xs'
                      : 'bg-white dark:bg-[#1E1917] text-stone-700 dark:text-stone-300 border-stone-200 dark:border-[#2D2522]'
                  }`}
                >
                  {loc} <span className="opacity-70 text-[10px]">({count})</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* LISTAGEM DE PLANTAS COM TOQUE OTIMIZADO */}
        {filteredPlants.length === 0 ? (
          <div className="bg-white dark:bg-[#1A1615] p-10 rounded-3xl text-center border border-stone-200/70 dark:border-[#2F2926] shadow-sm space-y-3">
            <span className="text-4xl">🪴</span>
            <h3 className="text-base sm:text-lg font-bold text-stone-800 dark:text-stone-200">
              Nenhuma planta encontrada
            </h3>
            <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto">
              Tente limpar os filtros ou buscar por outro nome de planta ou código.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedLocationFilter('all');
                setStatusFilter('all');
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors"
            >
              Ver Todas as Plantas
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredPlants.map((plant) => {
              const isAvailable = plant.status === 'disponivel';
              const isReserved = plant.status === 'reservada';
              const isSold = plant.status === 'vendida';

              return (
                <div
                  key={plant.id}
                  className={`bg-white dark:bg-[#1A1615] p-3.5 sm:p-4 rounded-3xl border transition-all shadow-xs ${
                    isSold 
                      ? 'opacity-70 border-stone-200 dark:border-[#26201D] bg-stone-50/50 dark:bg-[#161211]' 
                      : isReserved
                      ? 'border-amber-400/60 dark:border-amber-500/40 bg-amber-50/20 dark:bg-amber-950/10'
                      : 'border-stone-200/90 dark:border-[#2F2926] hover:border-emerald-500/40'
                  }`}
                >
                  {/* Topo do Card: Foto + Informações Principais */}
                  <div className="flex items-start gap-3.5">
                    {/* Foto da Planta */}
                    <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-stone-100 dark:bg-[#241F1D] border border-stone-200/80 dark:border-[#352D29] shrink-0">
                      {plant.imageUrl ? (
                        <img
                          src={plant.imageUrl}
                          alt={plant.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-400 text-xl">
                          🌿
                        </div>
                      )}
                      <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] px-1.5 py-0.5 rounded-md font-mono font-bold">
                        {plant.id}
                      </span>
                    </div>

                    {/* Nome, Categoria e Preço */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-lg border border-emerald-200/40 dark:border-emerald-800/30">
                            {plant.category || 'Geral'}
                          </span>
                          <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-100 leading-snug mt-0.5 line-clamp-1">
                            {plant.name}
                          </h3>
                          {plant.scientificName && (
                            <p className="text-[11px] sm:text-xs text-stone-400 italic line-clamp-1">
                              {plant.scientificName}
                            </p>
                          )}
                        </div>

                        {/* Botão de Preço com Toque Fácil */}
                        <button
                          onClick={() => openPriceModal(plant)}
                          title="Toque para alterar o preço"
                          className="px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border-2 border-emerald-500/60 text-emerald-800 dark:text-emerald-300 rounded-2xl flex items-center gap-1.5 shadow-xs transition-transform active:scale-95 cursor-pointer shrink-0"
                        >
                          <span className="text-xs font-semibold opacity-80">R$</span>
                          <span className="text-base sm:text-lg font-extrabold font-mono">
                            {plant.price ? plant.price.toFixed(2).replace('.', ',') : '0,00'}
                          </span>
                          <Tag className="w-3.5 h-3.5 opacity-60 ml-0.5" />
                        </button>
                      </div>

                      {/* Botão de Bancada/Localização */}
                      <div className="mt-2">
                        <button
                          onClick={() => setLocationModalPlant(plant)}
                          className="w-full text-left flex items-center justify-between px-3 py-2 bg-stone-100/90 dark:bg-[#221C1A] hover:bg-stone-200/80 dark:hover:bg-[#2A2320] text-stone-800 dark:text-stone-200 rounded-xl border border-stone-200 dark:border-[#352C28] text-xs transition-colors cursor-pointer active:scale-[0.99]"
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span className="font-semibold truncate">
                              {plant.location || 'Sem bancada definida'}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100/60 dark:bg-emerald-950/80 px-2 py-0.5 rounded-md shrink-0 ml-1">
                            Mudar local ▾
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Barra de Status com 3 Botões Grandes de 1 Toque */}
                  <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-stone-100 dark:border-[#26201D]">
                    {/* Disponível */}
                    <button
                      onClick={() => handleStatusChange(plant, 'disponivel')}
                      className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                        isAvailable
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20 ring-2 ring-emerald-400'
                          : 'bg-stone-100 dark:bg-[#221C1A] text-stone-600 dark:text-stone-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30'
                      }`}
                    >
                      <CheckCircle2 className={`w-4 h-4 ${isAvailable ? 'text-white' : 'text-emerald-500'}`} />
                      <span>Disponível</span>
                    </button>

                    {/* Reservada */}
                    <button
                      onClick={() => handleStatusChange(plant, 'reservada')}
                      className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                        isReserved
                          ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20 ring-2 ring-amber-300'
                          : 'bg-stone-100 dark:bg-[#221C1A] text-stone-600 dark:text-stone-400 hover:bg-amber-50 dark:hover:bg-amber-950/30'
                      }`}
                    >
                      <Clock className={`w-4 h-4 ${isReserved ? 'text-white' : 'text-amber-500'}`} />
                      <span>Reservar</span>
                    </button>

                    {/* Vendida */}
                    <button
                      onClick={() => handleStatusChange(plant, 'vendida')}
                      className={`py-2.5 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-95 ${
                        isSold
                          ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20 ring-2 ring-rose-300'
                          : 'bg-stone-100 dark:bg-[#221C1A] text-stone-600 dark:text-stone-400 hover:bg-rose-50 dark:hover:bg-rose-950/30'
                      }`}
                    >
                      <ShoppingBag className={`w-4 h-4 ${isSold ? 'text-white' : 'text-rose-500'}`} />
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
      {/* MODAL 1: ALTERAÇÃO RÁPIDA DE PREÇO                      */}
      {/* ======================================================== */}
      {priceModalPlant && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white dark:bg-[#1A1615] rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 border border-stone-200 dark:border-[#2F2926] shadow-2xl space-y-4 animate-in slide-in-from-bottom-6 duration-300">
            
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-[#27211E]">
              <div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                  Alterar Preço
                </span>
                <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                  {priceModalPlant.name}
                </h3>
              </div>
              <button
                onClick={() => setPriceModalPlant(null)}
                className="p-2 rounded-xl bg-stone-100 dark:bg-[#251F1D] text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Campo de Entrada de Preço Grande */}
            <div className="text-center py-2">
              <label className="block text-xs font-semibold text-stone-400 mb-1.5">
                Digite o novo valor (R$):
              </label>
              <div className="relative inline-flex items-center justify-center">
                <span className="text-2xl sm:text-3xl font-bold text-emerald-600 mr-2">R$</span>
                <input
                  type="number"
                  step="0.50"
                  inputMode="decimal"
                  value={tempPrice}
                  onChange={(e) => setTempPrice(e.target.value)}
                  className="w-48 text-3xl sm:text-4xl font-extrabold text-stone-900 dark:text-stone-100 bg-stone-50 dark:bg-[#221C1A] border-2 border-emerald-500 rounded-2xl py-2 px-3 text-center focus:outline-none focus:ring-4 focus:ring-emerald-500/20"
                  autoFocus
                />
              </div>
            </div>

            {/* Botões de Atalho Rápido (+5, +10, -5, etc) */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              <button
                onClick={() => adjustPrice(-5)}
                className="py-2 bg-stone-100 dark:bg-[#251F1D] hover:bg-stone-200 text-stone-700 dark:text-stone-300 font-bold rounded-xl text-xs border border-stone-200 dark:border-[#352D29] active:scale-95"
              >
                - R$ 5
              </button>
              <button
                onClick={() => adjustPrice(5)}
                className="py-2 bg-stone-100 dark:bg-[#251F1D] hover:bg-stone-200 text-stone-700 dark:text-stone-300 font-bold rounded-xl text-xs border border-stone-200 dark:border-[#352D29] active:scale-95"
              >
                + R$ 5
              </button>
              <button
                onClick={() => adjustPrice(10)}
                className="py-2 bg-stone-100 dark:bg-[#251F1D] hover:bg-stone-200 text-stone-700 dark:text-stone-300 font-bold rounded-xl text-xs border border-stone-200 dark:border-[#352D29] active:scale-95"
              >
                + R$ 10
              </button>
              <button
                onClick={() => adjustPrice(20)}
                className="py-2 bg-stone-100 dark:bg-[#251F1D] hover:bg-stone-200 text-stone-700 dark:text-stone-300 font-bold rounded-xl text-xs border border-stone-200 dark:border-[#352D29] active:scale-95"
              >
                + R$ 20
              </button>
            </div>

            {/* Botão de Salvar Grande */}
            <button
              onClick={handleSavePrice}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white text-base font-bold rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Check className="w-5 h-5" />
              <span>Salvar Novo Preço</span>
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: MUDANÇA DE BANCADA COM 1 TOQUE                 */}
      {/* ======================================================== */}
      {locationModalPlant && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md max-h-[85vh] bg-white dark:bg-[#1A1615] rounded-t-3xl sm:rounded-3xl p-5 sm:p-6 border border-stone-200 dark:border-[#2F2926] shadow-2xl flex flex-col space-y-3 animate-in slide-in-from-bottom-6 duration-300">
            
            <div className="flex items-center justify-between pb-3 border-b border-stone-100 dark:border-[#27211E] shrink-0">
              <div>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide">
                  Onde está a planta?
                </span>
                <h3 className="text-lg font-bold text-stone-900 dark:text-stone-100">
                  {locationModalPlant.name}
                </h3>
              </div>
              <button
                onClick={() => setLocationModalPlant(null)}
                className="p-2 rounded-xl bg-stone-100 dark:bg-[#251F1D] text-stone-400 hover:text-stone-700 dark:hover:text-stone-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-stone-500 dark:text-stone-400 shrink-0">
              Toque na bancada para onde você moveu este vaso:
            </p>

            {/* Lista de Bancadas da Loja */}
            <div className="space-y-2 overflow-y-auto max-h-[50vh] pr-1">
              {locations.map((loc) => {
                const isCurrent = locationModalPlant.location === loc;
                return (
                  <button
                    key={loc}
                    onClick={() => handleSaveLocation(loc)}
                    className={`w-full p-3.5 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer border ${
                      isCurrent
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-800 dark:text-emerald-200 font-bold ring-2 ring-emerald-500/20'
                        : 'bg-stone-50 dark:bg-[#221C1A] border-stone-200/80 dark:border-[#2E2522] text-stone-800 dark:text-stone-200 hover:bg-stone-100 dark:hover:bg-[#2A2320]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <MapPin className={`w-4 h-4 ${isCurrent ? 'text-emerald-600' : 'text-stone-400'}`} />
                      <span className="text-sm">{loc}</span>
                    </div>
                    {isCurrent && <Check className="w-4 h-4 text-emerald-600" />}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setLocationModalPlant(null)}
              className="w-full py-3 bg-stone-100 dark:bg-[#251F1D] text-stone-700 dark:text-stone-300 text-xs font-bold rounded-2xl transition-colors shrink-0"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
