// Serviço de configurações personalizadas da loja
// Salva categorias e chaves de API no localStorage

const CATEGORIES_KEY = 'tonseflores_categories';
const API_KEY_KEY = 'tonseflores_perenual_apikey';

const DEFAULT_CATEGORIES = [
  'Folhagens',
  'Suculentas & Cactos',
  'Flores',
  'Pendentes',
  'Arbustos & Árvores',
  'Ervas & Temperos',
];

export const configService = {
  // ── Categorias ──────────────────────────────────────────────
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

  addCategory(name: string): string[] {
    const cats = this.getCategories();
    const trimmed = name.trim();
    if (trimmed && !cats.includes(trimmed)) {
      cats.push(trimmed);
      this.setCategories(cats);
    }
    return cats;
  },

  removeCategory(name: string): string[] {
    const cats = this.getCategories().filter(c => c !== name);
    this.setCategories(cats);
    return cats;
  },

  resetCategories(): string[] {
    localStorage.removeItem(CATEGORIES_KEY);
    return [...DEFAULT_CATEGORIES];
  },

  // ── Perenual API Key ────────────────────────────────────────
  getApiKey(): string {
    return localStorage.getItem(API_KEY_KEY) || '';
  },

  setApiKey(key: string): void {
    localStorage.setItem(API_KEY_KEY, key.trim());
  }
};
