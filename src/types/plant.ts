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

