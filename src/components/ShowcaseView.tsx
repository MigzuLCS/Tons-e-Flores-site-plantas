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
  Check, 
  X, 
  ChevronRight,
  Sparkles
} from 'lucide-react';
import type { Plant } from '../types/plant';
import { PlantCard } from './PlantCard';
import { configService } from '../services/configService';

interface ShowcaseViewProps {
  plants: Plant[];
  isLoading?: boolean;
  onSelectPlant: (plant: Plant) => void;
  activeLocationFilter?: string | null;
  onClearLocationFilter?: () => void;
}

export const ShowcaseView: React.FC<ShowcaseViewProps> = ({ 
  plants, 
  isLoading = false,
  onSelectPlant, 
  activeLocationFilter, 
  onClearLocationFilter 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedCultivation, setSelectedCultivation] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>(activeLocationFilter || 'all');
  const [selectedLight, setSelectedLight] = useState<string>('all');
  const [selectedWater, setSelectedWater] = useState<string>('all');
  const [petFriendlyOnly, setPetFriendlyOnly] = useState<boolean>(false);
  
  // Modais / Painéis de Filtro
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isMobileFilterSheetOpen, setIsMobileFilterSheetOpen] = useState(false);
  
  // Buscas internas no modal de filtros
  const [categorySearchQuery, setCategorySearchQuery] = useState('');
  const [locationSearchQuery, setLocationSearchQuery] = useState('');

  // Sincroniza quando activeLocationFilter mudar externamente (ex: leitura de QR code)
  useEffect(() => {
    if (activeLocationFilter) {
      setSelectedLocation(activeLocationFilter);
    }
  }, [activeLocationFilter]);

  // Carrega todos os tipos de cultivo cadastrados na loja dinamicamente
  const allCultivations = useMemo(() => {
    const configuredCuls = configService.getCultivations();
    const plantCuls = plants.map(p => p.cultivation || 'Tradicional').filter(Boolean);
    const merged = Array.from(new Set([...configuredCuls, ...plantCuls]));
    return merged.sort((a, b) => a.localeCompare(b, 'pt-BR'));
  }, [plants]);

  // Contagem de vasos por tipo de cultivo (apenas vasos disponíveis e reservados)
  const cultivationCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: plants.filter(p => p.status !== 'vendida').length
    };
    for (const p of plants) {
      if (p.status !== 'vendida') {
        const cul = p.cultivation || 'Tradicional';
        counts[cul] = (counts[cul] || 0) + 1;
      }
    }
    return counts;
  }, [plants]);

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

      // Cultivo / Formato
      const matchesCultivation = selectedCultivation === 'all' || (plant.cultivation || 'Tradicional') === selectedCultivation;

      // Localização / Bancada
      const matchesLocation = selectedLocation === 'all' || plant.location === selectedLocation;

      // Luz
      const matchesLight = selectedLight === 'all' || plant.light === selectedLight;

      // Rega
      const matchesWater = selectedWater === 'all' || plant.watering === selectedWater;

      // Pets
      const matchesPets = !petFriendlyOnly || plant.petFriendly;

      return matchesSearch && matchesCategory && matchesCultivation && matchesLocation && matchesLight && matchesWater && matchesPets;
    });

    // Regra 2: Ordenação - Disponíveis no topo, Reservadas abaixo
    return visiblePlants.sort((a, b) => {
      if (a.status === 'disponivel' && b.status === 'reservada') return -1;
      if (a.status === 'reservada' && b.status === 'disponivel') return 1;
      return 0;
    });
  }, [plants, searchTerm, selectedCategory, selectedCultivation, selectedLocation, selectedLight, selectedWater, petFriendlyOnly]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedCultivation('all');
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

  const hasActiveFilters =
    searchTerm !== '' ||
    selectedCategory !== 'all' ||
    selectedCultivation !== 'all' ||
    selectedLocation !== 'all' ||
    selectedLight !== 'all' ||
    selectedWater !== 'all' ||
    petFriendlyOnly;

  const totalActiveFiltersCount = useMemo(() => {
    let count = 0;
    if (searchTerm.trim() !== '') count++;
    if (selectedCategory !== 'all') count++;
    if (selectedCultivation !== 'all') count++;
    if (selectedLocation !== 'all') count++;
    if (selectedLight !== 'all') count++;
    if (selectedWater !== 'all') count++;
    if (petFriendlyOnly) count++;
    return count;
  }, [searchTerm, selectedCategory, selectedCultivation, selectedLocation, selectedLight, selectedWater, petFriendlyOnly]);

  const getCultivationIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes('tradicional')) return '🪴';
    if (lower.includes('muda')) return '🌱';
    if (lower.includes('bonsai')) return '🎍';
    if (lower.includes('arranjo')) return '💐';
    if (lower.includes('kokedama') || lower.includes('coquedama')) return '🧶';
    return '🌿';
  };

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

      {/* ======================================================== */}
      {/* 1. VERSÃO MOBILE & TABLET DA BUSCA E FILTROS (Excalidraw) */}
      {/* ======================================================== */}
      <div className="lg:hidden bg-brand-surface p-3.5 sm:p-4 rounded-2xl border border-brand-border shadow-xs space-y-3">
        {/* Barra de Pesquisa com Botão de Filtro Embutido */}
        <div className="relative flex items-center">
          <Search className="w-4 h-4 absolute left-3.5 text-brand-text-light pointer-events-none" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={selectedLocation !== 'all' ? `Pesquisar em "${selectedLocation}"...` : "Pesquisar plantas, espécies, #TF..."} 
            className="w-full pl-10 pr-12 py-2.5 text-xs bg-brand-surface-subtle border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-olive focus:border-brand-olive font-medium transition-all text-brand-text placeholder:text-brand-text-light"
          />
          
          {/* Botão Expansivo de Filtro Mobile */}
          <button 
            onClick={() => setIsMobileFilterSheetOpen(true)}
            title="Abrir menu de escolhas de filtro"
            aria-label="Abrir menu de escolhas de filtro"
            className={`absolute right-1.5 p-2 rounded-lg border transition-all cursor-pointer flex items-center justify-center ${
              totalActiveFiltersCount > 0
                ? 'bg-brand-olive text-white border-brand-olive shadow-xs'
                : 'bg-brand-surface text-brand-text-muted hover:text-brand-text border-brand-border'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            {totalActiveFiltersCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-nude text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                {totalActiveFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Chips de Filtros Aplicados */}
        {hasActiveFilters && (
          <div className="space-y-2 pt-1 border-t border-brand-border/60">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-[11px]">
              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-olive/15 text-brand-olive-text border border-brand-olive/30 rounded-full shrink-0 font-medium animate-in fade-in">
                  🔍 "{searchTerm}"
                  <button 
                    onClick={() => setSearchTerm('')} 
                    className="hover:text-red-500 font-bold ml-0.5 w-3.5 h-3.5 inline-flex items-center justify-center cursor-pointer"
                    title="Remover busca"
                  >
                    ×
                  </button>
                </span>
              )}

              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-olive/15 text-brand-olive-text border border-brand-olive/30 rounded-full shrink-0 font-medium animate-in fade-in">
                  🌱 {selectedCategory}
                  <button 
                    onClick={() => setSelectedCategory('all')} 
                    className="hover:text-red-500 font-bold ml-0.5 w-3.5 h-3.5 inline-flex items-center justify-center cursor-pointer"
                    title="Remover categoria"
                  >
                    ×
                  </button>
                </span>
              )}

              {selectedCultivation !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-olive/15 text-brand-olive-text border border-brand-olive/30 rounded-full shrink-0 font-medium animate-in fade-in">
                  🪴 Cultivo: {selectedCultivation}
                  <button 
                    onClick={() => setSelectedCultivation('all')} 
                    className="hover:text-red-500 font-bold ml-0.5 w-3.5 h-3.5 inline-flex items-center justify-center cursor-pointer"
                    title="Remover cultivo"
                  >
                    ×
                  </button>
                </span>
              )}

              {selectedLocation !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-olive/15 text-brand-olive-text border border-brand-olive/30 rounded-full shrink-0 font-medium animate-in fade-in">
                  📍 {selectedLocation}
                  <button 
                    onClick={handleClearLocation} 
                    className="hover:text-red-500 font-bold ml-0.5 w-3.5 h-3.5 inline-flex items-center justify-center cursor-pointer"
                    title="Remover bancada"
                  >
                    ×
                  </button>
                </span>
              )}

              {selectedLight !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-olive/15 text-brand-olive-text border border-brand-olive/30 rounded-full shrink-0 font-medium animate-in fade-in">
                  ☀️ {selectedLight === 'sol-pleno' ? 'Sol Pleno' : selectedLight === 'meia-sombra' ? 'Meia-Sombra' : 'Sombra'}
                  <button 
                    onClick={() => setSelectedLight('all')} 
                    className="hover:text-red-500 font-bold ml-0.5 w-3.5 h-3.5 inline-flex items-center justify-center cursor-pointer"
                    title="Remover filtro de luz"
                  >
                    ×
                  </button>
                </span>
              )}

              {selectedWater !== 'all' && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-olive/15 text-brand-olive-text border border-brand-olive/30 rounded-full shrink-0 font-medium animate-in fade-in">
                  💧 Rega {selectedWater === 'baixa' ? 'Baixa' : selectedWater === 'moderada' ? 'Moderada' : 'Frequente'}
                  <button 
                    onClick={() => setSelectedWater('all')} 
                    className="hover:text-red-500 font-bold ml-0.5 w-3.5 h-3.5 inline-flex items-center justify-center cursor-pointer"
                    title="Remover filtro de rega"
                  >
                    ×
                  </button>
                </span>
              )}

              {petFriendlyOnly && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-brand-nude-light text-brand-nude-text border border-brand-nude-border rounded-full shrink-0 font-medium animate-in fade-in">
                  🐾 Pet Friendly
                  <button 
                    onClick={() => setPetFriendlyOnly(false)} 
                    className="hover:text-red-500 font-bold ml-0.5 w-3.5 h-3.5 inline-flex items-center justify-center cursor-pointer"
                    title="Remover filtro pet friendly"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>

            {/* Linha com Botão Limpar Filtros */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <button 
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 text-xs text-brand-text-muted hover:text-brand-olive font-medium transition-colors cursor-pointer"
              >
                <span className="w-3.5 h-3.5 rounded-full border border-brand-border flex items-center justify-center text-[9px]">✕</span>
                <span>Limpar filtros</span>
              </button>
              <span className="text-[11px] text-brand-text-muted">
                {filteredAndSortedPlants.length} {filteredAndSortedPlants.length === 1 ? 'vaso' : 'vasos'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* 2. NOVA VERSÃO DESKTOP (MODERNA, LIMPA & UNIFICADA)       */}
      {/* ======================================================== */}
      <div className="hidden lg:block bg-brand-surface p-5 rounded-3xl border border-brand-border shadow-xs space-y-4">
        
        {/* Linha Principal: Busca Ampla + Botão Unificado de Filtros */}
        <div className="flex items-center gap-3">
          {/* Campo de Busca Principal */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-4 top-3.5 text-brand-text-light pointer-events-none" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={selectedLocation !== 'all' ? `Pesquisar plantas em "${selectedLocation}"...` : "Buscar por nome popular, científico, categoria, tag #TF..."} 
              className="w-full pl-11 pr-10 py-2.5 text-sm bg-brand-surface-subtle border border-brand-border rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-olive focus:border-brand-olive font-medium transition-all text-brand-text placeholder:text-brand-text-light"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-2.5 text-xs text-brand-text-muted hover:text-brand-text bg-brand-border hover:bg-brand-border-subtle w-5 h-5 rounded-full flex items-center justify-center font-bold cursor-pointer"
                title="Limpar busca"
              >
                ✕
              </button>
            )}
          </div>

          {/* Botão Principal Unificado de Filtros (Abre o Centro de Filtros Desktop) */}
          <button 
            onClick={() => setIsFilterModalOpen(true)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-xs shrink-0 border ${
              totalActiveFiltersCount > 0
                ? 'bg-brand-olive text-white border-brand-olive hover:bg-brand-olive-hover'
                : 'bg-brand-surface-subtle hover:bg-brand-olive-light text-brand-text border-brand-border hover:border-brand-olive-border'
            }`}
            title="Abrir painel de filtros completo"
          >
            <SlidersHorizontal className="w-4 h-4 text-inherit shrink-0" />
            <span>Filtros do Catálogo</span>
            {totalActiveFiltersCount > 0 ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-brand-nude text-white shadow-xs">
                {totalActiveFiltersCount}
              </span>
            ) : (
              <span className="text-[11px] text-brand-text-muted font-semibold">
                (Todos)
              </span>
            )}
            <ChevronRight className="w-3.5 h-3.5 opacity-60 ml-0.5" />
          </button>
        </div>

        {/* Linha Secundária: Pílulas Rápidas de Categorias & Acesso Direto */}
        <div className="flex items-center gap-2 pt-1 border-t border-brand-border/60">
          <span className="text-xs font-bold text-brand-text-muted flex items-center gap-1 shrink-0 mr-1">
            <span>🌿</span> Categorias:
          </span>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 hide-scrollbar flex-1 text-xs">
            {/* Pílula: Todas */}
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer shrink-0 ${
                selectedCategory === 'all'
                  ? 'bg-brand-olive text-white shadow-xs font-bold'
                  : 'bg-brand-surface-subtle border border-brand-border text-brand-text hover:bg-brand-olive-light'
              }`}
            >
              Todas ({categoryCounts.all || 0})
            </button>

            {/* Categorias em destaque para clique rápido */}
            {allCategories.slice(0, 6).map((cat) => {
              const isSelected = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(isSelected ? 'all' : cat)}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer shrink-0 border ${
                    isSelected
                      ? 'bg-brand-olive text-white border-brand-olive shadow-xs font-bold'
                      : 'bg-brand-surface-subtle border-brand-border text-brand-text hover:bg-brand-olive-light'
                  }`}
                >
                  <span>{cat}</span>
                  {categoryCounts[cat] !== undefined && (
                    <span className={`text-[10px] ml-1.5 ${isSelected ? 'text-white/80 font-bold' : 'text-brand-text-muted'}`}>
                      ({categoryCounts[cat]})
                    </span>
                  )}
                  {isSelected && <span className="text-[10px] ml-1 opacity-80">✕</span>}
                </button>
              );
            })}

            {/* Botão Ver Todas as Categorias no Modal */}
            {allCategories.length > 6 && (
              <button
                onClick={() => setIsFilterModalOpen(true)}
                className="px-3 py-1.5 rounded-xl font-bold shrink-0 text-brand-olive bg-brand-olive-light hover:bg-brand-olive-border/40 border border-dashed border-brand-olive-border transition-all cursor-pointer text-xs"
              >
                + Mais Categorias ({allCategories.length})
              </button>
            )}
          </div>
        </div>

        {/* Linha de Chips de Filtros Ativos no Desktop (Design inspirado no Mobile) */}
        {hasActiveFilters && (
          <div className="pt-2 border-t border-brand-border/70 flex flex-wrap items-center justify-between gap-3 animate-in fade-in duration-200">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-brand-text-muted text-xs font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-olive" />
                Filtros ativos:
              </span>

              {searchTerm && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-brand-olive/15 text-brand-olive-text border border-brand-olive/30 rounded-xl font-medium animate-in fade-in">
                  🔍 "{searchTerm}"
                  <button 
                    onClick={() => setSearchTerm('')} 
                    className="hover:text-red-500 font-bold ml-1 cursor-pointer"
                    title="Remover busca"
                  >
                    ×
                  </button>
                </span>
              )}

              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-brand-olive/15 text-brand-olive-text border border-brand-olive/30 rounded-xl font-medium animate-in fade-in">
                  🌱 Categoria: {selectedCategory}
                  <button 
                    onClick={() => setSelectedCategory('all')} 
                    className="hover:text-red-500 font-bold ml-1 cursor-pointer"
                    title="Remover categoria"
                  >
                    ×
                  </button>
                </span>
              )}

              {selectedCultivation !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-brand-olive/15 text-brand-olive-text border border-brand-olive/30 rounded-xl font-medium animate-in fade-in">
                  🪴 Cultivo: {selectedCultivation}
                  <button 
                    onClick={() => setSelectedCultivation('all')} 
                    className="hover:text-red-500 font-bold ml-1 cursor-pointer"
                    title="Remover cultivo"
                  >
                    ×
                  </button>
                </span>
              )}

              {selectedLocation !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-brand-olive/15 text-brand-olive-text border border-brand-olive/30 rounded-xl font-medium animate-in fade-in">
                  📍 Bancada: {selectedLocation}
                  <button 
                    onClick={handleClearLocation} 
                    className="hover:text-red-500 font-bold ml-1 cursor-pointer"
                    title="Remover bancada"
                  >
                    ×
                  </button>
                </span>
              )}

              {selectedLight !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-brand-olive/15 text-brand-olive-text border border-brand-olive/30 rounded-xl font-medium animate-in fade-in">
                  ☀️ Luz: {selectedLight === 'sol-pleno' ? 'Sol Pleno' : selectedLight === 'meia-sombra' ? 'Meia-Sombra' : 'Sombra'}
                  <button 
                    onClick={() => setSelectedLight('all')} 
                    className="hover:text-red-500 font-bold ml-1 cursor-pointer"
                    title="Remover luz"
                  >
                    ×
                  </button>
                </span>
              )}

              {selectedWater !== 'all' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-brand-olive/15 text-brand-olive-text border border-brand-olive/30 rounded-xl font-medium animate-in fade-in">
                  💧 Rega: {selectedWater === 'baixa' ? 'Baixa' : selectedWater === 'moderada' ? 'Moderada' : 'Frequente'}
                  <button 
                    onClick={() => setSelectedWater('all')} 
                    className="hover:text-red-500 font-bold ml-1 cursor-pointer"
                    title="Remover rega"
                  >
                    ×
                  </button>
                </span>
              )}

              {petFriendlyOnly && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-brand-nude-light text-brand-nude-text border border-brand-nude-border rounded-xl font-medium animate-in fade-in">
                  🐾 100% Pet Friendly
                  <button 
                    onClick={() => setPetFriendlyOnly(false)} 
                    className="hover:text-red-500 font-bold ml-1 cursor-pointer"
                    title="Remover pet friendly"
                  >
                    ×
                  </button>
                </span>
              )}
            </div>

            {/* Ações Rápidas: Limpar Todos e Total de Vasos */}
            <div className="flex items-center gap-4 text-xs">
              <button 
                onClick={handleResetFilters}
                className="text-brand-text-muted hover:text-brand-olive font-bold flex items-center gap-1.5 hover:underline cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Limpar Todos os Filtros
              </button>
              <span className="text-xs text-brand-text-muted font-medium bg-brand-surface-subtle px-2.5 py-1 rounded-lg border border-brand-border">
                {filteredAndSortedPlants.length} {filteredAndSortedPlants.length === 1 ? 'vaso' : 'vasos'}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Contagem de Resultados */}
      <div className="text-xs text-stone-500 px-1">
        {isLoading ? (
          <div className="h-4 w-44 bg-brand-surface-subtle animate-pulse rounded-md" />
        ) : (
          <span>
            Exibindo <strong>{filteredAndSortedPlants.length}</strong> vasos na vitrine
          </span>
        )}
      </div>

      {/* Grade de Plantas / Skeleton */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div 
              key={n} 
              className="bg-brand-surface rounded-2xl border border-brand-border overflow-hidden animate-pulse flex flex-col justify-between h-[380px]"
            >
              <div>
                <div className="h-52 bg-brand-surface-subtle" />
                <div className="p-5 space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="h-3 bg-brand-surface-subtle rounded w-20" />
                    <div className="h-3 bg-brand-surface-subtle rounded w-12" />
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="h-5 bg-brand-surface-subtle rounded w-36" />
                    <div className="h-5 bg-brand-surface-subtle rounded w-16" />
                  </div>
                  <div className="h-3 bg-brand-surface-subtle rounded w-28" />
                  <div className="flex gap-2 pt-2">
                    <div className="h-6 bg-brand-surface-subtle rounded-lg w-20" />
                    <div className="h-6 bg-brand-surface-subtle rounded-lg w-20" />
                  </div>
                </div>
              </div>
              <div className="p-5 pt-0">
                <div className="h-9 bg-brand-surface-subtle rounded-xl w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredAndSortedPlants.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedPlants.map((plant, idx) => (
            <PlantCard 
              key={plant.id} 
              plant={plant} 
              priority={idx < 3}
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

      {/* ======================================================== */}
      {/* 3. MODAL UNIFICADO DE FILTROS DESKTOP                     */}
      {/* ======================================================== */}
      {isFilterModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsFilterModalOpen(false)}
        >
          <div 
            className="bg-brand-surface rounded-3xl shadow-2xl border border-brand-border w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200 text-brand-text"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabeçalho do Modal */}
            <div className="p-6 border-b border-brand-border flex items-center justify-between bg-brand-surface-subtle">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-brand-olive-light text-brand-olive-text flex items-center justify-center shadow-xs">
                  <SlidersHorizontal className="w-5 h-5 text-brand-olive" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-brand-text font-serif-title flex items-center gap-2">
                    Filtros do Catálogo
                    {totalActiveFiltersCount > 0 && (
                      <span className="text-xs px-2.5 py-0.5 bg-brand-olive text-white rounded-full font-sans font-bold">
                        {totalActiveFiltersCount} {totalActiveFiltersCount === 1 ? 'ativo' : 'ativos'}
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-brand-text-muted">
                    Selecione categorias, bancadas físicas, tipo de cultivo e rotinas de cuidado
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="w-9 h-9 rounded-full bg-brand-border hover:bg-brand-border-subtle text-brand-text-muted hover:text-brand-text flex items-center justify-center transition-colors cursor-pointer"
                title="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Conteúdo Rolável do Modal (2 Colunas Elegantes) */}
            <div className="p-6 overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-2 gap-8 text-xs">
              
              {/* COLUNA ESQUERDA: Categoria, Cultivo e Bancadas */}
              <div className="space-y-6">
                
                {/* Seção 1: Categorias */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-brand-text text-sm flex items-center gap-1.5">
                      <span>🌿</span> Categorias da Loja
                    </h4>
                    {selectedCategory !== 'all' && (
                      <button 
                        onClick={() => setSelectedCategory('all')}
                        className="text-brand-olive font-bold hover:underline cursor-pointer text-[11px]"
                      >
                        Todas as categorias
                      </button>
                    )}
                  </div>

                  {/* Campo de Busca de Categorias */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-brand-text-light" />
                    <input
                      type="text"
                      value={categorySearchQuery}
                      onChange={(e) => setCategorySearchQuery(e.target.value)}
                      placeholder="Buscar categoria..."
                      className="w-full pl-9 pr-7 py-1.5 text-xs bg-brand-surface-subtle border border-brand-border rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-olive text-brand-text"
                    />
                    {categorySearchQuery && (
                      <button
                        onClick={() => setCategorySearchQuery('')}
                        className="absolute right-2 top-2 text-[10px] text-brand-text-muted hover:text-brand-text"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Grade de Categorias */}
                  <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto p-0.5">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer border ${
                        selectedCategory === 'all'
                          ? 'bg-brand-olive text-white border-brand-olive shadow-xs font-bold'
                          : 'bg-brand-surface-subtle border-brand-border text-brand-text hover:bg-brand-olive-light'
                      }`}
                    >
                      Todas ({categoryCounts.all || 0})
                    </button>
                    {filteredModalCategories.map((cat) => {
                      const isSelected = selectedCategory === cat;
                      const count = categoryCounts[cat] || 0;
                      return (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(isSelected ? 'all' : cat)}
                          className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer border flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-brand-olive text-white border-brand-olive shadow-xs font-bold'
                              : 'bg-brand-surface-subtle border-brand-border text-brand-text hover:bg-brand-olive-light'
                          }`}
                        >
                          <span>{cat}</span>
                          <span className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-brand-text-muted'}`}>
                            ({count})
                          </span>
                          {isSelected && <Check className="w-3 h-3 text-white font-bold" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Seção 2: Tipo de Cultivo */}
                <div className="space-y-3 pt-4 border-t border-brand-border">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-brand-text text-sm flex items-center gap-1.5">
                      <span>🪴</span> Tipo de Cultivo / Formato
                    </h4>
                    {selectedCultivation !== 'all' && (
                      <button 
                        onClick={() => setSelectedCultivation('all')}
                        className="text-brand-olive font-bold hover:underline cursor-pointer text-[11px]"
                      >
                        Todos os cultivos
                      </button>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    <button
                      onClick={() => setSelectedCultivation('all')}
                      className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer border ${
                        selectedCultivation === 'all'
                          ? 'bg-brand-olive text-white border-brand-olive shadow-xs font-bold'
                          : 'bg-brand-surface-subtle border-brand-border text-brand-text hover:bg-brand-olive-light'
                      }`}
                    >
                      Todos ({cultivationCounts.all || 0})
                    </button>
                    {allCultivations.map((cul) => {
                      const isSelected = selectedCultivation === cul;
                      const count = cultivationCounts[cul] || 0;
                      return (
                        <button
                          key={cul}
                          onClick={() => setSelectedCultivation(isSelected ? 'all' : cul)}
                          className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer border flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-brand-olive text-white border-brand-olive shadow-xs font-bold'
                              : 'bg-brand-surface-subtle border-brand-border text-brand-text hover:bg-brand-olive-light'
                          }`}
                        >
                          <span>{getCultivationIcon(cul)}</span>
                          <span>{cul}</span>
                          <span className={`text-[10px] ${isSelected ? 'text-white/80' : 'text-brand-text-muted'}`}>
                            ({count})
                          </span>
                          {isSelected && <Check className="w-3 h-3 text-white font-bold" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Seção 3: Bancadas & Setores da Loja */}
                <div className="space-y-3 pt-4 border-t border-brand-border">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-brand-text text-sm flex items-center gap-1.5">
                      <span>📍</span> Bancadas Físicas & Setores
                    </h4>
                    {selectedLocation !== 'all' && (
                      <button 
                        onClick={handleClearLocation}
                        className="text-brand-olive font-bold hover:underline cursor-pointer text-[11px]"
                      >
                        Todas as bancadas
                      </button>
                    )}
                  </div>

                  {/* Campo de Busca de Bancadas */}
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-brand-text-light" />
                    <input
                      type="text"
                      value={locationSearchQuery}
                      onChange={(e) => setLocationSearchQuery(e.target.value)}
                      placeholder="Buscar bancada ou setor..."
                      className="w-full pl-9 pr-7 py-1.5 text-xs bg-brand-surface-subtle border border-brand-border rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-olive text-brand-text"
                    />
                    {locationSearchQuery && (
                      <button
                        onClick={() => setLocationSearchQuery('')}
                        className="absolute right-2 top-2 text-[10px] text-brand-text-muted hover:text-brand-text"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {/* Grade de Bancadas */}
                  <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-0.5">
                    <button
                      onClick={handleClearLocation}
                      className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        selectedLocation === 'all'
                          ? 'bg-brand-olive-light border-brand-olive text-brand-olive-text font-bold shadow-xs'
                          : 'bg-brand-surface-subtle border-brand-border text-brand-text hover:bg-brand-olive-light'
                      }`}
                    >
                      <span className="truncate">Todas as Bancadas</span>
                      <span className="text-[10px] text-brand-text-muted ml-1 font-normal">
                        ({locationCounts.all || 0})
                      </span>
                    </button>
                    {filteredModalLocations.map((loc) => {
                      const isSelected = selectedLocation === loc;
                      const count = locationCounts[loc] || 0;
                      return (
                        <button
                          key={loc}
                          onClick={() => setSelectedLocation(isSelected ? 'all' : loc)}
                          className={`p-2.5 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-brand-olive-light border-brand-olive text-brand-olive-text font-bold shadow-xs'
                              : 'bg-brand-surface border-brand-border text-brand-text hover:bg-brand-olive-light'
                          }`}
                        >
                          <span className="truncate">📍 {loc}</span>
                          <span className="text-[10px] text-brand-text-muted ml-1 shrink-0 font-normal">
                            ({count})
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>

              {/* COLUNA DIREITA: Cuidados (Luz, Rega e Pets) */}
              <div className="space-y-6">
                
                {/* Seção 4: Luminosidade & Exposição Solar */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-brand-text text-sm flex items-center gap-1.5">
                      <Sun className="w-4 h-4 text-amber-500" />
                      Luminosidade & Exposição Solar
                    </h4>
                    {selectedLight !== 'all' && (
                      <button 
                        onClick={() => setSelectedLight('all')} 
                        className="text-[11px] text-brand-olive font-bold hover:underline cursor-pointer"
                      >
                        Qualquer sol
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* Qualquer */}
                    <button
                      onClick={() => setSelectedLight('all')}
                      className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        selectedLight === 'all'
                          ? 'bg-brand-olive-light border-brand-olive ring-1 ring-brand-olive/20 text-brand-olive-text font-bold shadow-xs'
                          : 'bg-brand-surface-subtle border-brand-border text-brand-text hover:bg-brand-olive-light'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-xs">Qualquer Luz</div>
                        <div className="text-[10px] text-brand-text-muted">Sem preferência solar</div>
                      </div>
                      {selectedLight === 'all' && <Check className="w-4 h-4 text-brand-olive font-bold" />}
                    </button>

                    {/* Sol Pleno */}
                    <button
                      onClick={() => setSelectedLight('sol-pleno')}
                      className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        selectedLight === 'sol-pleno'
                          ? 'bg-brand-olive-light border-brand-olive ring-1 ring-brand-olive/20 text-brand-olive-text font-bold shadow-xs'
                          : 'bg-brand-surface border-brand-border text-brand-text hover:bg-brand-olive-light'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <Sun className="w-4 h-4 text-brand-olive shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-xs">Sol Pleno</div>
                          <div className="text-[10px] text-brand-text-muted">4h+ sol direto/dia ({careCounts.solPleno})</div>
                        </div>
                      </div>
                      {selectedLight === 'sol-pleno' && <Check className="w-3.5 h-3.5 text-brand-olive font-bold" />}
                    </button>

                    {/* Meia Sombra */}
                    <button
                      onClick={() => setSelectedLight('meia-sombra')}
                      className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        selectedLight === 'meia-sombra'
                          ? 'bg-brand-olive-light border-brand-olive ring-1 ring-brand-olive/20 text-brand-olive-text font-bold shadow-xs'
                          : 'bg-brand-surface border-brand-border text-brand-text hover:bg-brand-olive-light'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <CloudSun className="w-4 h-4 text-brand-olive shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-xs">Meia Sombra</div>
                          <div className="text-[10px] text-brand-text-muted">Luz indireta ({careCounts.meiaSombra})</div>
                        </div>
                      </div>
                      {selectedLight === 'meia-sombra' && <Check className="w-3.5 h-3.5 text-brand-olive font-bold" />}
                    </button>

                    {/* Sombra Difusa */}
                    <button
                      onClick={() => setSelectedLight('sombra-difusa')}
                      className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        selectedLight === 'sombra-difusa'
                          ? 'bg-brand-olive-light border-brand-olive ring-1 ring-brand-olive/20 text-brand-olive-text font-bold shadow-xs'
                          : 'bg-brand-surface border-brand-border text-brand-text hover:bg-brand-olive-light'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <Cloud className="w-4 h-4 text-brand-olive shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-xs">Sombra Difusa</div>
                          <div className="text-[10px] text-brand-text-muted">Sem sol direto ({careCounts.sombraDifusa})</div>
                        </div>
                      </div>
                      {selectedLight === 'sombra-difusa' && <Check className="w-3.5 h-3.5 text-brand-olive font-bold" />}
                    </button>
                  </div>
                </div>

                {/* Seção 5: Frequência de Rega */}
                <div className="space-y-3 pt-4 border-t border-brand-border">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-brand-text text-sm flex items-center gap-1.5">
                      <Droplets className="w-4 h-4 text-brand-olive" />
                      Frequência de Rega
                    </h4>
                    {selectedWater !== 'all' && (
                      <button 
                        onClick={() => setSelectedWater('all')} 
                        className="text-[11px] text-brand-olive font-bold hover:underline cursor-pointer"
                      >
                        Qualquer rega
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* Qualquer */}
                    <button
                      onClick={() => setSelectedWater('all')}
                      className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        selectedWater === 'all'
                          ? 'bg-brand-olive-light border-brand-olive ring-1 ring-brand-olive/20 text-brand-olive-text font-bold shadow-xs'
                          : 'bg-brand-surface-subtle border-brand-border text-brand-text hover:bg-brand-olive-light'
                      }`}
                    >
                      <div>
                        <div className="font-bold text-xs">Qualquer Rega</div>
                        <div className="text-[10px] text-brand-text-muted">Sem preferência</div>
                      </div>
                      {selectedWater === 'all' && <Check className="w-4 h-4 text-brand-olive font-bold" />}
                    </button>

                    {/* Pouca Rega */}
                    <button
                      onClick={() => setSelectedWater('baixa')}
                      className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        selectedWater === 'baixa'
                          ? 'bg-brand-olive-light border-brand-olive ring-1 ring-brand-olive/20 text-brand-olive-text font-bold shadow-xs'
                          : 'bg-brand-surface border-brand-border text-brand-text hover:bg-brand-olive-light'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <Droplets className="w-4 h-4 text-brand-olive shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-xs">Pouca Rega</div>
                          <div className="text-[10px] text-brand-text-muted">Solo seco (1x cada 10-15d) ({careCounts.poucaRega})</div>
                        </div>
                      </div>
                      {selectedWater === 'baixa' && <Check className="w-3.5 h-3.5 text-brand-olive font-bold" />}
                    </button>

                    {/* Rega Moderada */}
                    <button
                      onClick={() => setSelectedWater('moderada')}
                      className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        selectedWater === 'moderada'
                          ? 'bg-brand-olive-light border-brand-olive ring-1 ring-brand-olive/20 text-brand-olive-text font-bold shadow-xs'
                          : 'bg-brand-surface border-brand-border text-brand-text hover:bg-brand-olive-light'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <Droplet className="w-4 h-4 text-brand-olive shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-xs">Moderada</div>
                          <div className="text-[10px] text-brand-text-muted">1 a 2x por semana ({careCounts.regaModerada})</div>
                        </div>
                      </div>
                      {selectedWater === 'moderada' && <Check className="w-3.5 h-3.5 text-brand-olive font-bold" />}
                    </button>

                    {/* Rega Frequente */}
                    <button
                      onClick={() => setSelectedWater('frequente')}
                      className={`p-3 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                        selectedWater === 'frequente'
                          ? 'bg-brand-olive-light border-brand-olive ring-1 ring-brand-olive/20 text-brand-olive-text font-bold shadow-xs'
                          : 'bg-brand-surface border-brand-border text-brand-text hover:bg-brand-olive-light'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <Droplets className="w-4 h-4 text-brand-olive shrink-0 mt-0.5" />
                        <div>
                          <div className="font-bold text-xs">Frequente</div>
                          <div className="text-[10px] text-brand-text-muted">Solo sempre úmido ({careCounts.regaFrequente})</div>
                        </div>
                      </div>
                      {selectedWater === 'frequente' && <Check className="w-3.5 h-3.5 text-brand-olive font-bold" />}
                    </button>
                  </div>
                </div>

                {/* Seção 6: Segurança com Pets */}
                <div className="space-y-3 pt-4 border-t border-brand-border">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-brand-text text-sm flex items-center gap-1.5">
                      <Heart className="w-4 h-4 text-brand-nude" />
                      Segurança Pet & Crianças
                    </h4>
                  </div>

                  <button
                    onClick={() => setPetFriendlyOnly(!petFriendlyOnly)}
                    className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                      petFriendlyOnly
                        ? 'bg-brand-nude-light border-brand-nude ring-1 ring-brand-nude/20 text-brand-nude-text font-bold shadow-xs'
                        : 'bg-brand-surface border-brand-border text-brand-text hover:bg-brand-nude-light'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        petFriendlyOnly ? 'bg-brand-nude text-white' : 'bg-brand-nude-light text-brand-nude-text'
                      }`}>
                        <Heart className={`w-5 h-5 ${petFriendlyOnly ? 'fill-white text-white' : 'fill-brand-nude text-brand-nude'}`} />
                      </div>
                      <div>
                        <div className="font-bold text-xs sm:text-sm">100% Pet Friendly (Não Tóxica)</div>
                        <div className="text-[11px] text-brand-text-muted">
                          Espécies seguras para cães e gatos ({careCounts.petFriendly} vasos)
                        </div>
                      </div>
                    </div>
                    {petFriendlyOnly ? (
                      <span className="px-3 py-1 bg-brand-nude text-white rounded-xl text-[10px] font-bold">
                        Ativo ✓
                      </span>
                    ) : (
                      <span className="text-[11px] text-brand-text-muted font-medium">
                        Desativado
                      </span>
                    )}
                  </button>
                </div>

              </div>

            </div>

            {/* Rodapé Fixo do Modal Desktop */}
            <div className="p-5 border-t border-brand-border bg-brand-surface-subtle flex items-center justify-between text-xs">
              <button
                onClick={handleResetFilters}
                className="text-brand-text-muted hover:text-brand-olive font-bold flex items-center gap-1.5 hover:underline cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Limpar Todos os Filtros
              </button>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => setIsFilterModalOpen(false)}
                  className="px-4 py-2.5 bg-brand-border hover:bg-brand-border-subtle text-brand-text font-bold rounded-xl transition-colors cursor-pointer"
                >
                  Fechar
                </button>
                <button
                  onClick={() => setIsFilterModalOpen(false)}
                  className="px-6 py-2.5 bg-brand-olive hover:bg-brand-olive-hover text-white font-bold rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-2"
                >
                  <span>Ver {filteredAndSortedPlants.length} Vasos na Vitrine</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 4. MODAL / BOTTOM SHEET DE FILTROS MOBILE & TABLET       */}
      {/* ======================================================== */}
      <div 
        className={`lg:hidden fixed inset-0 z-50 transition-all duration-300 ${
          isMobileFilterSheetOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Backdrop escuro */}
        <div 
          onClick={() => setIsMobileFilterSheetOpen(false)}
          className="absolute inset-0 bg-black/75 backdrop-blur-xs transition-opacity duration-300"
        />

        {/* Painel Inferior (Bottom Sheet) */}
        <div 
          className={`absolute bottom-0 left-0 right-0 max-h-[85vh] bg-brand-surface text-brand-text rounded-t-[28px] border-t border-brand-border shadow-2xl flex flex-col p-5 transition-transform duration-300 ease-out z-10 ${
            isMobileFilterSheetOpen ? 'translate-y-0' : 'translate-y-full'
          }`}
        >
          {/* Puxador Superior */}
          <div className="w-12 h-1.5 bg-brand-border rounded-full mx-auto mb-3 shrink-0" />

          {/* Header do Sheet */}
          <div className="flex items-center justify-between pb-3 border-b border-brand-border shrink-0">
            <div>
              <h3 className="font-bold text-sm text-brand-text font-serif-title">Filtros de Plantas</h3>
              <p className="text-[11px] text-brand-text-muted">Escolha categorias, bancadas e cuidados</p>
            </div>
            <button 
              onClick={() => setIsMobileFilterSheetOpen(false)}
              className="w-8 h-8 rounded-xl bg-brand-surface-subtle text-brand-text-muted hover:text-brand-text flex items-center justify-center text-xs border border-brand-border cursor-pointer"
              title="Fechar filtros"
            >
              ✕
            </button>
          </div>

          {/* Corpo Rolável com os Filtros */}
          <div className="flex-1 overflow-y-auto py-3 space-y-4 text-xs">
            
            {/* Seção 1: Categorias */}
            <div>
              <h4 className="font-bold text-brand-text mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">🌿 Categorias</span>
                <span className="text-[10px] text-brand-olive font-semibold">{allCategories.length} tipos</span>
              </h4>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto no-scrollbar p-0.5">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                    selectedCategory === 'all'
                      ? 'bg-brand-olive text-white shadow-xs font-bold'
                      : 'bg-brand-surface-subtle text-brand-text border border-brand-border hover:bg-brand-olive-light'
                  }`}
                >
                  Todas ({categoryCounts.all || 0})
                </button>
                {allCategories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat === selectedCategory ? 'all' : cat)}
                    className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-brand-olive text-white shadow-xs font-bold'
                        : 'bg-brand-surface-subtle text-brand-text border border-brand-border hover:bg-brand-olive-light'
                    }`}
                  >
                    {cat} {categoryCounts[cat] !== undefined && `(${categoryCounts[cat]})`}
                  </button>
                ))}
              </div>
            </div>

            {/* Seção: Tipo de Cultivo */}
            <div>
              <h4 className="font-bold text-brand-text mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">🪴 Tipo de Cultivo</span>
                <span className="text-[10px] text-brand-olive font-semibold">{allCultivations.length} tipos</span>
              </h4>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto no-scrollbar p-0.5">
                <button
                  onClick={() => setSelectedCultivation('all')}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                    selectedCultivation === 'all'
                      ? 'bg-brand-olive text-white shadow-xs font-bold'
                      : 'bg-brand-surface-subtle text-brand-text border border-brand-border hover:bg-brand-olive-light'
                  }`}
                >
                  Todos ({cultivationCounts.all || 0})
                </button>
                {allCultivations.map(cul => (
                  <button
                    key={cul}
                    onClick={() => setSelectedCultivation(cul === selectedCultivation ? 'all' : cul)}
                    className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                      selectedCultivation === cul
                        ? 'bg-brand-olive text-white shadow-xs font-bold'
                        : 'bg-brand-surface-subtle text-brand-text border border-brand-border hover:bg-brand-olive-light'
                    }`}
                  >
                    {cul} {cultivationCounts[cul] !== undefined && `(${cultivationCounts[cul]})`}
                  </button>
                ))}
              </div>
            </div>

            {/* Seção 2: Bancadas & Setores */}
            <div>
              <h4 className="font-bold text-brand-text mb-2 flex items-center justify-between">
                <span className="flex items-center gap-1.5">📍 Bancadas & Setores</span>
                <span className="text-[10px] text-brand-olive font-semibold">{allLocations.length} locais</span>
              </h4>
              <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto no-scrollbar p-0.5">
                <button
                  onClick={() => handleClearLocation()}
                  className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                    selectedLocation === 'all'
                      ? 'bg-brand-olive text-white shadow-xs font-bold'
                      : 'bg-brand-surface-subtle text-brand-text border border-brand-border hover:bg-brand-olive-light'
                  }`}
                >
                  Todas ({locationCounts.all || 0})
                </button>
                {allLocations.map(loc => (
                  <button
                    key={loc}
                    onClick={() => setSelectedLocation(loc === selectedLocation ? 'all' : loc)}
                    className={`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${
                      selectedLocation === loc
                        ? 'bg-brand-olive text-white shadow-xs font-bold'
                        : 'bg-brand-surface-subtle text-brand-text border border-brand-border hover:bg-brand-olive-light'
                    }`}
                  >
                    {loc} {locationCounts[loc] !== undefined && `(${locationCounts[loc]})`}
                  </button>
                ))}
              </div>
            </div>

            {/* Seção 3: Necessidade de Luz */}
            <div>
              <h4 className="font-bold text-brand-text mb-2">☀️ Necessidade de Luz</h4>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => setSelectedLight(selectedLight === 'sol-pleno' ? 'all' : 'sol-pleno')}
                  className={`p-2 rounded-xl font-semibold text-center transition-all cursor-pointer border ${
                    selectedLight === 'sol-pleno'
                      ? 'bg-brand-olive text-white border-brand-olive shadow-xs font-bold'
                      : 'bg-brand-surface-subtle border-brand-border text-brand-text'
                  }`}
                >
                  Sol Pleno
                </button>
                <button
                  onClick={() => setSelectedLight(selectedLight === 'meia-sombra' ? 'all' : 'meia-sombra')}
                  className={`p-2 rounded-xl font-semibold text-center transition-all cursor-pointer border ${
                    selectedLight === 'meia-sombra'
                      ? 'bg-brand-olive text-white border-brand-olive shadow-xs font-bold'
                      : 'bg-brand-surface-subtle border-brand-border text-brand-text'
                  }`}
                >
                  Meia-Sombra
                </button>
                <button
                  onClick={() => setSelectedLight(selectedLight === 'sombra-difusa' ? 'all' : 'sombra-difusa')}
                  className={`p-2 rounded-xl font-semibold text-center transition-all cursor-pointer border ${
                    selectedLight === 'sombra-difusa'
                      ? 'bg-brand-olive text-white border-brand-olive shadow-xs font-bold'
                      : 'bg-brand-surface-subtle border-brand-border text-brand-text'
                  }`}
                >
                  Sombra
                </button>
              </div>
            </div>

            {/* Seção 4: Rega */}
            <div>
              <h4 className="font-bold text-brand-text mb-2">💧 Frequência de Rega</h4>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => setSelectedWater(selectedWater === 'baixa' ? 'all' : 'baixa')}
                  className={`p-2 rounded-xl font-semibold text-center transition-all cursor-pointer border ${
                    selectedWater === 'baixa'
                      ? 'bg-brand-olive text-white border-brand-olive shadow-xs font-bold'
                      : 'bg-brand-surface-subtle border-brand-border text-brand-text'
                  }`}
                >
                  Pouca Rega
                </button>
                <button
                  onClick={() => setSelectedWater(selectedWater === 'moderada' ? 'all' : 'moderada')}
                  className={`p-2 rounded-xl font-semibold text-center transition-all cursor-pointer border ${
                    selectedWater === 'moderada'
                      ? 'bg-brand-olive text-white border-brand-olive shadow-xs font-bold'
                      : 'bg-brand-surface-subtle border-brand-border text-brand-text'
                  }`}
                >
                  Moderada
                </button>
                <button
                  onClick={() => setSelectedWater(selectedWater === 'frequente' ? 'all' : 'frequente')}
                  className={`p-2 rounded-xl font-semibold text-center transition-all cursor-pointer border ${
                    selectedWater === 'frequente'
                      ? 'bg-brand-olive text-white border-brand-olive shadow-xs font-bold'
                      : 'bg-brand-surface-subtle border-brand-border text-brand-text'
                  }`}
                >
                  Frequente
                </button>
              </div>
            </div>

            {/* Seção 5: Pet Friendly */}
            <div>
              <button
                onClick={() => setPetFriendlyOnly(!petFriendlyOnly)}
                className={`w-full p-2.5 rounded-xl font-semibold flex items-center justify-between transition-all cursor-pointer border ${
                  petFriendlyOnly
                    ? 'bg-brand-nude-light border-brand-nude-border text-brand-nude-text font-bold shadow-xs'
                    : 'bg-brand-surface-subtle border-brand-border text-brand-text hover:bg-brand-nude-light'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Heart className={`w-4 h-4 ${petFriendlyOnly ? 'text-brand-nude fill-brand-nude' : 'text-brand-text-light'}`} />
                  <span>Amigas de Cães e Gatos (Pet Friendly)</span>
                </div>
                <span className="text-[10px] font-bold">
                  {petFriendlyOnly ? '✓ Ativo' : 'Desativado'}
                </span>
              </button>
            </div>

          </div>

          {/* Footer do Sheet */}
          <div className="pt-3 border-t border-brand-border flex gap-2 shrink-0">
            <button 
              onClick={handleResetFilters}
              className="w-1/3 py-2.5 bg-brand-surface-subtle border border-brand-border text-brand-text rounded-xl font-semibold text-xs hover:bg-brand-olive-light cursor-pointer"
            >
              Limpar
            </button>
            <button 
              onClick={() => setIsMobileFilterSheetOpen(false)}
              className="w-2/3 py-2.5 bg-brand-olive text-white rounded-xl font-bold text-xs hover:bg-brand-olive-hover shadow-xs cursor-pointer"
            >
              Ver Vasos ({filteredAndSortedPlants.length})
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

