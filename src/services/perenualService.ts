import type { LightRequirement, WateringFrequency } from '../types/plant';
import { configService } from './configService';

// Dicionário de mapeamento de nomes comuns em Português para nomes científicos / termos de busca
const COMMON_NAMES_MAP: Record<string, { scientific: string; ptName: string }> = {
  'costela de adao': { scientific: 'Monstera deliciosa', ptName: 'Costela de Adão' },
  'costela-de-adao': { scientific: 'Monstera deliciosa', ptName: 'Costela de Adão' },
  'jiboia': { scientific: 'Epipremnum aureum', ptName: 'Jiboia' },
  'jibóia': { scientific: 'Epipremnum aureum', ptName: 'Jiboia' },
  'espada de sao jorge': { scientific: 'Dracaena trifasciata', ptName: 'Espada de São Jorge' },
  'espada de são jorge': { scientific: 'Dracaena trifasciata', ptName: 'Espada de São Jorge' },
  'espada de santa barbara': { scientific: 'Dracaena trifasciata', ptName: 'Espada de Santa Bárbara' },
  'zamioculca': { scientific: 'Zamioculcas zamiifolia', ptName: 'Zamioculca' },
  'lirio da paz': { scientific: 'Spathiphyllum', ptName: 'Lírio da Paz' },
  'lírio da paz': { scientific: 'Spathiphyllum', ptName: 'Lírio da Paz' },
  'samambaia': { scientific: 'Nephrolepis exaltata', ptName: 'Samambaia Americana' },
  'samambaia americana': { scientific: 'Nephrolepis exaltata', ptName: 'Samambaia Americana' },
  'avenca': { scientific: 'Adiantum raddianum', ptName: 'Avenca' },
  'anturio': { scientific: 'Anthurium', ptName: 'Antúrio' },
  'antúrio': { scientific: 'Anthurium', ptName: 'Antúrio' },
  'begonia': { scientific: 'Begonia', ptName: 'Begônia' },
  'begônia': { scientific: 'Begonia', ptName: 'Begônia' },
  'ficus lyrata': { scientific: 'Ficus lyrata', ptName: 'Ficus Lyrata' },
  'figueira lira': { scientific: 'Ficus lyrata', ptName: 'Figueira-Lira' },
  'ficus elastica': { scientific: 'Ficus elastica', ptName: 'Ficus Elástica (Borracheira)' },
  'arvore da borracha': { scientific: 'Ficus elastica', ptName: 'Ficus Elástica (Borracheira)' },
  'babosa': { scientific: 'Aloe vera', ptName: 'Babosa (Aloe Vera)' },
  'aloe vera': { scientific: 'Aloe vera', ptName: 'Aloe Vera' },
  'croton': { scientific: 'Codiaeum variegatum', ptName: 'Cróton' },
  'cróton': { scientific: 'Codiaeum variegatum', ptName: 'Cróton' },
  'singonio': { scientific: 'Syngonium podophyllum', ptName: 'Singônio' },
  'singônio': { scientific: 'Syngonium podophyllum', ptName: 'Singônio' },
  'peperomia': { scientific: 'Peperomia', ptName: 'Peperômia' },
  'peperômia': { scientific: 'Peperomia', ptName: 'Peperômia' },
  'maranta': { scientific: 'Maranta leuconeura', ptName: 'Maranta' },
  'maranta pavão': { scientific: 'Calathea makoyana', ptName: 'Maranta Pavão' },
  'calateia': { scientific: 'Calathea', ptName: 'Calatéia' },
  'calatéia': { scientific: 'Calathea', ptName: 'Calatéia' },
  'palmeira raphis': { scientific: 'Rhapis excelsa', ptName: 'Palmeira Raphis' },
  'palmeira areca': { scientific: 'Dypsis lutescens', ptName: 'Palmeira Areca' },
  'palmeira chamaedorea': { scientific: 'Chamaedorea elegans', ptName: 'Palmeira Chamaedorea' },
  'chamaedorea': { scientific: 'Chamaedorea elegans', ptName: 'Chamaedorea' },
  'rosa do deserto': { scientific: 'Adenium obesum', ptName: 'Rosa do Deserto' },
  'violeta': { scientific: 'Saintpaulia', ptName: 'Violeta Africana' },
  'violeta africana': { scientific: 'Saintpaulia', ptName: 'Violeta Africana' },
  'cacto': { scientific: 'Cactus', ptName: 'Cacto' },
  'suculenta': { scientific: 'Succulent', ptName: 'Suculenta' },
  'filodendro': { scientific: 'Philodendron', ptName: 'Filodendro' },
  'pacova': { scientific: 'Philodendron martianum', ptName: 'Pacová' },
  'pacová': { scientific: 'Philodendron martianum', ptName: 'Pacová' },
  'clorofito': { scientific: 'Chlorophytum comosum', ptName: 'Clorofito' },
  'dracena': { scientific: 'Dracaena', ptName: 'Dracena' },
  'orquidea': { scientific: 'Orchidaceae', ptName: 'Orquídea' },
  'orquídea': { scientific: 'Phalaenopsis', ptName: 'Orquídea Phalaenopsis' },
  'planta jade': { scientific: 'Crassula ovata', ptName: 'Planta Jade' },
  'dinheiro em penca': { scientific: 'Callisia repens', ptName: 'Dinheiro em Penca' },
  'tostao': { scientific: 'Callisia repens', ptName: 'Tostão' },
  'tostão': { scientific: 'Callisia repens', ptName: 'Tostão' },
  'hera': { scientific: 'Hedera helix', ptName: 'Hera Inglesa' },
  'hera inglesa': { scientific: 'Hedera helix', ptName: 'Hera Inglesa' },
  'columeia': { scientific: 'Columnea', ptName: 'Columéia' },
  'columéia': { scientific: 'Columnea', ptName: 'Columéia' },
  'asplenio': { scientific: 'Asplenium nidus', ptName: 'Asplênio' },
  'asplênio': { scientific: 'Asplenium nidus', ptName: 'Asplênio' },
  'bambu da sorte': { scientific: 'Dracaena sanderiana', ptName: 'Bambu da Sorte' },
  'caladium': { scientific: 'Caladium', ptName: 'Tinhorão / Caladium' },
  'tinhorao': { scientific: 'Caladium', ptName: 'Tinhorão' },
  'tinhorão': { scientific: 'Caladium', ptName: 'Tinhorão' },
};

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export interface PerenualSpeciesResult {
  id: number;
  common_name: string;
  scientific_name: string[];
  other_name?: string[];
  cycle?: string;
  watering?: string;
  sunlight?: string[];
  default_image?: {
    thumbnail?: string;
    original_url?: string;
  };
  matchedPtName?: string;
}

