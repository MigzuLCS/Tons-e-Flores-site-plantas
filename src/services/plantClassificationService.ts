import type { LightRequirement, WateringFrequency } from '../types/plant';
import { configService } from './configService';

export interface PlantBotanicalPreset {
  scientific: string;
  ptName: string;
  family: string;
  origin: string;
  suggestedCategory: string;
  light: LightRequirement;
  watering: WateringFrequency;
  petFriendly: boolean;
  wateringTip: string;
  careInstructions: string;
  cycle: string;
  bloomingSeason: string;
  pestsDiseases: string;
  toxicity: string;
  imageUrl?: string;
  aliases?: string[];
}

export interface BotanicalSearchResult {
  id: string | number;
  common_name: string;
  scientific_name: string[];
  matchedPtName: string;
  suggestedCategory?: string;
  family?: string;
  origin?: string;
  light?: LightRequirement;
  watering?: WateringFrequency;
  petFriendly?: boolean;
  wateringTip?: string;
  careInstructions?: string;
  cycle?: string;
  bloomingSeason?: string;
  pestsDiseases?: string;
  toxicity?: string;
  imageUrl?: string;
  source: 'local' | 'gemini' | 'wikipedia' | 'fallback';
}

export interface PlantClassificationDetails {
  name: string;
  scientificName: string;
  suggestedCategory?: string;
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
  source?: 'local' | 'gemini' | 'wikipedia' | 'fallback';
}

// 🌿 Dedução inteligente de categorias padrão da loja
export function inferCategory(name: string, family?: string, description?: string): string {
  const text = `${name} ${family || ''} ${description || ''}`.toLowerCase();

  if (
    text.includes('cacto') ||
    text.includes('suculenta') ||
    text.includes('crassul') ||
    text.includes('echeveria') ||
    text.includes('sedum') ||
    text.includes('aloe') ||
    text.includes('kalanchoe') ||
    text.includes('cactaceae')
  ) {
    return 'Suculentas & Cactos';
  }

  if (
    text.includes('orquid') ||
    text.includes('orquídea') ||
    text.includes('rosa') ||
    text.includes('lirio') ||
    text.includes('lírio') ||
    text.includes('anturio') ||
    text.includes('antúrio') ||
    text.includes('flor') ||
    text.includes('hibisco') ||
    text.includes('violeta') ||
    text.includes('azaleia') ||
    text.includes('girassol') ||
    text.includes('begonia') ||
    text.includes('begônia') ||
    text.includes('orchidaceae')
  ) {
    return 'Flores';
  }

  if (
    text.includes('pendente') ||
    text.includes('samambaia') ||
    text.includes('jiboia') ||
    text.includes('jibóia') ||
    text.includes('colar') ||
    text.includes('corações') ||
    text.includes('hoya') ||
    text.includes('hera') ||
    text.includes('cascata') ||
    text.includes('avenca') ||
    text.includes('renda portuguesa') ||
    text.includes('chifre de veado')
  ) {
    return 'Pendentes';
  }

  if (
    text.includes('hortela') ||
    text.includes('hortelã') ||
    text.includes('manjericao') ||
    text.includes('manjericão') ||
    text.includes('alecrim') ||
    text.includes('lavanda') ||
    text.includes('tomilho') ||
    text.includes('tempero') ||
    text.includes('erva') ||
    text.includes('chá') ||
    text.includes('cha') ||
    text.includes('salvia') ||
    text.includes('sálvia') ||
    text.includes('cebolinha') ||
    text.includes('salsa') ||
    text.includes('coentro') ||
    text.includes('oregano') ||
    text.includes('orégano') ||
    text.includes('pimenta') ||
    text.includes('lamiaceae')
  ) {
    return 'Ervas & Temperos';
  }

  if (
    text.includes('arvore') ||
    text.includes('árvore') ||
    text.includes('arbusto') ||
    text.includes('ficus') ||
    text.includes('palmeira') ||
    text.includes('pleomele') ||
    text.includes('pata de elefante') ||
    text.includes('dracena') ||
    text.includes('dracaena') ||
    text.includes('bambu') ||
    text.includes('areca') ||
    text.includes('rafia') ||
    text.includes('moraceae')
  ) {
    return 'Arbustos & Árvores';
  }

  return 'Folhagens';
}

