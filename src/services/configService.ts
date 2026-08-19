// Serviço de configurações personalizadas da loja
// Salva categorias e frequências de rega no localStorage

const CATEGORIES_KEY = 'tonseflores_categories';
const WATERING_KEY = 'tonseflores_watering';

export interface WateringOption {
  value: string;   // identificador interno
  label: string;   // texto exibido
  emoji: string;   // emoji visual
}

const DEFAULT_CATEGORIES = [
  'Folhagens',
  'Suculentas & Cactos',
  'Flores',
  'Pendentes',
  'Arbustos & Árvores',
  'Ervas & Temperos',
];

const DEFAULT_WATERING: WateringOption[] = [
  { value: 'baixa',     label: 'Pouca Rega (Solo Seco)',     emoji: '💧' },
  { value: 'moderada',  label: 'Moderada (1-2x/sem)',        emoji: '💧💧' },
  { value: 'frequente', label: 'Solo Sempre Úmido',          emoji: '💧💧💧' },
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

  // ── Frequências de Rega ─────────────────────────────────────
  getWateringOptions(): WateringOption[] {
    try {
      const raw = localStorage.getItem(WATERING_KEY);
      if (raw) return JSON.parse(raw) as WateringOption[];
    } catch {}
    return [...DEFAULT_WATERING];
  },

  setWateringOptions(opts: WateringOption[]): void {
    localStorage.setItem(WATERING_KEY, JSON.stringify(opts));
  },

  addWateringOption(label: string, emoji: string): WateringOption[] {
    const opts = this.getWateringOptions();
    const trimmed = label.trim();
    if (!trimmed) return opts;
    // Gera um value único a partir do label
    const value = trimmed
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
    if (opts.some(o => o.value === value)) return opts;
    opts.push({ value, label: trimmed, emoji: emoji || '💧' });
    this.setWateringOptions(opts);
    return opts;
  },

  removeWateringOption(value: string): WateringOption[] {
    // Não deixa remover as 3 opções padrão
    const defaultValues = DEFAULT_WATERING.map(o => o.value);
    if (defaultValues.includes(value)) return this.getWateringOptions();
    const opts = this.getWateringOptions().filter(o => o.value !== value);
    this.setWateringOptions(opts);
    return opts;
  },

  resetWateringOptions(): WateringOption[] {
    localStorage.removeItem(WATERING_KEY);
    return [...DEFAULT_WATERING];
  },
};