export interface PlantClassificationDetails {
  name: string;
  scientificName: string;
  light: LightRequirement;
  watering: WateringFrequency;
  petFriendly: boolean;
  imageUrl?: string;
  wateringTip: string;
  careInstructions: string;
  family: string;
  origin: string;
  cycle: string;
  bloomingSeason: string;
  pestsDiseases: string;
  toxicity: string;
}

export const perenualService = {
  // Obter chave de API com prioridade para variáveis de ambiente (.env / Secrets do Host)
  getApiKey(): string {
    const envKey = (import.meta.env.VITE_PERENUAL_API_KEY as string) || '';
    if (envKey && envKey.trim().length > 0) {
      return envKey.trim();
    }
    return configService.getApiKey();
  },

  isKeyFromEnv(): boolean {
    const envKey = (import.meta.env.VITE_PERENUAL_API_KEY as string) || '';
    return envKey.trim().length > 0;
  },

  // Busca espécies permitindo busca por nome comum (PT/EN) e nome científico
  async searchSpecies(rawQuery: string): Promise<PerenualSpeciesResult[]> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error('Chave de API não configurada. Adicione VITE_PERENUAL_API_KEY no arquivo .env ou no painel de segredos do host.');
    }

    const trimmedQuery = rawQuery.trim();
    if (!trimmedQuery) return [];

    const normalized = normalizeText(trimmedQuery);
    const mapped = COMMON_NAMES_MAP[normalized];

    // Se encontramos um mapeamento comum brasileiro (ex: "costela de adao" -> "Monstera deliciosa"),
    // usamos o nome científico como query principal, com fallback para o termo digitado.
    const queryTerm = mapped ? mapped.scientific : trimmedQuery;

    const url = `https://perenual.com/api/species-list?key=${apiKey}&q=${encodeURIComponent(queryTerm)}`;
    const response = await fetch(url);

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('Limite de requisições da Perenual API atingido para a chave atual.');
      }
      throw new Error(`Erro na API Perenual (Status ${response.status}).`);
    }

    const data = await response.json();
    let results: PerenualSpeciesResult[] = data && data.data ? data.data : [];

    // Se não encontrou resultados e a query original era diferente do termo mapeado, tenta a query original direta
    if (results.length === 0 && queryTerm !== trimmedQuery) {
      const fallbackUrl = `https://perenual.com/api/species-list?key=${apiKey}&q=${encodeURIComponent(trimmedQuery)}`;
      const fallbackRes = await fetch(fallbackUrl);
      if (fallbackRes.ok) {
        const fallbackData = await fallbackRes.json();
        if (fallbackData && fallbackData.data) {
          results = fallbackData.data;
        }
      }
    }

    // Enriquece os resultados com o nome popular em português se detectado
    return results.map(item => {
      let matchedPtName: string | undefined = mapped?.ptName;
      if (!matchedPtName && item.scientific_name && item.scientific_name[0]) {
        const sciNorm = normalizeText(item.scientific_name[0]);
        for (const key of Object.keys(COMMON_NAMES_MAP)) {
          if (normalizeText(COMMON_NAMES_MAP[key].scientific) === sciNorm) {
            matchedPtName = COMMON_NAMES_MAP[key].ptName;
            break;
          }
        }
      }
      return {
        ...item,
        matchedPtName: matchedPtName || item.common_name,
      };
    });
  },

  // Busca detalhes completos e classifica a planta
  async getSpeciesDetails(speciesId: number, originalSearchQuery?: string): Promise<PlantClassificationDetails> {
    const apiKey = this.getApiKey();
    const detailsUrl = `https://perenual.com/api/species/details/${speciesId}?key=${apiKey}`;
    const res = await fetch(detailsUrl);

    if (!res.ok) {
      throw new Error(`Erro ao obter detalhes da espécie (Status ${res.status}).`);
    }

    const details = await res.json();

    // Mapear Iluminação
    let mappedLight: LightRequirement = 'meia-sombra';
    if (details.sunlight) {
      const sunlightStr = JSON.stringify(details.sunlight).toLowerCase();
      if (sunlightStr.includes('full sun')) {
        mappedLight = 'sol-pleno';
      } else if (sunlightStr.includes('part shade') || sunlightStr.includes('part sun')) {
        mappedLight = 'meia-sombra';
      } else if (sunlightStr.includes('full shade') || sunlightStr.includes('shade')) {
        mappedLight = 'sombra-difusa';
      }
    }

    // Mapear Rega
    let mappedWatering: WateringFrequency = 'moderada';
    if (details.watering) {
      const wateringStr = details.watering.toLowerCase();
      if (wateringStr.includes('minimum') || wateringStr.includes('low') || wateringStr.includes('little')) {
        mappedWatering = 'baixa';
      } else if (wateringStr.includes('average') || wateringStr.includes('moderate')) {
        mappedWatering = 'moderada';
      } else if (wateringStr.includes('frequent') || wateringStr.includes('high') || wateringStr.includes('keep moist')) {
        mappedWatering = 'frequente';
      }
    }

    // Mapear Toxicidade e Segurança para Pets
    const hasCatsToxicity = details.toxicity_from_cats === true || (typeof details.toxicity_from_cats === 'number' && details.toxicity_from_cats > 0);
    const hasDogsToxicity = details.toxicity_from_dogs === true || (typeof details.toxicity_from_dogs === 'number' && details.toxicity_from_dogs > 0);
    const isToxic = hasCatsToxicity || hasDogsToxicity;
    const petFriendly = !isToxic;

    // Determinar Nome Popular em Português ou da API
    let popularName = details.common_name || '';
    if (originalSearchQuery) {
      const normQuery = normalizeText(originalSearchQuery);
      if (COMMON_NAMES_MAP[normQuery]) {
        popularName = COMMON_NAMES_MAP[normQuery].ptName;
      }
    }
    if (!popularName && details.scientific_name && details.scientific_name[0]) {
      const sciNorm = normalizeText(details.scientific_name[0]);
      for (const key of Object.keys(COMMON_NAMES_MAP)) {
        if (normalizeText(COMMON_NAMES_MAP[key].scientific) === sciNorm) {
          popularName = COMMON_NAMES_MAP[key].ptName;
          break;
        }
      }
    }
    if (!popularName) {
      popularName = details.common_name || (details.scientific_name ? details.scientific_name[0] : 'Planta');
    }

    // Nome científico preservado
    const scientificName = (details.scientific_name && details.scientific_name[0]) || popularName;

    // Monta instruções de cuidado
    let careGuideText = '';
    if (details.care_instructions) {
      careGuideText = details.care_instructions;
    } else {
      careGuideText = `Planta do tipo ${details.type || 'ornamental'}. Ciclo ${details.cycle || 'perene'}. `;
      if (details.pruning_month && details.pruning_month.length > 0) {
        careGuideText += `Poda recomendada em: ${details.pruning_month.join(', ')}. `;
      }
    }

    const wateringTipText = `Rega: Nível ${details.watering || 'moderado'}. Mantenha a drenagem adequada.`;

    return {
      name: popularName,
      scientificName,
      light: mappedLight,
      watering: mappedWatering,
      petFriendly,
      imageUrl: (details.default_image && (details.default_image.original_url || details.default_image.regular_url)) || undefined,
      wateringTip: wateringTipText,
      careInstructions: careGuideText,
      family: details.family || '',
      origin: (details.origin && details.origin.join(', ')) || '',
      cycle: details.cycle || '',
      bloomingSeason: details.blooming_season || '',
      pestsDiseases: (details.pest_susceptibility && details.pest_susceptibility.join(', ')) || 'Nenhuma registrada',
      toxicity: isToxic ? 'Tóxica para cães/gatos se ingerida' : 'Segura para animais domésticos',
    };
  }
};
