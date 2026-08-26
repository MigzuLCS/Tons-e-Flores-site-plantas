import type { LightRequirement, WateringFrequency } from '../types/plant';
import { configService } from './configService';

export interface PlantBotanicalPreset {
  scientific: string;
  ptName: string;
  family: string;
  origin: string;
  light: LightRequirement;
  watering: WateringFrequency;
  petFriendly: boolean;
  wateringTip: string;
  careInstructions: string;
  cycle: string;
  bloomingSeason: string;
  pestsDiseases: string;
  toxicity: string;
}

// Base botânica brasileira com dados completos de cuidados e cultivo
const BOTANICAL_DATABASE: Record<string, PlantBotanicalPreset> = {
  'costela de adao': {
    scientific: 'Monstera deliciosa',
    ptName: 'Costela de Adão',
    family: 'Araceae',
    origin: 'América Central e do Sul',
    light: 'meia-sombra',
    watering: 'moderada',
    petFriendly: false,
    wateringTip: 'Regar 1 a 2 vezes por semana quando os primeiros 2cm do solo estiverem secos.',
    careInstructions: 'Luz indireta brilhante. Limpar as folhas com pano úmido 1x ao mês para manter a respiração da planta.',
    cycle: 'Perene',
    bloomingSeason: 'Verão (raro em ambientes internos)',
    pestsDiseases: 'Cochonilhas, ácaros rajados',
    toxicity: 'Tóxica para cães e gatos (contém oxalato de cálcio)',
  },
  'jiboia': {
    scientific: 'Epipremnum aureum',
    ptName: 'Jiboia',
    family: 'Araceae',
    origin: 'Ilhas Salomão e Sudeste Asiático',
    light: 'sombra-difusa',
    watering: 'moderada',
    petFriendly: false,
    wateringTip: 'Regar quando a terra estiver quase seca ao toque, sem encharcar.',
    careInstructions: 'Excelente para vasos suspensos ou tutorada em suporte de fibra de coco. Muito resistente.',
    cycle: 'Perene',
    bloomingSeason: 'Primavera',
    pestsDiseases: 'Pulgões e cochonilhas',
    toxicity: 'Tóxica para pets ao mastigar ou ingerir',
  },
  'espada de sao jorge': {
    scientific: 'Dracaena trifasciata',
    ptName: 'Espada de São Jorge',
    family: 'Asparagaceae',
    origin: 'África Ocidental Tropical',
    light: 'sol-pleno',
    watering: 'baixa',
    petFriendly: false,
    wateringTip: 'Regar a cada 10 a 15 dias no verão e 20 dias no inverno. Solo bem seco.',
    careInstructions: 'Purificadora de ar e extremamente rústica. Suporta sol pleno, meia sombra ou luz difusa.',
    cycle: 'Perene',
    bloomingSeason: 'Verão',
    pestsDiseases: 'Cochonilhas e podridão radicular por excesso de água',
    toxicity: 'Tóxica para cães e gatos se ingerida',
  },
  'zamioculca': {
    scientific: 'Zamioculcas zamiifolia',
    ptName: 'Zamioculca',
    family: 'Araceae',
    origin: 'África Oriental',
    light: 'sombra-difusa',
    watering: 'baixa',
    petFriendly: false,
    wateringTip: 'Regar a cada 15 a 20 dias. A batata (tubérculo) armazena água.',
    careInstructions: 'Tolera locais com pouca luz e ar-condicionado. Nunca deixe o prato com água parada.',
    cycle: 'Perene',
    bloomingSeason: 'Outono / Inverno',
    pestsDiseases: 'Podridão de raízes por excesso de umidade',
    toxicity: 'Tóxica para cães e gatos',
  },
  'lirio da paz': {
    scientific: 'Spathiphyllum wallisii',
    ptName: 'Lírio da Paz',
    family: 'Araceae',
    origin: 'América Tropical (Colômbia e Venezuela)',
    light: 'sombra-difusa',
    watering: 'frequente',
    petFriendly: false,
    wateringTip: 'Manter a terra sempre levemente úmida (2 a 3 vezes por semana).',
    careInstructions: 'Gosta de umidade no ar. Excelente filtradora de poluentes em ambientes fechados.',
    cycle: 'Perene',
    bloomingSeason: 'Primavera e Verão',
    pestsDiseases: 'Ácaros, cochonilha branca',
    toxicity: 'Tóxica para animais de estimação',
  },
  'samambaia': {
    scientific: 'Nephrolepis exaltata',
    ptName: 'Samambaia Americana',
    family: 'Lomariopsidaceae',
    origin: 'América Central e do Sul',
    light: 'meia-sombra',
    watering: 'frequente',
    petFriendly: true,
    wateringTip: 'Regar quase diariamente no calor ou a cada 2 dias no frio, mantendo o solo úmido.',
    careInstructions: 'Proteger de ventos fortes e sol direto. Borrifar água nas folhas nos dias secos.',
    cycle: 'Perene',
    bloomingSeason: 'Não produz flores (esporos)',
    pestsDiseases: 'Lagartas, pulgões',
    toxicity: 'Não tóxica (100% Pet Friendly)',
  },
  'anturio': {
    scientific: 'Anthurium andraeanum',
    ptName: 'Antúrio',
    family: 'Araceae',
    origin: 'América do Sul (Colômbia e Equador)',
    light: 'meia-sombra',
    watering: 'moderada',
    petFriendly: false,
    wateringTip: 'Regar 2 vezes na semana no verão e 1 vez no inverno.',
    careInstructions: 'Aprecia ambiente quente e úmido com bastante luz indireta para florir o ano todo.',
    cycle: 'Perene',
    bloomingSeason: 'O ano todo',
    pestsDiseases: 'Cochonilhas, ácaros',
    toxicity: 'Tóxica para pets',
  },
  'ficus lyrata': {
    scientific: 'Ficus lyrata',
    ptName: 'Ficus Lyrata (Figueira-Lira)',
    family: 'Moraceae',
    origin: 'África Ocidental',
    light: 'sol-pleno',
    watering: 'moderada',
    petFriendly: false,
    wateringTip: 'Regar 1 a 2 vezes na semana quando os primeiros centímetros de terra secarem.',
    careInstructions: 'Precisa de muita luz solar (sol da manhã ou luz muito forte). Evite mudar de lugar com frequência.',
    cycle: 'Perene',
    bloomingSeason: 'Primavera',
    pestsDiseases: 'Ácaros vermelhos, cochonilhas',
    toxicity: 'Tóxica para cães e gatos (seiva leitosa irritante)',
  },
  'ficus elastica': {
    scientific: 'Ficus elastica',
    ptName: 'Ficus Elástica (Borracheira)',
    family: 'Moraceae',
    origin: 'Índia e Malásia',
    light: 'sol-pleno',
    watering: 'moderada',
    petFriendly: false,
    wateringTip: 'Regar quando a superfície do substrato secar.',
    careInstructions: 'Folhas grossas e brilhantes. Limpar o pó periodicamente e manter em local bem iluminado.',
    cycle: 'Perene',
    bloomingSeason: 'Verão',
    pestsDiseases: 'Cochonilhas, tripes',
    toxicity: 'Tóxica para animais de estimação',
  },
  'babosa': {
    scientific: 'Aloe vera',
    ptName: 'Babosa (Aloe Vera)',
    family: 'Asphodelaceae',
    origin: 'Península Arábica',
    light: 'sol-pleno',
    watering: 'baixa',
    petFriendly: false,
    wateringTip: 'Regar a cada 10 a 15 dias. O excesso de água apodrece as folhas carnudas.',
    careInstructions: 'Gosta de sol direto de pelo menos 4 a 6 horas por dia. Substrato bem drenável com areia.',
    cycle: 'Perene',
    bloomingSeason: 'Inverno e Primavera',
    pestsDiseases: 'Fungos por excesso de umidade',
    toxicity: 'Tóxica para cães e gatos se ingerida',
  },
  'croton': {
    scientific: 'Codiaeum variegatum',
    ptName: 'Cróton',
    family: 'Euphorbiaceae',
    origin: 'Indonésia e Malásia',
    light: 'sol-pleno',
    watering: 'moderada',
    petFriendly: false,
    wateringTip: 'Regar 2 a 3 vezes por semana no verão. Não deixar o solo secar completamente.',
    careInstructions: 'Quanto mais sol direto receber, mais vivas e coloridas ficam suas folhas.',
    cycle: 'Perene',
    bloomingSeason: 'Outono',
    pestsDiseases: 'Ácaros, cochonilhas',
    toxicity: 'Tóxica para animais de estimação',
  },
  'singonio': {
    scientific: 'Syngonium podophyllum',
    ptName: 'Singônio',
    family: 'Araceae',
    origin: 'América do Sul e Central',
    light: 'meia-sombra',
    watering: 'moderada',
    petFriendly: false,
    wateringTip: 'Regar 2 vezes na semana quando a terra começar a secar.',
    careInstructions: 'Crescimento rápido. Pode ser cultivada como pendente ou trepadeira.',
    cycle: 'Perene',
    bloomingSeason: 'Verão',
    pestsDiseases: 'Pulgões e ácaros',
    toxicity: 'Tóxica para pets',
  },
  'peperomia': {
    scientific: 'Peperomia caperata',
    ptName: 'Peperômia',
    family: 'Piperaceae',
    origin: 'América Central e do Sul',
    light: 'meia-sombra',
    watering: 'moderada',
    petFriendly: true,
    wateringTip: 'Regar 1 a 2 vezes por semana sem encharcar.',
    careInstructions: 'Folhas decorativas e delicadas. 100% segura para animais de estimação.',
    cycle: 'Perene',
    bloomingSeason: 'Primavera e Verão',
    pestsDiseases: 'Cochonilhas',
    toxicity: 'Não tóxica (Pet Friendly)',
  },
  'calateia': {
    scientific: 'Calathea makoyana',
    ptName: 'Calatéia / Maranta Pavão',
    family: 'Marantaceae',
    origin: 'Brasil (Florestas Tropicais)',
    light: 'meia-sombra',
    watering: 'moderada',
    petFriendly: true,
    wateringTip: 'Manter a terra sempre úmida, nunca encharcada. Evitar água clorada da torneira.',
    careInstructions: 'Conhecida como planta rezadeira (fecha as folhas à noite). Adora alta umidade do ar.',
    cycle: 'Perene',
    bloomingSeason: 'Primavera',
    pestsDiseases: 'Ácaros vermelhos',
    toxicity: 'Não tóxica (Pet Friendly)',
  },
  'rosa do deserto': {
    scientific: 'Adenium obesum',
    ptName: 'Rosa do Deserto',
    family: 'Apocynaceae',
    origin: 'África e Península Arábica',
    light: 'sol-pleno',
    watering: 'baixa',
    petFriendly: false,
    wateringTip: 'Regar abundantemente apenas quando o solo estiver totalmente seco (a cada 5 a 7 dias).',
    careInstructions: 'Necessita de sol pleno diário (no mínimo 6 horas). Substrato super drenável.',
    cycle: 'Perene',
    bloomingSeason: 'Primavera, Verão e Outono',
    pestsDiseases: 'Pulgões e ácaros nas flores',
    toxicity: 'Tóxica para pets e humanos (seiva venenosa)',
  },
  'palmeira raphis': {
    scientific: 'Rhapis excelsa',
    ptName: 'Palmeira Raphis',
    family: 'Arecaceae',
    origin: 'China e Sudeste Asiático',
    light: 'meia-sombra',
    watering: 'moderada',
    petFriendly: true,
    wateringTip: 'Regar 1 a 2 vezes na semana. Evitar ressecamento total do vaso.',
    careInstructions: 'Elegante para interiores e escritórios. Tolera bem meia-sombra e é segura para pets.',
    cycle: 'Perene',
    bloomingSeason: 'Verão',
    pestsDiseases: 'Cochonilhas de carapaça',
    toxicity: 'Não tóxica (Pet Friendly)',
  },
  'planta jade': {
    scientific: 'Crassula ovata',
    ptName: 'Planta Jade (Árvore da Fortuna)',
    family: 'Crassulaceae',
    origin: 'África do Sul e Moçambique',
    light: 'sol-pleno',
    watering: 'baixa',
    petFriendly: false,
    wateringTip: 'Regar a cada 10 a 15 dias quando a terra estiver bem seca.',
    careInstructions: 'Suculenta arbustiva de vida longa. Conhecida por atrair prosperidade e boa sorte.',
    cycle: 'Perene',
    bloomingSeason: 'Inverno',
    pestsDiseases: 'Cochonilhas farinhentas',
    toxicity: 'Tóxica para cães e gatos',
  },
  'bambu da sorte': {
    scientific: 'Dracaena sanderiana',
    ptName: 'Bambu da Sorte',
    family: 'Asparagaceae',
    origin: 'África Central',
    light: 'sombra-difusa',
    watering: 'moderada',
    petFriendly: false,
    wateringTip: 'Se cultivado em água, trocar semanalmente. Em terra, manter úmido.',
    careInstructions: 'Luz difusa, nunca sol direto. Tradicional símbolo de harmonia e boas energias.',
    cycle: 'Perene',
    bloomingSeason: 'Raro em cultivo interno',
    pestsDiseases: 'Fungos na água se não for trocada',
    toxicity: 'Tóxica para cães e gatos',
  }
};

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function findPreset(query: string): PlantBotanicalPreset | undefined {
  const norm = normalizeText(query);
  // Busca exata na chave
  if (BOTANICAL_DATABASE[norm]) return BOTANICAL_DATABASE[norm];

  // Busca parcial por chave popular
  for (const key of Object.keys(BOTANICAL_DATABASE)) {
    if (norm.includes(key) || key.includes(norm)) {
      return BOTANICAL_DATABASE[key];
    }
  }

  // Busca por nome científico
  for (const key of Object.keys(BOTANICAL_DATABASE)) {
    const item = BOTANICAL_DATABASE[key];
    if (normalizeText(item.scientific).includes(norm) || norm.includes(normalizeText(item.scientific))) {
      return item;
    }
  }

  return undefined;
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
    regular_url?: string;
    medium_url?: string;
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
  fromFallback?: boolean;
}

