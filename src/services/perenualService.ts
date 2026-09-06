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

// Arquivo mantido como ponte de compatibilidade para o novo motor híbrido
import { plantClassificationService } from './plantClassificationService';

export interface PerenualSpeciesResult {
  id: string | number;
  common_name: string;
  scientific_name: string[];
  matchedPtName?: string;
  cycle?: string;
  watering?: string;
  sunlight?: string[];
  default_image?: {
    thumbnail?: string;
    original_url?: string;
    regular_url?: string;
    medium_url?: string;
  };
}

export const perenualService = {
  getApiKey(): string {
    return plantClassificationService.getGeminiApiKey();
  },

  async searchSpecies(rawQuery: string): Promise<any[]> {
    return plantClassificationService.searchSpecies(rawQuery);
  },

  async getSpeciesDetails(speciesItem: any, originalSearchQuery?: string): Promise<any> {
    return plantClassificationService.getSpeciesDetails(speciesItem, originalSearchQuery);
  }
};
