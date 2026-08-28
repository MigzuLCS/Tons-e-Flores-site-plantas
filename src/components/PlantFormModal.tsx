import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Sparkles, Image as ImageIcon, MapPin, Upload, Search, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import type { Plant, LightRequirement, WateringFrequency, PlantStatus } from '../types/plant';
import { plantService } from '../services/plantService';
import { configService } from '../services/configService';
import { plantClassificationService, type BotanicalSearchResult } from '../services/plantClassificationService';
import { compressImageFile, formatBytes } from '../utils/imageCompressor';

interface PlantFormModalProps {
  plantToEdit?: Plant | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (plant: Plant) => Promise<void> | void;
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
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [compressionDetails, setCompressionDetails] = useState<{
    originalSize: string;
    compressedSize: string;
    savingsPercent: number;
    dimensions: string;
  } | null>(null);

  // Botanical Classification Search State (100% Gratuito / Híbrido)
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<BotanicalSearchResult[]>([]);
  const [apiError, setApiError] = useState('');
  const [apiSuccessNotice, setApiSuccessNotice] = useState('');
  const [showResultsDropdown, setShowResultsDropdown] = useState(false);

  useEffect(() => {
    setCategories(configService.getCategories());
  }, [isOpen]);

  useEffect(() => {
    const cats = configService.getCategories();
    if (plantToEdit) {
      setFormData(plantToEdit);
      setUploadedFileName('');
      setCompressionDetails(null);
      setSearchQuery('');
      setSearchResults([]);
      setApiError('');
      setApiSuccessNotice('');
    } else {
      // Busca o próximo ID de forma assíncrona
      const defaultData: Partial<Plant> = {
        id: 'TF-???', // placeholder enquanto busca
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
      };
      setFormData(defaultData);
      plantService.generateNextId().then(nextId => {
        setFormData(prev => ({ ...prev, id: nextId }));
      });
      setUploadedFileName('');
      setCompressionDetails(null);
      setSearchQuery('');
      setSearchResults([]);
      setApiError('');
      setApiSuccessNotice('');
    }
  }, [plantToEdit, isOpen]);

  if (!isOpen) return null;

  // Busca espécies permitindo tanto Nome Popular (ex: Costela de Adão) quanto Nome Científico (ex: Monstera deliciosa)
  const handleSearchBotanical = async () => {
    if (!searchQuery.trim()) {
      setApiError('Digite o nome popular ou científico (ex: Costela de Adão, Jiboia, Zamioculca, Monstera).');
      return;
    }

    setIsSearching(true);
    setApiError('');
    setApiSuccessNotice('');
    setSearchResults([]);
    setShowResultsDropdown(false);

    try {
      const results = await plantClassificationService.searchSpecies(searchQuery);
      if (results && results.length > 0) {
        setSearchResults(results.slice(0, 6));
        setShowResultsDropdown(true);
      } else {
        setApiError('Nenhuma espécie correspondente encontrada. Você pode preencher manualmente abaixo.');
      }
    } catch (err: any) {
      setApiError(err.message || 'Erro ao consultar a base botânica.');
    } finally {
      setIsSearching(false);
    }
  };

