import React, { useState, useMemo } from 'react';
import { Search, Flower2, Sprout, Sun, CloudSun, Heart, Droplets, SlidersHorizontal, RotateCcw } from 'lucide-react';
import type { Plant, PlantCategory } from '../types/plant';
import { PlantCard } from './PlantCard';

interface ShowcaseViewProps {
  plants: Plant[];
  onSelectPlant: (plant: Plant) => void;
}

export const ShowcaseView: React.FC<ShowcaseViewProps> = ({ plants, onSelectPlant }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLight, setSelectedLight] = useState<string>('all');
  const [selectedWater, setSelectedWater] = useState<string>('all');
  const [petFriendlyOnly, setPetFriendlyOnly] = useState<boolean>(false);

  const categories: PlantCategory[] = [
    'Folhagens',
    'Pendentes',
    'Suculentas & Cactos',
    'Flores',
    'Arbustos & Árvores',
    'Ervas & Temperos',
  ];

  // Filtro inteligente
  const filteredPlants = useMemo(() => {
    return plants.filter(plant => {
      // Busca textual
      const matchesSearch =
        searchTerm === '' ||
        plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plant.scientificName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plant.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plant.id.toLowerCase().includes(searchTerm.toLowerCase());

      // Categoria
      const matchesCategory = selectedCategory === 'all' || plant.category === selectedCategory;

      // Luz
      const matchesLight = selectedLight === 'all' || plant.light === selectedLight;

      // Rega
      const matchesWater = selectedWater === 'all' || plant.watering === selectedWater;

      // Pets
      const matchesPets = !petFriendlyOnly || plant.petFriendly;

      return matchesSearch && matchesCategory && matchesLight && matchesWater && matchesPets;
    });
  }, [plants, searchTerm, selectedCategory, selectedLight, selectedWater, petFriendlyOnly]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedLight('all');
    setSelectedWater('all');
    setPetFriendlyOnly(false);
  };

  const hasActiveFilters =
    searchTerm !== '' ||
    selectedCategory !== 'all' ||
    selectedLight !== 'all' ||
    selectedWater !== 'all' ||
    petFriendlyOnly;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12 animate-in fade-in duration-300">
      
      {/* Banner Principal / Hero */}
      <div className="relative bg-gradient-to-br from-emerald-950 via-emerald-900 to-stone-900 rounded-3xl p-6 sm:p-10 text-white overflow-hidden shadow-xl border border-emerald-800/40">
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-800/70 backdrop-blur-md rounded-full text-xs font-semibold text-emerald-200 border border-emerald-700/50">
            <Flower2 className="w-3.5 h-3.5 text-emerald-400" />
            Tons & Flores • Catálogo Digital da Loja
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-serif-title leading-tight text-white m-0">
            Encontre a planta perfeita para o seu espaço.
          </h1>
          <p className="text-xs sm:text-sm text-stone-300 leading-relaxed max-w-xl">
            Explore nossas espécies disponíveis, conheça as necessidades de luz e rega de cada vaso e venha nos visitar!
          </p>
        </div>

        {/* Efeito decorativo botanical */}
        <div className="absolute -right-8 -bottom-10 opacity-15 pointer-events-none text-emerald-400">
          <Sprout className="w-72 h-72" />
        </div>
      </div>

      {/* Caixa de Busca e Filtros Rápidos */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm space-y-4">
        
        {/* Campo de Busca */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-3.5 text-stone-400" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por nome popular, científico, tag #TF ou categoria..." 
            className="w-full pl-12 pr-10 py-3 text-sm bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium transition-all"
          />
          {searchTerm && (
            <button 
              onClick={() => setSearchTerm('')}
              className="absolute right-3.5 top-3 text-xs text-stone-400 hover:text-stone-700 bg-stone-200 hover:bg-stone-300 w-5 h-5 rounded-full flex items-center justify-center font-bold cursor-pointer"
            >
              ✕
            </button>
          )}
        </div>

        {/* Categorias (Chips) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
          <button 
            onClick={() => setSelectedCategory('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
              selectedCategory === 'all' 
                ? 'bg-emerald-800 text-white shadow-sm' 
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            Todas as Categorias ({plants.length})
          </button>
          {categories.map((cat) => (
            <button 
              key={cat}
              onClick={() => setSelectedCategory(selectedCategory === cat ? 'all' : cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all cursor-pointer ${
                selectedCategory === cat 
                  ? 'bg-emerald-800 text-white shadow-sm' 
                  : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Filtros de Cuidados Específicos */}
        <div className="pt-2 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-stone-400 uppercase text-[10px] mr-1 flex items-center gap-1">
              <SlidersHorizontal className="w-3 h-3" /> Cuidados:
            </span>

            {/* Sol Pleno */}
            <button 
              onClick={() => setSelectedLight(selectedLight === 'sol-pleno' ? 'all' : 'sol-pleno')}
              className={`px-3 py-1 rounded-lg font-medium flex items-center gap-1.5 border transition-all cursor-pointer ${
                selectedLight === 'sol-pleno' 
                  ? 'bg-amber-100 border-amber-300 text-amber-900 font-bold' 
                  : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              Sol Pleno
            </button>

            {/* Meia Sombra */}
            <button 
              onClick={() => setSelectedLight(selectedLight === 'meia-sombra' ? 'all' : 'meia-sombra')}
              className={`px-3 py-1 rounded-lg font-medium flex items-center gap-1.5 border transition-all cursor-pointer ${
                selectedLight === 'meia-sombra' 
                  ? 'bg-orange-100 border-orange-300 text-orange-900 font-bold' 
                  : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
              }`}
            >
              <CloudSun className="w-3.5 h-3.5 text-orange-500" />
              Meia Sombra
            </button>

            {/* Pet Friendly */}
            <button 
              onClick={() => setPetFriendlyOnly(!petFriendlyOnly)}
              className={`px-3 py-1 rounded-lg font-medium flex items-center gap-1.5 border transition-all cursor-pointer ${
                petFriendlyOnly 
                  ? 'bg-emerald-100 border-emerald-300 text-emerald-900 font-bold' 
                  : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
              }`}
            >
              <Heart className={`w-3.5 h-3.5 ${petFriendlyOnly ? 'text-emerald-700 fill-emerald-600' : 'text-stone-400'}`} />
              Pet Friendly (Segura)
            </button>

            {/* Pouca Rega */}
            <button 
              onClick={() => setSelectedWater(selectedWater === 'baixa' ? 'all' : 'baixa')}
              className={`px-3 py-1 rounded-lg font-medium flex items-center gap-1.5 border transition-all cursor-pointer ${
                selectedWater === 'baixa' 
                  ? 'bg-blue-100 border-blue-300 text-blue-900 font-bold' 
                  : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
              }`}
            >
              <Droplets className="w-3.5 h-3.5 text-blue-500" />
              Pouca Rega (Fácil de Cuidar)
            </button>
          </div>

          {hasActiveFilters && (
            <button 
              onClick={handleResetFilters}
              className="text-stone-500 hover:text-emerald-800 font-semibold flex items-center gap-1 hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Limpar Filtros
            </button>
          )}
        </div>
      </div>

      {/* Contagem de Resultados */}
      <div className="flex items-center justify-between text-xs text-stone-500 px-1">
        <span>
          Exibindo <strong>{filteredPlants.length}</strong> de {plants.length} vasos disponíveis
        </span>
        {hasActiveFilters && (
          <span className="text-emerald-700 font-medium">
            (Filtros ativos aplicados)
          </span>
        )}
      </div>

      {/* Grade de Plantas */}
      {filteredPlants.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlants.map((plant) => (
            <PlantCard 
              key={plant.id} 
              plant={plant} 
              onSelect={onSelectPlant} 
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 shadow-sm space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto text-stone-400">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-stone-800 font-serif-title">Nenhuma planta encontrada</h3>
          <p className="text-xs text-stone-500">
            Não encontramos resultados para a sua busca atual. Tente buscar por outro termo ou limpe os filtros.
          </p>
          <button 
            onClick={handleResetFilters}
            className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow transition-colors cursor-pointer"
          >
            Ver Todas as Plantas
          </button>
        </div>
      )}

    </div>
  );
};
