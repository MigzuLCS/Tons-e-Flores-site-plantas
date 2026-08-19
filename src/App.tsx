import { useState, useEffect } from 'react';
import { Navbar, type AppTab } from './components/Navbar';
import { ShowcaseView } from './components/ShowcaseView';
import { AdminPanel } from './components/AdminPanel';
import { TagsPrintView } from './components/TagsPrintView';
import { PlantDetailModal } from './components/PlantDetailModal';
import { PlantFormModal } from './components/PlantFormModal';
import { plantService } from './services/plantService';
import type { Plant, PlantStatus } from './types/plant';

export function App() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [currentTab, setCurrentTab] = useState<AppTab>('showcase');
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [plantToEdit, setPlantToEdit] = useState<Plant | null>(null);
  const [selectedPlantForTag, setSelectedPlantForTag] = useState<string | null>(null);

  // Carregar plantas do armazenamento
  const loadPlants = () => {
    const loaded = plantService.getPlants();
    setPlants(loaded);
  };

  useEffect(() => {
    loadPlants();

    // Verificação de URL Hash (Ex: ao escanear o QR Code que leva a #p-TF-001)
    const checkHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#p-')) {
        const plantId = hash.replace('#p-', '');
        const found = plantService.getPlantById(plantId);
        if (found) {
          setSelectedPlant(found);
        }
      }
    };

    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  // Handlers
  const handleSavePlant = (plant: Plant) => {
    if (plantToEdit) {
      plantService.updatePlant(plant);
    } else {
      plantService.addPlant(plant);
    }
    loadPlants();
    setPlantToEdit(null);
  };

  const handleDeletePlant = (id: string) => {
    plantService.deletePlant(id);
    loadPlants();
  };

  const handleStatusChange = (plant: Plant, newStatus: PlantStatus) => {
    plantService.updatePlant({ ...plant, status: newStatus });
    loadPlants();
  };

  const handleSelectForTag = (plant: Plant) => {
    setSelectedPlantForTag(plant.id);
    setCurrentTab('tags');
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Barra de Navegação Superior */}
      <Navbar 
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab !== 'tags') setSelectedPlantForTag(null);
          setCurrentTab(tab);
        }}
        onOpenAddModal={() => {
          setPlantToEdit(null);
          setIsFormModalOpen(true);
        }}
        plantCount={plants.length}
      />

      {/* Conteúdo da Aba Ativa */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        {currentTab === 'showcase' && (
          <ShowcaseView 
            plants={plants} 
            onSelectPlant={(plant) => setSelectedPlant(plant)} 
          />
        )}

        {currentTab === 'admin' && (
          <AdminPanel 
            plants={plants}
            onOpenAddModal={() => {
              setPlantToEdit(null);
              setIsFormModalOpen(true);
            }}
            onOpenEditModal={(plant) => {
              setPlantToEdit(plant);
              setIsFormModalOpen(true);
            }}
            onViewPlant={(plant) => setSelectedPlant(plant)}
            onSelectForTag={handleSelectForTag}
            onDeletePlant={handleDeletePlant}
            onStatusChange={handleStatusChange}
            onRefresh={loadPlants}
          />
        )}

        {currentTab === 'tags' && (
          <TagsPrintView 
            plants={plants}
            selectedPlantId={selectedPlantForTag}
          />
        )}
      </main>

      {/* Rodapé da Loja (Não aparece na impressão) */}
      <footer className="no-print bg-stone-900 text-stone-400 border-t border-stone-800 py-8 px-6 text-center text-xs space-y-2">
        <div className="flex items-center justify-center gap-2 font-serif-title font-bold text-stone-200 text-sm">
          <span>Tons & Flores</span>
        </div>
        <p>Sistema de Gestão & Catálogo Digital de Plantas com QR Code.</p>
        <p className="text-stone-500 text-[11px]">
          Desenvolvido sob medida para a Tons & Flores • 100% Gratuito & Otimizado
        </p>
      </footer>

      {/* Modal de Detalhes da Planta (Visualização Mobile ao ler o QR Code) */}
      <PlantDetailModal 
        plant={selectedPlant} 
        onClose={() => {
          setSelectedPlant(null);
          if (window.location.hash.startsWith('#p-')) {
            history.pushState('', document.title, window.location.pathname + window.location.search);
          }
        }} 
      />

      {/* Modal de Cadastro / Edição */}
      <PlantFormModal 
        isOpen={isFormModalOpen}
        plantToEdit={plantToEdit}
        onClose={() => {
          setIsFormModalOpen(false);
          setPlantToEdit(null);
        }}
        onSave={handleSavePlant}
      />

    </div>
  );
}

export default App;