// 🌿 Base botânica brasileira completa com categorias mapeadas
const BOTANICAL_DATABASE: Record<string, PlantBotanicalPreset> = {
  'costela de adao': {
    scientific: 'Monstera deliciosa',
    ptName: 'Costela de Adão',
    family: 'Araceae',
    origin: 'América Central e do Sul (México até Panamá)',
    suggestedCategory: 'Folhagens',
    light: 'meia-sombra',
    watering: 'moderada',
    petFriendly: false,
    wateringTip: 'Regar 1 a 2 vezes por semana quando os primeiros 2cm do solo estiverem secos.',
    careInstructions: 'Luz indireta brilhante. Limpar as folhas com pano úmido 1x ao mês para manter a respiração da planta.',
    cycle: 'Perene',
    bloomingSeason: 'Verão (raro em ambientes internos)',
    pestsDiseases: 'Cochonilhas, ácaros rajados',
    toxicity: 'Tóxica para cães e gatos (contém oxalato de cálcio)',
    aliases: ['monstera', 'monstera deliciosa', 'ceriman', 'abacaxi-do-reino'],
  },
  'jiboia': {
    scientific: 'Epipremnum aureum',
    ptName: 'Jiboia',
    family: 'Araceae',
    origin: 'Ilhas Salomão e Sudeste Asiático',
    suggestedCategory: 'Pendentes',
    light: 'sombra-difusa',
    watering: 'moderada',
    petFriendly: false,
    wateringTip: 'Regar quando a terra estiver quase seca ao toque, sem encharcar.',
    careInstructions: 'Excelente para vasos suspensos ou tutorada em suporte de fibra de coco. Muito resistente e purificadora do ar.',
    cycle: 'Perene',
    bloomingSeason: 'Primavera',
    pestsDiseases: 'Pulgões e cochonilhas',
    toxicity: 'Tóxica para pets ao mastigar ou ingerir (oxalato de cálcio)',
    aliases: ['epipremnum', 'epipremnum aureum', 'hera-do-diabo', 'pothos', 'jiboia verde', 'jiboia amarela', 'jiboia prateada'],
  },
  'espada de sao jorge': {
    scientific: 'Dracaena trifasciata',
    ptName: 'Espada de São Jorge',
    family: 'Asparagaceae',
    origin: 'África Ocidental Tropical',
    suggestedCategory: 'Folhagens',
    light: 'sol-pleno',
    watering: 'baixa',
    petFriendly: false,
    wateringTip: 'Regar a cada 10 a 15 dias no verão e 20 dias no inverno. O solo deve secar completamente entre as regas.',
    careInstructions: 'Planta purificadora de ar e extremamente rústica. Suporta sol pleno, meia sombra ou ambientes de baixa luminosidade.',
    cycle: 'Perene',
    bloomingSeason: 'Verão',
    pestsDiseases: 'Cochonilhas e podridão radicular por excesso de água',
    toxicity: 'Tóxica para cães e gatos se ingerida',
    aliases: ['sansevieria', 'sansevieria trifasciata', 'dracaena trifasciata', 'espada de santa barbara', 'espada-de-são-jorge', 'lingua de sogra'],
  },
  'zamioculca': {
    scientific: 'Zamioculcas zamiifolia',
    ptName: 'Zamioculca',
    family: 'Araceae',
    origin: 'África Oriental (Quênia, Tanzânia e África do Sul)',
    suggestedCategory: 'Folhagens',
    light: 'sombra-difusa',
    watering: 'baixa',
    petFriendly: false,
    wateringTip: 'Regar a cada 15 a 20 dias. O tubérculo subterrâneo retém muita água.',
    careInstructions: 'Tolera locais com pouca luz e ar-condicionado. Nunca deixe o prato com água parada.',
    cycle: 'Perene',
    bloomingSeason: 'Outono / Inverno',
    pestsDiseases: 'Podridão de raízes por excesso de umidade',
    toxicity: 'Tóxica para cães e gatos',
    aliases: ['zz plant', 'zamioculcas', 'zamioculcas zamiifolia', 'planta da fortuna', 'zamioculca raven'],
  },
  'lirio da paz': {
    scientific: 'Spathiphyllum wallisii',
    ptName: 'Lírio da Paz',
    family: 'Araceae',
    origin: 'América Tropical (Colômbia e Venezuela)',
    suggestedCategory: 'Flores',
    light: 'sombra-difusa',
    watering: 'frequente',
    petFriendly: false,
    wateringTip: 'Manter a terra sempre levemente úmida (2 a 3 vezes por semana). Ela "avisa" murchando suavemente quando precisa de água.',
    careInstructions: 'Gosta de umidade no ar. Excelente filtradora de toxinas em ambientes fechados. Proteger do sol direto para não queimar as folhas.',
    cycle: 'Perene',
    bloomingSeason: 'Primavera e Verão',
    pestsDiseases: 'Ácaros e cochonilha branca',
    toxicity: 'Tóxica para animais de estimação',
    aliases: ['spathiphyllum', 'spathiphyllum wallisii', 'lírio da paz', 'espatifilo', 'bandeira branca'],
  },
  'samambaia': {
    scientific: 'Nephrolepis exaltata',
    ptName: 'Samambaia Americana',
    family: 'Lomariopsidaceae',
    origin: 'América Central e do Sul',
    suggestedCategory: 'Pendentes',
    light: 'meia-sombra',
    watering: 'frequente',
    petFriendly: true,
    wateringTip: 'Regar quase diariamente no calor ou a cada 2 dias no frio, mantendo o solo úmido mas drenado.',
    careInstructions: 'Proteger de ventos fortes e sol direto. Borrifar água nas folhas nos dias secos para manter a umidade alta.',
    cycle: 'Perene',
    bloomingSeason: 'Não produz flores (reproduz por esporos)',
    pestsDiseases: 'Lagartas e pulgões',
    toxicity: 'Não tóxica (100% Pet Friendly)',
    aliases: ['samambaia americana', 'samambaia de metro', 'nephrolepis', 'nephrolepis exaltata', 'samambaia paulistinha'],
  },
  'anturio': {
    scientific: 'Anthurium andraeanum',
    ptName: 'Antúrio',
    family: 'Araceae',
    origin: 'América do Sul (Colômbia e Equador)',
    suggestedCategory: 'Flores',
    light: 'meia-sombra',
    watering: 'moderada',
    petFriendly: false,
    wateringTip: 'Regar 2 vezes na semana no verão e 1 vez no inverno. Substrato úmido sem encharcar.',
    careInstructions: 'Aprecia claridade difusa e boa umidade do ar. Evite expor as folhas a correntes de ar frio.',
    cycle: 'Perene',
    bloomingSeason: 'O ano todo sob condições ideais',
    pestsDiseases: 'Pulgões e fungos foliares',
    toxicity: 'Tóxica para cães e gatos',
    aliases: ['anthurium', 'anthurium andraeanum', 'anturio vermelho', 'anturio branco', 'antúrio'],
  },
  'ficus lyrata': {
    scientific: 'Ficus lyrata',
    ptName: 'Ficus Lyrata',
    family: 'Moraceae',
    origin: 'África Ocidental',
    suggestedCategory: 'Arbustos & Árvores',
    light: 'sol-pleno',
    watering: 'moderada',
    petFriendly: false,
    wateringTip: 'Regar quando os primeiros 3 a 5 cm do solo estiverem secos. Geralmente 1x por semana.',
    careInstructions: 'Aprecia muita luminosidade (pelo menos 4 horas de sol indireto forte por dia). Não gosta de ser mudada de lugar com frequência.',
    cycle: 'Perene',
    bloomingSeason: 'Raro em interiores',
    pestsDiseases: 'Ácaros, fungos de folhagem e cochonilhas',
    toxicity: 'Tóxica para cães e gatos (seiva leitosa irritante)',
    aliases: ['figueira lira', 'fiddle leaf fig', 'ficus', 'ficus violino'],
  },
  'ficus elastica': {
    scientific: 'Ficus elastica',
    ptName: 'Falsa Seringueira (Ficus Elastica)',
    family: 'Moraceae',
    origin: 'Índia e Malásia',
    suggestedCategory: 'Arbustos & Árvores',
    light: 'meia-sombra',
    watering: 'moderada',
    petFriendly: false,
    wateringTip: 'Regar 1 a 2 vezes por semana no verão, reduzindo no inverno quando a terra secar.',
    careInstructions: 'Folhas grandes e brilhantes. Limpar o pó periodicamente e manter em local bem iluminado.',
    cycle: 'Perene',
    bloomingSeason: 'Raro em vasos',
    pestsDiseases: 'Cochonilhas e tripes',
    toxicity: 'Tóxica para animais de estimação',
    aliases: ['ficus elastica', 'ficus burgundy', 'borracheira', 'seringueira de jardim', 'rubber plant'],
  },
  'calathea': {
    scientific: 'Goeppertia insignis',
    ptName: 'Maranta / Calathea (Planta Pavão)',
    family: 'Marantaceae',
    origin: 'Florestas Tropicais do Brasil',
    suggestedCategory: 'Folhagens',
    light: 'sombra-difusa',
    watering: 'frequente',
    petFriendly: true,
    wateringTip: 'Manter a terra sempre levemente úmida usando água sem cloro (ou descansada).',
    careInstructions: 'Move suas folhas à noite ("planta que reza"). Gosta de ambiente úmido, calor e sombra protegida.',
    cycle: 'Perene',
    bloomingSeason: 'Primavera / Verão',
    pestsDiseases: 'Ácaros em ambientes secos',
    toxicity: 'Não tóxica (100% Pet Friendly)',
    aliases: ['maranta', 'calathea', 'maranta cascavel', 'planta pavao', 'planta rezadeira', 'calateia', 'goeppertia'],
  },
  'peperomia': {
    scientific: 'Peperomia caperata',
    ptName: 'Peperômia',
    family: 'Piperaceae',
    origin: 'América Central e do Sul (Brasil tropical)',
    suggestedCategory: 'Folhagens',
    light: 'sombra-difusa',
    watering: 'moderada',
    petFriendly: true,
    wateringTip: 'Regar quando a camada superficial da terra secar. Folhas carnosas retêm umidade.',
    careInstructions: 'Perfeita para mesas de trabalho e ambientes compactos. Não tolera encharcamento.',
    cycle: 'Perene',
    bloomingSeason: 'Primavera e Verão',
    pestsDiseases: 'Cochonilhas e podridão do caule',
    toxicity: 'Não tóxica (100% Pet Friendly)',
    aliases: ['peperomia caperata', 'peperomia melancia', 'peperomia variegata', 'peperômia', 'peperomia scandens'],
  },
  'begonia rex': {
    scientific: 'Begonia rex-cultorum',
    ptName: 'Begônia Rex',
    family: 'Begoniaceae',
    origin: 'Índia e Sudeste Asiático',
    suggestedCategory: 'Folhagens',
    light: 'sombra-difusa',
    watering: 'moderada',
    petFriendly: false,
    wateringTip: 'Regar o solo diretamente sem molhar as folhas para prevenir manchas e fungos.',
    careInstructions: 'Folhagem com desenhos exuberantes e cores metálicas. Mantenha em luz indireta abundante.',
    cycle: 'Perene',
    bloomingSeason: 'Verão',
    pestsDiseases: 'Oídio e míldio',
    toxicity: 'Tóxica para cães e gatos (rizomas concentram oxalatos)',
    aliases: ['begonia', 'begônia', 'begonia rex', 'begonia maculata', 'begônia maculata', 'begonia asa de anjo'],
  },
  'monstera adansonii': {
    scientific: 'Monstera adansonii',
    ptName: 'Costela de Eva (Monstera Furadinha)',
    family: 'Araceae',
    origin: 'América Central e do Sul',
    suggestedCategory: 'Pendentes',
    light: 'meia-sombra',
    watering: 'moderada',
    petFriendly: false,
    wateringTip: 'Regar 1 a 2 vezes na semana quando o topo do substrato estiver seco.',
    careInstructions: 'Excelente trepadeira ou pendente. As fenestras nas folhas necessitam de boa luz indireta.',
    cycle: 'Perene',
    bloomingSeason: 'Verão',
    pestsDiseases: 'Ácaros e tripes',
    toxicity: 'Tóxica para animais se ingerida',
    aliases: ['costela de eva', 'monstera adansonii', 'queijo suico', 'monkey mask', 'monstera furadinha'],
  },
  'suculenta echeveria': {
    scientific: 'Echeveria elegans',
    ptName: 'Rosa de Pedra (Echeveria)',
    family: 'Crassulaceae',
    origin: 'México e América Central',
    suggestedCategory: 'Suculentas & Cactos',
    light: 'sol-pleno',
    watering: 'baixa',
    petFriendly: true,
    wateringTip: 'Regar somente quando o substrato estiver 100% seco (a cada 10-15 dias). Não molhar o miolo da roseta.',
    careInstructions: 'Necessita de pelo menos 4 a 6 horas diárias de sol direto para manter a forma compacta e cor viva.',
    cycle: 'Perene',
    bloomingSeason: 'Primavera',
    pestsDiseases: 'Cochonilha de carapaça e fungos por excesso de água',
    toxicity: 'Não tóxica (Pet Friendly)',
    aliases: ['suculenta', 'echeveria', 'rosa de pedra', 'echeveria elegans', 'suculentas'],
  },
  'planta jade': {
    scientific: 'Crassula ovata',
    ptName: 'Planta Jade (Árvore da Fortuna)',
    family: 'Crassulaceae',
    origin: 'África do Sul',
    suggestedCategory: 'Suculentas & Cactos',
    light: 'sol-pleno',
    watering: 'baixa',
    petFriendly: false,
    wateringTip: 'Regar a cada 10 a 15 dias no verão e apenas 1 vez ao mês no inverno.',
    careInstructions: 'Cultivada como suculenta arbustiva ou mini-bonsai. Símbolo de prosperidade e muito duradoura.',
    cycle: 'Perene',
    bloomingSeason: 'Inverno / Primavera',
    pestsDiseases: 'Cochonilhas farinhentas',
    toxicity: 'Tóxica para cães e gatos se ingerida',
    aliases: ['crassula', 'crassula ovata', 'arvore da fortuna', 'planta do dinheiro', 'jade'],
  },
  'cacto': {
    scientific: 'Mammillaria elongata',
    ptName: 'Cacto',
    family: 'Cactaceae',
    origin: 'Américas (Zonas áridas e desérticas)',
    suggestedCategory: 'Suculentas & Cactos',
    light: 'sol-pleno',
    watering: 'baixa',
    petFriendly: true,
    wateringTip: 'Regar 1 vez a cada 15 a 20 dias no calor e 1 vez ao mês no frio. Solo hiper drenável.',
    careInstructions: 'Exige sol pleno e máxima circulação de ar. O maior erro no cultivo é regar em excesso.',
    cycle: 'Perene',
    bloomingSeason: 'Primavera e Verão',
    pestsDiseases: 'Cochonilhas de raiz',
    toxicity: 'Não tóxica (atenção apenas aos espinhos físicos)',
    aliases: ['cactos', 'cactus', 'mammillaria', 'echinocactus', 'cacto castelo de fadas', 'cacto mandacaru'],
  },
  'orquidea phalaenopsis': {
    scientific: 'Phalaenopsis aphrodite',
    ptName: 'Orquídea Borboleta (Phalaenopsis)',
    family: 'Orchidaceae',
    origin: 'Sudeste Asiático e Filipinas',
    suggestedCategory: 'Flores',
    light: 'sombra-difusa',
    watering: 'moderada',
    petFriendly: true,
    wateringTip: 'Regar com água corrente pelas cascas do vaso quando as raízes ficarem esbranquiçadas (a cada 5-7 dias).',
    careInstructions: 'Cultivada em casca de pinus/carvão. Nunca plantar em terra comum. Luz indireta e boa ventilação.',
    cycle: 'Perene',
    bloomingSeason: 'Outono / Inverno (dura até 3 meses em flor)',
    pestsDiseases: 'Fungos, pulgões e cochonilhas',
    toxicity: 'Não tóxica (100% Pet Friendly)',
    aliases: ['orquidea', 'orquídea', 'phalaenopsis', 'orquidea phalaenopsis', 'orquídea borboleta'],
  },
  'dracena pleomele': {
    scientific: 'Dracaena reflexa',
    ptName: 'Pleomele (Dracena Reflexa)',
    family: 'Asparagaceae',
    origin: 'Madagascar e Ilhas do Oceano Índico',
    suggestedCategory: 'Arbustos & Árvores',
    light: 'meia-sombra',
    watering: 'moderada',
    petFriendly: false,
    wateringTip: 'Regar 1 a 2 vezes por semana mantendo o solo levemente úmido.',
    careInstructions: 'Arbusto ornamental muito elegante para salas de estar e escritórios. Folhagem variegata verde e amarela.',
    cycle: 'Perene',
    bloomingSeason: 'Primavera',
    pestsDiseases: 'Cochonilhas e ácaros',
    toxicity: 'Tóxica para pets se mastigada',
    aliases: ['pleomele', 'dracena reflexa', 'dracaena reflexa', 'dracena'],
  },
  'alocasia': {
    scientific: 'Alocasia amazonica',
    ptName: 'Alocasia Polly (Orelha de Burro / Cara de Cavalo)',
    family: 'Araceae',
    origin: 'Ásia Tropical e Filipinas',
    suggestedCategory: 'Folhagens',
    light: 'sombra-difusa',
    watering: 'moderada',
    petFriendly: false,
    wateringTip: 'Regar 2 vezes na semana no calor mantendo a terra fofa e úmida, reduzindo no inverno.',
    careInstructions: 'Aprecia alta umidade do ar e calor. Pode entrar em dormência no inverno se a temperatura cair muito.',
    cycle: 'Perene',
    bloomingSeason: 'Verão',
    pestsDiseases: 'Ácaros rajados em locais secos',
    toxicity: 'Tóxica para cães e gatos',
    aliases: ['alocasia amazonica', 'alocasia polly', 'orelha de elefante', 'alocacia', 'alocasia'],
  },
  'aglaonema': {
    scientific: 'Aglaonema commutatum',
    ptName: 'Aglaonema (Café de Salão)',
    family: 'Araceae',
    origin: 'Florestas Úmidas do Sudeste Asiático',
    suggestedCategory: 'Folhagens',
    light: 'sombra-difusa',
    watering: 'moderada',
    petFriendly: false,
    wateringTip: 'Regar quando a superfície do substrato estiver quase seca ao toque.',
    careInstructions: 'Uma das melhores plantas para ambientes internos com pouca luminosidade natural. Muito resistente.',
    cycle: 'Perene',
    bloomingSeason: 'Verão',
    pestsDiseases: 'Cochonilhas',
    toxicity: 'Tóxica para animais de estimação',
    aliases: ['aglaonema', 'cafe de salao', 'falso cafeeiro', 'aglaonema commutatum'],
  },
  'singonio': {
    scientific: 'Syngonium podophyllum',
    ptName: 'Singônio',
    family: 'Araceae',
    origin: 'América Central e do Sul (México até Brasil)',
    suggestedCategory: 'Folhagens',
    light: 'sombra-difusa',
    watering: 'moderada',
    petFriendly: false,
    wateringTip: 'Regar 2 vezes por semana no verão e 1 vez no inverno.',
    careInstructions: 'Cresce rápido como forração, vaso pendente ou tutorado. As folhas mudam de formato com a idade.',
    cycle: 'Perene',
    bloomingSeason: 'Primavera',
    pestsDiseases: 'Pulgões e cochonilhas',
    toxicity: 'Tóxica para pets',
    aliases: ['singonio', 'syngonium', 'syngonium podophyllum', 'singônio'],
  },
  'pata de elefante': {
    scientific: 'Beaucarnea recurvata',
    ptName: 'Pata de Elefante (Beaucarnea)',
    family: 'Asparagaceae',
    origin: 'México',
    suggestedCategory: 'Arbustos & Árvores',
    light: 'sol-pleno',
    watering: 'baixa',
    petFriendly: true,
    wateringTip: 'Regar a cada 15 a 20 dias. O tronco dilatado funciona como reservatório natural de água.',
    careInstructions: 'Adora sol pleno ou claridade muito intensa. Praticamente imune a secas moderadas.',
    cycle: 'Perene',
    bloomingSeason: 'Raro em vasos',
    pestsDiseases: 'Podridão por excesso de rega',
    toxicity: 'Não tóxica (100% Pet Friendly)',
    aliases: ['pata de elefante', 'beaucarnea', 'beaucarnea recurvata', 'nolina'],
  },
  'ceropegia woodii': {
    scientific: 'Ceropegia woodii',
    ptName: 'Corações Emaranhados',
    family: 'Apocynaceae',
    origin: 'África do Sul e Zimbábue',
    suggestedCategory: 'Pendentes',
    light: 'meia-sombra',
    watering: 'baixa',
    petFriendly: true,
    wateringTip: 'Regar quando o substrato secar por completo (a cada 7-10 dias).',
    careInstructions: 'Pendente delicada com folhas suculentas em formato de coração. Aprecia boa luz indireta.',
    cycle: 'Perene',
    bloomingSeason: 'Verão e Outono',
    pestsDiseases: 'Cochonilhas',
    toxicity: 'Não tóxica (100% Pet Friendly)',
    aliases: ['coracoes emaranhados', 'ceropegia woodii', 'ceropegia', 'string of hearts', 'rosario'],
  },
  'senecio rowleyanus': {
    scientific: 'Curio rowleyanus',
    ptName: 'Colar de Pérolas (Rosário)',
    family: 'Asteraceae',
    origin: 'Sudoeste da África',
    suggestedCategory: 'Pendentes',
    light: 'meia-sombra',
    watering: 'baixa',
    petFriendly: false,
    wateringTip: 'Regar quando as esferas começarem a murchar suavemente (a cada 10 a 14 dias).',
    careInstructions: 'Suculenta pendente única. Mantenha em local bem ventilado e com muita claridade sem sol direto escaldante.',
    cycle: 'Perene',
    bloomingSeason: 'Primavera',
    pestsDiseases: 'Podridão por excesso de rega',
    toxicity: 'Tóxica para pets se ingerida',
    aliases: ['colar de perolas', 'senecio rowleyanus', 'curio rowleyanus', 'rosario suculenta', 'colar de ervilhas'],
  },
  'hoya carnosa': {
    scientific: 'Hoya carnosa',
    ptName: 'Flor de Cera (Hoya)',
    family: 'Apocynaceae',
    origin: 'Leste Asiático e Austrália',
    suggestedCategory: 'Pendentes',
    light: 'meia-sombra',
    watering: 'baixa',
    petFriendly: true,
    wateringTip: 'Regar apenas quando a terra secar quase por completo.',
    careInstructions: 'Trepadeira ou pendente com flores cerosas perfumadas em formato de estrela. Durável e rústica.',
    cycle: 'Perene',
    bloomingSeason: 'Primavera e Verão',
    pestsDiseases: 'Cochonilhas',
    toxicity: 'Não tóxica (100% Pet Friendly)',
    aliases: ['flor de cera', 'hoya carnosa', 'hoya', 'wax plant'],
  },
  'asplenio': {
    scientific: 'Asplenium nidus',
    ptName: 'Asplênio (Ninho de Pássaro)',
    family: 'Aspleniaceae',
    origin: 'Florestas Tropicais da Ásia e Australásia',
    suggestedCategory: 'Folhagens',
    light: 'sombra-difusa',
    watering: 'frequente',
    petFriendly: true,
    wateringTip: 'Regar as laterais do vaso sem molhar o centro da roseta (a cada 2-3 dias).',
    careInstructions: 'Folhas largas e onduladas verde-maçã. Aprecia umidade constante e locais protegidos do sol direto.',
    cycle: 'Perene',
    bloomingSeason: 'Não floresce (esporos)',
    pestsDiseases: 'Cochonilhas e lesmas',
    toxicity: 'Não tóxica (100% Pet Friendly)',
    aliases: ['asplenio', 'asplenium nidus', 'asplenium', 'ninho de passaro', 'asplênio'],
  },
  'hibisco': {
    scientific: 'Hibiscus rosa-sinensis',
    ptName: 'Hibisco (Graxa de Estudante)',
    family: 'Malvaceae',
    origin: 'Ásia Tropical',
    suggestedCategory: 'Flores',
    light: 'sol-pleno',
    watering: 'frequente',
    petFriendly: true,
    wateringTip: 'Regar com frequência nos dias quentes, sem encharcar o substrato.',
    careInstructions: 'Arbusto florífero que precisa de muito sol direto para floração contínua e abundante.',
    cycle: 'Perene',
    bloomingSeason: 'O ano todo sob sol pleno',
    pestsDiseases: 'Pulgões e moscas-brancas',
    toxicity: 'Não tóxica para animais',
    aliases: ['hibisco', 'hibiscus', 'hibiscus rosa-sinensis', 'mimo-de-vênus'],
  },
  'hortela': {
    scientific: 'Mentha spicata',
    ptName: 'Hortelã / Menta',
    family: 'Lamiaceae',
    origin: 'Europa e Ásia',
    suggestedCategory: 'Ervas & Temperos',
    light: 'sol-pleno',
    watering: 'frequente',
    petFriendly: true,
    wateringTip: 'Manter a terra sempre úmida, regando diariamente nos períodos quentes.',
    careInstructions: 'Erva aromática vigorosa. Melhor plantar em vaso separado para não sufocar outras plantas.',
    cycle: 'Perene',
    bloomingSeason: 'Verão',
    pestsDiseases: 'Lagartas e ácaros',
    toxicity: 'Não tóxica (em pequenas quantidades para pets)',
    aliases: ['hortela', 'menta', 'mentha spicata', 'hortelã'],
  },
  'manjericao': {
    scientific: 'Ocimum basilicum',
    ptName: 'Manjericão',
    family: 'Lamiaceae',
    origin: 'Ásia Tropical e África',
    suggestedCategory: 'Ervas & Temperos',
    light: 'sol-pleno',
    watering: 'frequente',
    petFriendly: true,
    wateringTip: 'Regar diariamente no início da manhã ou final da tarde, sem molhar as folhas no sol quente.',
    careInstructions: 'Necessita de pelo menos 4 a 6 horas de sol pleno. Podar as flores para prolongar a colheita de folhas.',
    cycle: 'Anual / Bianual',
    bloomingSeason: 'Verão',
    pestsDiseases: 'Pulgões e lagartas',
    toxicity: 'Não tóxica (100% Pet Friendly)',
    aliases: ['manjericao', 'manjericão', 'ocimum basilicum', 'albahaca', 'basilico'],
  },
  'lavanda': {
    scientific: 'Lavandula angustifolia',
    ptName: 'Lavanda / Alfazema',
    family: 'Lamiaceae',
    origin: 'Região do Mediterrâneo',
    suggestedCategory: 'Ervas & Temperos',
    light: 'sol-pleno',
    watering: 'baixa',
    petFriendly: false,
    wateringTip: 'Regar apenas quando a terra estiver bem seca. Não tolera terra encharcada.',
    careInstructions: 'Aprecia sol direto intenso, solo arenoso e muito bem drenado. Fragrância relaxante natural.',
    cycle: 'Perene',
    bloomingSeason: 'Primavera e Verão',
    pestsDiseases: 'Fungos por excesso de umidade',
    toxicity: 'Tóxica para pets se ingerida em grande quantidade',
    aliases: ['lavanda', 'alfazema', 'lavandula', 'lavandula angustifolia', 'lavanda inglesa'],
  },
  'alecrim': {
    scientific: 'Salvia rosmarinus',
    ptName: 'Alecrim',
    family: 'Lamiaceae',
    origin: 'Mediterrâneo',
    suggestedCategory: 'Ervas & Temperos',
    light: 'sol-pleno',
    watering: 'baixa',
    petFriendly: true,
    wateringTip: 'Regar a cada 4 a 7 dias, deixando a terra secar entre as irrigações.',
    careInstructions: 'Planta rústica que adora sol pleno e boa ventilação. Excelente para temperos e infusões.',
    cycle: 'Perene',
    bloomingSeason: 'Primavera / Verão',
    pestsDiseases: 'Podridão de raízes',
    toxicity: 'Não tóxica (Pet Friendly)',
    aliases: ['alecrim', 'rosmarinus officinalis', 'salvia rosmarinus', 'alecrim de horta'],
  },
};

