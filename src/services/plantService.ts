import type { Plant } from '../types/plant';

const STORAGE_KEY = 'tonseflores_plants_v1';

export const INITIAL_PLANTS: Plant[] = [
  {
    id: 'TF-001',
    name: 'Costela de Adão',
    scientificName: 'Monstera deliciosa',
    category: 'Folhagens',
    price: 68.00,
    potSize: 'Pote 17',
    location: 'Bancada Central • Estufa 01',
    status: 'disponivel',
    light: 'meia-sombra',
    watering: 'moderada',
    petFriendly: false,
    wateringTip: 'Regar 1 a 2 vezes por semana quando os primeiros 2cm do solo estiverem secos.',
    careInstructions: 'Gosta de luz indireta brilhante. Limpar as folhas com pano úmido 1x por mês para manter o brilho natural e a respiração da planta.',
    imageUrl: 'https://images.unsplash.com/photo-1614594975525-e45190c55d0b?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'TF-002',
    name: 'Costela de Adão (Muda Grande)',
    scientificName: 'Monstera deliciosa',
    category: 'Folhagens',
    price: 95.00,
    potSize: 'Cuia 21',
    location: 'Entrada Principal • Lado Direito',
    status: 'disponivel',
    light: 'meia-sombra',
    watering: 'moderada',
    petFriendly: false,
    wateringTip: 'Regar moderadamente, evitando encharcar o pratinho.',
    careInstructions: 'Planta de porte avantajado com folhas já fenestradas (com recortes). Ótima para salas e varandas cobertas.',
    imageUrl: 'https://images.unsplash.com/photo-1599598425947-5202edd562c8?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'TF-003',
    name: 'Jiboia Verde (Pothos)',
    scientificName: 'Epipremnum aureum',
    category: 'Pendentes',
    price: 35.00,
    potSize: 'Cuia 18 Pendente',
    location: 'Varanda Suspensa • Setor 2',
    status: 'disponivel',
    light: 'sombra-difusa',
    watering: 'moderada',
    petFriendly: false,
    wateringTip: 'Regar quando a terra estiver quase seca ao toque.',
    careInstructions: 'Excelente para prateleiras altas e suportes pendentes de macramê. Tolera ambientes com menos luz natural.',
    imageUrl: 'https://images.unsplash.com/photo-1596724855579-2475e638b368?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'TF-004',
    name: 'Zamioculca (ZZ Plant)',
    scientificName: 'Zamioculcas zamiifolia',
    category: 'Folhagens',
    price: 55.00,
    potSize: 'Pote 15',
    location: 'Balcão de Atendimento',
    status: 'disponivel',
    light: 'sombra-difusa',
    watering: 'baixa',
    petFriendly: false,
    wateringTip: 'Regar apenas a cada 15 a 20 dias no inverno, ou a cada 10 dias no verão.',
    careInstructions: 'Uma das plantas mais resistentes para interiores. Sobrevive bem em salas com ar-condicionado e pouca luminosidade.',
    imageUrl: 'https://images.unsplash.com/photo-1632207691143-643e2a9a9361?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'TF-005',
    name: 'Ficus Lyrata (Bambu)',
    scientificName: 'Ficus lyrata',
    category: 'Arbustos & Árvores',
    price: 130.00,
    potSize: 'Vaso Cerâmica 24',
    location: 'Corredor das Árvores • Setor 4',
    status: 'disponivel',
    light: 'sol-pleno',
    watering: 'moderada',
    petFriendly: false,
    wateringTip: 'Regar generosamente 1x por semana, garantindo boa drenagem.',
    careInstructions: 'Folhas largas em formato de violino. Necessita de bastante claridade perto de janelas grandes ou varandas.',
    imageUrl: 'https://images.unsplash.com/photo-1545241047-6083a3684587?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'TF-006',
    name: 'Espada de São Jorge',
    scientificName: 'Dracaena trifasciata',
    category: 'Folhagens',
    price: 42.00,
    potSize: 'Pote 17',
    location: 'Estufa 02 • Setor Rústico',
    status: 'disponivel',
    light: 'sol-pleno',
    watering: 'baixa',
    petFriendly: false,
    wateringTip: 'Regar a cada 15 dias. Solo bem drenado.',
    careInstructions: 'Purificadora de ar comprovada pela NASA. Aguenta sol forte, sombra e longos períodos sem rega.',
    imageUrl: 'https://images.unsplash.com/photo-1593482892290-f54927ae1bf6?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'TF-007',
    name: 'Samambaia Americana',
    scientificName: 'Nephrolepis exaltata',
    category: 'Pendentes',
    price: 48.00,
    potSize: 'Cuia 21 Grande',
    location: 'Pergolado de Entrada',
    status: 'disponivel',
    light: 'meia-sombra',
    watering: 'frequente',
    petFriendly: true,
    wateringTip: 'Manter a terra sempre levemente úmida e borrifar água nas folhas nos dias secos.',
    careInstructions: 'Totalmente segura para gatos e cachorros (Pet Friendly!). Gosta de umidade e vento suave.',
    imageUrl: 'https://images.unsplash.com/photo-1596724855579-2475e638b368?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'TF-008',
    name: 'Suculenta Echeveria Elegans',
    scientificName: 'Echeveria elegans',
    category: 'Suculentas & Cactos',
    price: 18.00,
    potSize: 'Pote 11',
    location: 'Mesa de Suculentas • Setor Sol',
    status: 'disponivel',
    light: 'sol-pleno',
    watering: 'baixa',
    petFriendly: true,
    wateringTip: 'Regar diretamente na terra a cada 10 a 15 dias. Nunca molhar o miolo da roseta.',
    careInstructions: 'Necessita de pelo menos 4 a 6 horas de sol direto por dia para manter o formato compacto.',
    imageUrl: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?auto=format&fit=crop&w=800&q=80',
    createdAt: new Date().toISOString(),
  },
];

export const plantService = {
  getPlants(): Plant[] {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      this.savePlants(INITIAL_PLANTS);
      return INITIAL_PLANTS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_PLANTS;
    }
  },

  getPlantById(id: string): Plant | undefined {
    const plants = this.getPlants();
    return plants.find(p => p.id.toLowerCase() === id.toLowerCase());
  },

  savePlants(plants: Plant[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(plants));
  },

  addPlant(plant: Omit<Plant, 'createdAt'>): Plant {
    const plants = this.getPlants();
    const newPlant: Plant = {
      ...plant,
      createdAt: new Date().toISOString(),
    };
    const updated = [newPlant, ...plants];
    this.savePlants(updated);
    return newPlant;
  },

  updatePlant(plant: Plant): void {
    const plants = this.getPlants();
    const updated = plants.map(p => (p.id === plant.id ? { ...plant, updatedAt: new Date().toISOString() } : p));
    this.savePlants(updated);
  },

  deletePlant(id: string): void {
    const plants = this.getPlants();
    const updated = plants.filter(p => p.id !== id);
    this.savePlants(updated);
  },

  generateNextId(): string {
    const plants = this.getPlants();
    let maxNumber = 0;
    plants.forEach(p => {
      const match = p.id.match(/TF-(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (num > maxNumber) maxNumber = num;
      }
    });
    const nextNum = maxNumber + 1;
    return `TF-${String(nextNum).padStart(3, '0')}`;
  },

  exportBackup(): void {
    const plants = this.getPlants();
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(plants, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `tonseflores_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  },

  importBackup(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed)) {
        this.savePlants(parsed);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  },

  resetToInitial(): void {
    this.savePlants(INITIAL_PLANTS);
  }
};
