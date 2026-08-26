import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Sparkles, Image as ImageIcon, MapPin, Upload, Search, Loader2, AlertCircle } from 'lucide-react';
import type { Plant, LightRequirement, WateringFrequency, PlantStatus } from '../types/plant';
import { plantService } from '../services/plantService';
import { configService } from '../services/configService';
import { perenualService } from '../services/perenualService';

interface PlantFormModalProps {
  plantToEdit?: Plant | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (plant: Plant) => void;
}

const PRESET_PHOTOS = [
  { label: 'Costela de Adão', url: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80' },
  { label: 'Jiboia / Pendente', url: 'https://images.unsplash.com/photo-1596724855579-2475e638b368?auto=format&fit=crop&w=800&q=80' },
  { label: 'Zamioculca', url: 'https://images.unsplash.com/photo-1632207691143-643e2a9a9361?auto=format&fit=crop&w=800&q=80' },
  { label: 'Ficus / Árvore', url: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=800&q=80' },
  { label: 'Espada de S. Jorge', url: 'https://images.unsplash.com/photo-1593482892290-f54927ae1bf6?auto=format&fit=crop&w=800&q=80' },
  { label: 'Suculenta', url: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=800&q=80' },
];

const WATERING_OPTIONS = [
  { value: 'baixa',     label: 'Pouca Rega (Solo Seco)',     emoji: '💧' },
  { value: 'moderada',  label: 'Moderada (1-2x/sem)',        emoji: '💧💧' },
  { value: 'frequente', label: 'Solo Sempre Úmido',          emoji: '💧💧💧' },
];

export const PlantFormModal: React.FC<PlantFormModalProps> = ({ plantToEdit, isOpen, onClose, onSave }) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [formData, setFormData] = useState<Partial<Plant>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFileName, setUploadedFileName] = useState('');

  // Perenual API Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [apiError, setApiError] = useState('');
  const [showResultsDropdown, setShowResultsDropdown] = useState(false);

  useEffect(() => {
    setCategories(configService.getCategories());
  }, [isOpen]);

  useEffect(() => {
    const cats = configService.getCategories();
    if (plantToEdit) {
      setFormData(plantToEdit);
      setUploadedFileName('');
      setSearchQuery('');
      setSearchResults([]);
      setApiError('');
    } else {
      setFormData({
        id: plantService.generateNextId(),
        name: '',
        scientificName: '',
        category: cats[0] || 'Folhagens',
        price: 45.0,
        potSize: 'Pote 15',
        location: 'Estufa 01 • Bancada A',
        status: 'disponivel',
        light: 'meia-sombra',
        watering: 'moderada',
        petFriendly: false,
        wateringTip: 'Regar 1 a 2 vezes na semana.',
        careInstructions: 'Manter em local bem iluminado sem sol direto.',
        imageUrl: PRESET_PHOTOS[0].url,
        family: '',
        origin: '',
        cycle: '',
        bloomingSeason: '',
        pestsDiseases: '',
        toxicity: '',
      });
      setUploadedFileName('');
      setSearchQuery('');
      setSearchResults([]);
      setApiError('');
    }
  }, [plantToEdit, isOpen]);

  if (!isOpen) return null;

  // Busca espécies permitindo tanto Nome Popular (ex: Costela de Adão) quanto Nome Científico (ex: Monstera deliciosa)
  const handleSearchPerenual = async () => {
    const apiKey = perenualService.getApiKey();
    if (!apiKey) {
      setApiError('Configuração Necessária: Defina VITE_PERENUAL_API_KEY no arquivo .env ou no painel de segredos do host.');
      return;
    }
    if (!searchQuery.trim()) {
      setApiError('Digite o nome popular ou científico (ex: Costela de Adão, Monstera, Jiboia, Zamioculca).');
      return;
    }

    setIsSearching(true);
    setApiError('');
    setSearchResults([]);
    setShowResultsDropdown(false);

    try {
      const results = await perenualService.searchSpecies(searchQuery);
      if (results && results.length > 0) {
        setSearchResults(results.slice(0, 6));
        setShowResultsDropdown(true);
      } else {
        setApiError('Nenhuma planta encontrada. Tente buscar pelo nome científico ou outro sinônimo.');
      }
    } catch (err: any) {
      setApiError(err.message || 'Erro ao conectar com a base de dados botânica.');
    } finally {
      setIsSearching(false);
    }
  };

  // Ao selecionar uma espécie, preenche Nome Popular, Nome Científico e toda a ficha botânica
  const handleSelectSpecies = async (speciesId: number) => {
    setIsSearching(true);
    setShowResultsDropdown(false);
    setApiError('');

    try {
      const details = await perenualService.getSpeciesDetails(speciesId, searchQuery);

      setFormData(prev => ({
        ...prev,
        name: details.name || prev.name,
        scientificName: details.scientificName || prev.scientificName,
        light: details.light,
        watering: details.watering,
        petFriendly: details.petFriendly,
        imageUrl: details.imageUrl || prev.imageUrl,
        wateringTip: details.wateringTip || prev.wateringTip,
        careInstructions: details.careInstructions || prev.careInstructions,
        family: details.family || '',
        origin: details.origin || '',
        cycle: details.cycle || '',
        bloomingSeason: details.bloomingSeason || '',
        pestsDiseases: details.pestsDiseases || '',
        toxicity: details.toxicity || '',
      }));

    } catch (err: any) {
      setApiError(err.message || 'Erro ao carregar detalhes botânicos.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Redimensiona para no máximo 800px e converte para JPEG 80% para economizar espaço
    const reader = new FileReader();
    reader.onload = (evt) => {
      const img = new Image();
      img.onload = () => {
        const maxW = 800;
        const scale = img.width > maxW ? maxW / img.width : 1;
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setFormData(prev => ({ ...prev, imageUrl: dataUrl }));
        setUploadedFileName(file.name);
      };
      img.src = evt.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.id) return;

    const finalPlant: Plant = {
      id: formData.id!,
      name: formData.name!,
      scientificName: formData.scientificName || formData.name!,
      category: formData.category || categories[0] || 'Folhagens',
      price: Number(formData.price) || 0,
      potSize: formData.potSize || 'Pote 15',
      location: formData.location || 'Loja',
      status: (formData.status as PlantStatus) || 'disponivel',
      light: (formData.light as LightRequirement) || 'meia-sombra',
      watering: (formData.watering as WateringFrequency) || 'moderada',
      petFriendly: Boolean(formData.petFriendly),
      wateringTip: formData.wateringTip || '',
      careInstructions: formData.careInstructions || '',
      family: formData.family || '',
      origin: formData.origin || '',
      cycle: formData.cycle || '',
      bloomingSeason: formData.bloomingSeason || '',
      pestsDiseases: formData.pestsDiseases || '',
      toxicity: formData.toxicity || '',
      imageUrl: formData.imageUrl || PRESET_PHOTOS[0].url,
      createdAt: plantToEdit?.createdAt || new Date().toISOString(),
    };

    onSave(finalPlant);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200 flex flex-col max-h-[90vh]">
        
        {/* Cabeçalho */}
        <div className="bg-stone-900 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-bold text-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif-title leading-tight">
                {plantToEdit ? 'Editar Planta / Vaso' : 'Cadastrar Nova Planta'}
              </h2>
              <p className="text-xs text-stone-400">Preencha os dados e cuidados do vaso</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-white rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário com Scroll */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1 text-sm text-stone-800">
          
          {/* SEÇÃO INTEGRADA: Busca Botânica Automática */}
          {!plantToEdit && (
            <div className="bg-stone-50 border border-emerald-100 rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-800">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                Classificação Botânica Automática
              </div>
              <p className="text-xs text-stone-500">
                Pesquise pelo <strong>Nome Popular</strong> (ex: <em>Costela de Adão</em>, <em>Espada de São Jorge</em>, <em>Jiboia</em>) ou pelo <strong>Nome Científico</strong> (ex: <em>Monstera deliciosa</em>) para preencher a ficha completa.
              </p>
              <div className="relative flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Buscar por nome comum ou científico..."
                  className="flex-1 px-3 py-2 text-xs bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSearchPerenual();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleSearchPerenual}
                  disabled={isSearching}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:bg-stone-400 text-white text-xs font-semibold rounded-xl cursor-pointer transition-colors flex items-center gap-1.5"
                >
                  {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                  Buscar
                </button>

                {/* Dropdown de Resultados de Busca */}
                {showResultsDropdown && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-stone-200 rounded-xl shadow-lg z-30 max-h-56 overflow-y-auto divide-y divide-stone-100 animate-in fade-in slide-in-from-top-1">
                    {searchResults.map((species: any) => (
                      <button
                        key={species.id}
                        type="button"
                        onClick={() => handleSelectSpecies(species.id)}
                        className="w-full px-4 py-2.5 text-left text-xs hover:bg-emerald-50 transition-colors flex items-center justify-between group cursor-pointer"
                      >
                        <div>
                          <div className="font-bold text-stone-900 group-hover:text-emerald-900">
                            {species.matchedPtName || species.common_name || 'Desconhecida'}
                          </div>
                          <div className="text-stone-500 italic text-[11px]">
                            {species.scientific_name ? species.scientific_name.join(', ') : ''}
                          </div>
                        </div>
                        {species.default_image && (
                          <img
                            src={species.default_image.thumbnail || species.default_image.original_url}
                            alt=""
                            className="w-8 h-8 rounded-lg object-cover border"
                          />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {apiError && (
                <div className="text-xs text-rose-600 flex items-center gap-1.5 mt-1 font-medium bg-rose-50/50 p-2 rounded-xl border border-rose-100">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {apiError}
                </div>
              )}
            </div>
          )}

          {/* BLOCO 1: Identificação Básica */}
          <div className="space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-800 border-b pb-1">
              1. Identificação Básica
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Código / Tag Única *
                </label>
                <input 
                  type="text" 
                  required
                  value={formData.id}
                  onChange={e => setFormData({ ...formData, id: e.target.value })}
                  placeholder="Ex: TF-009"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-mono font-bold text-emerald-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nome Popular da Planta *
                </label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Costela de Adão, Jiboia Verde"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nome Científico *
                </label>
                <input 
                  type="text" 
                  value={formData.scientificName}
                  onChange={e => setFormData({ ...formData, scientificName: e.target.value })}
                  placeholder="Ex: Monstera deliciosa"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl italic focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Categoria *
                </label>
                <select 
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* BLOCO 2: Loja, Estoque e Localização Física */}
          <div className="space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-800 border-b pb-1">
              2. Loja, Estoque e Localização Física
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Preço de Venda (R$) *
                </label>
                <input 
                  type="number" 
                  step="0.50"
                  required
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-bold text-stone-900 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Tamanho do Vaso / Pote
                </label>
                <input 
                  type="text" 
                  value={formData.potSize}
                  onChange={e => setFormData({ ...formData, potSize: e.target.value })}
                  placeholder="Ex: Pote 15, Cuia 21"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Status
                </label>
                <select 
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as PlantStatus })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none font-medium"
                >
                  <option value="disponivel">Disponível na Loja</option>
                  <option value="reservada">Reservada</option>
                  <option value="vendida">Vendida</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                Localização Física na Loja / Casa *
              </label>
              <input 
                type="text" 
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                placeholder="Ex: Estufa 01 • Bancada A, Prateleira Suspensa, Entrada"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* BLOCO 3: Guia de Cuidados */}
          <div className="space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-800 border-b pb-1">
              3. Guia de Cuidados (Exibido no QR Code)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Necessidade de Sol
                </label>
                <select 
                  value={formData.light}
                  onChange={e => setFormData({ ...formData, light: e.target.value as LightRequirement })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none"
                >
                  <option value="sol-pleno">☀️ Sol Pleno</option>
                  <option value="meia-sombra">🌤️ Meia Sombra</option>
                  <option value="sombra-difusa">🌥️ Sombra / Difusa</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Frequência de Rega
                </label>
                <select 
                  value={formData.watering}
                  onChange={e => setFormData({ ...formData, watering: e.target.value as WateringFrequency })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none"
                >
                  {WATERING_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.emoji} {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Segurança para Pets
                </label>
                <select 
                  value={formData.petFriendly ? 'true' : 'false'}
                  onChange={e => setFormData({ ...formData, petFriendly: e.target.value === 'true' })}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none"
                >
                  <option value="true">🐾 Sim (Pet Friendly)</option>
                  <option value="false">⚠️ Não (Tóxica ao ingerir)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Dica de Rega Detalhada
              </label>
              <input 
                type="text" 
                value={formData.wateringTip}
                onChange={e => setFormData({ ...formData, wateringTip: e.target.value })}
                placeholder="Ex: Regar quando os primeiros 2cm do solo estiverem secos."
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Dicas de Cultivo & Ambiente
              </label>
              <textarea 
                rows={2}
                value={formData.careInstructions}
                onChange={e => setFormData({ ...formData, careInstructions: e.target.value })}
                placeholder="Ex: Borrifar água nas folhas no verão. Limpar a poeira 1x ao mês."
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* NOVO BLOCO 3b: Classificação Botânica Detalhada (Preenchido via API ou manualmente) */}
          <div className="space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-800 border-b pb-1">
              3b. Ficha Botânica Auxiliar (Perenual API)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Família
                </label>
                <input 
                  type="text" 
                  value={formData.family || ''}
                  onChange={e => setFormData({ ...formData, family: e.target.value })}
                  placeholder="Ex: Araceae, Asparagaceae..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Origem / Habitat Natural
                </label>
                <input 
                  type="text" 
                  value={formData.origin || ''}
                  onChange={e => setFormData({ ...formData, origin: e.target.value })}
                  placeholder="Ex: América Tropical, África..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Ciclo de Vida
                </label>
                <input 
                  type="text" 
                  value={formData.cycle || ''}
                  onChange={e => setFormData({ ...formData, cycle: e.target.value })}
                  placeholder="Ex: Perene, Anual..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Época de Floração
                </label>
                <input 
                  type="text" 
                  value={formData.bloomingSeason || ''}
                  onChange={e => setFormData({ ...formData, bloomingSeason: e.target.value })}
                  placeholder="Ex: Primavera / Verão"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Suscetibilidade a Pragas / Doenças
                </label>
                <input 
                  type="text" 
                  value={formData.pestsDiseases || ''}
                  onChange={e => setFormData({ ...formData, pestsDiseases: e.target.value })}
                  placeholder="Ex: Cochonilha, Ácaro..."
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Nota de Toxicidade
                </label>
                <input 
                  type="text" 
                  value={formData.toxicity || ''}
                  onChange={e => setFormData({ ...formData, toxicity: e.target.value })}
                  placeholder="Ex: Tóxica para cães/gatos se ingerida"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* BLOCO 4: Foto da Planta */}
          <div className="space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-800 border-b pb-1 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" />
              4. Foto do Vaso / Planta
            </h3>

            {/* Upload de foto própria */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1.5 flex items-center gap-1">
                <Upload className="w-3.5 h-3.5 text-emerald-600" />
                Enviar Foto do Celular / Computador
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="w-full border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-xl p-4 cursor-pointer text-center bg-emerald-50/50 hover:bg-emerald-50 transition-colors"
              >
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                {uploadedFileName ? (
                  <div className="text-xs font-semibold text-emerald-800">
                    ✅ Foto carregada: <span className="font-mono">{uploadedFileName}</span>
                  </div>
                ) : (
                  <div className="text-xs text-stone-500 space-y-0.5">
                    <div className="text-2xl">📷</div>
                    <p className="font-semibold text-stone-700">Clique para selecionar uma foto</p>
                    <p>JPG, PNG, WEBP — será redimensionada automaticamente</p>
                  </div>
                )}
              </div>
            </div>

            {/* Separador ou URL */}
            <div className="flex items-center gap-2 text-stone-400 text-[11px]">
              <div className="flex-1 h-px bg-stone-200" />
              <span>ou cole uma URL de imagem da internet</span>
              <div className="flex-1 h-px bg-stone-200" />
            </div>

            <div>
              <input 
                type="url" 
                value={formData.imageUrl?.startsWith('data:') ? '' : formData.imageUrl}
                onChange={e => {
                  setFormData({ ...formData, imageUrl: e.target.value });
                  setUploadedFileName('');
                }}
                placeholder="https://..."
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>

            {/* Presets rápidos para teste */}
            <div>
              <div className="text-[11px] font-semibold text-stone-500 mb-1.5">Ou escolha uma foto de exemplo:</div>
              <div className="flex flex-wrap gap-2">
                {PRESET_PHOTOS.map((preset, idx) => (
                  <button 
                    key={idx}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, imageUrl: preset.url });
                      setUploadedFileName('');
                    }}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                      formData.imageUrl === preset.url 
                        ? 'bg-emerald-100 border-emerald-400 text-emerald-900 font-bold' 
                        : 'bg-stone-100 border-stone-200 text-stone-700 hover:bg-stone-200'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Prévia da Foto */}
            {formData.imageUrl && (
              <div className="mt-2 flex items-center gap-3 p-2 bg-stone-50 rounded-xl border border-stone-200">
                <img 
                  src={formData.imageUrl} 
                  alt="Prévia" 
                  className="w-16 h-16 rounded-lg object-cover border"
                />
                <span className="text-xs text-stone-500">
                  {uploadedFileName 
                    ? '📷 Foto própria — será exibida na vitrine e na etiqueta.'
                    : 'Prévia da foto que aparecerá na etiqueta e no site'
                  }
                </span>
              </div>
            )}
          </div>

          {/* Botões do Rodapé */}
          <div className="pt-4 border-t border-stone-200 flex items-center justify-end gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-stone-600 hover:text-stone-900 font-semibold text-xs rounded-xl hover:bg-stone-100 cursor-pointer"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" />
              Salvar Planta
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
