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
import { themeService } from './services/configService';
import type { Plant, PlantStatus } from './types/plant';

export function App() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTab, setCurrentTab] = useState<AppTab>('showcase');
  const [selectedPlant, setSelectedPlant] = useState<Plant | null>(null);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [plantToEdit, setPlantToEdit] = useState<Plant | null>(null);
  const [selectedPlantForTag, setSelectedPlantForTag] = useState<string | null>(null);

  // Carregar plantas do Supabase
  const loadPlants = async () => {
    setIsLoading(true);
    try {
      const loaded = await plantService.getPlants();
      setPlants(loaded);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    themeService.initTheme();
    loadPlants();
    setIsAdmin(authService.isAuthenticated());

    // Verificação de URL Hash (Ex: ao escanear o QR Code que leva a #p-TF-001)
    const checkHash = async () => {
      const hash = window.location.hash;
      if (hash.startsWith('#p-')) {
        const plantId = hash.replace('#p-', '');
        const found = await plantService.getPlantById(plantId);
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
  const handleSavePlant = async (plant: Plant) => {
    if (plantToEdit) {
      await plantService.updatePlant(plant);
    } else {
      await plantService.addPlant(plant);
    }
    await loadPlants();
    setPlantToEdit(null);
  };

  const handleDeletePlant = async (id: string) => {
    await plantService.deletePlant(id);
    await loadPlants();
  };

  const handleStatusChange = async (plant: Plant, newStatus: PlantStatus) => {
    await plantService.updatePlant({ ...plant, status: newStatus });
    await loadPlants();
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
    <div className="min-h-screen bg-brand-bg text-brand-text flex flex-col selection:bg-brand-nude-light selection:text-brand-nude-text">
      
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
          isLoading ? (
            <div className="flex items-center justify-center py-32 text-brand-text-muted gap-3">
              <div className="w-6 h-6 border-2 border-brand-olive border-t-brand-nude rounded-full animate-spin" />
              <span className="text-sm font-medium text-brand-text">Carregando catálogo Tons & Flores...</span>
            </div>
          ) : (
            <ShowcaseView 
              plants={plants} 
              onSelectPlant={(plant) => setSelectedPlant(plant)} 
            />
          )
        )}

        {currentTab === 'admin' && isAdmin && (
          <AdminPanel 
            plants={plants}
            isLoading={isLoading}
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
      <footer className="no-print bg-brand-surface text-brand-text-muted border-t border-brand-border py-8 px-6 text-center text-xs space-y-2.5">
        <div className="flex items-center justify-center gap-2 font-serif-title font-bold text-brand-text text-base">
          <span className="tracking-wide">Tons & Flores</span>
          <span className="text-xs font-sans px-2.5 py-0.5 rounded-full bg-brand-olive-light text-brand-olive-text border border-brand-olive-border font-semibold">
            Boutique de Plantas
          </span>
        </div>
        <p className="text-brand-text-muted text-xs max-w-md mx-auto">
          Catálogo Botânico & Gestão de Plantas com Identificação por QR Code.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <p className="text-brand-text-muted text-[11px]">
            © {new Date().getFullYear()} Tons & Flores Boutique
          </p>
          <span className="text-brand-border">•</span>
          {!isAdmin ? (
            <button 
              onClick={() => setIsLoginModalOpen(true)}
              className="text-brand-olive hover:text-brand-olive-hover text-[11px] font-medium underline cursor-pointer"
            >
              Área do Lojista
            </button>
          ) : (
            <span className="text-brand-olive-text font-bold text-[11px] flex items-center gap-1">
              <span>🌿</span> Modo Administrador Ativo
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
