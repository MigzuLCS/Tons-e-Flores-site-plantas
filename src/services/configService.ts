import { supabase } from './supabaseClient';

// Serviço de configurações personalizadas da loja
// Salva categorias, bancadas e chaves de API com sincronização híbrida (Supabase Nuvem + LocalStorage)

const CATEGORIES_KEY = 'tonseflores_categories';
const LOCATIONS_KEY = 'tonseflores_locations';
const CULTIVATIONS_KEY = 'tonseflores_cultivations';
const API_KEY_KEY = 'tonseflores_perenual_apikey';
const GEMINI_API_KEY_KEY = 'tonseflores_gemini_apikey';

export interface StoreLocation {
  id: string;
  name: string;
  description: string;
}

export interface StoreCultivation {
  id: string;
  name: string;
  description?: string;
}

export const DEFAULT_CULTIVATIONS: StoreCultivation[] = [
  { id: 'cul-01', name: 'Tradicional', description: 'Cultivo padrão estabelecido em vaso convencional' },
  { id: 'cul-02', name: 'Muda', description: 'Muda jovem em desenvolvimento para plantio ou transplante' },
  { id: 'cul-03', name: 'Bonsai', description: 'Árvore miniaturizada e cultivada com técnicas de poda e aramação' },
  { id: 'cul-04', name: 'Arranjo', description: 'Composição artística combinando uma ou mais espécies decorativas' },
  { id: 'cul-05', name: 'Kokedama', description: 'Técnica japonesa de cultivo em esfera de musgo suspensa ou apoiada' },
];

const DEFAULT_CATEGORIES = [
  'Folhagens',
  'Flores',
  'Orquídeas',
  'Suculentas & Cactos',
  'Pendentes',
  'Aquáticas',
  'Carnívoras',
  'Bromélias',
  'Arbustos & Árvores',
  'Palmeiras',
  'Ervas & Temperos',
];

const DEFAULT_STORE_LOCATIONS: StoreLocation[] = [
  { id: 'loc-01', name: 'Bancada Central • Estufa 01', description: 'Mesa principal de destaque na entrada' },
  { id: 'loc-02', name: 'Bancada 02 • Sombra & Samambaias', description: 'Setor interno de meia sombra e folhagens' },
  { id: 'loc-03', name: 'Bancada 03 • Sol Pleno & Cactos', description: 'Setor ensolarado para cactos e suculentas' },
  { id: 'loc-04', name: 'Prateleira Suspensa • Pendentes', description: 'Estrutura vertical para vasos suspensos' },
  { id: 'loc-05', name: 'Entrada Principal • Destaques', description: 'Área de recepção e novidades da semana' },
];

