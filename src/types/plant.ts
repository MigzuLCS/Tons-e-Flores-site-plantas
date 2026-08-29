export type LightRequirement = 'sol-pleno' | 'meia-sombra' | 'sombra-difusa';
export type WateringFrequency = 'baixa' | 'moderada' | 'frequente';
export type PlantStatus = 'disponivel' | 'reservada' | 'vendida';
export type PlantCategory = string; // Suporta categorias customizadas criadas pela loja
export type PlantCultivation = string; // Ex: 'Tradicional', 'Muda', 'Bonsai', 'Arranjo', 'Kokedama'

export interface Plant {
  id: string; // Ex: "TF-001"
  name: string; // Nome popular: "Costela de Adão"
  scientificName: string; // "Monstera deliciosa"
  category: PlantCategory;
  cultivation?: PlantCultivation; // 'Tradicional' (padrão), 'Muda', 'Bonsai', 'Arranjo', 'Kokedama'
  price: number; // Ex: 68.00
  potSize: string; // Ex: "Pote 17", "Cuia 21"
  location: string; // Ex: "Bancada Central • Estufa 01"
  status: PlantStatus;
  
  // Cuidados
  light: LightRequirement;
  watering: WateringFrequency;
  petFriendly: boolean;
  wateringTip: string;
  careInstructions: string;
  
  // Informações adicionais de classificação botânica detalhada (Acervo / IA / Enciclopédia)
  family?: string;
  origin?: string;
  cycle?: string;
  bloomingSeason?: string;
  pestsDiseases?: string;
  toxicity?: string;
  
  // Mídia
  imageUrl: string;
  
  createdAt: string;
  updatedAt?: string;
}

export interface FilterOptions {
  search: string;
  category: string;
  cultivation: string;
  light: string;
  watering: string;
  petFriendlyOnly: boolean;
  status: string;
}