  // Ao selecionar uma espécie, preenche Nome Popular, Nome Científico e toda a ficha botânica
  const handleSelectSpecies = async (species: BotanicalSearchResult) => {
    setIsSearching(true);
    setShowResultsDropdown(false);
    setApiError('');
    setApiSuccessNotice('');

    try {
      const details = await plantClassificationService.getSpeciesDetails(species, searchQuery);

      setFormData(prev => {
        let matchedCategory = prev.category;
        if (details.suggestedCategory) {
          const found = categories.find(
            c => c.toLowerCase() === details.suggestedCategory?.toLowerCase()
          );
          if (found) {
            matchedCategory = found;
          } else if (categories.length > 0) {
            matchedCategory = details.suggestedCategory;
          }
        }

        return {
          ...prev,
          name: details.name || prev.name,
          scientificName: details.scientificName || prev.scientificName,
          category: matchedCategory || prev.category || categories[0] || 'Folhagens',
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
        };
      });

      if (details.source === 'local') {
        setApiSuccessNotice('🌿 Ficha botânica preenchida instantaneamente via Acervo Botânico!');
      } else if (details.source === 'gemini') {
        setApiSuccessNotice('✨ Ficha botânica gerada com IA e salva no seu acervo local permanente!');
      } else {
        setApiSuccessNotice('📖 Ficha botânica preenchida com dados abertos da enciclopédia!');
      }

    } catch (err: any) {
      setApiError(err.message || 'Erro ao carregar detalhes botânicos.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    setApiError('');

    try {
      // Redimensiona proporcionalmente para no máx 800px e compacta em WebP 80% qualidade
      const result = await compressImageFile(file, {
        maxDimension: 800,
        quality: 0.8,
        mimeType: 'image/webp',
      });

      setFormData(prev => ({ ...prev, imageUrl: result.dataUrl }));
      setUploadedFileName(file.name);
      setCompressionDetails({
        originalSize: formatBytes(result.originalSizeBytes),
        compressedSize: formatBytes(result.compressedSizeBytes),
        savingsPercent: result.savingsPercent,
        dimensions: `${result.width}x${result.height}px`,
      });
    } catch (err: any) {
      console.error('Erro na compactação da foto:', err);
      setApiError('Erro ao compactar foto selecionada. Tente outra imagem.');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.id) return;

    setIsSaving(true);
    setApiError('');

    try {
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

      await onSave(finalPlant);
      onClose();
    } catch (err: any) {
      console.error('Erro ao salvar planta:', err);
      setApiError('Erro ao salvar planta ou enviar foto: ' + (err.message || err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-brand-surface rounded-3xl shadow-xl overflow-hidden border border-brand-border flex flex-col max-h-[90vh]">
        
        {/* Cabeçalho */}
        <div className="bg-brand-surface-subtle text-brand-text px-6 py-4 flex items-center justify-between border-b border-brand-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-olive-light text-brand-olive flex items-center justify-center font-bold text-sm shadow-xs border border-brand-olive-border">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif-title leading-tight text-brand-text">
                {plantToEdit ? 'Editar Planta / Vaso' : 'Cadastrar Nova Planta'}
              </h2>
              <p className="text-xs text-brand-text-muted">Tons & Flores • Gestão do Vaso</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 text-brand-text-muted hover:text-brand-text rounded-lg hover:bg-brand-border transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulário com Scroll */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6 flex-1 text-sm text-brand-text">
          
          {/* SEÇÃO INTEGRADA: Busca Botânica Automática */}
          {!plantToEdit && (
            <div className="bg-brand-surface-subtle border border-brand-border rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-brand-olive">
                <Sparkles className="w-4 h-4 text-brand-olive" />
                Classificação Botânica Inteligente & Gratuita
              </div>
              <p className="text-xs text-brand-text-muted">
                Pesquise pelo <strong>Nome Popular</strong> (ex: <em>Costela de Adão</em>, <em>Espada de São Jorge</em>, <em>Jiboia</em>, <em>Zamioculca</em>) ou pelo <strong>Nome Científico</strong> (ex: <em>Monstera deliciosa</em>) para preencher a ficha completa instantaneamente.
              </p>
              <div className="relative flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Buscar por nome comum ou científico..."
                  className="flex-1 px-3 py-2 text-xs bg-brand-surface border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-olive font-medium text-brand-text"
                  onKeyDown={e => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSearchBotanical();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleSearchBotanical}
                  disabled={isSearching}
                  className="px-4 py-2 bg-brand-olive hover:bg-brand-olive-hover disabled:bg-brand-border text-white text-xs font-semibold rounded-xl cursor-pointer transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                  Buscar
                </button>

                {/* Dropdown de Resultados de Busca */}
                {showResultsDropdown && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-brand-surface border border-brand-border rounded-xl shadow-lg z-30 max-h-56 overflow-y-auto divide-y divide-brand-border animate-in fade-in slide-in-from-top-1">
                    {searchResults.map((species: BotanicalSearchResult) => (
                      <button
                        key={species.id}
                        type="button"
                        onClick={() => handleSelectSpecies(species)}
                        className="w-full px-4 py-2.5 text-left text-xs hover:bg-brand-surface-subtle transition-colors flex items-center justify-between group cursor-pointer"
                      >
                        <div>
                          <div className="font-bold text-brand-text group-hover:text-brand-olive">
                            {species.matchedPtName || species.common_name || 'Desconhecida'}
                          </div>
                          <div className="text-brand-text-muted italic text-[11px]">
                            {species.scientific_name ? species.scientific_name.join(', ') : ''}
                          </div>
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-brand-olive-subtle text-brand-olive">
                          {species.source === 'local' ? '🌿 Acervo' : species.source === 'gemini' ? '✨ IA' : '📖 Wiki'}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {apiSuccessNotice && (
                <div className="text-xs text-brand-olive flex items-center gap-1.5 mt-1 font-medium bg-brand-olive-subtle p-2.5 rounded-xl border border-brand-olive/20">
                  <Sparkles className="w-3.5 h-3.5 text-brand-olive" />
                  {apiSuccessNotice}
                </div>
              )}

              {apiError && (
                <div className="text-xs text-brand-nude-text flex items-center gap-1.5 mt-1 font-medium bg-brand-nude-light p-2 rounded-xl border border-brand-nude-border">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {apiError}
                </div>
              )}
            </div>
          )}

          {/* BLOCO 1: Identificação Básica */}
          <div className="space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-brand-olive border-b border-brand-border pb-1">
              1. Identificação Básica
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">
                  Código / Tag Única *
                </label>
                <input 
                  type="text" 
                  required
                  value={formData.id}
                  onChange={e => setFormData({ ...formData, id: e.target.value })}
                  placeholder="Ex: TF-009"
                  className="w-full px-3 py-2 bg-brand-olive-light border border-brand-olive-border rounded-xl font-mono font-bold text-brand-olive-text focus:ring-2 focus:ring-brand-olive focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-brand-text mb-1">
                  Nome Popular da Planta *
                </label>
                <input 
                  type="text" 
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Costela de Adão, Jiboia Verde"
                  className="w-full px-3 py-2 bg-brand-surface-subtle border border-brand-border rounded-xl focus:ring-2 focus:ring-brand-olive focus:outline-none font-medium text-brand-text"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">
                  Nome Científico *
                </label>
                <input 
                  type="text" 
                  value={formData.scientificName}
                  onChange={e => setFormData({ ...formData, scientificName: e.target.value })}
                  placeholder="Ex: Monstera deliciosa"
                  className="w-full px-3 py-2 bg-brand-surface-subtle border border-brand-border rounded-xl italic focus:ring-2 focus:ring-brand-olive focus:outline-none text-brand-text"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">
                  Categoria *
                </label>
                <select 
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 bg-brand-surface-subtle border border-brand-border rounded-xl focus:ring-2 focus:ring-brand-olive focus:outline-none font-medium text-brand-text"
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
            <h3 className="font-bold text-xs uppercase tracking-wider text-brand-olive border-b border-brand-border pb-1">
              2. Loja, Estoque e Localização Física
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">
                  Preço de Venda (R$) *
                </label>
                <input 
                  type="number" 
                  step="0.50" 
                  required
                  value={formData.price}
                  onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 bg-brand-surface-subtle border border-brand-border rounded-xl font-bold text-brand-text focus:ring-2 focus:ring-brand-olive focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">
                  Tamanho do Vaso / Pote
                </label>
                <input 
                  type="text" 
                  value={formData.potSize}
                  onChange={e => setFormData({ ...formData, potSize: e.target.value })}
                  placeholder="Ex: Pote 15, Cuia 21"
                  className="w-full px-3 py-2 bg-brand-surface-subtle border border-brand-border rounded-xl focus:ring-2 focus:ring-brand-olive focus:outline-none text-brand-text"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">
                  Status
                </label>
                <select 
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as PlantStatus })}
                  className="w-full px-3 py-2 bg-brand-surface-subtle border border-brand-border rounded-xl focus:ring-2 focus:ring-brand-olive focus:outline-none font-medium text-brand-text"
                >
                  <option value="disponivel">Disponível na Loja</option>
                  <option value="reservada">Reservada</option>
                  <option value="vendida">Vendida</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-brand-olive" />
                Localização Física na Loja / Casa *
              </label>
              <input 
                type="text" 
                value={formData.location}
                onChange={e => setFormData({ ...formData, location: e.target.value })}
                placeholder="Ex: Estufa 01 • Bancada A, Prateleira Suspensa, Entrada"
                className="w-full px-3 py-2 bg-brand-surface-subtle border border-brand-border rounded-xl focus:ring-2 focus:ring-brand-olive focus:outline-none text-brand-text"
              />
            </div>
          </div>

          {/* BLOCO 3: Guia de Cuidados */}
          <div className="space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-brand-olive border-b border-brand-border pb-1">
              3. Guia de Cuidados (Exibido no QR Code)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">
                  Necessidade de Sol
                </label>
                <select 
                  value={formData.light}
                  onChange={e => setFormData({ ...formData, light: e.target.value as LightRequirement })}
                  className="w-full px-3 py-2 bg-brand-surface-subtle border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-olive text-brand-text"
                >
                  <option value="sol-pleno">☀️ Sol Pleno</option>
                  <option value="meia-sombra">🌤️ Meia Sombra</option>
                  <option value="sombra-difusa">🌥️ Sombra / Difusa</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">
                  Frequência de Rega
                </label>
                <select 
                  value={formData.watering}
                  onChange={e => setFormData({ ...formData, watering: e.target.value as WateringFrequency })}
                  className="w-full px-3 py-2 bg-brand-surface-subtle border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-olive text-brand-text"
                >
                  {WATERING_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>
                      {opt.emoji} {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">
                  Segurança para Pets
                </label>
                <select 
                  value={formData.petFriendly ? 'true' : 'false'}
                  onChange={e => setFormData({ ...formData, petFriendly: e.target.value === 'true' })}
                  className="w-full px-3 py-2 bg-brand-surface-subtle border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-olive text-brand-text"
                >
                  <option value="true">🐾 Sim (Pet Friendly)</option>
                  <option value="false">⚠️ Não (Tóxica ao ingerir)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">
                Dica de Rega Detalhada
              </label>
              <input 
                type="text" 
                value={formData.wateringTip}
                onChange={e => setFormData({ ...formData, wateringTip: e.target.value })}
                placeholder="Ex: Regar quando os primeiros 2cm do solo estiverem secos."
                className="w-full px-3 py-2 bg-brand-surface-subtle border border-brand-border rounded-xl focus:ring-2 focus:ring-brand-olive focus:outline-none text-brand-text"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1">
                Dicas de Cultivo & Ambiente
              </label>
              <textarea 
                rows={2}
                value={formData.careInstructions}
                onChange={e => setFormData({ ...formData, careInstructions: e.target.value })}
                placeholder="Ex: Borrifar água nas folhas no verão. Limpar a poeira 1x ao mês."
                className="w-full px-3 py-2 bg-brand-surface-subtle border border-brand-border rounded-xl focus:ring-2 focus:ring-brand-olive focus:outline-none text-brand-text"
              />
            </div>
          </div>

          {/* BLOCO 3b: Classificação Botânica Detalhada */}
          <div className="space-y-4">
            <h3 className="font-bold text-xs uppercase tracking-wider text-brand-olive border-b border-brand-border pb-1">
              3b. Ficha Botânica Detalhada (Classificação Inteligente)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">
                  Família
                </label>
                <input 
                  type="text" 
                  value={formData.family || ''}
                  onChange={e => setFormData({ ...formData, family: e.target.value })}
                  placeholder="Ex: Araceae, Asparagaceae..."
                  className="w-full px-3 py-2 bg-brand-surface-subtle border border-brand-border rounded-xl focus:ring-2 focus:ring-brand-olive focus:outline-none text-brand-text"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">
                  Origem / Habitat Natural
                </label>
                <input 
                  type="text" 
                  value={formData.origin || ''}
                  onChange={e => setFormData({ ...formData, origin: e.target.value })}
                  placeholder="Ex: América Tropical, África..."
                  className="w-full px-3 py-2 bg-brand-surface-subtle border border-brand-border rounded-xl focus:ring-2 focus:ring-brand-olive focus:outline-none text-brand-text"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">
                  Ciclo de Vida
                </label>
                <input 
                  type="text" 
                  value={formData.cycle || ''}
                  onChange={e => setFormData({ ...formData, cycle: e.target.value })}
                  placeholder="Ex: Perene, Anual..."
                  className="w-full px-3 py-2 bg-brand-surface-subtle border border-brand-border rounded-xl focus:ring-2 focus:ring-brand-olive focus:outline-none text-brand-text"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">
                  Época de Floração
                </label>
                <input 
                  type="text" 
                  value={formData.bloomingSeason || ''}
                  onChange={e => setFormData({ ...formData, bloomingSeason: e.target.value })}
                  placeholder="Ex: Primavera / Verão"
                  className="w-full px-3 py-2 bg-brand-surface-subtle border border-brand-border rounded-xl focus:ring-2 focus:ring-brand-olive focus:outline-none text-brand-text"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">
                  Suscetibilidade a Pragas / Doenças
                </label>
                <input 
                  type="text" 
                  value={formData.pestsDiseases || ''}
                  onChange={e => setFormData({ ...formData, pestsDiseases: e.target.value })}
                  placeholder="Ex: Cochonilha, Ácaro..."
                  className="w-full px-3 py-2 bg-brand-surface-subtle border border-brand-border rounded-xl focus:ring-2 focus:ring-brand-olive focus:outline-none text-brand-text"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-brand-text mb-1">
                  Nota de Toxicidade
                </label>
                <input 
                  type="text" 
                  value={formData.toxicity || ''}
                  onChange={e => setFormData({ ...formData, toxicity: e.target.value })}
                  placeholder="Ex: Tóxica para cães/gatos se ingerida"
                  className="w-full px-3 py-2 bg-brand-surface-subtle border border-brand-border rounded-xl focus:ring-2 focus:ring-brand-olive focus:outline-none text-brand-text"
                />
              </div>
            </div>
          </div>

          {/* BLOCO 4: Foto da Planta */}
          <div className="space-y-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-brand-olive border-b border-brand-border pb-1 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-brand-olive" />
              4. Foto do Vaso / Planta
            </h3>

            {/* Upload de foto própria */}
            <div>
              <label className="block text-xs font-semibold text-brand-text mb-1.5 flex items-center gap-1">
                <Upload className="w-3.5 h-3.5 text-brand-olive" />
                Enviar Foto do Celular / Computador
              </label>
              <div
                onClick={() => !isCompressing && fileInputRef.current?.click()}
                className={`w-full border-2 border-dashed rounded-xl p-4 cursor-pointer text-center transition-colors ${
                  isCompressing 
                    ? 'border-brand-olive bg-brand-olive-subtle opacity-80 cursor-wait' 
                    : 'border-brand-border hover:border-brand-olive bg-brand-surface-subtle hover:bg-brand-olive-light'
                }`}
              >
                <input 
                  ref={fileInputRef}
                  type="file" 
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={isCompressing}
                />
                {isCompressing ? (
                  <div className="text-xs text-brand-olive flex flex-col items-center justify-center gap-2 py-1">
                    <Loader2 className="w-5 h-5 animate-spin text-brand-olive" />
                    <span className="font-semibold">Compactando foto para WebP (máx. 800px)...</span>
                  </div>
                ) : uploadedFileName ? (
                  <div className="text-xs space-y-1">
                    <div className="font-semibold text-brand-olive flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-brand-olive" />
                      <span>Foto compactada em WebP: <strong className="font-mono">{uploadedFileName}</strong></span>
                    </div>
                    {compressionDetails && (
                      <div className="text-[11px] text-brand-text-muted flex items-center justify-center gap-2 flex-wrap">
                        <span className="bg-brand-olive-light text-brand-olive px-2 py-0.5 rounded font-mono font-medium">
                          {compressionDetails.dimensions}
                        </span>
                        <span>{compressionDetails.originalSize} → <strong>{compressionDetails.compressedSize}</strong></span>
                        {compressionDetails.savingsPercent > 0 && (
                          <span className="text-brand-olive font-bold">
                            (-{compressionDetails.savingsPercent}%)
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-xs text-brand-text-muted space-y-0.5">
                    <div className="text-2xl">📷</div>
                    <p className="font-semibold text-brand-text">Clique para selecionar uma foto</p>
                    <p>Compactação automática em WebP • Máx. 800px • 80% qualidade</p>
                  </div>
                )}
              </div>
            </div>

            {/* Separador ou URL */}
            <div className="flex items-center gap-2 text-brand-text-light text-[11px]">
              <div className="flex-1 h-px bg-brand-border" />
              <span>ou cole uma URL de imagem da internet</span>
              <div className="flex-1 h-px bg-brand-border" />
            </div>

            <div>
              <input 
                type="url" 
                value={formData.imageUrl?.startsWith('data:') ? '' : formData.imageUrl}
                onChange={e => {
                  setFormData({ ...formData, imageUrl: e.target.value });
                  setUploadedFileName('');
                  setCompressionDetails(null);
                }}
                placeholder="https://..."
                className="w-full px-3 py-2 bg-brand-surface-subtle border border-brand-border rounded-xl text-xs focus:ring-2 focus:ring-brand-olive focus:outline-none text-brand-text"
              />
            </div>

            {/* Presets rápidos para teste */}
            <div>
              <div className="text-[11px] font-semibold text-brand-text-muted mb-1.5">Ou escolha uma foto de exemplo:</div>
              <div className="flex flex-wrap gap-2">
                {PRESET_PHOTOS.map((preset, idx) => (
                  <button 
                    key={idx}
                    type="button"
                    onClick={() => {
                      setFormData({ ...formData, imageUrl: preset.url });
                      setUploadedFileName('');
                      setCompressionDetails(null);
                    }}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                      formData.imageUrl === preset.url 
                        ? 'bg-brand-olive-light border-brand-olive-border text-brand-olive-text font-bold shadow-xs' 
                        : 'bg-brand-surface-subtle border-brand-border text-brand-text hover:bg-brand-olive-light'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Prévia da Foto */}
            {formData.imageUrl && (
              <div className="mt-2 flex items-center gap-3 p-2 bg-brand-surface-subtle rounded-xl border border-brand-border">
                <img 
                  src={formData.imageUrl} 
                  alt="Prévia" 
                  className="w-16 h-16 rounded-lg object-cover border border-brand-border"
                />
                <div className="text-xs text-brand-text-muted space-y-0.5">
                  <p className="font-medium text-brand-text">
                    {uploadedFileName 
                      ? '📷 Foto própria do vaso compactada em WebP'
                      : 'Foto ilustrativa selecionada'
                    }
                  </p>
                  <p className="text-[11px]">Será exibida na vitrine e gerada na etiqueta para impressão.</p>
                </div>
              </div>
            )}
          </div>

          {/* Botões do Rodapé */}
          <div className="pt-4 border-t border-brand-border flex items-center justify-end gap-3">
            <button 
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2.5 text-brand-text-muted hover:text-brand-text font-semibold text-xs rounded-xl hover:bg-brand-surface-subtle cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={isSaving || isCompressing}
              className="px-6 py-2.5 bg-brand-olive hover:bg-brand-olive-hover disabled:bg-brand-border text-white font-semibold text-xs rounded-xl shadow-xs flex items-center gap-2 cursor-pointer transition-colors"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Salvando no Supabase...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Salvar Planta
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