export const configService = {
  // ── Localizações / Bancadas (Sincronização Nuvem + Local) ───
  getLocationDetails(): StoreLocation[] {
    try {
      const raw = localStorage.getItem(LOCATIONS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Converte caso o formato antigo fosse apenas array de strings
          if (typeof parsed[0] === 'string') {
            return parsed.map((name: string, idx: number) => ({
              id: `loc-${String(idx + 1).padStart(2, '0')}`,
              name,
              description: 'Setor físico da loja',
            }));
          }
          return parsed as StoreLocation[];
        }
      }
    } catch {}
    return [...DEFAULT_STORE_LOCATIONS];
  },

  getLocations(): string[] {
    return this.getLocationDetails().map(l => l.name);
  },

  getLocationDescription(name: string): string {
    const found = this.getLocationDetails().find(l => l.name === name);
    return found?.description || '';
  },

  setLocationDetails(details: StoreLocation[]): void {
    localStorage.setItem(LOCATIONS_KEY, JSON.stringify(details));
  },

  setLocations(locNames: string[]): void {
    const current = this.getLocationDetails();
    const updated: StoreLocation[] = locNames.map((name, idx) => {
      const existing = current.find(c => c.name === name);
      return existing || {
        id: `loc-${String(idx + 1).padStart(2, '0')}`,
        name,
        description: 'Setor físico da loja',
      };
    });
    this.setLocationDetails(updated);
  },

  generateNextLocationId(existing: StoreLocation[]): string {
    let maxNum = 0;
    for (const loc of existing) {
      const match = loc.id?.match(/^loc-(\d+)$/i);
      if (match) {
        const num = parseInt(match[1], 10);
        // Ignora timestamps gigantes para não quebrar a sequência limpa
        if (!isNaN(num) && num < 1000 && num > maxNum) {
          maxNum = num;
        }
      }
    }
    const nextNum = maxNum + 1;
    return `loc-${String(nextNum).padStart(2, '0')}`;
  },

  async syncLocationsWithCloud(): Promise<StoreLocation[]> {
    try {
      const { data, error } = await supabase
        .from('store_locations')
        .select('id, name, description')
        .order('name');

      if (!error && data && data.length > 0) {
        const cloudLocations: StoreLocation[] = data.map((row: any, idx: number) => ({
          id: row.id || `loc-${String(idx + 1).padStart(2, '0')}`,
          name: row.name,
          description: row.description || '',
        }));

        // Mescla garantindo que bancadas locais não sejam perdidas
        const existing = this.getLocationDetails();
        const mergedMap = new Map<string, StoreLocation>();
        
        for (const loc of cloudLocations) {
          mergedMap.set(loc.name, loc);
        }
        for (const loc of existing) {
          if (!mergedMap.has(loc.name)) {
            mergedMap.set(loc.name, loc);
          }
        }

        const finalLocations = Array.from(mergedMap.values());
        this.setLocationDetails(finalLocations);
        return finalLocations;
      }
    } catch (err) {
      console.warn('Sincronização de bancadas offline ou tabela store_locations ainda não criada no Supabase:', err);
    }
    return this.getLocationDetails();
  },

  async addLocation(name: string, description: string = ''): Promise<StoreLocation[]> {
    const locs = this.getLocationDetails();
    const trimmed = name.trim();
    if (!trimmed) return locs;

    const exists = locs.some(l => l.name.toLowerCase() === trimmed.toLowerCase());
    if (!exists) {
      const nextId = this.generateNextLocationId(locs);
      const newLoc: StoreLocation = {
        id: nextId,
        name: trimmed,
        description: description.trim() || 'Setor físico cadastrado pela loja',
      };

      const updated = [...locs, newLoc];
      this.setLocationDetails(updated);

      // Envia para o Supabase em segundo plano com ID sequencial limpo
      try {
        await supabase
          .from('store_locations')
          .upsert({
            id: nextId,
            name: trimmed,
            description: newLoc.description,
          }, { onConflict: 'name' });
      } catch (err) {
        console.warn('Erro ao salvar bancada no Supabase (salvo apenas localmente):', err);
      }

      return updated;
    }
    return locs;
  },

  async updateLocation(oldName: string, newName: string, newDescription: string): Promise<StoreLocation[]> {
    const trimmedNew = newName.trim();
    const trimmedDesc = newDescription.trim();
    if (!trimmedNew) return this.getLocationDetails();

    const locs = this.getLocationDetails();
    const updated = locs.map(l => {
      if (l.name === oldName) {
        return { ...l, name: trimmedNew, description: trimmedDesc || l.description };
      }
      return l;
    });

    this.setLocationDetails(updated);

    try {
      // 1. Atualiza o nome e descrição no Supabase
      await supabase
        .from('store_locations')
        .update({ name: trimmedNew, description: trimmedDesc })
        .eq('name', oldName);

      // 2. Atualização em cascata nas plantas vinculadas se o nome mudou
      if (oldName !== trimmedNew) {
        await supabase
          .from('plants')
          .update({ location: trimmedNew })
          .eq('location', oldName);
      }
    } catch (err) {
      console.warn('Erro ao atualizar bancada no Supabase:', err);
    }

    return updated;
  },

  async renameLocation(oldName: string, newName: string): Promise<string[]> {
    const updated = await this.updateLocation(oldName, newName, '');
    return updated.map(l => l.name);
  },

  async removeLocation(name: string): Promise<StoreLocation[]> {
    const locs = this.getLocationDetails().filter(l => l.name !== name);
    this.setLocationDetails(locs);

    try {
      await supabase
        .from('store_locations')
        .delete()
        .eq('name', name);
    } catch (err) {
      console.warn('Erro ao remover bancada do Supabase:', err);
    }
    return locs;
  },

  resetLocations(): StoreLocation[] {
    localStorage.removeItem(LOCATIONS_KEY);
    return [...DEFAULT_STORE_LOCATIONS];
  },

  // ── Categorias (Sincronização Nuvem + Local) ────────────────
  getCategories(): string[] {
    try {
      const raw = localStorage.getItem(CATEGORIES_KEY);
      if (raw) return JSON.parse(raw) as string[];
    } catch {}
    return [...DEFAULT_CATEGORIES];
  },

  setCategories(cats: string[]): void {
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify(cats));
  },

  async syncCategoriesWithCloud(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('store_categories')
        .select('name')
        .order('name');

      if (!error && data && data.length > 0) {
        const cloudCategories: string[] = data.map((row: any) => row.name).filter(Boolean);

        // Mescla categorias da nuvem com as locais e com as padrões
        const existing = this.getCategories();
        const mergedSet = new Set([...DEFAULT_CATEGORIES, ...cloudCategories, ...existing]);
        const finalCategories = Array.from(mergedSet);
        this.setCategories(finalCategories);
        return finalCategories;
      }
    } catch (err) {
      console.warn('Sincronização de categorias offline ou tabela store_categories ainda não criada no Supabase:', err);
    }
    return this.getCategories();
  },

  async generateNextCategoryId(): Promise<string> {
    let maxNum = 0;
    try {
      const { data } = await supabase
        .from('store_categories')
        .select('id');

      if (data && data.length > 0) {
        for (const row of data) {
          const match = row.id?.match(/^cat-(\d+)$/i);
          if (match) {
            const num = parseInt(match[1], 10);
            if (!isNaN(num) && num < 1000 && num > maxNum) {
              maxNum = num;
            }
          }
        }
      }
    } catch {}

    if (maxNum === 0) {
      const cats = this.getCategories();
      maxNum = cats.length;
    }

    const nextNum = maxNum + 1;
    return `cat-${String(nextNum).padStart(2, '0')}`;
  },

  async addCategory(name: string): Promise<string[]> {
    const cats = this.getCategories();
    const trimmed = name.trim();
    if (!trimmed) return cats;

    if (!cats.includes(trimmed)) {
      const updated = [...cats, trimmed];
      this.setCategories(updated);

      // Envia para o Supabase com ID sequencial limpo (ex: cat-07)
      try {
        const nextId = await this.generateNextCategoryId();
        await supabase
          .from('store_categories')
          .upsert({ id: nextId, name: trimmed }, { onConflict: 'name' });
      } catch (err) {
        console.warn('Erro ao salvar categoria no Supabase (salvo apenas localmente):', err);
      }

      return updated;
    }
    return cats;
  },

  async removeCategory(name: string): Promise<string[]> {
    const cats = this.getCategories().filter(c => c !== name);
    this.setCategories(cats);

    try {
      await supabase
        .from('store_categories')
        .delete()
        .eq('name', name);
    } catch (err) {
      console.warn('Erro ao remover categoria do Supabase:', err);
    }
    return cats;
  },

  resetCategories(): string[] {
    localStorage.removeItem(CATEGORIES_KEY);
    return [...DEFAULT_CATEGORIES];
  },

  // ── Tipos de Cultivo (Sincronização Nuvem + Local) ───────────
  getCultivationDetails(): StoreCultivation[] {
    try {
      const raw = localStorage.getItem(CULTIVATIONS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (typeof parsed[0] === 'string') {
            return parsed.map((name: string, idx: number) => ({
              id: `cul-${String(idx + 1).padStart(2, '0')}`,
              name,
              description: '',
            }));
          }
          return parsed as StoreCultivation[];
        }
      }
    } catch {}
    return [...DEFAULT_CULTIVATIONS];
  },

  getCultivations(): string[] {
    return this.getCultivationDetails().map(c => c.name);
  },

  setCultivationDetails(details: StoreCultivation[]): void {
    localStorage.setItem(CULTIVATIONS_KEY, JSON.stringify(details));
  },

  setCultivations(cultNames: string[]): void {
    const current = this.getCultivationDetails();
    const updated: StoreCultivation[] = cultNames.map((name, idx) => {
      const existing = current.find(c => c.name === name);
      return existing || {
        id: `cul-${String(idx + 1).padStart(2, '0')}`,
        name,
        description: '',
      };
    });
    this.setCultivationDetails(updated);
  },

  generateNextCultivationId(existing: StoreCultivation[]): string {
    let maxNum = 0;
    for (const cul of existing) {
      const match = cul.id?.match(/^cul-(\d+)$/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num < 1000 && num > maxNum) {
          maxNum = num;
        }
      }
    }
    const nextNum = maxNum + 1;
    return `cul-${String(nextNum).padStart(2, '0')}`;
  },

  async syncCultivationsWithCloud(): Promise<StoreCultivation[]> {
    try {
      const { data, error } = await supabase
        .from('store_cultivations')
        .select('id, name, description')
        .order('id');

      if (!error && data && data.length > 0) {
        const cloudCultivations: StoreCultivation[] = data.map((row: any, idx: number) => ({
          id: row.id || `cul-${String(idx + 1).padStart(2, '0')}`,
          name: row.name,
          description: row.description || '',
        }));

        const existing = this.getCultivationDetails();
        const mergedMap = new Map<string, StoreCultivation>();

        for (const cul of cloudCultivations) {
          mergedMap.set(cul.name, cul);
        }
        for (const cul of existing) {
          if (!mergedMap.has(cul.name)) {
            mergedMap.set(cul.name, cul);
          }
        }

        const finalCultivations = Array.from(mergedMap.values());
        this.setCultivationDetails(finalCultivations);
        return finalCultivations;
      }
    } catch (err) {
      console.warn('Sincronização de cultivos offline ou tabela store_cultivations ainda não criada no Supabase:', err);
    }
    return this.getCultivationDetails();
  },

  async addCultivation(name: string, description: string = ''): Promise<StoreCultivation[]> {
    const list = this.getCultivationDetails();
    const trimmed = name.trim();
    if (!trimmed) return list;

    const exists = list.some(c => c.name.toLowerCase() === trimmed.toLowerCase());
    if (!exists) {
      const nextId = this.generateNextCultivationId(list);
      const newCult: StoreCultivation = {
        id: nextId,
        name: trimmed,
        description: description.trim() || 'Tipo de cultivo de planta',
      };

      const updated = [...list, newCult];
      this.setCultivationDetails(updated);

      try {
        await supabase
          .from('store_cultivations')
          .upsert({
            id: nextId,
            name: trimmed,
            description: newCult.description,
          }, { onConflict: 'name' });
      } catch (err) {
        console.warn('Erro ao salvar tipo de cultivo no Supabase:', err);
      }

      return updated;
    }
    return list;
  },

  async updateCultivation(oldName: string, newName: string, newDescription: string): Promise<StoreCultivation[]> {
    const trimmedNew = newName.trim();
    const trimmedDesc = newDescription.trim();
    if (!trimmedNew) return this.getCultivationDetails();

    const list = this.getCultivationDetails();
    const updated = list.map(c => {
      if (c.name === oldName) {
        return { ...c, name: trimmedNew, description: trimmedDesc || c.description };
      }
      return c;
    });

    this.setCultivationDetails(updated);

    try {
      await supabase
        .from('store_cultivations')
        .update({ name: trimmedNew, description: trimmedDesc })
        .eq('name', oldName);

      if (oldName !== trimmedNew) {
        await supabase
          .from('plants')
          .update({ cultivation: trimmedNew })
          .eq('cultivation', oldName);
      }
    } catch (err) {
      console.warn('Erro ao atualizar tipo de cultivo no Supabase:', err);
    }

    return updated;
  },

  async removeCultivation(name: string): Promise<StoreCultivation[]> {
    const list = this.getCultivationDetails().filter(c => c.name !== name);
    this.setCultivationDetails(list);

    try {
      await supabase
        .from('store_cultivations')
        .delete()
        .eq('name', name);
    } catch (err) {
      console.warn('Erro ao remover tipo de cultivo do Supabase:', err);
    }
    return list;
  },

  resetCultivations(): StoreCultivation[] {
    localStorage.removeItem(CULTIVATIONS_KEY);
    return [...DEFAULT_CULTIVATIONS];
  },

  // ── Chaves de API de Classificação Botânica & IA ──────────
  getGeminiApiKey(): string {
    return localStorage.getItem(GEMINI_API_KEY_KEY) || localStorage.getItem(API_KEY_KEY) || '';
  },

  setGeminiApiKey(key: string): void {
    localStorage.setItem(GEMINI_API_KEY_KEY, key.trim());
  },

  // Compatibilidade legada
  getApiKey(): string {
    return this.getGeminiApiKey();
  },

  setApiKey(key: string): void {
    this.setGeminiApiKey(key);
  }
};

export type Theme = 'light' | 'dark';
const THEME_KEY = 'tonseflores_theme';

export const themeService = {
  getTheme(): Theme {
    try {
      const saved = localStorage.getItem(THEME_KEY);
      if (saved === 'dark' || saved === 'light') {
        return saved;
      }
    } catch {}
    return 'light';
  },

  setTheme(theme: Theme): void {
    try {
      localStorage.setItem(THEME_KEY, theme);
      if (typeof document !== 'undefined') {
        if (theme === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    } catch {}
  },

  toggleTheme(): Theme {
    const current = this.getTheme();
    const next = current === 'dark' ? 'light' : 'dark';
    this.setTheme(next);
    return next;
  },

  initTheme(): Theme {
    const theme = this.getTheme();
    this.setTheme(theme);
    return theme;
  }
};

