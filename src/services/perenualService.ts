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
