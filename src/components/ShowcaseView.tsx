import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Flower2, 
  Sprout, 
  Sun, 
  CloudSun, 
  Cloud,
  Heart, 
  Droplets, 
  Droplet,
  SlidersHorizontal, 
  RotateCcw, 
  LayoutGrid, 
  Check, 
  X, 
  Layers, 
  ChevronRight,
  Sparkles,
  MapPin
} from 'lucide-react';
import type { Plant } from '../types/plant';
import { PlantCard } from './PlantCard';
import { configService } from '../services/configService';

interface ShowcaseViewProps {
  plants: Plant[];
  onSelectPlant: (plant: Plant) => void;
  activeLocationFilter?: string | null;
  onClearLocationFilter?: () => void;
}

export const ShowcaseView: React.FC<ShowcaseViewProps> = ({ 
  plants, 
  onSelectPlant, 
  activeLocationFilter, 
  onClearLocationFilter 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>(activeLocationFilter || 'all');
  const [selectedLight, setSelectedLight] = useState<string>('all');
  const [selectedWater, setSelectedWater] = useState<string>('all');
  const [petFriendlyOnly, setPetFriendlyOnly] = useState<boolean>(false);
  
  // Modais
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [locationSearchQuery, setLocationSearchQuery] = useState('');
  const [isCareModalOpen, setIsCareModalOpen] = useState(false);

  // Sincroniza quando activeLocationFilter mudar externamente (ex: leitura de QR code)
  useEffect(() => {
    if (activeLocationFilter) {
      setSelectedLocation(activeLocationFilter);
    }
  }, [activeLocationFilter]);

  // Carrega todas as localizações/bancadas cadastradas na loja dinamicamente
  const allLocations = useMemo(() => {
    const configuredLocs = configService.getLocations();
    const plantLocs = plants.map(p => p.location).filter(Boolean);
    const merged = Array.from(new Set([...configuredLocs, ...plantLocs]));
    return merged.sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [plants]);

  // Contagem de vasos por localização
  const locationCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: plants.filter(p => p.status !== 'vendida').length
    };
    for (const p of plants) {
      if (p.status !== 'vendida' && p.location) {
        counts[p.location] = (counts[p.location] || 0) + 1;
      }
    }
    return counts;
  }, [plants]);

  // Carrega todas as categorias cadastradas na loja dinamicamente
  const allCategories = useMemo(() => {
    const configuredCats = configService.getCategories();
    const plantCats = plants.map(p => p.category).filter(Boolean);
    const merged = Array.from(new Set([...configuredCats, ...plantCats]));
    return merged.sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [plants]);

  // Contagem de vasos por categoria (apenas vasos disponíveis e reservados visíveis na vitrine)
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: plants.filter(p => p.status !== 'vendida').length
    };
    for (const p of plants) {
      if (p.status !== 'vendida' && p.category) {
        counts[p.category] = (counts[p.category] || 0) + 1;
      }
    }
    return counts;
  }, [plants]);

  // Contagem dinâmica por tipos de cuidados (plantas não vendidas)
  const careCounts = useMemo(() => {
    const visible = plants.filter(p => p.status !== 'vendida');
    return {
      solPleno: visible.filter(p => p.light === 'sol-pleno').length,
      meiaSombra: visible.filter(p => p.light === 'meia-sombra').length,
      sombraDifusa: visible.filter(p => p.light === 'sombra-difusa').length,
      poucaRega: visible.filter(p => p.watering === 'baixa').length,
      regaModerada: visible.filter(p => p.watering === 'moderada').length,
      regaFrequente: visible.filter(p => p.watering === 'frequente').length,
      petFriendly: visible.filter(p => p.petFriendly).length,
    };
  }, [plants]);

  // Quantidade de filtros de cuidados ativos no momento
  const activeCareFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedLight !== 'all') count++;
    if (selectedWater !== 'all') count++;
    if (petFriendlyOnly) count++;
    return count;
  }, [selectedLight, selectedWater, petFriendlyOnly]);

  // Localizações filtradas dentro do modal de seleção
  const filteredModalLocations = useMemo(() => {
    if (!locationSearchQuery.trim()) return allLocations;
    const q = locationSearchQuery.toLowerCase();
    return allLocations.filter(loc => loc.toLowerCase().includes(q));
  }, [allLocations, locationSearchQuery]);

  // Categorias filtradas dentro do modal de seleção
  const filteredModalCategories = useMemo(() => {
    if (!categorySearchQuery.trim()) return allCategories;
    const q = categorySearchQuery.toLowerCase();
    return allCategories.filter(cat => cat.toLowerCase().includes(q));
  }, [allCategories, categorySearchQuery]);

  // Filtro inteligente da Vitrine Pública:
  // 1. Oculta plantas com status 'vendida'
  // 2. Ordena: 'disponivel' primeiro, e 'reservada' sempre abaixo
  const filteredAndSortedPlants = useMemo(() => {
    const visiblePlants = plants.filter(plant => {
      // Regra 1: Plantas vendidas NUNCA aparecem na vitrine pública
      if (plant.status === 'vendida') return false;

      // Busca textual
      const matchesSearch =
        searchTerm === '' ||
        plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plant.scientificName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plant.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plant.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plant.id.toLowerCase().includes(searchTerm.toLowerCase());

      // Categoria
      const matchesCategory = selectedCategory === 'all' || plant.category === selectedCategory;

      // Localização / Bancada
      const matchesLocation = selectedLocation === 'all' || plant.location === selectedLocation;

      // Luz
      const matchesLight = selectedLight === 'all' || plant.light === selectedLight;

      // Rega
      const matchesWater = selectedWater === 'all' || plant.watering === selectedWater;

      // Pets
      const matchesPets = !petFriendlyOnly || plant.petFriendly;

      return matchesSearch && matchesCategory && matchesLocation && matchesLight && matchesWater && matchesPets;
    });

    // Regra 2: Ordenação - Disponíveis no topo, Reservadas abaixo
    return visiblePlants.sort((a, b) => {
      if (a.status === 'disponivel' && b.status === 'reservada') return -1;
      if (a.status === 'reservada' && b.status === 'disponivel') return 1;
      return 0;
    });
  }, [plants, searchTerm, selectedCategory, selectedLocation, selectedLight, selectedWater, petFriendlyOnly]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedLocation('all');
    setSelectedLight('all');
    setSelectedWater('all');
    setPetFriendlyOnly(false);
    if (onClearLocationFilter) {
      onClearLocationFilter();
    }
  };

  const handleClearLocation = () => {
    setSelectedLocation('all');
    if (onClearLocationFilter) {
      onClearLocationFilter();
    }
  };

  const handleResetCareFilters = () => {
    setSelectedLight('all');
    setSelectedWater('all');
    setPetFriendlyOnly(false);
  };

  const hasActiveFilters =
    searchTerm !== '' ||
    selectedCategory !== 'all' ||
    selectedLocation !== 'all' ||
    selectedLight !== 'all' ||
    selectedWater !== 'all' ||
    petFriendlyOnly;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-in fade-in duration-300">
      
      {/* Banner de Boas-Vindas da Bancada (Exibido ao ler o QR Code da Bancada) */}
      {selectedLocation !== 'all' && (
        <div className="bg-brand-olive-light border-2 border-brand-olive rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in slide-in-from-top-2 duration-300">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-brand-olive text-white flex items-center justify-center shrink-0 shadow-xs text-xl">
              📍
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-brand-olive text-white">
                  Bancada Física
                </span>
                <span className="text-xs text-brand-olive-text font-bold">
                  Tons & Flores
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold font-serif-title text-brand-olive-text mt-0.5">
                {selectedLocation}
              </h2>
              {configService.getLocationDescription(selectedLocation) && (
                <p className="text-xs text-brand-olive-text/80 italic mt-0.5">
                  {configService.getLocationDescription(selectedLocation)}
                </p>
              )}
              <p className="text-xs text-brand-text-muted mt-0.5">
                Exibindo <strong>{locationCounts[selectedLocation] || 0}</strong> vasos disponíveis nesta bancada.
              </p>
            </div>
          </div>

          <button
            onClick={handleClearLocation}
            className="self-start sm:self-center px-4 py-2.5 bg-white hover:bg-brand-surface border border-brand-olive-border text-brand-olive-text font-bold text-xs rounded-xl shadow-xs transition-all hover:shadow cursor-pointer flex items-center gap-2 shrink-0"
          >
            <span>✕ Ver Todas as Bancadas da Loja</span>
          </button>
        </div>
      )}

      {/* Banner Principal / Hero (Oculto se uma bancada específica estiver em foco para priorizar espaço no mobile) */}
      {selectedLocation === 'all' && (
        <div className="relative bg-brand-olive-light/60 dark:bg-brand-surface rounded-3xl p-6 sm:p-10 text-brand-text overflow-hidden shadow-xs border border-brand-olive-border/70 dark:border-brand-border">
          <div className="relative z-10 max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 bg-brand-surface/90 dark:bg-brand-surface-subtle rounded-full text-xs font-semibold text-brand-olive-text border border-brand-olive-border shadow-xs">
              <Flower2 className="w-3.5 h-3.5 text-brand-olive" />
              Tons & Flores • Boutique de Plantas
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif-title leading-tight text-brand-text m-0">
              Encontre a planta perfeita para o seu espaço.
            </h1>
            <p className="text-xs sm:text-sm text-brand-text-muted leading-relaxed max-w-xl">
              Explore nossas espécies exclusivas, conheça as necessidades de rega e luz de cada vaso e transforme seu ambiente!
            </p>
          </div>

          {/* Efeito decorativo botanical */}
          <div className="absolute -right-8 -bottom-10 opacity-15 dark:opacity-10 pointer-events-none text-brand-olive">
            <Sprout className="w-72 h-72" />
          </div>
        </div>
      )}

      {/* Caixa de Busca e Filtros Rápidos */}
      <div className="bg-brand-surface p-5 rounded-2xl border border-brand-border shadow-xs space-y-4">
        
        {/* Campo de Busca */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-3.5 text-brand-text-light" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={selectedLocation !== 'all' ? `Pesquisar em "${selectedLocation}"...` : "Pesquisar por nome popular, científico, tag #TF ou categoria..."} 
            className="w-full pl-12 pr-10 py-3 text-sm bg-brand-surface-subtle border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-olive focus:border-brand-olive font-medium transition-all text-brand-text placeholder:text-brand-text-light"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-3 text-xs text-brand-text-muted hover:text-brand-text bg-brand-border hover:bg-brand-border-subtle w-5 h-5 rounded-full flex items-center justify-center font-bold cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Barra de Seleção e Filtro de Localização / Bancadas */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 pt-1">
          {/* Botão Geral de Bancadas */}
          <button 
            onClick={() => setIsLocationModalOpen(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs shrink-0 ${
              selectedLocation !== 'all' 
                ? 'bg-brand-olive text-white shadow-xs hover:bg-brand-olive-hover' 
                : 'bg-brand-surface-subtle text-brand-text border border-brand-border hover:bg-brand-olive-light'
            }`}
            title="Abrir mapa de bancadas e setores"
          >
            <MapPin className="w-4 h-4 text-brand-olive shrink-0" />
            <span>Bancadas</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              selectedLocation !== 'all' 
                ? 'bg-white/20 text-white' 
                : 'bg-brand-olive-light text-brand-olive-text border border-brand-olive-border'
            }`}>
              {allLocations.length}
            </span>
            <ChevronRight className="w-3.5 h-3.5 opacity-70 ml-0.5" />
          </button>

          {/* Chips Rápidos de Bancadas */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar flex-1">
            <button 
              onClick={() => setSelectedLocation('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                selectedLocation === 'all' 
                  ? 'bg-brand-olive text-white shadow-xs font-bold' 
                  : 'bg-brand-surface-subtle border border-brand-border text-brand-text hover:bg-brand-olive-light'
              }`}
            >
              Todas as Bancadas ({locationCounts.all || 0})
            </button>

            {/* Se houver uma bancada ativa, mostra chip de destaque com botão de remoção */}
            {selectedLocation !== 'all' && (
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-olive text-white rounded-full text-xs font-semibold shadow-xs shrink-0 animate-in fade-in">
                <span>📍 {selectedLocation}</span>
                <span className="text-white/80 text-[10px]">({locationCounts[selectedLocation] || 0})</span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearLocation();
                  }}
                  title="Remover filtro de bancada"
                  className="ml-1 w-4 h-4 bg-white/20 hover:bg-white/40 rounded-full inline-flex items-center justify-center text-[10px] cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Primeiras bancadas para acesso rápido */}
            {allLocations.slice(0, 4).map((loc) => {
              if (loc === selectedLocation) return null;
              return (
                <button 
                  key={loc}
                  onClick={() => setSelectedLocation(loc)}
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 bg-brand-surface-subtle border border-brand-border text-brand-text hover:bg-brand-olive-light transition-all cursor-pointer"
                >
                  {loc} {locationCounts[loc] !== undefined && `(${locationCounts[loc]})`}
                </button>
              );
            })}

            {/* Botão Ver Todas as Bancadas */}
            {allLocations.length > 4 && (
              <button 
                onClick={() => setIsLocationModalOpen(true)}
                className="px-3 py-1.5 rounded-full text-xs font-bold shrink-0 text-brand-olive bg-brand-olive-light hover:bg-brand-olive-border/40 border border-dashed border-brand-olive-border transition-all cursor-pointer"
              >
                + Ver Todas ({allLocations.length})
              </button>
            )}
          </div>
        </div>

        {/* Barra de Seleção e Filtro de Categorias */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 pt-2 border-t border-brand-border">
          {/* Botão Geral de Categorias */}
          <button 
            onClick={() => setIsCategoryModalOpen(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs shrink-0 ${
              selectedCategory !== 'all' 
                ? 'bg-brand-olive text-white shadow-xs hover:bg-brand-olive-hover' 
                : 'bg-brand-surface-subtle text-brand-text border border-brand-border hover:bg-brand-olive-light'
            }`}
            title="Abrir catálogo completo de categorias"
          >
            <LayoutGrid className="w-4 h-4 text-brand-olive shrink-0" />
            <span>Categorias</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
              selectedCategory !== 'all' 
                ? 'bg-white/20 text-white' 
                : 'bg-brand-olive-light text-brand-olive-text border border-brand-olive-border'
            }`}>
              {allCategories.length}
            </span>
            <ChevronRight className="w-3.5 h-3.5 opacity-70 ml-0.5" />
          </button>

          {/* Chips Rápidos de Categorias */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar flex-1">
            <button 
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                selectedCategory === 'all' 
                  ? 'bg-brand-olive text-white shadow-xs font-bold' 
                  : 'bg-brand-surface-subtle border border-brand-border text-brand-text hover:bg-brand-olive-light'
              }`}
            >
              Todas ({categoryCounts.all || 0})
            </button>

            {/* Se houver uma categoria ativa que não está nas primeiras, mostra chip de destaque com botão de remoção */}
            {selectedCategory !== 'all' && (
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-brand-olive text-white rounded-full text-xs font-semibold shadow-xs shrink-0 animate-in fade-in">
                <span>{selectedCategory}</span>
                <span className="text-white/80 text-[10px]">({categoryCounts[selectedCategory] || 0})</span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedCategory('all');
                  }}
                  title="Remover filtro de categoria"
                  className="ml-1 w-4 h-4 bg-white/20 hover:bg-white/40 rounded-full inline-flex items-center justify-center text-[10px] cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Primeiras categorias para acesso rápido */}
            {allCategories.slice(0, 5).map((cat) => {
              if (cat === selectedCategory) return null; // Já mostrado no chip ativo
              return (
                <button 
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className="px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 bg-brand-surface-subtle border border-brand-border text-brand-text hover:bg-brand-olive-light transition-all cursor-pointer"
                >
                  {cat} {categoryCounts[cat] !== undefined && `(${categoryCounts[cat]})`}
                </button>
              );
            })}

            {/* Botão Ver Todas caso tenha mais categorias */}
            {allCategories.length > 5 && (
              <button 
                onClick={() => setIsCategoryModalOpen(true)}
                className="px-3 py-1.5 rounded-full text-xs font-bold shrink-0 text-brand-olive bg-brand-olive-light hover:bg-brand-olive-border/40 border border-dashed border-brand-olive-border transition-all cursor-pointer"
              >
                + Ver Todas ({allCategories.length})
              </button>
            )}
          </div>
        </div>

        {/* Barra de Cuidados Específicos */}
        <div className="pt-3 border-t border-brand-border flex flex-wrap sm:flex-nowrap items-center gap-2.5">
          {/* Botão Geral de Cuidados */}
          <button 
            onClick={() => setIsCareModalOpen(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs shrink-0 ${
              activeCareFiltersCount > 0 
                ? 'bg-brand-olive text-white shadow-xs hover:bg-brand-olive-hover' 
                : 'bg-brand-surface-subtle text-brand-text border border-brand-border hover:bg-brand-olive-light'
            }`}
            title="Abrir painel completo de cuidados (Luz, Rega e Pets)"
          >
            <SlidersHorizontal className="w-4 h-4 text-brand-olive shrink-0" />
            <span>Cuidados</span>
            {activeCareFiltersCount > 0 ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/20 text-white">
                {activeCareFiltersCount} {activeCareFiltersCount === 1 ? 'ativo' : 'ativos'}
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-brand-olive-light text-brand-olive-text border border-brand-olive-border">
                Todos
              </span>
            )}
            <ChevronRight className="w-3.5 h-3.5 opacity-70 ml-0.5" />
          </button>

          {/* Chips Rápidos de Cuidados */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar flex-1 text-xs">
            {/* Sol Pleno */}
            <button 
              onClick={() => setSelectedLight(selectedLight === 'sol-pleno' ? 'all' : 'sol-pleno')}
              className={`px-3 py-1.5 rounded-full font-semibold shrink-0 flex items-center gap-1.5 border transition-all cursor-pointer ${
                selectedLight === 'sol-pleno' 
                  ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold shadow-xs' 
                  : 'bg-brand-surface-subtle border-brand-border text-brand-text hover:bg-brand-olive-light'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Sol Pleno ({careCounts.solPleno})</span>
              {selectedLight === 'sol-pleno' && <span className="text-[10px] text-amber-800 ml-0.5">✕</span>}
            </button>

            {/* Meia Sombra */}
            <button 
              onClick={() => setSelectedLight(selectedLight === 'meia-sombra' ? 'all' : 'meia-sombra')}
              className={`px-3 py-1.5 rounded-full font-semibold shrink-0 flex items-center gap-1.5 border transition-all cursor-pointer ${
                selectedLight === 'meia-sombra' 
                  ? 'bg-orange-50 border-orange-300 text-orange-900 font-bold shadow-xs' 
                  : 'bg-brand-surface-subtle border-brand-border text-brand-text hover:bg-brand-olive-light'
              }`}
            >
              <CloudSun className="w-3.5 h-3.5 text-orange-500" />
              <span>Meia Sombra ({careCounts.meiaSombra})</span>
              {selectedLight === 'meia-sombra' && <span className="text-[10px] text-orange-800 ml-0.5">✕</span>}
            </button>

            {/* Sombra Difusa */}
            <button 
              onClick={() => setSelectedLight(selectedLight === 'sombra-difusa' ? 'all' : 'sombra-difusa')}
              className={`px-3 py-1.5 rounded-full font-semibold shrink-0 flex items-center gap-1.5 border transition-all cursor-pointer ${
                selectedLight === 'sombra-difusa' 
                  ? 'bg-indigo-50 border-indigo-300 text-indigo-900 font-bold shadow-xs' 
                  : 'bg-brand-surface-subtle border-brand-border text-brand-text hover:bg-brand-olive-light'
              }`}
            >
              <Cloud className="w-3.5 h-3.5 text-indigo-500" />
              <span>Sombra / Difusa ({careCounts.sombraDifusa})</span>
              {selectedLight === 'sombra-difusa' && <span className="text-[10px] text-indigo-800 ml-0.5">✕</span>}
            </button>

            {/* Pouca Rega */}
            <button 
              onClick={() => setSelectedWater(selectedWater === 'baixa' ? 'all' : 'baixa')}
              className={`px-3 py-1.5 rounded-full font-semibold shrink-0 flex items-center gap-1.5 border transition-all cursor-pointer ${
                selectedWater === 'baixa' 
                  ? 'bg-blue-50 border-blue-300 text-blue-900 font-bold shadow-xs' 
                  : 'bg-brand-surface-subtle border-brand-border text-brand-text hover:bg-brand-olive-light'
              }`}
            >
              <Droplets className="w-3.5 h-3.5 text-blue-500" />
              <span>Pouca Rega ({careCounts.poucaRega})</span>
              {selectedWater === 'baixa' && <span className="text-[10px] text-blue-800 ml-0.5">✕</span>}
            </button>

            {/* Pet Friendly (Separado com tom Nude Suave) */}
            <button 
              onClick={() => setPetFriendlyOnly(!petFriendlyOnly)}
              className={`px-3 py-1.5 rounded-full font-semibold shrink-0 flex items-center gap-1.5 border transition-all cursor-pointer ${
                petFriendlyOnly 
                  ? 'bg-brand-nude-light border-brand-nude-border text-brand-nude-text font-bold shadow-xs' 
                  : 'bg-brand-surface-subtle border-brand-border text-brand-text hover:bg-brand-nude-light'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${petFriendlyOnly ? 'text-brand-nude fill-brand-nude' : 'text-brand-text-light'}`} />
              <span>Pet Friendly ({careCounts.petFriendly})</span>
              {petFriendlyOnly && <span className="text-[10px] text-brand-nude-text ml-0.5">✕</span>}
            </button>

            {/* Botão para ver todos os cuidados em detalhe */}
            <button 
              onClick={() => setIsCareModalOpen(true)}
              className="px-3 py-1.5 rounded-full text-xs font-bold shrink-0 text-brand-olive bg-brand-olive-light hover:bg-brand-olive-border/40 border border-dashed border-brand-olive-border transition-all cursor-pointer"
            >
              + Personalizar
            </button>
          </div>

          {activeCareFiltersCount > 0 && (
            <button 
              onClick={handleResetCareFilters}
              title="Limpar filtros de cuidados"
              className="text-brand-text-muted hover:text-brand-olive font-semibold flex items-center gap-1 text-xs hover:underline cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3 h-3" />
              Limpar
            </button>
          )}
        </div>

        {/* Barra de Status de Filtros Globais se houver qualquer filtro ativo */}
        {hasActiveFilters && (
          <div className="pt-2 border-t border-brand-border flex items-center justify-between text-xs text-brand-text-muted">
            <span className="flex items-center gap-1.5 text-brand-text font-medium">
              <Sparkles className="w-3.5 h-3.5 text-brand-olive" />
              Filtros ativos aplicados ao catálogo
            </span>
            <button 
              onClick={handleResetFilters}
              className="text-brand-text-muted hover:text-brand-olive font-bold flex items-center gap-1.5 hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Limpar Todos os Filtros
            </button>
          </div>
        )}
      </div>

      {/* Contagem de Resultados */}
      <div className="text-xs text-stone-500 px-1">
        <span>
          Exibindo <strong>{filteredAndSortedPlants.length}</strong> vasos na vitrine
        </span>
      </div>

      {/* Grade de Plantas */}
      {filteredAndSortedPlants.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedPlants.map((plant) => (
            <PlantCard 
              key={plant.id} 
              plant={plant} 
              onSelect={onSelectPlant} 
            />
          ))}
        </div>
      ) : (
        <div className="bg-brand-surface rounded-3xl p-12 text-center border border-brand-border shadow-xs space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 bg-brand-surface-subtle rounded-full flex items-center justify-center mx-auto text-brand-olive">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-brand-text font-serif-title">Nenhuma planta encontrada</h3>
          <p className="text-xs text-brand-text-muted">
            Não encontramos vasos disponíveis para os filtros selecionados.
          </p>
          <button 
            onClick={handleResetFilters}
            className="bg-brand-olive hover:bg-brand-olive-hover text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            Ver Todas as Plantas
          </button>
        </div>
      )}

      {/* Modal de Seleção de Bancadas Completo */}
      {isLocationModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => {
            setIsLocationModalOpen(false);
            setLocationSearchQuery('');
          }}
        >
          <div 
            className="bg-brand-surface rounded-3xl shadow-xl border border-brand-border w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabeçalho do Modal */}
            <div className="p-5 sm:p-6 border-b border-brand-border flex items-center justify-between bg-brand-surface-subtle">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-olive-light text-brand-olive-text flex items-center justify-center shadow-xs">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-brand-text font-serif-title flex items-center gap-2">
                    Bancadas & Setores da Loja
                    <span className="text-xs px-2 py-0.5 bg-brand-olive-light text-brand-olive-text rounded-full font-sans font-semibold border border-brand-olive-border">
                      {allLocations.length}
                    </span>
                  </h3>
                  <p className="text-xs text-brand-text-muted">
                    Selecione uma bancada para explorar os vasos organizados naquele espaço
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsLocationModalOpen(false);
                  setLocationSearchQuery('');
                }}
                className="w-8 h-8 rounded-full bg-brand-border hover:bg-brand-border-subtle text-brand-text-muted hover:text-brand-text flex items-center justify-center transition-colors cursor-pointer"
                title="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Campo de Busca de Bancadas */}
            <div className="p-4 sm:px-6 border-b border-brand-border bg-brand-surface">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-brand-text-light" />
                <input
                  type="text"
                  value={locationSearchQuery}
                  onChange={(e) => setLocationSearchQuery(e.target.value)}
                  placeholder="Buscar bancada ou setor..."
                  className="w-full pl-10 pr-9 py-2 text-xs sm:text-sm bg-brand-surface-subtle border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-olive font-medium transition-all text-brand-text"
                  autoFocus
                />
                {locationSearchQuery && (
                  <button
                    onClick={() => setLocationSearchQuery('')}
                    className="absolute right-3 top-2.5 text-xs text-brand-text-muted hover:text-brand-text bg-brand-border hover:bg-brand-border-subtle w-4 h-4 rounded-full flex items-center justify-center font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Lista e Grade de Bancadas */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3">
              {/* Opção: Todas as Bancadas */}
              {(!locationSearchQuery || 'todas as bancadas'.includes(locationSearchQuery.toLowerCase())) && (
                <button
                  onClick={() => {
                    handleClearLocation();
                    setIsLocationModalOpen(false);
                    setLocationSearchQuery('');
                  }}
                  className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    selectedLocation === 'all'
                      ? 'bg-brand-olive-light border-brand-olive ring-2 ring-brand-olive/20 text-brand-olive-text font-bold shadow-xs'
                      : 'bg-brand-surface-subtle border-brand-border text-brand-text hover:bg-brand-olive-light'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${selectedLocation === 'all' ? 'bg-brand-olive text-white' : 'bg-brand-border text-brand-text-muted'}`}>
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold">Todas as Bancadas</div>
                      <div className="text-xs text-brand-text-muted">Exibir catálogo geral da loja sem restrição de local</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 bg-brand-olive-light text-brand-olive-text border border-brand-olive-border rounded-full font-bold">
                      {locationCounts.all || 0} vasos
                    </span>
                    {selectedLocation === 'all' && (
                      <Check className="w-4 h-4 text-brand-olive font-bold" />
                    )}
                  </div>
                </button>
              )}

              {/* Grade com Todas as Bancadas */}
              {filteredModalLocations.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {filteredModalLocations.map((loc) => {
                    const count = locationCounts[loc] || 0;
                    const isSelected = selectedLocation === loc;
                    return (
                      <button
                        key={loc}
                        onClick={() => {
                          setSelectedLocation(loc);
                          setIsLocationModalOpen(false);
                          setLocationSearchQuery('');
                        }}
                        className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-brand-olive-light border-brand-olive ring-2 ring-brand-olive/20 text-brand-olive-text font-bold shadow-xs'
                            : 'bg-brand-surface border-brand-border text-brand-text hover:bg-brand-olive-light hover:border-brand-olive-border'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate pr-2">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                            isSelected ? 'bg-brand-olive text-white' : 'bg-brand-surface-subtle text-brand-text-muted'
                          }`}>
                            📍
                          </div>
                          <span className="text-xs sm:text-sm font-semibold truncate">{loc}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                            count > 0 ? 'bg-brand-surface-subtle text-brand-text-muted' : 'bg-brand-surface-subtle text-brand-text-light'
                          }`}>
                            {count} {count === 1 ? 'vaso' : 'vasos'}
                          </span>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-brand-olive font-bold" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="py-10 text-center text-brand-text-muted space-y-2">
                  <p className="text-sm font-medium">Nenhuma bancada encontrada para "{locationSearchQuery}".</p>
                  <button
                    onClick={() => setLocationSearchQuery('')}
                    className="text-xs text-brand-olive font-bold hover:underline cursor-pointer"
                  >
                    Limpar busca
                  </button>
                </div>
              )}
            </div>

            {/* Rodapé do Modal */}
            <div className="p-4 border-t border-brand-border bg-brand-surface-subtle flex items-center justify-between text-xs">
              <span className="text-brand-text-muted font-medium">
                Total: <strong>{allLocations.length}</strong> bancadas cadastradas
              </span>
              <button
                onClick={() => {
                  setIsLocationModalOpen(false);
                  setLocationSearchQuery('');
                }}
                className="px-4 py-2 bg-brand-border hover:bg-brand-border-subtle text-brand-text font-bold rounded-xl transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Seleção de Categorias Completo */}
      {isCategoryModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => {
            setIsCategoryModalOpen(false);
            setCategorySearchQuery('');
          }}
        >
          <div 
            className="bg-brand-surface rounded-3xl shadow-xl border border-brand-border w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabeçalho do Modal */}
            <div className="p-5 sm:p-6 border-b border-brand-border flex items-center justify-between bg-brand-surface-subtle">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-olive-light text-brand-olive-text flex items-center justify-center shadow-xs">
                  <LayoutGrid className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-brand-text font-serif-title flex items-center gap-2">
                    Todas as Categorias
                    <span className="text-xs px-2 py-0.5 bg-brand-olive-light text-brand-olive-text rounded-full font-sans font-semibold border border-brand-olive-border">
                      {allCategories.length}
                    </span>
                  </h3>
                  <p className="text-xs text-brand-text-muted">
                    Selecione uma categoria para filtrar o catálogo de plantas
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsCategoryModalOpen(false);
                  setCategorySearchQuery('');
                }}
                className="w-8 h-8 rounded-full bg-brand-border hover:bg-brand-border-subtle text-brand-text-muted hover:text-brand-text flex items-center justify-center transition-colors cursor-pointer"
                title="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Campo de Busca de Categorias */}
            <div className="p-4 sm:px-6 border-b border-brand-border bg-brand-surface">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-brand-text-light" />
                <input
                  type="text"
                  value={categorySearchQuery}
                  onChange={(e) => setCategorySearchQuery(e.target.value)}
                  placeholder="Buscar categoria..."
                  className="w-full pl-10 pr-9 py-2 text-xs sm:text-sm bg-brand-surface-subtle border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-olive font-medium transition-all text-brand-text"
                  autoFocus
                />
                {categorySearchQuery && (
                  <button
                    onClick={() => setCategorySearchQuery('')}
                    className="absolute right-3 top-2.5 text-xs text-brand-text-muted hover:text-brand-text bg-brand-border hover:bg-brand-border-subtle w-4 h-4 rounded-full flex items-center justify-center font-bold cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Lista e Grade de Categorias */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-3">
              {/* Opção: Todas as Categorias */}
              {(!categorySearchQuery || 'todas as categorias'.includes(categorySearchQuery.toLowerCase())) && (
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setIsCategoryModalOpen(false);
                    setCategorySearchQuery('');
                  }}
                  className={`w-full p-3.5 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                    selectedCategory === 'all'
                      ? 'bg-brand-olive-light border-brand-olive ring-2 ring-brand-olive/20 text-brand-olive-text font-bold shadow-xs'
                      : 'bg-brand-surface-subtle border-brand-border text-brand-text hover:bg-brand-olive-light'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${selectedCategory === 'all' ? 'bg-brand-olive text-white' : 'bg-brand-border text-brand-text-muted'}`}>
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-sm font-bold">Todas as Categorias</div>
                      <div className="text-xs text-brand-text-muted">Exibir catálogo completo da loja</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 bg-brand-olive-light text-brand-olive-text border border-brand-olive-border rounded-full font-bold">
                      {categoryCounts.all || 0} vasos
                    </span>
                    {selectedCategory === 'all' && (
                      <Check className="w-4 h-4 text-brand-olive font-bold" />
                    )}
                  </div>
                </button>
              )}

              {/* Grade com Todas as Categorias Existentes */}
              {filteredModalCategories.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {filteredModalCategories.map((cat) => {
                    const count = categoryCounts[cat] || 0;
                    const isSelected = selectedCategory === cat;
                    return (
                      <button
                        key={cat}
                        onClick={() => {
                          setSelectedCategory(cat);
                          setIsCategoryModalOpen(false);
                          setCategorySearchQuery('');
                        }}
                        className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-brand-olive-light border-brand-olive ring-2 ring-brand-olive/20 text-brand-olive-text font-bold shadow-xs'
                            : 'bg-brand-surface border-brand-border text-brand-text hover:bg-brand-olive-light hover:border-brand-olive-border'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 truncate pr-2">
                          <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                            isSelected ? 'bg-brand-olive text-white' : 'bg-brand-surface-subtle text-brand-text-muted'
                          }`}>
                            🌿
                          </div>
                          <span className="text-xs sm:text-sm font-semibold truncate">{cat}</span>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                            count > 0 ? 'bg-brand-surface-subtle text-brand-text-muted' : 'bg-brand-surface-subtle text-brand-text-light'
                          }`}>
                            {count} {count === 1 ? 'vaso' : 'vasos'}
                          </span>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-brand-olive font-bold" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="py-10 text-center text-brand-text-muted space-y-2">
                  <p className="text-sm font-medium">Nenhuma categoria encontrada para "{categorySearchQuery}".</p>
                  <button
                    onClick={() => setCategorySearchQuery('')}
                    className="text-xs text-brand-olive font-bold hover:underline cursor-pointer"
                  >
                    Limpar busca
                  </button>
                </div>
              )}
            </div>

            {/* Rodapé do Modal */}
            <div className="p-4 border-t border-brand-border bg-brand-surface-subtle flex items-center justify-between text-xs">
              <span className="text-brand-text-muted font-medium">
                Total: <strong>{allCategories.length}</strong> categorias disponíveis
              </span>
              <button
                onClick={() => {
                  setIsCategoryModalOpen(false);
                  setCategorySearchQuery('');
                }}
                className="px-4 py-2 bg-brand-border hover:bg-brand-border-subtle text-brand-text font-bold rounded-xl transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Modal de Seleção de Cuidados Completo */}
      {isCareModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsCareModalOpen(false)}
        >
          <div 
            className="bg-brand-surface rounded-3xl shadow-xl border border-brand-border w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabeçalho do Modal */}
            <div className="p-5 sm:p-6 border-b border-brand-border flex items-center justify-between bg-brand-surface-subtle">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand-olive-light text-brand-olive-text flex items-center justify-center shadow-xs">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-brand-text font-serif-title flex items-center gap-2">
                    Filtros & Guia de Cuidados
                    {activeCareFiltersCount > 0 && (
                      <span className="text-xs px-2 py-0.5 bg-brand-olive-light text-brand-olive-text rounded-full font-sans font-bold border border-brand-olive-border">
                        {activeCareFiltersCount} {activeCareFiltersCount === 1 ? 'ativo' : 'ativos'}
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-brand-text-muted">
                    Selecione as condições ideais de luz, rega e ambiente para o seu espaço
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsCareModalOpen(false)}
                className="w-8 h-8 rounded-full bg-brand-border hover:bg-brand-border-subtle text-brand-text-muted hover:text-brand-text flex items-center justify-center transition-colors cursor-pointer"
                title="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Conteúdo do Modal: 3 Seções de Cuidados */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-6">
              
              {/* Seção 1: Iluminação / Luz */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-text uppercase tracking-wide flex items-center gap-1.5">
                    <Sun className="w-4 h-4 text-amber-500" />
                    1. Luminosidade & Exposição Solar
                  </span>
                  {selectedLight !== 'all' && (
                    <button 
                      onClick={() => setSelectedLight('all')} 
                      className="text-[11px] text-brand-olive font-bold hover:underline cursor-pointer"
                    >
                      Qualquer luz
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Opção: Qualquer Luz */}
                  <button
                    onClick={() => setSelectedLight('all')}
                    className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      selectedLight === 'all'
                        ? 'bg-brand-olive-light border-brand-olive ring-1 ring-brand-olive/20 text-brand-olive-text font-bold shadow-xs'
                        : 'bg-brand-surface border-brand-border text-brand-text hover:bg-brand-surface-subtle hover:border-brand-olive/40'
                    }`}
                  >
                    <div>
                      <div className="text-xs sm:text-sm font-bold">Qualquer Luminosidade</div>
                      <div className="text-[11px] text-brand-text-muted">Sem preferência de sol</div>
                    </div>
                    {selectedLight === 'all' && <Check className="w-4 h-4 text-brand-olive font-bold" />}
                  </button>

                  {/* Opção: Sol Pleno */}
                  <button
                    onClick={() => setSelectedLight('sol-pleno')}
                    className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      selectedLight === 'sol-pleno'
                        ? 'bg-brand-olive-light border-brand-olive ring-1 ring-brand-olive/20 text-brand-olive-text font-bold shadow-xs'
                        : 'bg-brand-surface border-brand-border text-brand-text hover:bg-brand-surface-subtle hover:border-brand-olive/40'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        selectedLight === 'sol-pleno' 
                          ? 'bg-brand-olive text-white' 
                          : 'bg-brand-surface-subtle text-brand-text-muted border border-brand-border/50'
                      }`}>
                        <Sun className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold">Sol Pleno</div>
                        <div className="text-[11px] text-brand-text-muted">Sol direto 4h+ ao dia (varandas, quintais)</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-brand-surface-subtle text-brand-text-muted font-medium border border-brand-border/60">
                        {careCounts.solPleno}
                      </span>
                      {selectedLight === 'sol-pleno' && <Check className="w-3.5 h-3.5 text-brand-olive font-bold" />}
                    </div>
                  </button>

                  {/* Opção: Meia Sombra */}
                  <button
                    onClick={() => setSelectedLight('meia-sombra')}
                    className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      selectedLight === 'meia-sombra'
                        ? 'bg-brand-olive-light border-brand-olive ring-1 ring-brand-olive/20 text-brand-olive-text font-bold shadow-xs'
                        : 'bg-brand-surface border-brand-border text-brand-text hover:bg-brand-surface-subtle hover:border-brand-olive/40'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        selectedLight === 'meia-sombra' 
                          ? 'bg-brand-olive text-white' 
                          : 'bg-brand-surface-subtle text-brand-text-muted border border-brand-border/50'
                      }`}>
                        <CloudSun className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold">Meia Sombra</div>
                        <div className="text-[11px] text-brand-text-muted">Luz indireta abundante ou sol fraco matinal</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-brand-surface-subtle text-brand-text-muted font-medium border border-brand-border/60">
                        {careCounts.meiaSombra}
                      </span>
                      {selectedLight === 'meia-sombra' && <Check className="w-3.5 h-3.5 text-brand-olive font-bold" />}
                    </div>
                  </button>

                  {/* Opção: Sombra Difusa */}
                  <button
                    onClick={() => setSelectedLight('sombra-difusa')}
                    className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      selectedLight === 'sombra-difusa'
                        ? 'bg-brand-olive-light border-brand-olive ring-1 ring-brand-olive/20 text-brand-olive-text font-bold shadow-xs'
                        : 'bg-brand-surface border-brand-border text-brand-text hover:bg-brand-surface-subtle hover:border-brand-olive/40'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        selectedLight === 'sombra-difusa' 
                          ? 'bg-brand-olive text-white' 
                          : 'bg-brand-surface-subtle text-brand-text-muted border border-brand-border/50'
                      }`}>
                        <Cloud className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold">Sombra / Difusa</div>
                        <div className="text-[11px] text-brand-text-muted">Ambientes internos sem incidência solar direta</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-brand-surface-subtle text-brand-text-muted font-medium border border-brand-border/60">
                        {careCounts.sombraDifusa}
                      </span>
                      {selectedLight === 'sombra-difusa' && <Check className="w-3.5 h-3.5 text-brand-olive font-bold" />}
                    </div>
                  </button>
                </div>
              </div>

              {/* Seção 2: Frequência de Rega */}
              <div className="space-y-2.5 pt-2 border-t border-brand-border">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-text uppercase tracking-wide flex items-center gap-1.5">
                    <Droplets className="w-4 h-4 text-brand-olive" />
                    2. Frequência & Rotina de Rega
                  </span>
                  {selectedWater !== 'all' && (
                    <button 
                      onClick={() => setSelectedWater('all')} 
                      className="text-[11px] text-brand-olive font-bold hover:underline cursor-pointer"
                    >
                      Qualquer rega
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Opção: Qualquer Rega */}
                  <button
                    onClick={() => setSelectedWater('all')}
                    className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      selectedWater === 'all'
                        ? 'bg-brand-olive-light border-brand-olive ring-1 ring-brand-olive/20 text-brand-olive-text font-bold shadow-xs'
                        : 'bg-brand-surface border-brand-border text-brand-text hover:bg-brand-surface-subtle hover:border-brand-olive/40'
                    }`}
                  >
                    <div>
                      <div className="text-xs sm:text-sm font-bold">Qualquer Frequência</div>
                      <div className="text-[11px] text-brand-text-muted">Sem preferência de umidade</div>
                    </div>
                    {selectedWater === 'all' && <Check className="w-4 h-4 text-brand-olive font-bold" />}
                  </button>

                  {/* Opção: Pouca Rega */}
                  <button
                    onClick={() => setSelectedWater('baixa')}
                    className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      selectedWater === 'baixa'
                        ? 'bg-brand-olive-light border-brand-olive ring-1 ring-brand-olive/20 text-brand-olive-text font-bold shadow-xs'
                        : 'bg-brand-surface border-brand-border text-brand-text hover:bg-brand-surface-subtle hover:border-brand-olive/40'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        selectedWater === 'baixa' 
                          ? 'bg-brand-olive text-white' 
                          : 'bg-brand-surface-subtle text-brand-text-muted border border-brand-border/50'
                      }`}>
                        <Droplets className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold">Pouca Rega (Solo Seco)</div>
                        <div className="text-[11px] text-brand-text-muted">1x a cada 10-15 dias (suculentas, cactos, espadas)</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-brand-surface-subtle text-brand-text-muted font-medium border border-brand-border/60">
                        {careCounts.poucaRega}
                      </span>
                      {selectedWater === 'baixa' && <Check className="w-3.5 h-3.5 text-brand-olive font-bold" />}
                    </div>
                  </button>

                  {/* Opção: Rega Moderada */}
                  <button
                    onClick={() => setSelectedWater('moderada')}
                    className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      selectedWater === 'moderada'
                        ? 'bg-brand-olive-light border-brand-olive ring-1 ring-brand-olive/20 text-brand-olive-text font-bold shadow-xs'
                        : 'bg-brand-surface border-brand-border text-brand-text hover:bg-brand-surface-subtle hover:border-brand-olive/40'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        selectedWater === 'moderada' 
                          ? 'bg-brand-olive text-white' 
                          : 'bg-brand-surface-subtle text-brand-text-muted border border-brand-border/50'
                      }`}>
                        <Droplet className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold">Rega Moderada</div>
                        <div className="text-[11px] text-brand-text-muted">1 a 2 vezes por semana (regar quando secar a superfície)</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-brand-surface-subtle text-brand-text-muted font-medium border border-brand-border/60">
                        {careCounts.regaModerada}
                      </span>
                      {selectedWater === 'moderada' && <Check className="w-3.5 h-3.5 text-brand-olive font-bold" />}
                    </div>
                  </button>

                  {/* Opção: Rega Frequente */}
                  <button
                    onClick={() => setSelectedWater('frequente')}
                    className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      selectedWater === 'frequente'
                        ? 'bg-brand-olive-light border-brand-olive ring-1 ring-brand-olive/20 text-brand-olive-text font-bold shadow-xs'
                        : 'bg-brand-surface border-brand-border text-brand-text hover:bg-brand-surface-subtle hover:border-brand-olive/40'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 font-bold text-xs ${
                        selectedWater === 'frequente' 
                          ? 'bg-brand-olive text-white' 
                          : 'bg-brand-surface-subtle text-brand-text-muted border border-brand-border/50'
                      }`}>
                        3x
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold">Rega Frequente</div>
                        <div className="text-[11px] text-brand-text-muted">Solo sempre úmido (samambaias, avencas, marantas)</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-brand-surface-subtle text-brand-text-muted font-medium border border-brand-border/60">
                        {careCounts.regaFrequente}
                      </span>
                      {selectedWater === 'frequente' && <Check className="w-3.5 h-3.5 text-brand-olive font-bold" />}
                    </div>
                  </button>
                </div>
              </div>

              {/* Seção 3: Convivência com Pets & Crianças */}
              <div className="space-y-2.5 pt-2 border-t border-brand-border">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-brand-text uppercase tracking-wide flex items-center gap-1.5">
                    <Heart className="w-4 h-4 text-brand-nude" />
                    3. Segurança com Animais de Estimação (Pets)
                  </span>
                  {petFriendlyOnly && (
                    <button 
                      onClick={() => setPetFriendlyOnly(false)} 
                      className="text-[11px] text-brand-nude-text font-bold hover:underline cursor-pointer"
                    >
                      Todas as plantas
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Opção: Todas as Espécies */}
                  <button
                    onClick={() => setPetFriendlyOnly(false)}
                    className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      !petFriendlyOnly
                        ? 'bg-brand-olive-light border-brand-olive ring-1 ring-brand-olive/20 text-brand-olive-text font-bold shadow-xs'
                        : 'bg-brand-surface border-brand-border text-brand-text hover:bg-brand-surface-subtle hover:border-brand-olive/40'
                    }`}
                  >
                    <div>
                      <div className="text-xs sm:text-sm font-bold">Todas as Espécies</div>
                      <div className="text-[11px] text-brand-text-muted">Inclui plantas ornamentais tradicionais</div>
                    </div>
                    {!petFriendlyOnly && <Check className="w-4 h-4 text-brand-olive font-bold" />}
                  </button>

                  {/* Opção: Apenas Pet Friendly */}
                  <button
                    onClick={() => setPetFriendlyOnly(true)}
                    className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      petFriendlyOnly
                        ? 'bg-brand-nude-light border-brand-nude ring-1 ring-brand-nude/20 text-brand-nude-text font-bold shadow-xs'
                        : 'bg-brand-surface border-brand-border text-brand-text hover:bg-brand-nude-light hover:border-brand-nude-border'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                        petFriendlyOnly 
                          ? 'bg-brand-nude text-white' 
                          : 'bg-brand-nude-light text-brand-nude-text'
                      }`}>
                        <Heart className={`w-4 h-4 ${petFriendlyOnly ? 'fill-white text-white' : 'fill-brand-nude text-brand-nude'}`} />
                      </div>
                      <div>
                        <div className="text-xs sm:text-sm font-bold">100% Pet Friendly (Não Tóxica)</div>
                        <div className="text-[11px] text-brand-text-muted">Totalmente seguras para cães e gatos</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-brand-surface-subtle text-brand-text-muted font-medium border border-brand-border/60">
                        {careCounts.petFriendly}
                      </span>
                      {petFriendlyOnly && <Check className="w-3.5 h-3.5 text-brand-nude font-bold" />}
                    </div>
                  </button>
                </div>
              </div>

            </div>

            {/* Rodapé do Modal */}
            <div className="p-4 sm:p-5 border-t border-brand-border bg-brand-surface-subtle flex flex-wrap items-center justify-between gap-3 text-xs">
              <div>
                {activeCareFiltersCount > 0 ? (
                  <button
                    onClick={handleResetCareFilters}
                    className="text-brand-text-muted hover:text-brand-olive font-bold flex items-center gap-1.5 hover:underline cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Limpar Cuidados Selecionados
                  </button>
                ) : (
                  <span className="text-brand-text-muted">Nenhum filtro de cuidado aplicado</span>
                )}
              </div>

              <button
                onClick={() => setIsCareModalOpen(false)}
                className="px-5 py-2.5 bg-brand-olive hover:bg-brand-olive-hover text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-2"
              >
                <span>Ver {filteredAndSortedPlants.length} vasos na vitrine</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