// Normalizador de texto para comparação segura
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

// Localizador na base interna
function findLocalPreset(query: string): PlantBotanicalPreset | undefined {
  const norm = normalizeText(query);
  if (!norm) return undefined;

  // Busca exata na chave
  if (BOTANICAL_DATABASE[norm]) {
    return BOTANICAL_DATABASE[norm];
  }

  // Busca por nomes parciais, científicos ou aliases
  for (const [key, preset] of Object.entries(BOTANICAL_DATABASE)) {
    if (norm.includes(key) || key.includes(norm)) {
      return preset;
    }
    if (normalizeText(preset.ptName).includes(norm) || norm.includes(normalizeText(preset.ptName))) {
      return preset;
    }
    if (normalizeText(preset.scientific).includes(norm) || norm.includes(normalizeText(preset.scientific))) {
      return preset;
    }
    if (preset.aliases && preset.aliases.some(alias => normalizeText(alias).includes(norm) || norm.includes(normalizeText(alias)))) {
      return preset;
    }
  }

  return undefined;
}

// Caches em memória
const searchCache = new Map<string, BotanicalSearchResult[]>();
const detailsCache = new Map<string | number, PlantClassificationDetails>();

export const plantClassificationService = {
  // Retorna a chave Gemini se configurada no .env ou localStorage
  getGeminiApiKey(): string {
    const envKey = (import.meta.env.VITE_GEMINI_API_KEY as string) || '';
    if (envKey && envKey !== 'undefined' && envKey !== 'null') {
      return envKey;
    }
    return configService.getGeminiApiKey();
  },

  // 🌿 1. Busca rápida de espécies (com resultados sugeridos instantâneos)
  async searchSpecies(rawQuery: string): Promise<BotanicalSearchResult[]> {
    const trimmed = rawQuery.trim();
    if (!trimmed) return [];

    const normQuery = normalizeText(trimmed);
    const cached = searchCache.get(normQuery);
    if (cached) return cached;

    const results: BotanicalSearchResult[] = [];

    // 1a. Procura correspondências na base local
    for (const [key, preset] of Object.entries(BOTANICAL_DATABASE)) {
      const matchScore =
        (normQuery.length >= 3 && key.includes(normQuery)) ||
        (normQuery.length >= 3 && normalizeText(preset.ptName).includes(normQuery)) ||
        (normQuery.length >= 3 && normalizeText(preset.scientific).includes(normQuery)) ||
        (preset.aliases && preset.aliases.some(a => normalizeText(a).includes(normQuery)));

      if (matchScore) {
        results.push({
          id: `local_${key}`,
          common_name: preset.ptName,
          scientific_name: [preset.scientific],
          matchedPtName: preset.ptName,
          suggestedCategory: preset.suggestedCategory,
          family: preset.family,
          origin: preset.origin,
          light: preset.light,
          watering: preset.watering,
          petFriendly: preset.petFriendly,
          wateringTip: preset.wateringTip,
          careInstructions: preset.careInstructions,
          cycle: preset.cycle,
          bloomingSeason: preset.bloomingSeason,
          pestsDiseases: preset.pestsDiseases,
          toxicity: preset.toxicity,
          source: 'local',
        });
      }
    }

    // Se encontrou na base local, retorna de imediato
    if (results.length > 0) {
      searchCache.set(normQuery, results);
      return results;
    }

    const geminiKey = this.getGeminiApiKey();

    // 1b. Prioridade Máxima: Se a chave do Gemini estiver configurada, adiciona a opção de IA em primeiro lugar
    if (geminiKey) {
      results.push({
        id: `gemini_${Date.now()}_${encodeURIComponent(trimmed)}`,
        common_name: trimmed,
        scientific_name: ['Classificação Inteligente via IA'],
        matchedPtName: trimmed,
        suggestedCategory: inferCategory(trimmed),
        careInstructions: `Gerar ficha botânica completa e dicas de cultivo de "${trimmed}" com Google Gemini IA.`,
        source: 'gemini',
      });
    }

    // 1c. Em seguida, busca na API gratuita da Wikipedia em português como complemento/fallback
    try {
      const wikiUrl = `https://pt.wikipedia.org/w/api.php?action=opensearch&search=${encodeURIComponent(
        trimmed
      )}&limit=4&namespace=0&format=json&origin=*`;
      const wikiRes = await fetch(wikiUrl);
      if (wikiRes.ok) {
        const data = await wikiRes.json();
        if (data && Array.isArray(data[1]) && data[1].length > 0) {
          const titles: string[] = data[1];
          const descriptions: string[] = data[2] || [];

          titles.forEach((title, idx) => {
            const desc = descriptions[idx] || '';
            const inferred = inferCategory(title, '', desc);
            results.push({
              id: `wiki_${idx}_${encodeURIComponent(title)}`,
              common_name: title,
              scientific_name: [title],
              matchedPtName: title,
              suggestedCategory: inferred,
              careInstructions: desc || `Informações botânicas de ${title}.`,
              source: 'wikipedia',
            });
          });
        }
      }
    } catch (e) {
      console.warn('Wikipedia OpenSearch fallback failed:', e);
    }

    // 1d. Se ainda assim não houver nada, monta uma sugestão direta com o termo digitado
    if (results.length === 0) {
      results.push({
        id: `custom_${Date.now()}`,
        common_name: trimmed,
        scientific_name: [trimmed],
        matchedPtName: trimmed,
        suggestedCategory: inferCategory(trimmed),
        source: 'fallback',
      });
    }

    searchCache.set(normQuery, results);
    return results;
  },

  // 🌿 2. Detalhes completos da espécie (Autofill da Ficha Botânica)
  async getSpeciesDetails(
    speciesItem: BotanicalSearchResult,
    originalSearchQuery?: string
  ): Promise<PlantClassificationDetails> {
    const query = originalSearchQuery || speciesItem.matchedPtName || speciesItem.common_name;
    const cached = detailsCache.get(speciesItem.id);
    if (cached) return cached;

    // Etapa 1: Verifica se já existe na base local enriquecida
    const localMatch =
      findLocalPreset(query) ||
      (speciesItem.scientific_name?.[0] ? findLocalPreset(speciesItem.scientific_name[0]) : undefined) ||
      (speciesItem.common_name ? findLocalPreset(speciesItem.common_name) : undefined);

    if (localMatch) {
      const details: PlantClassificationDetails = {
        name: localMatch.ptName,
        scientificName: localMatch.scientific,
        suggestedCategory: localMatch.suggestedCategory,
        light: localMatch.light,
        watering: localMatch.watering,
        petFriendly: localMatch.petFriendly,
        imageUrl: speciesItem.imageUrl || localMatch.imageUrl,
        wateringTip: localMatch.wateringTip,
        careInstructions: localMatch.careInstructions,
        family: localMatch.family,
        origin: localMatch.origin,
        cycle: localMatch.cycle,
        bloomingSeason: localMatch.bloomingSeason,
        pestsDiseases: localMatch.pestsDiseases,
        toxicity: localMatch.toxicity,
        fromFallback: false,
        source: 'local',
      };
      detailsCache.set(speciesItem.id, details);
      return details;
    }

    // Etapa 2: Se tiver Gemini API Key configurada, utiliza a IA para classificar
    const geminiKey = this.getGeminiApiKey();
    if (geminiKey) {
      try {
        const aiDetails = await this.classifyWithGemini(query, geminiKey);
        if (aiDetails) {
          detailsCache.set(speciesItem.id, aiDetails);
          return aiDetails;
        }
      } catch (err) {
        console.warn('Gemini classification fallback error:', err);
      }
    }

    // Etapa 3: Fallback público via Wikipedia / Resumo
    try {
      const wikiSummaryUrl = `https://pt.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
        speciesItem.common_name
      )}`;
      const summaryRes = await fetch(wikiSummaryUrl);
      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        const extract = summaryData.extract || '';
        const thumbnail = summaryData.thumbnail?.source;
        const inferredCat = inferCategory(speciesItem.common_name, '', extract);

        const details: PlantClassificationDetails = {
          name: speciesItem.common_name,
          scientificName: speciesItem.scientific_name?.[0] || speciesItem.common_name,
          suggestedCategory: inferredCat,
          light: 'meia-sombra',
          watering: 'moderada',
          petFriendly: true,
          imageUrl: thumbnail || speciesItem.imageUrl,
          wateringTip: 'Regar quando os primeiros 2cm de solo estiverem secos ao toque.',
          careInstructions: extract || `Planta ornamental ${speciesItem.common_name}. Manter em local arejado com boa luminosidade.`,
          family: 'Botânica Ornamental',
          origin: 'Informação a confirmar',
          cycle: 'Perene',
          bloomingSeason: 'Primavera / Verão',
          pestsDiseases: 'Cochonilhas e ácaros',
          toxicity: 'Não tóxica para animais de estimação (sob uso habitual)',
          fromFallback: true,
          source: 'wikipedia',
        };
        detailsCache.set(speciesItem.id, details);
        return details;
      }
    } catch (e) {
      console.warn('Wikipedia summary fetch failed:', e);
    }

    // Etapa 4: Fallback padrão elegante
    const fallbackCat = inferCategory(speciesItem.matchedPtName || speciesItem.common_name);
    const fallback: PlantClassificationDetails = {
      name: speciesItem.matchedPtName || speciesItem.common_name,
      scientificName: speciesItem.scientific_name?.[0] || speciesItem.common_name,
      suggestedCategory: fallbackCat,
      light: 'meia-sombra',
      watering: 'moderada',
      petFriendly: true,
      imageUrl: speciesItem.imageUrl,
      wateringTip: 'Regar 1 a 2 vezes por semana, verificando a umidade do solo.',
      careInstructions: 'Mantenha em local com boa ventilação e claridade natural indireta.',
      family: 'Ornamental',
      origin: 'Brasil / Regiões Tropicais',
      cycle: 'Perene',
      bloomingSeason: 'Primavera / Verão',
      pestsDiseases: 'Cochonilhas comuns',
      toxicity: 'Manter fora do alcance de filhotes por precaução.',
      fromFallback: true,
      source: 'fallback',
    };

    detailsCache.set(speciesItem.id, fallback);
    return fallback;
  },

  // Chamada estruturada à API do Google Gemini
  async classifyWithGemini(plantName: string, apiKey: string): Promise<PlantClassificationDetails | null> {
    const prompt = `Você é um botânico especialista em plantas de interior e jardim no Brasil.
Classifique a seguinte planta: "${plantName}".
Categorias possíveis: "Folhagens", "Suculentas & Cactos", "Flores", "Pendentes", "Arbustos & Árvores", "Ervas & Temperos".
Retorne APENAS um objeto JSON válido (sem blocos markdown adicionais, sem explicações fora do JSON) com as propriedades exatas:
{
  "name": "Nome popular brasileiro",
  "scientificName": "Gênero e espécie em latim",
  "category": "Uma das categorias possíveis acima",
  "light": "sol-pleno" OU "meia-sombra" OU "sombra-difusa",
  "watering": "baixa" OU "moderada" OU "frequente",
  "petFriendly": true OU false,
  "wateringTip": "Instrução curta e prática de rega em português",
  "careInstructions": "Guia de cultivo e luz em 2 frases",
  "family": "Família botânica (ex: Araceae, Moraceae)",
  "origin": "Região nativa de origem",
  "cycle": "Perene ou Anual",
  "bloomingSeason": "Época de floração",
  "pestsDiseases": "Pragas comuns",
  "toxicity": "Descrição clara se é tóxica para cães e gatos e por quê"
}`;

    const models = ['gemini-3.6-flash', 'gemini-3.5-flash-lite'];
    let text = '';

    for (const model of models) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
              temperature: 0.2,
              responseMimeType: 'application/json',
            },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          if (text) break;
        }
      } catch (err) {
        console.warn(`Gemini model ${model} failed, trying next:`, err);
      }
    }

    if (!text) return null;

    const parsed = JSON.parse(text);

    return {
      name: parsed.name || plantName,
      scientificName: parsed.scientificName || plantName,
      suggestedCategory: parsed.category || inferCategory(parsed.name || plantName, parsed.family),
      light: (['sol-pleno', 'meia-sombra', 'sombra-difusa'].includes(parsed.light) ? parsed.light : 'meia-sombra') as LightRequirement,
      watering: (['baixa', 'moderada', 'frequente'].includes(parsed.watering) ? parsed.watering : 'moderada') as WateringFrequency,
      petFriendly: Boolean(parsed.petFriendly),
      wateringTip: parsed.wateringTip || 'Regar moderadamente quando o solo secar.',
      careInstructions: parsed.careInstructions || 'Ambiente iluminado e arejado.',
      family: parsed.family || '',
      origin: parsed.origin || '',
      cycle: parsed.cycle || 'Perene',
      bloomingSeason: parsed.bloomingSeason || 'Primavera',
      pestsDiseases: parsed.pestsDiseases || 'Cochonilhas e ácaros',
      toxicity: parsed.toxicity || (parsed.petFriendly ? 'Não tóxica para animais' : 'Tóxica para cães e gatos'),
      fromFallback: false,
      source: 'gemini',
    };
  },
};
