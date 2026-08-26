import type { Plant } from '../types/plant';

const STORAGE_KEY = 'tonseflores_plants_v1';

const INITIAL_PLANTS: Plant[] = [
  {
    id: 'TF-001',
    name: 'Costela de Adão',
    scientificName: 'Monstera deliciosa',
    category: 'Folhagens',
    price: 85.00,
    potSize: 'Vaso 20cm',
    location: 'Prateleira A1',
    status: 'disponivel',
    light: 'sombra-difusa',
    watering: 'moderada',
    petFriendly: false,
    wateringTip: 'Regar quando o substrato estiver seco a 3cm de profundidade. Evitar encharcamento.',
    careInstructions: 'Prefere ambientes com umidade. Limpe as folhas periodicamente. Adube mensalmente na primavera/verão.',
    imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?w=400&q=80',
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'TF-002',
    name: 'Suculenta Echeveria',
    scientificName: 'Echeveria elegans',
    category: 'Suculentas & Cactos',
    price: 25.00,
    potSize: 'Vaso 8cm',
    location: 'Mesa Central',
    status: 'disponivel',
    light: 'sol-pleno',
    watering: 'baixa',
    petFriendly: true,
    wateringTip: 'Regar apenas quando o substrato estiver completamente seco. Em inverno, reduzir ainda mais.',
    careInstructions: 'Substrato bem drenado. Evitar água nas folhas. Não tolera geada.',
    imageUrl: 'https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400&q=80',
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'TF-003',
    name: 'Orquídea Phalaenopsis',
    scientificName: 'Phalaenopsis amabilis',
    category: 'Flores',
    price: 120.00,
    potSize: 'Vaso 12cm',
    location: 'Vitrine Flores',
    status: 'reservada',
    light: 'sombra-difusa',
    watering: 'moderada',
    petFriendly: true,
    wateringTip: 'Mergulhar o vaso em água por 15 min a cada 7 dias. Escorrer bem antes de voltar ao lugar.',
    careInstructions: 'Não tolera luz solar direta. Prefere ambiente fresco com boa circulação de ar. Adube levemente a cada 15 dias.',
    imageUrl: 'https://images.unsplash.com/photo-1566909985637-3b59d80f8a20?w=400&q=80',
    createdAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'TF-004',
    name: 'Jiboia',
    scientificName: 'Epipremnum aureum',
    category: 'Pendentes',
    price: 40.00,
    potSize: 'Vaso 15cm',
    location: 'Prateleira B2',
    status: 'disponivel',
    light: 'sombra-difusa',
    watering: 'moderada',
    petFriendly: false,
    wateringTip: 'Regar quando o topo do substrato estiver seco. Tolera bem períodos de seca.',
    careInstructions: 'Extremamente adaptável. Pode ser cultivada em vaso suspenso ou com suporte. Ótima para purificar o ar.',
    imageUrl: 'https://images.unsplash.com/photo-1572688484438-313a6e50c333?w=400&q=80',
    createdAt: '2025-01-01T00:00:00.000Z',
  },
];

function getPlants(): Plant[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as Plant[];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PLANTS));
    return INITIAL_PLANTS;
  } catch {
    return INITIAL_PLANTS;
  }
}

function savePlants(plants: Plant[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plants));
}

function getPlantById(id: string): Plant | null {
  return getPlants().find(p => p.id === id) ?? null;
}

function generateNextId(): string {
  const plants = getPlants();
  if (plants.length === 0) return 'TF-001';
  const numbers = plants.map(p => {
    const match = p.id.match(/TF-(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  });
  const next = Math.max(...numbers) + 1;
  return `TF-${String(next).padStart(3, '0')}`;
}

function addPlant(plant: Plant): boolean {
  const plants = getPlants();
  plants.push(plant);
  savePlants(plants);
  return true;
}

function updatePlant(updated: Plant): boolean {
  const plants = getPlants();
  const index = plants.findIndex(p => p.id === updated.id);
  if (index === -1) return false;
  plants[index] = updated;
  savePlants(plants);
  return true;
}

function deletePlant(id: string): boolean {
  const filtered = getPlants().filter(p => p.id !== id);
  savePlants(filtered);
  return true;
}

function exportBackup(): void {
  const plants = getPlants();
  const blob = new Blob([JSON.stringify(plants, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `tons-e-flores-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function importBackup(jsonContent: string): boolean {
  try {
    const data = JSON.parse(jsonContent);
    if (!Array.isArray(data)) return false;
    savePlants(data as Plant[]);
    return true;
  } catch {
    return false;
  }
}

function resetToInitial(): void {
  savePlants(INITIAL_PLANTS);
}

export const plantService = {
  getPlants,
  getPlantById,
  generateNextId,
  addPlant,
  updatePlant,
  deletePlant,
  exportBackup,
  importBackup,
  resetToInitial,
};