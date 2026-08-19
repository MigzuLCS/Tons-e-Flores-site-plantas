import { useState, useEffect } from 'react';
import { Navbar, type AppTab } from './components/Navbar';
import { ShowcaseView } from './components/ShowcaseView';
import { AdminPanel } from './components/AdminPanel';
import { TagsPrintView } from './components/TagsPrintView';
import { PlantDetailModal } from './components/PlantDetailModal';
import { PlantFormModal } from './components/PlantFormModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { plantService } from './services/plantService';
import { authService } from './services/authService';
import type { Plant, PlantStatus } from './types/plant';

export function App() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [currentTab, setCurrentTab] = useState<AppTab>('showcase');
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [plantToEdit, setPlantToEdit] = useState<Plant | null>(null);
  const [selectedPlantForTag, setSelectedPlantForTag] = useState<string | null>(null);

  // Carregar plantas e status de autenticação
  const loadPlants = () => {
    const loaded = plantService.getPlants();
    setPlants(loaded);
  };

  useEffect(() => {
    loadPlants();
    setIsAdmin(authService.isAuthenticated());

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

  const handleLoginSuccess = () => {
    setIsAdmin(true);
    setCurrentTab('admin');
  };

  const handleLogout = () => {
    authService.logout();
    setIsAdmin(false);
    setCurrentTab('showcase');
  };

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* Barra de Navegação Superior */}
      <Navbar 
        currentTab={currentTab}
        onSelectTab={(tab) => {
          if (tab !== 'showcase' && !isAdmin) {
            setIsLoginModalOpen(true);
            return;
          }
          if (tab !== 'tags') setSelectedPlantForTag(null);
          setCurrentTab(tab);
        }}
        onOpenAddModal={() => {
          if (!isAdmin) {
            setIsLoginModalOpen(true);
            return;
          }
          setPlantToEdit(null);
          setIsFormModalOpen(true);
        }}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        isAdmin={isAdmin}
        plantCount={plants.filter(p => p.status !== 'vendida').length}
      />

      {/* Conteúdo da Aba Ativa */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        {currentTab === 'showcase' && (
          <ShowcaseView 
            plants={plants} 
            onSelectPlant={(plant) => setSelectedPlant(plant)} 
          />
        )}

        {currentTab === 'admin' && isAdmin && (
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

        {currentTab === 'tags' && isAdmin && (
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
        <div className="flex items-center justify-center gap-4 pt-1">
          <p className="text-stone-500 text-[11px]">
            Desenvolvido sob medida para a Tons & Flores
          </p>
          <span className="text-stone-700">•</span>
          {!isAdmin ? (
            <button 
              onClick={() => setIsLoginModalOpen(true)}
              className="text-stone-400 hover:text-emerald-400 text-[11px] underline cursor-pointer"
            >
              Acesso do Administrador
            </button>
          ) : (
            <span className="text-emerald-400 font-bold text-[11px]">
              👑 Modo Administrador Ativo
            </span>
          )}
        </div>
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

      {/* Modal de Login do Administrador */}
      <AdminLoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

    </div>
  );
}

export default App;