// Cache simples em memória para evitar gastar cota em requisições repetidas
const searchCache = new Map<string, PerenualSpeciesResult[]>();
const detailsCache = new Map<number, any>();

export const perenualService = {
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

  // Busca espécies permitindo tanto Nome Popular (ex: Costela de Adão) quanto Nome Científico
  async searchSpecies(rawQuery: string): Promise<PerenualSpeciesResult[]> {
    const trimmedQuery = rawQuery.trim();
    if (!trimmedQuery) return [];

    const normQuery = normalizeText(trimmedQuery);
    const cached = searchCache.get(normQuery);
    if (cached) return cached;

    const preset = findPreset(trimmedQuery);
    const queryTerm = preset ? preset.scientific : trimmedQuery;

    const apiKey = this.getApiKey();
    let apiResults: PerenualSpeciesResult[] = [];

    // Se houver chave, tenta a API
    if (apiKey) {
      try {
        const url = `https://perenual.com/api/species-list?key=${apiKey}&q=${encodeURIComponent(queryTerm)}`;
        const response = await fetch(url);

        if (response.ok) {
          const data = await response.json();
          if (data && data.data && Array.isArray(data.data)) {
            apiResults = data.data;
          }
        }
      } catch (e) {
        console.warn('Perenual API species-list fetch failed, falling back to local database:', e);
      }
    }

    // Se a API não retornou nada ou falhou por cota/rede, mas temos a planta na base interna:
    if (apiResults.length === 0 && preset) {
      const localResult: PerenualSpeciesResult = {
        id: 999000 + Math.floor(Math.random() * 1000),
        common_name: preset.ptName,
        scientific_name: [preset.scientific],
        cycle: preset.cycle,
        watering: preset.watering === 'baixa' ? 'Minimum' : preset.watering === 'moderada' ? 'Average' : 'Frequent',
        sunlight: [preset.light === 'sol-pleno' ? 'full sun' : preset.light === 'meia-sombra' ? 'part shade' : 'shade'],
        matchedPtName: preset.ptName,
      };
      apiResults = [localResult];
    }

    // Enriquece os resultados com nomes populares em português
    const formatted = apiResults.map(item => {
      let matchedPtName = preset?.ptName;
      if (!matchedPtName && item.scientific_name && item.scientific_name[0]) {
        const match = findPreset(item.scientific_name[0]);
        if (match) matchedPtName = match.ptName;
      }
      return {
        ...item,
        matchedPtName: matchedPtName || item.common_name,
      };
    });

    if (formatted.length > 0) {
      searchCache.set(normQuery, formatted);
    }

    return formatted;
  },

  // Busca os detalhes e faz fallback automático e seguro caso a API retorne Status 429 ou erro
  async getSpeciesDetails(
    speciesItem: PerenualSpeciesResult,
    originalSearchQuery?: string
  ): Promise<PlantClassificationDetails> {
    const speciesId = speciesItem.id;
    const apiKey = this.getApiKey();
    let details: any = detailsCache.get(speciesId) || null;
    let hitRateLimitOrError = false;

    // Se temos apiKey e não está em cache, tenta buscar detalhes adicionais
    if (!details && apiKey && speciesId < 900000) {
      try {
        const detailsUrl = `https://perenual.com/api/species/details/${speciesId}?key=${apiKey}`;
        const res = await fetch(detailsUrl);
        if (res.ok) {
          details = await res.json();
          detailsCache.set(speciesId, details);
        } else {
          // Status 429 (Too Many Requests) ou outro erro de cota da API
          hitRateLimitOrError = true;
          console.warn(`Perenual details API returned status ${res.status}. Using smart fallback.`);
        }
      } catch (err) {
        hitRateLimitOrError = true;
        console.warn('Error fetching details from Perenual API:', err);
      }
    }

    // Se não conseguimos detalhes extras pela API (ex: Status 429), usamos o próprio item já recebido na lista
    const source = details || speciesItem;

    // Verifica se temos informações ricas na nossa base interna
    const preset =
      findPreset(originalSearchQuery || '') ||
      (source.scientific_name && source.scientific_name[0] ? findPreset(source.scientific_name[0]) : undefined) ||
      (source.common_name ? findPreset(source.common_name) : undefined);

    // Mapear Iluminação
    let mappedLight: LightRequirement = preset ? preset.light : 'meia-sombra';
    if (!preset && source.sunlight) {
      const sunlightStr = JSON.stringify(source.sunlight).toLowerCase();
      if (sunlightStr.includes('full sun') || sunlightStr.includes('full_sun')) {
        mappedLight = 'sol-pleno';
      } else if (sunlightStr.includes('part shade') || sunlightStr.includes('part sun') || sunlightStr.includes('sun-part-shade')) {
        mappedLight = 'meia-sombra';
      } else if (sunlightStr.includes('shade') || sunlightStr.includes('filtered shade')) {
        mappedLight = 'sombra-difusa';
      }
    }

    // Mapear Rega
    let mappedWatering: WateringFrequency = preset ? preset.watering : 'moderada';
    if (!preset && source.watering) {
      const wateringStr = source.watering.toLowerCase();
      if (wateringStr.includes('minimum') || wateringStr.includes('low') || wateringStr.includes('little')) {
        mappedWatering = 'baixa';
      } else if (wateringStr.includes('average') || wateringStr.includes('moderate')) {
        mappedWatering = 'moderada';
      } else if (wateringStr.includes('frequent') || wateringStr.includes('high') || wateringStr.includes('moist')) {
        mappedWatering = 'frequente';
      }
    }

    // Mapear Toxicidade e Segurança para Pets
    let isToxic = preset ? !preset.petFriendly : false;
    if (!preset && (source.toxicity_from_cats !== undefined || source.toxicity_from_dogs !== undefined)) {
      const hasCats = source.toxicity_from_cats === true || (typeof source.toxicity_from_cats === 'number' && source.toxicity_from_cats > 0);
      const hasDogs = source.toxicity_from_dogs === true || (typeof source.toxicity_from_dogs === 'number' && source.toxicity_from_dogs > 0);
      isToxic = hasCats || hasDogs;
    }
    const petFriendly = preset ? preset.petFriendly : !isToxic;

    // Nome Popular
    const popularName =
      preset?.ptName ||
      speciesItem.matchedPtName ||
      source.common_name ||
      (source.scientific_name ? source.scientific_name[0] : 'Planta');

    // Nome Científico
    const scientificName =
      (source.scientific_name && source.scientific_name[0]) ||
      preset?.scientific ||
      popularName;

    // Imagem
    const imageUrl =
      (source.default_image && (source.default_image.original_url || source.default_image.regular_url || source.default_image.medium_url)) ||
      (speciesItem.default_image && (speciesItem.default_image.original_url || speciesItem.default_image.regular_url || speciesItem.default_image.thumbnail)) ||
      undefined;

    // Dicas e Cuidados
    const careGuideText =
      source.care_instructions ||
      preset?.careInstructions ||
      `Planta do tipo ${source.type || 'ornamental'}. Ciclo ${source.cycle || 'perene'}. Mantenha em ambiente com boa iluminação e ventilação.`;

    const wateringTipText =
      preset?.wateringTip ||
      (mappedWatering === 'baixa'
        ? 'Regar apenas quando o solo estiver totalmente seco.'
        : mappedWatering === 'frequente'
        ? 'Manter o solo sempre úmido, sem encharcar as raízes.'
        : 'Regar 1 a 2 vezes por semana, verificando a umidade do substrato.');

    return {
      name: popularName,
      scientificName,
      light: mappedLight,
      watering: mappedWatering,
      petFriendly,
      imageUrl,
      wateringTip: wateringTipText,
      careInstructions: careGuideText,
      family: source.family || preset?.family || '',
      origin: (source.origin && Array.isArray(source.origin) ? source.origin.join(', ') : source.origin) || preset?.origin || '',
      cycle: source.cycle || preset?.cycle || 'Perene',
      bloomingSeason: source.blooming_season || preset?.bloomingSeason || 'Primavera / Verão',
      pestsDiseases: (source.pest_susceptibility && Array.isArray(source.pest_susceptibility) ? source.pest_susceptibility.join(', ') : source.pest_susceptibility) || preset?.pestsDiseases || 'Cochonilhas e ácaros',
      toxicity: preset ? preset.toxicity : (isToxic ? 'Tóxica para animais domésticos se ingerida' : 'Segura para animais de estimação'),
      fromFallback: hitRateLimitOrError,
    };
  }
};
