import { supabase } from './supabaseClient';
import { storageService } from './storageService';
import type { Plant } from '../types/plant';

// ─── Plantas de exemplo (usadas no reset inicial) ────────────────────────────
const INITIAL_PLANTS: Omit<Plant, 'createdAt' | 'updatedAt'>[] = [
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
  },
];

// ─── Conversor: row do Postgres (snake_case) → Plant (camelCase) ─────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToPlant(row: any): Plant {
  return {
    id: row.id,
    name: row.name,
    scientificName: row.scientific_name,
    category: row.category,
    price: Number(row.price || 0),
    potSize: row.pot_size || '',
    location: row.location || '',
    status: row.status || 'disponivel',
    light: row.light || 'sombra-difusa',
    watering: row.watering || 'moderada',
    petFriendly: Boolean(row.pet_friendly),
    wateringTip: row.watering_tip || '',
    careInstructions: row.care_instructions || '',
    family: row.family ?? undefined,
    origin: row.origin ?? undefined,
    cycle: row.cycle ?? undefined,
    bloomingSeason: row.blooming_season ?? undefined,
    pestsDiseases: row.pests_diseases ?? undefined,
    toxicity: row.toxicity ?? undefined,
    imageUrl: row.image_url || '',
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at ?? undefined,
  };
}

// ─── Conversor: Plant (camelCase) → row do Postgres (snake_case) ─────────────
function plantToRow(plant: Plant) {
  return {
    id: plant.id,
    name: plant.name,
    scientific_name: plant.scientificName,
    category: plant.category,
    price: plant.price,
    pot_size: plant.potSize,
    location: plant.location,
    status: plant.status,
    light: plant.light,
    watering: plant.watering,
    pet_friendly: plant.petFriendly,
    watering_tip: plant.wateringTip,
    care_instructions: plant.careInstructions,
    family: plant.family ?? null,
    origin: plant.origin ?? null,
    cycle: plant.cycle ?? null,
    blooming_season: plant.bloomingSeason ?? null,
    pests_diseases: plant.pestsDiseases ?? null,
    toxicity: plant.toxicity ?? null,
    image_url: plant.imageUrl,
  };
}

// ─── Serviço ──────────────────────────────────────────────────────────────────
async function getPlants(): Promise<Plant[]> {
  try {
    const { data, error } = await supabase
      .from('plants')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      console.error('[plantService] Erro ao buscar plantas no Supabase:', error.message);
      return [];
    }
    return (data ?? []).map(rowToPlant);
  } catch (err) {
    console.error('[plantService] Exceção ao buscar plantas:', err);
    return [];
  }
}

async function getPlantById(id: string): Promise<Plant | null> {
  try {
    const { data, error } = await supabase
      .from('plants')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return rowToPlant(data);
  } catch (err) {
    console.error('[plantService] Exceção ao buscar planta por id:', err);
    return null;
  }
}

async function generateNextId(): Promise<string> {
  try {
    const { data } = await supabase
      .from('plants')
      .select('id')
      .order('id', { ascending: false })
      .limit(1);

    if (!data || data.length === 0) return 'TF-001';

    const match = data[0].id.match(/TF-(\d+)/);
    const next = match ? parseInt(match[1], 10) + 1 : 1;
    return `TF-${String(next).padStart(3, '0')}`;
  } catch {
    return 'TF-001';
  }
}

async function addPlant(plant: Plant): Promise<boolean> {
  try {
    let finalImageUrl = plant.imageUrl;

    // Se a foto for um Data URL base64, faz upload para o Supabase Storage
    if (finalImageUrl && finalImageUrl.startsWith('data:image/')) {
      finalImageUrl = await storageService.uploadPlantPhoto(plant.id, finalImageUrl);
    }

    const plantToSave: Plant = {
      ...plant,
      imageUrl: finalImageUrl,
    };

    const { error } = await supabase
      .from('plants')
      .insert([plantToRow(plantToSave)]);

    if (error) {
      console.error('[plantService] Erro ao adicionar planta:', error.message);
      alert('Erro ao salvar no Supabase: ' + error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[plantService] Exceção ao adicionar planta:', err);
    return false;
  }
}

async function updatePlant(plant: Plant): Promise<boolean> {
  try {
    let finalImageUrl = plant.imageUrl;

    // Se a foto for um novo Data URL base64, faz upload para o Supabase Storage
    if (finalImageUrl && finalImageUrl.startsWith('data:image/')) {
      // Opcional: remove a foto antiga do storage se houver troca de arquivo
      const existing = await getPlantById(plant.id);
      if (existing?.imageUrl && existing.imageUrl !== finalImageUrl) {
        await storageService.deletePlantPhoto(existing.imageUrl);
      }
      finalImageUrl = await storageService.uploadPlantPhoto(plant.id, finalImageUrl);
    }

    const plantToSave: Plant = {
      ...plant,
      imageUrl: finalImageUrl,
    };

    const { error } = await supabase
      .from('plants')
      .update({ ...plantToRow(plantToSave), updated_at: new Date().toISOString() })
      .eq('id', plant.id);

    if (error) {
      console.error('[plantService] Erro ao atualizar planta:', error.message);
      alert('Erro ao atualizar no Supabase: ' + error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[plantService] Exceção ao atualizar planta:', err);
    return false;
  }
}

async function deletePlant(id: string): Promise<boolean> {
  try {
    // Busca a planta antes de deletar para limpar a foto do Storage
    const existing = await getPlantById(id);
    if (existing?.imageUrl) {
      await storageService.deletePlantPhoto(existing.imageUrl);
    }

    const { error } = await supabase
      .from('plants')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[plantService] Erro ao excluir planta:', error.message);
      alert('Erro ao excluir no Supabase: ' + error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[plantService] Exceção ao excluir planta:', err);
    return false;
  }
}

async function exportBackup(): Promise<void> {
  try {
    const plants = await getPlants();
    const blob = new Blob([JSON.stringify(plants, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tons-e-flores-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error('[plantService] Erro ao exportar backup:', err);
  }
}

async function importBackup(jsonContent: string): Promise<boolean> {
  try {
    const data = JSON.parse(jsonContent);
    if (!Array.isArray(data)) return false;

    const rows = (data as Plant[]).map(plantToRow);
    const { error } = await supabase
      .from('plants')
      .upsert(rows, { onConflict: 'id' });

    if (error) {
      console.error('[plantService] Erro ao importar backup:', error.message);
      alert('Erro ao importar backup no Supabase: ' + error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error('[plantService] JSON inválido:', e);
    return false;
  }
}

async function resetToInitial(): Promise<void> {
  try {
    // Remove todas as plantas existentes
    await supabase.from('plants').delete().neq('id', '');

    // Insere as plantas de exemplo
    const rows = INITIAL_PLANTS.map(p => ({
      ...plantToRow({ ...p, createdAt: new Date().toISOString() }),
    }));
    const { error } = await supabase.from('plants').insert(rows);
    if (error) {
      console.error('[plantService] Erro ao resetar dados:', error.message);
      alert('Erro ao resetar dados no Supabase: ' + error.message);
    }
  } catch (err) {
    console.error('[plantService] Exceção ao resetar dados:', err);
  }
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