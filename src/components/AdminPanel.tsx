import React, { useState, useMemo, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Pencil, 
  Trash2, 
  Eye, 
  Download, 
  Upload, 
  QrCode, 
  MapPin, 
  Sprout, 
  CheckCircle2, 
  Clock,
  RotateCcw,
  Archive,
  RefreshCw,
  Settings,
  X as XIcon,
  Tag,
  BookOpen,
  ShieldCheck,
  ShieldAlert,
  Droplets,
  Sun
} from 'lucide-react';
import type { Plant, PlantStatus } from '../types/plant';
import { plantService } from '../services/plantService';
import { configService } from '../services/configService';
import { plantClassificationService, type PlantBotanicalPreset } from '../services/plantClassificationService';

interface AdminPanelProps {
  plants: Plant[];
  isLoading?: boolean;
  onOpenAddModal: () => void;
  onOpenEditModal: (plant: Plant) => void;
  onViewPlant: (plant: Plant) => void;
  onSelectForTag: (plant: Plant) => void;
  onDeletePlant: (id: string) => void;
  onStatusChange: (plant: Plant, newStatus: PlantStatus) => void;
  onRefresh: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  plants,
  isLoading = false,
  onOpenAddModal,
  onOpenEditModal,
  onViewPlant,
  onSelectForTag,
  onDeletePlant,
  onStatusChange,
  onRefresh,
}) => {
  // Aba interna do painel: 'ativas', 'vendidas', 'acervo' ou 'config'
  const [adminTab, setAdminTab] = useState<'ativas' | 'vendidas' | 'acervo' | 'config'>('ativas');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Estado de configurações (categorias e bancadas)
  const [categories, setCategories] = useState<string[]>(() => configService.getCategories());
  const [newCatName, setNewCatName] = useState('');
  const [locations, setLocations] = useState<any[]>(() => configService.getLocationDetails());
  const [newLocName, setNewLocName] = useState('');
  const [newLocDesc, setNewLocDesc] = useState('');
  const [editingLoc, setEditingLoc] = useState<{ oldName: string; name: string; description: string } | null>(null);

  // Estado do Acervo Botânico
  const [botanicalPresets, setBotanicalPresets] = useState<PlantBotanicalPreset[]>(() => plantClassificationService.getAllBotanicalPresetsList());
  const [acervoSearch, setAcervoSearch] = useState('');
  const [acervoCategoryFilter, setAcervoCategoryFilter] = useState('all');
  const [editingPreset, setEditingPreset] = useState<PlantBotanicalPreset | null>(null);
  const [isNewPresetModalOpen, setIsNewPresetModalOpen] = useState(false);
  const [presetForm, setPresetForm] = useState<Partial<PlantBotanicalPreset>>({});
  const [isSavingPreset, setIsSavingPreset] = useState(false);

  useEffect(() => {
    configService.syncCategoriesWithCloud().then(setCategories);
    configService.syncLocationsWithCloud().then(setLocations);
    plantClassificationService.syncCloud().then(() => {
      setBotanicalPresets(plantClassificationService.getAllBotanicalPresetsList());
    });
  }, []);



  // Métricas da Loja
  const stats = useMemo(() => {
    const total = plants.length;
    const available = plants.filter(p => p.status === 'disponivel').length;
    const reserved = plants.filter(p => p.status === 'reservada').length;
    const sold = plants.filter(p => p.status === 'vendida').length;
    
    const stockValue = plants
      .filter(p => p.status === 'disponivel' || p.status === 'reservada')
      .reduce((sum, p) => sum + p.price, 0);

    const soldTotalValue = plants
      .filter(p => p.status === 'vendida')
      .reduce((sum, p) => sum + p.price, 0);

    return { total, available, reserved, sold, stockValue, soldTotalValue };
  }, [plants]);

  // Lista Filtrada por aba e critérios
  const filteredPlants = useMemo(() => {
    return plants.filter(plant => {
      // Separação por Aba: Ativas vs Vendidas
      if (adminTab === 'ativas' && plant.status === 'vendida') return false;
      if (adminTab === 'vendidas' && plant.status !== 'vendida') return false;

      const matchesSearch =
        searchTerm === '' ||
        plant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plant.scientificName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plant.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plant.location.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus = statusFilter === 'all' || plant.status === statusFilter;
      const matchesCategory = categoryFilter === 'all' || plant.category === categoryFilter;

      return matchesSearch && matchesStatus && matchesCategory;
    });
  }, [plants, adminTab, searchTerm, statusFilter, categoryFilter]);

  // Lista Filtrada do Acervo Botânico
  const filteredBotanicalPresets = useMemo(() => {
    return botanicalPresets.filter(preset => {
      const q = acervoSearch.toLowerCase().trim();
      const matchesSearch =
        q === '' ||
        preset.ptName.toLowerCase().includes(q) ||
        preset.scientific.toLowerCase().includes(q) ||
        (preset.family && preset.family.toLowerCase().includes(q)) ||
        (preset.suggestedCategory && preset.suggestedCategory.toLowerCase().includes(q)) ||
        (preset.aliases && preset.aliases.some(a => a.toLowerCase().includes(q)));

      const matchesCat = acervoCategoryFilter === 'all' || preset.suggestedCategory === acervoCategoryFilter;

      return matchesSearch && matchesCat;
    });
  }, [botanicalPresets, acervoSearch, acervoCategoryFilter]);

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const content = event.target?.result as string;
      const ok = await plantService.importBackup(content);
      if (ok) {
        alert('Backup importado com sucesso!');
        onRefresh();
      } else {
        alert('Erro ao importar arquivo. Verifique o formato JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = async () => {
    if (confirm('Tem certeza que deseja restaurar as plantas de exemplo? Seus cadastros atuais serão redefinidos.')) {
      await plantService.resetToInitial();
      onRefresh();
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in">
      
      {/* Cabeçalho do Painel */}
      <div className="bg-brand-surface p-6 rounded-3xl border border-brand-border shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-brand-nude rounded-full animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-olive">Painel Administrativo Tons & Flores</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif-title text-brand-text mt-1">
            Gestão do Catálogo & Vasos
          </h2>
          <p className="text-xs text-brand-text-muted mt-0.5">
            Cadastre, edite, altere status e acompanhe o estoque e histórico de vendas
          </p>
        </div>

        {/* Ações Rápidas */}
        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={onOpenAddModal}
            className="bg-brand-nude hover:bg-brand-nude-hover text-white font-semibold px-4 py-2.5 rounded-2xl shadow-xs flex items-center gap-1.5 text-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Cadastrar Novo Vaso
          </button>

          <button 
            onClick={() => plantService.exportBackup()}
            title="Baixar cópia de segurança em JSON"
            className="bg-brand-surface-subtle hover:bg-brand-olive-light text-brand-text font-semibold px-3 py-2.5 rounded-2xl text-xs border border-brand-border flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-brand-olive" />
            Backup
          </button>

          <label 
            title="Restaurar backup de arquivo JSON"
            className="bg-brand-surface-subtle hover:bg-brand-olive-light text-brand-text font-semibold px-3 py-2.5 rounded-2xl text-xs border border-brand-border flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Upload className="w-3.5 h-3.5 text-brand-olive" />
            Importar
            <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
          </label>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-brand-surface p-4 rounded-2xl border border-brand-border shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-surface-subtle flex items-center justify-center text-brand-olive">
            <Sprout className="w-5 h-5 text-brand-olive" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-brand-text-muted uppercase">Em Estoque</div>
            <div className="text-xl font-extrabold text-brand-text">{stats.available + stats.reserved}</div>
          </div>
        </div>

        <div className="bg-brand-surface p-4 rounded-2xl border border-brand-border shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-olive-light flex items-center justify-center text-brand-olive-text">
            <CheckCircle2 className="w-5 h-5 text-brand-olive" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-brand-text-muted uppercase">Disponíveis</div>
            <div className="text-xl font-extrabold text-brand-olive-text">{stats.available}</div>
          </div>
        </div>

        <div className="bg-brand-surface p-4 rounded-2xl border border-brand-border shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/40 flex items-center justify-center text-amber-700 dark:text-amber-200">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-brand-text-muted uppercase">Reservadas</div>
            <div className="text-xl font-extrabold text-amber-700 dark:text-amber-200">{stats.reserved}</div>
          </div>
        </div>

        <div className="bg-brand-surface p-4 rounded-2xl border border-brand-border shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-brand-nude-light flex items-center justify-center text-brand-nude-text">
            <Archive className="w-5 h-5 text-brand-nude" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-brand-text-muted uppercase">Total Vendidas</div>
            <div className="text-xl font-extrabold text-brand-nude-text">{stats.sold}</div>
          </div>
        </div>
      </div>

      {/* Seletor de Seção do Painel (Scrollável e adaptativo para mobile) */}
      <div className="border-b border-brand-border">
        <div className="flex items-center justify-between gap-4">
          {/* Abas com scroll horizontal suave no mobile */}
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto hide-scrollbar pb-0.5 max-w-full -mb-px">
            <button
              onClick={() => {
                setAdminTab('ativas');
                setStatusFilter('all');
              }}
              className={`py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 border-b-2 transition-all shrink-0 whitespace-nowrap cursor-pointer ${
                adminTab === 'ativas'
                  ? 'border-brand-olive text-brand-text font-bold bg-brand-olive-light/40 sm:bg-transparent rounded-t-xl sm:rounded-none'
                  : 'border-transparent text-brand-text-muted hover:text-brand-text'
              }`}
            >
              <Sprout className="w-4 h-4 text-brand-olive shrink-0" />
              <span>Vasos Ativos</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-surface-subtle border border-brand-border font-bold text-brand-text">
                {stats.available + stats.reserved}
              </span>
            </button>

            <button
              onClick={() => {
                setAdminTab('vendidas');
                setStatusFilter('all');
              }}
              className={`py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 border-b-2 transition-all shrink-0 whitespace-nowrap cursor-pointer ${
                adminTab === 'vendidas'
                  ? 'border-brand-nude text-brand-text font-bold bg-brand-nude-light/40 sm:bg-transparent rounded-t-xl sm:rounded-none'
                  : 'border-transparent text-brand-text-muted hover:text-brand-text'
              }`}
            >
              <Archive className="w-4 h-4 text-brand-nude shrink-0" />
              <span>Histórico</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-surface-subtle border border-brand-border font-bold text-brand-text">
                {stats.sold}
              </span>
            </button>

            <button
              onClick={() => {
                setAdminTab('acervo');
                setBotanicalPresets(plantClassificationService.getAllBotanicalPresetsList());
              }}
              className={`py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 border-b-2 transition-all shrink-0 whitespace-nowrap cursor-pointer ${
                adminTab === 'acervo'
                  ? 'border-brand-olive text-brand-text font-bold bg-brand-olive-light/40 sm:bg-transparent rounded-t-xl sm:rounded-none'
                  : 'border-transparent text-brand-text-muted hover:text-brand-text'
              }`}
            >
              <BookOpen className="w-4 h-4 text-brand-olive shrink-0" />
              <span>Acervo</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-surface-subtle border border-brand-border font-bold text-brand-text">
                {botanicalPresets.length}
              </span>
            </button>

            <button
              onClick={() => setAdminTab('config')}
              className={`py-2.5 sm:py-3 px-3 sm:px-4 text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 border-b-2 transition-all shrink-0 whitespace-nowrap cursor-pointer ${
                adminTab === 'config'
                  ? 'border-brand-olive text-brand-text font-bold bg-brand-olive-light/40 sm:bg-transparent rounded-t-xl sm:rounded-none'
                  : 'border-transparent text-brand-text-muted hover:text-brand-text'
              }`}
            >
              <Settings className="w-4 h-4 shrink-0" />
              <span>Configurações</span>
            </button>
          </div>

          <div className="hidden lg:block text-xs text-brand-text-muted pb-3 shrink-0 whitespace-nowrap">
            {adminTab === 'ativas' ? (
              <span>Valor em estoque: <strong className="text-brand-text">R$ {stats.stockValue.toFixed(2).replace('.', ',')}</strong></span>
            ) : adminTab === 'vendidas' ? (
              <span>Faturamento histórico: <strong className="text-brand-nude-text">R$ {stats.soldTotalValue.toFixed(2).replace('.', ',')}</strong></span>
            ) : null}
          </div>
        </div>
      </div>


      {/* Barra de Busca e Filtros da Tabela — oculta na aba Config */}
      {adminTab !== 'config' && (
      <div className="bg-brand-surface p-4 rounded-2xl border border-brand-border shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-brand-text-light" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder={adminTab === 'ativas' ? "Buscar vasos ativos..." : "Buscar no histórico de vendidas..."} 
            className="w-full pl-10 pr-4 py-2 text-xs bg-brand-surface-subtle border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-olive font-medium text-brand-text"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto text-xs">
          {adminTab === 'ativas' && (
            <select 
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-brand-surface-subtle border border-brand-border rounded-xl font-medium text-brand-text cursor-pointer"
            >
              <option value="all">Todos os Status Ativos</option>
              <option value="disponivel">Apenas Disponíveis</option>
              <option value="reservada">Apenas Reservadas</option>
            </select>
          )}

          <select 
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-brand-surface-subtle border border-brand-border rounded-xl font-medium text-brand-text cursor-pointer"
          >
            <option value="all">Todas as Categorias</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <button 
            onClick={handleResetData}
            title="Redefinir catálogo inicial"
            className="p-2 text-brand-text-muted hover:text-brand-text rounded-lg hover:bg-brand-surface-subtle cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
      )}

      {/* Tabela de Plantas — oculta na aba Config */}
      {adminTab !== 'config' && (
      <div className="bg-brand-surface rounded-3xl border border-brand-border shadow-xs overflow-hidden">
        <div className="overflow-x-auto">

          <table className="w-full text-left text-xs text-brand-text">
            <thead className="bg-brand-surface-subtle border-b border-brand-border font-bold uppercase tracking-wider text-brand-text-muted text-[10px]">
              <tr>
                <th className="px-4 py-3.5">Tag</th>
                <th className="px-4 py-3.5">Foto & Planta</th>
                <th className="px-4 py-3.5">Categoria</th>
                <th className="px-4 py-3.5">Localização Física</th>
                <th className="px-4 py-3.5">Preço</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-border">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-brand-text-muted text-xs">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-brand-olive border-t-brand-nude rounded-full animate-spin" />
                      <span>Carregando do banco de dados...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredPlants.length > 0 ? (
                filteredPlants.map((plant) => (
                  <tr key={plant.id} className="hover:bg-brand-surface-subtle/60 transition-colors">
                    
                    {/* Código / Tag */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-mono font-bold text-xs bg-brand-surface-subtle text-brand-text px-2 py-1 rounded border border-brand-border">
                        #{plant.id}
                      </span>
                    </td>

                    {/* Planta */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img 
                          src={plant.imageUrl} 
                          alt={plant.name} 
                          className="w-10 h-10 rounded-lg object-cover border border-brand-border shrink-0" 
                        />
                        <div>
                          <div className="font-bold text-brand-text text-xs">{plant.name}</div>
                          <div className="text-[11px] text-brand-text-muted italic">{plant.scientificName} • {plant.potSize}</div>
                        </div>
                      </div>
                    </td>

                    {/* Categoria */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-[11px] font-bold text-brand-olive-text bg-brand-olive-light px-2 py-0.5 rounded-full border border-brand-olive-border">
                        {plant.category}
                      </span>
                    </td>

                    {/* Localização */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-brand-text font-medium">
                        <MapPin className="w-3.5 h-3.5 text-brand-olive shrink-0" />
                        <span>{plant.location}</span>
                      </div>
                    </td>

                    {/* Preço */}
                    <td className="px-4 py-3 whitespace-nowrap font-bold text-brand-text">
                      R$ {plant.price.toFixed(2).replace('.', ',')}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <select 
                        value={plant.status}
                        onChange={(e) => onStatusChange(plant, e.target.value as PlantStatus)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                          plant.status === 'disponivel'
                            ? 'bg-brand-olive-light border-brand-olive-border text-brand-olive-text'
                            : plant.status === 'reservada'
                            ? 'bg-amber-500/15 border-amber-400/50 text-amber-900 dark:text-amber-300'
                            : 'bg-brand-nude-light border-brand-nude-border text-brand-nude-text'
                        }`}
                      >
                        <option value="disponivel">🟢 Disponível</option>
                        <option value="reservada">🟡 Reservada</option>
                        <option value="vendida">⚪ Vendida</option>
                      </select>
                    </td>

                    {/* Ações */}
                    <td className="px-4 py-3 whitespace-nowrap text-right space-x-1">
                      <button 
                        onClick={() => onViewPlant(plant)}
                        title="Ver ficha mobile"
                        className="p-1.5 text-brand-text-muted hover:text-brand-text hover:bg-brand-surface-subtle rounded-lg transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {plant.status !== 'vendida' ? (
                        <button 
                          onClick={() => onSelectForTag(plant)}
                          title="Gerar Etiqueta QR"
                          className="p-1.5 text-brand-text-muted hover:text-brand-olive hover:bg-brand-olive-light rounded-lg transition-colors cursor-pointer"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                      ) : (
                        <button 
                          onClick={() => onStatusChange(plant, 'disponivel')}
                          title="Reativar e colocar em estoque"
                          className="p-1.5 text-brand-olive hover:text-brand-olive-hover hover:bg-brand-olive-light rounded-lg transition-colors cursor-pointer"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      )}

                      <button 
                        onClick={() => onOpenEditModal(plant)}
                        title="Editar planta"
                        className="p-1.5 text-brand-text-muted hover:text-brand-olive hover:bg-brand-olive-light rounded-lg transition-colors cursor-pointer"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button 
                        onClick={() => {
                          if (confirm(`Excluir permanentemente ${plant.name} (#${plant.id}) do banco?`)) {
                            onDeletePlant(plant.id);
                          }
                        }}
                        title="Excluir planta permanentemente"
                        className="p-1.5 text-brand-text-muted hover:text-brand-nude-text hover:bg-brand-nude-light rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-brand-text-muted text-xs">
                    {adminTab === 'ativas' 
                      ? 'Nenhum vaso ativo encontrado para os filtros selecionados.' 
                      : 'Nenhuma planta vendida no histórico ainda.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Rodapé da Tabela */}
        <div className="p-4 bg-brand-surface-subtle border-t border-brand-border flex items-center justify-between text-xs text-brand-text-muted">
          <span>Mostrando <strong>{filteredPlants.length}</strong> registros</span>
          <span>
            {adminTab === 'ativas' 
              ? 'Dica: Ao alterar o status para "Vendida", a planta sai da vitrine e vai para o Histórico.' 
              : 'Dica: Você pode reativar uma planta vendida a qualquer momento.'}
          </span>
        </div>
      </div>
      )}

      {/* ── Painel do Acervo Botânico (Enciclopédia de Espécies) ── */}
      {adminTab === 'acervo' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Banner explicativo */}
          <div className="bg-brand-surface rounded-3xl border border-brand-border shadow-xs p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-brand-olive-light text-brand-olive flex items-center justify-center font-bold text-lg shrink-0 border border-brand-olive-border">
                <BookOpen className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-brand-text font-serif-title">
                    Acervo Botânico da Loja
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-olive-light text-brand-olive-text font-bold border border-brand-olive-border">
                    ☁️ Nuvem & Local
                  </span>
                </div>
                <p className="text-xs text-brand-text-muted max-w-2xl leading-relaxed">
                  Este dicionário botânico alimenta o <strong>Autofill Inteligente</strong> no balcão e no cadastro de vasos. Você pode editar os cuidados, trocar as categorias sugeridas ou adicionar novas espécies personalizadas.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={async () => {
                  await plantClassificationService.syncCloud();
                  setBotanicalPresets(plantClassificationService.getAllBotanicalPresetsList());
                }}
                title="Sincronizar acervo com a nuvem Supabase"
                className="px-3.5 py-2.5 bg-brand-surface-subtle hover:bg-brand-border text-brand-text text-xs font-semibold rounded-xl cursor-pointer border border-brand-border flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5 text-brand-olive" />
                <span>Atualizar</span>
              </button>

              <button
                onClick={() => {
                  setPresetForm({
                    ptName: '',
                    scientific: '',
                    family: '',
                    origin: '',
                    suggestedCategory: categories[0] || 'Folhagens',
                    light: 'meia-sombra',
                    watering: 'moderada',
                    petFriendly: true,
                    wateringTip: 'Regar quando a camada superficial da terra secar.',
                    careInstructions: 'Manter em local bem iluminado com claridade difusa.',
                    toxicity: 'Não tóxica para animais de estimação sob uso habitual.',
                    cycle: 'Perene',
                    bloomingSeason: 'Primavera / Verão',
                    pestsDiseases: 'Cochonilhas comuns',
                    aliases: [],
                  });
                  setIsNewPresetModalOpen(true);
                }}
                className="px-4 py-2.5 bg-brand-olive hover:bg-brand-olive-hover text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Nova Espécie no Acervo</span>
              </button>
            </div>
          </div>

          {/* Filtros e Busca do Acervo */}
          <div className="bg-brand-surface p-4 rounded-2xl border border-brand-border shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="relative w-full md:w-96">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-brand-text-muted" />
              <input
                type="text"
                placeholder="Buscar por nome popular, científico, família..."
                value={acervoSearch}
                onChange={e => setAcervoSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs bg-brand-surface-subtle border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-olive text-brand-text"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={acervoCategoryFilter}
                onChange={e => setAcervoCategoryFilter(e.target.value)}
                className="w-full md:w-auto px-3 py-2 text-xs bg-brand-surface-subtle border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-olive text-brand-text font-semibold cursor-pointer"
              >
                <option value="all">🌿 Todas as Categorias ({botanicalPresets.length})</option>
                {categories.map(cat => {
                  const count = botanicalPresets.filter(p => p.suggestedCategory === cat).length;
                  return (
                    <option key={cat} value={cat}>
                      {cat} ({count})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Grid de Espécies Catalogadas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBotanicalPresets.map(preset => (
              <div 
                key={preset.scientific || preset.ptName}
                className="bg-brand-surface rounded-2xl border border-brand-border p-4 space-y-3 hover:border-brand-olive/50 transition-all flex flex-col justify-between shadow-xs group"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-brand-text text-sm group-hover:text-brand-olive transition-colors leading-tight">
                        {preset.ptName}
                      </h4>
                      <p className="text-xs text-brand-text-muted italic">
                        {preset.scientific}
                      </p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-olive-light text-brand-olive-text font-bold border border-brand-olive-border shrink-0">
                      {preset.suggestedCategory || 'Folhagens'}
                    </span>
                  </div>

                  {/* Badges de Cuidados */}
                  <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold">
                    <span className="px-2 py-0.5 rounded-lg bg-brand-surface-subtle border border-brand-border text-brand-text-muted flex items-center gap-1">
                      <Sun className="w-3 h-3 text-amber-500" />
                      {preset.light === 'sol-pleno' ? 'Sol Pleno' : preset.light === 'meia-sombra' ? 'Meia Sombra' : 'Sombra Difusa'}
                    </span>
                    <span className="px-2 py-0.5 rounded-lg bg-brand-surface-subtle border border-brand-border text-brand-text-muted flex items-center gap-1">
                      <Droplets className="w-3 h-3 text-sky-500" />
                      {preset.watering === 'frequente' ? 'Rega Frequente' : preset.watering === 'moderada' ? 'Rega Moderada' : 'Pouca Rega'}
                    </span>
                    <span className={`px-2 py-0.5 rounded-lg border flex items-center gap-1 ${
                      preset.petFriendly 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800' 
                        : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800'
                    }`}>
                      {preset.petFriendly ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                      {preset.petFriendly ? 'Pet Friendly' : 'Tóxica'}
                    </span>
                  </div>

                  {/* Detalhes de cultivo */}
                  <div className="text-[11px] text-brand-text-muted bg-brand-surface-subtle p-2.5 rounded-xl border border-brand-border space-y-1">
                    <p className="line-clamp-2">
                      <strong className="text-brand-text">Cultivo:</strong> {preset.careInstructions}
                    </p>
                    <p className="line-clamp-1">
                      <strong className="text-brand-text">Rega:</strong> {preset.wateringTip}
                    </p>
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center justify-between pt-2 border-t border-brand-border text-xs">
                  <span className="text-[10px] text-brand-text-muted">
                    {preset.family ? `Família ${preset.family}` : 'Botânica'}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingPreset(preset);
                        setPresetForm({ ...preset });
                      }}
                      title="Editar ficha botânica desta espécie"
                      className="p-1.5 text-brand-text-muted hover:text-brand-olive hover:bg-brand-olive-light rounded-lg transition-colors cursor-pointer"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={async () => {
                        if (confirm(`Remover "${preset.ptName}" do acervo de classificação botânica?`)) {
                          await plantClassificationService.deletePreset(preset.ptName);
                          setBotanicalPresets(plantClassificationService.getAllBotanicalPresetsList());
                        }
                      }}
                      title="Excluir espécie do acervo"
                      className="p-1.5 text-brand-text-muted hover:text-brand-nude-text hover:bg-brand-nude-light rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredBotanicalPresets.length === 0 && (
            <div className="bg-brand-surface rounded-2xl border border-brand-border p-12 text-center text-brand-text-muted text-xs">
              Nenhuma espécie encontrada para o filtro de busca atual.
            </div>
          )}
        </div>
      )}

      {/* ── Painel de Configurações da Loja ─────────────────────── */}
      {adminTab === 'config' && (
        <div className="space-y-6 animate-in fade-in">

          {/* Categorias (Supabase Sync) */}
          <div className="bg-brand-surface rounded-3xl border border-brand-border shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Tag className="w-5 h-5 text-brand-olive" />
                <h3 className="text-base font-bold text-brand-text flex items-center gap-2">
                  Categorias de Plantas
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-olive-light text-brand-olive-text font-bold border border-brand-olive-border">
                    ☁️ Nuvem Supabase
                  </span>
                </h3>
              </div>
              <span className="text-xs text-brand-text-muted">
                <strong>{categories.length}</strong> categorias ativas
              </span>
            </div>
            <p className="text-xs text-brand-text-muted">
              As categorias organizam a vitrine, alimentam os filtros e são lidas pela Inteligência Artificial durante o preenchimento automático de espécies.
            </p>

            {/* Lista de categorias */}
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <div key={cat} className="flex items-center gap-1.5 bg-brand-olive-light border border-brand-olive-border rounded-xl px-3 py-1.5 text-xs font-semibold text-brand-olive-text">
                  <span>{cat}</span>
                  <button
                    onClick={async () => {
                      const updated = await configService.removeCategory(cat);
                      setCategories(updated);
                    }}
                    title="Remover categoria"
                    className="text-brand-olive hover:text-brand-nude-text cursor-pointer transition-colors"
                  >
                    <XIcon className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>

            {/* Adicionar nova categoria */}
            <div className="flex gap-2 items-center">
              <input
                type="text"
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                placeholder="Ex: Bromeliáceas, Aquáticas, Carnívoras, Bonsais..."
                className="flex-1 px-3 py-2 text-xs bg-brand-surface-subtle border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-olive text-brand-text"
                onKeyDown={async e => {
                  if (e.key === 'Enter' && newCatName.trim()) {
                    const updated = await configService.addCategory(newCatName);
                    setCategories(updated);
                    setNewCatName('');
                  }
                }}
              />
              <button
                onClick={async () => {
                  if (newCatName.trim()) {
                    const updated = await configService.addCategory(newCatName);
                    setCategories(updated);
                    setNewCatName('');
                  }
                }}
                className="px-4 py-2 bg-brand-olive hover:bg-brand-olive-hover text-white text-xs font-semibold rounded-xl cursor-pointer transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Adicionar
              </button>
              <button
                onClick={() => setCategories(configService.resetCategories())}
                title="Restaurar categorias padrão"
                className="px-3 py-2 bg-brand-surface-subtle hover:bg-brand-border text-brand-text text-xs font-semibold rounded-xl cursor-pointer border border-brand-border flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Restaurar padrão
              </button>
            </div>
          </div>

          {/* Bancadas & Setores Físicos da Loja (Supabase Sync) */}
          <div className="bg-brand-surface rounded-3xl border border-brand-border shadow-xs p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand-olive" />
                <div>
                  <h3 className="text-base font-bold text-brand-text flex items-center gap-2">
                    Bancadas & Setores Físicos
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-olive-light text-brand-olive-text font-bold border border-brand-olive-border">
                      ☁️ Nuvem Supabase
                    </span>
                  </h3>
                </div>
              </div>

              <span className="text-xs text-brand-text-muted">
                <strong>{locations.length}</strong> bancadas ativas
              </span>
            </div>

            <p className="text-xs text-brand-text-muted">
              As bancadas organizam os vasos na loja física, alimentam o gerador de QR Codes e filtram a vitrine do cliente.
            </p>

            {/* Lista de bancadas com IDs limpos e descrições visíveis */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {locations.map(loc => {
                const count = plants.filter(p => p.location === loc.name && p.status !== 'vendida').length;
                return (
                  <div 
                    key={loc.name} 
                    className="flex items-start justify-between bg-brand-surface-subtle border border-brand-border rounded-2xl p-3.5 text-xs gap-3 hover:border-brand-olive/40 transition-colors"
                  >
                    <div className="flex items-start gap-2.5 truncate flex-1">
                      <span className="text-base mt-0.5">📍</span>
                      <div className="truncate flex-1 space-y-0.5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-[10px] bg-brand-border/60 text-brand-text-muted px-1.5 py-0.5 rounded font-bold">
                            {loc.id}
                          </span>
                          <span className="font-bold text-brand-text truncate text-sm">
                            {loc.name}
                          </span>
                        </div>
                        {loc.description && (
                          <p className="text-[11px] text-brand-text-muted italic truncate">
                            {loc.description}
                          </p>
                        )}
                        <span className="text-[10px] inline-block font-semibold text-brand-olive bg-brand-olive-light px-2 py-0.5 rounded-full border border-brand-olive-border">
                          {count} {count === 1 ? 'vaso ativo' : 'vasos ativos'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0 pt-0.5">
                      {/* Editar Nome e Descrição */}
                      <button
                        onClick={() => {
                          setEditingLoc({
                            oldName: loc.name,
                            name: loc.name,
                            description: loc.description || '',
                          });
                        }}
                        title="Editar nome e descrição da bancada"
                        className="p-1.5 text-brand-text-muted hover:text-brand-olive hover:bg-brand-surface rounded-lg transition-colors cursor-pointer"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      {/* Remover bancada */}
                      <button
                        onClick={async () => {
                          if (confirm(`Remover a bancada "${loc.name}" da lista de setores da loja?`)) {
                            const updated = await configService.removeLocation(loc.name);
                            setLocations(updated);
                          }
                        }}
                        title="Remover bancada"
                        className="p-1.5 text-brand-text-muted hover:text-brand-nude-text hover:bg-brand-nude-light rounded-lg transition-colors cursor-pointer"
                      >
                        <XIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Adicionar nova bancada com Nome e Descrição */}
            <div className="pt-3 border-t border-brand-border space-y-2">
              <span className="text-xs font-bold text-brand-text flex items-center gap-1">
                <Plus className="w-3.5 h-3.5 text-brand-olive" />
                Cadastrar Nova Bancada / Setor:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  value={newLocName}
                  onChange={e => setNewLocName(e.target.value)}
                  placeholder="Nome da bancada (ex: Bancada 04 • Orquídeas)"
                  className="px-3 py-2 text-xs bg-brand-surface-subtle border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-olive text-brand-text font-medium"
                />
                <input
                  type="text"
                  value={newLocDesc}
                  onChange={e => setNewLocDesc(e.target.value)}
                  placeholder="Descrição / Localização (ex: Mesa perto da entrada)"
                  className="px-3 py-2 text-xs bg-brand-surface-subtle border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-olive text-brand-text"
                  onKeyDown={async e => {
                    if (e.key === 'Enter' && newLocName.trim()) {
                      const updated = await configService.addLocation(newLocName.trim(), newLocDesc.trim());
                      setLocations(updated);
                      setNewLocName('');
                      setNewLocDesc('');
                    }
                  }}
                />
              </div>
              <div className="flex gap-2 justify-end pt-1">
                <button
                  onClick={async () => {
                    if (newLocName.trim()) {
                      const updated = await configService.addLocation(newLocName.trim(), newLocDesc.trim());
                      setLocations(updated);
                      setNewLocName('');
                      setNewLocDesc('');
                    }
                  }}
                  disabled={!newLocName.trim()}
                  className="px-4 py-2 bg-brand-olive hover:bg-brand-olive-hover disabled:opacity-50 text-white text-xs font-semibold rounded-xl cursor-pointer transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Salvar Bancada
                </button>
                <button
                  onClick={() => setLocations(configService.resetLocations())}
                  title="Restaurar bancadas padrão"
                  className="px-3 py-2 bg-brand-surface-subtle hover:bg-brand-border text-brand-text text-xs font-semibold rounded-xl cursor-pointer border border-brand-border flex items-center gap-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Restaurar padrão
                </button>
              </div>
            </div>
          </div>

          {/* Modal de Edição de Bancada */}
          {editingLoc && (
            <div 
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in"
              onClick={() => setEditingLoc(null)}
            >
              <div 
                className="bg-brand-surface rounded-3xl shadow-xl border border-brand-border w-full max-w-md p-6 space-y-4 animate-in zoom-in-95"
                onClick={e => e.stopPropagation()}
              >
                <div className="flex items-center justify-between border-b border-brand-border pb-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-brand-olive" />
                    <h3 className="text-base font-bold text-brand-text font-serif-title">
                      Editar Bancada / Setor
                    </h3>
                  </div>
                  <button
                    onClick={() => setEditingLoc(null)}
                    className="p-1 rounded-lg text-brand-text-muted hover:text-brand-text hover:bg-brand-border cursor-pointer"
                  >
                    <XIcon className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-brand-text mb-1">
                      Nome da Bancada *
                    </label>
                    <input
                      type="text"
                      value={editingLoc.name}
                      onChange={e => setEditingLoc({ ...editingLoc, name: e.target.value })}
                      className="w-full px-3 py-2 bg-brand-surface-subtle border border-brand-border rounded-xl focus:ring-2 focus:ring-brand-olive focus:outline-none font-bold text-brand-text"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-brand-text mb-1">
                      Descrição / Detalhe Físico
                    </label>
                    <input
                      type="text"
                      value={editingLoc.description}
                      onChange={e => setEditingLoc({ ...editingLoc, description: e.target.value })}
                      placeholder="Ex: Mesa principal de destaque na entrada"
                      className="w-full px-3 py-2 bg-brand-surface-subtle border border-brand-border rounded-xl focus:ring-2 focus:ring-brand-olive focus:outline-none text-brand-text"
                    />
                  </div>

                  <p className="text-[11px] text-brand-text-muted bg-brand-surface-subtle p-2.5 rounded-xl border border-brand-border">
                    💡 Se você alterar o nome, todas as plantas atualmente cadastradas nesta bancada serão atualizadas automaticamente.
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-brand-border text-xs">
                  <button
                    onClick={() => setEditingLoc(null)}
                    className="px-4 py-2 bg-brand-border hover:bg-brand-border-subtle text-brand-text font-bold rounded-xl cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={async () => {
                      if (editingLoc.name.trim()) {
                        const updated = await configService.updateLocation(
                          editingLoc.oldName,
                          editingLoc.name.trim(),
                          editingLoc.description.trim()
                        );
                        setLocations(updated);
                        setEditingLoc(null);
                        onRefresh();
                      }
                    }}
                    className="px-4 py-2 bg-brand-olive hover:bg-brand-olive-hover text-white font-bold rounded-xl shadow-xs cursor-pointer"
                  >
                    Salvar Alterações
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* Modal de Criar/Editar Espécie no Acervo */}
      {(editingPreset || isNewPresetModalOpen) && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-brand-surface border border-brand-border rounded-3xl p-6 max-w-xl w-full shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-brand-border">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-brand-olive" />
                <h3 className="font-bold text-brand-text font-serif-title">
                  {editingPreset ? `Editar Espécie: ${editingPreset.ptName}` : 'Nova Espécie no Acervo Botânico'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setEditingPreset(null);
                  setIsNewPresetModalOpen(false);
                }}
                className="p-1 rounded-lg text-brand-text-muted hover:text-brand-text hover:bg-brand-border cursor-pointer"
              >
                <XIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-brand-text mb-1">Nome Popular *</label>
                <input
                  type="text"
                  value={presetForm.ptName || ''}
                  onChange={e => setPresetForm(prev => ({ ...prev, ptName: e.target.value }))}
                  placeholder="Ex: Cabomba, Orquídea Phalaenopsis"
                  className="w-full px-3 py-2 bg-brand-surface-subtle border border-brand-border rounded-xl focus:ring-2 focus:ring-brand-olive focus:outline-none font-bold text-brand-text"
                />
              </div>

              <div>
                <label className="block font-bold text-brand-text mb-1">Nome Científico *</label>
                <input
                  type="text"
                  value={presetForm.scientific || ''}
                  onChange={e => setPresetForm(prev => ({ ...prev, scientific: e.target.value }))}
                  placeholder="Ex: Cabomba caroliniana"
                  className="w-full px-3 py-2 bg-brand-surface-subtle border border-brand-border rounded-xl focus:ring-2 focus:ring-brand-olive focus:outline-none italic text-brand-text"
                />
              </div>

              <div>
                <label className="block font-bold text-brand-text mb-1">Categoria Sugerida *</label>
                <select
                  value={presetForm.suggestedCategory || categories[0] || 'Folhagens'}
                  onChange={e => setPresetForm(prev => ({ ...prev, suggestedCategory: e.target.value }))}
                  className="w-full px-3 py-2 bg-brand-surface-subtle border border-brand-border rounded-xl focus:ring-2 focus:ring-brand-olive focus:outline-none text-brand-text font-semibold cursor-pointer"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-brand-text mb-1">Família Botânica</label>
                <input
                  type="text"
                  value={presetForm.family || ''}
                  onChange={e => setPresetForm(prev => ({ ...prev, family: e.target.value }))}
                  placeholder="Ex: Cabombaceae, Araceae"
                  className="w-full px-3 py-2 bg-brand-surface-subtle border border-brand-border rounded-xl focus:ring-2 focus:ring-brand-olive focus:outline-none text-brand-text"
                />
              </div>

              <div>
                <label className="block font-bold text-brand-text mb-1">Luminosidade</label>
                <select
                  value={presetForm.light || 'meia-sombra'}
                  onChange={e => setPresetForm(prev => ({ ...prev, light: e.target.value as any }))}
                  className="w-full px-3 py-2 bg-brand-surface-subtle border border-brand-border rounded-xl focus:ring-2 focus:ring-brand-olive focus:outline-none text-brand-text cursor-pointer"
                >
                  <option value="sol-pleno">☀️ Sol Pleno (4-6h diárias de sol direto)</option>
                  <option value="meia-sombra">⛅ Meia-sombra (Sol suave / Claridade)</option>
                  <option value="sombra-difusa">☁️ Sombra Difusa (Luz indireta filtrada)</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-brand-text mb-1">Frequência de Rega</label>
                <select
                  value={presetForm.watering || 'moderada'}
                  onChange={e => setPresetForm(prev => ({ ...prev, watering: e.target.value as any }))}
                  className="w-full px-3 py-2 bg-brand-surface-subtle border border-brand-border rounded-xl focus:ring-2 focus:ring-brand-olive focus:outline-none text-brand-text cursor-pointer"
                >
                  <option value="baixa">💧 Pouca Rega (Solo completamente seco)</option>
                  <option value="moderada">💧💧 Rega Moderada (1 a 2x na semana)</option>
                  <option value="frequente">💧💧💧 Rega Frequente / Submersa</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="flex items-center gap-2 p-3 bg-brand-surface-subtle border border-brand-border rounded-xl cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(presetForm.petFriendly)}
                    onChange={e => setPresetForm(prev => ({ ...prev, petFriendly: e.target.checked }))}
                    className="w-4 h-4 text-brand-olive rounded-sm focus:ring-brand-olive"
                  />
                  <span className="font-bold text-brand-text">🐾 Espécie Pet Friendly (Segura para cães e gatos)</span>
                </label>
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-brand-text mb-1">Dica de Rega Prática</label>
                <input
                  type="text"
                  value={presetForm.wateringTip || ''}
                  onChange={e => setPresetForm(prev => ({ ...prev, wateringTip: e.target.value }))}
                  placeholder="Ex: Regar quando os primeiros 2cm do solo secarem."
                  className="w-full px-3 py-2 bg-brand-surface-subtle border border-brand-border rounded-xl focus:ring-2 focus:ring-brand-olive focus:outline-none text-brand-text"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-brand-text mb-1">Guia de Cultivo & Luminosidade</label>
                <textarea
                  rows={2}
                  value={presetForm.careInstructions || ''}
                  onChange={e => setPresetForm(prev => ({ ...prev, careInstructions: e.target.value }))}
                  placeholder="Ex: Luz indireta abundante. Aprecia boa umidade no ar."
                  className="w-full px-3 py-2 bg-brand-surface-subtle border border-brand-border rounded-xl focus:ring-2 focus:ring-brand-olive focus:outline-none text-brand-text"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-brand-text mb-1">Toxicidade / Alerta aos Pets</label>
                <input
                  type="text"
                  value={presetForm.toxicity || ''}
                  onChange={e => setPresetForm(prev => ({ ...prev, toxicity: e.target.value }))}
                  placeholder="Ex: Tóxica para cães e gatos (contém cristais de oxalato)"
                  className="w-full px-3 py-2 bg-brand-surface-subtle border border-brand-border rounded-xl focus:ring-2 focus:ring-brand-olive focus:outline-none text-brand-text"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-brand-text mb-1">Sinônimos / Apelidos de Busca (separados por vírgula)</label>
                <input
                  type="text"
                  value={Array.isArray(presetForm.aliases) ? presetForm.aliases.join(', ') : ''}
                  onChange={e => {
                    const list = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                    setPresetForm(prev => ({ ...prev, aliases: list }));
                  }}
                  placeholder="Ex: cabomba, leque aquatico, elodea"
                  className="w-full px-3 py-2 bg-brand-surface-subtle border border-brand-border rounded-xl focus:ring-2 focus:ring-brand-olive focus:outline-none text-brand-text font-mono text-[11px]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-brand-border text-xs">
              <button
                onClick={() => {
                  setEditingPreset(null);
                  setIsNewPresetModalOpen(false);
                }}
                className="px-4 py-2 bg-brand-border hover:bg-brand-border-subtle text-brand-text font-bold rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                disabled={isSavingPreset || !presetForm.ptName}
                onClick={async () => {
                  if (!presetForm.ptName) return;
                  setIsSavingPreset(true);
                  try {
                    const presetToSave: PlantBotanicalPreset = {
                      ptName: presetForm.ptName.trim(),
                      scientific: presetForm.scientific?.trim() || presetForm.ptName.trim(),
                      family: presetForm.family?.trim() || 'Botânica',
                      origin: presetForm.origin?.trim() || 'Brasil',
                      suggestedCategory: presetForm.suggestedCategory || categories[0] || 'Folhagens',
                      light: presetForm.light || 'meia-sombra',
                      watering: presetForm.watering || 'moderada',
                      petFriendly: Boolean(presetForm.petFriendly),
                      wateringTip: presetForm.wateringTip?.trim() || 'Regar moderadamente.',
                      careInstructions: presetForm.careInstructions?.trim() || 'Ambiente arejado com claridade natural.',
                      toxicity: presetForm.toxicity?.trim() || (presetForm.petFriendly ? 'Não tóxica para animais' : 'Tóxica para animais'),
                      cycle: presetForm.cycle?.trim() || 'Perene',
                      bloomingSeason: presetForm.bloomingSeason?.trim() || 'Primavera / Verão',
                      pestsDiseases: presetForm.pestsDiseases?.trim() || 'Cochonilhas comuns',
                      aliases: presetForm.aliases || [presetForm.ptName.toLowerCase()],
                    };

                    await plantClassificationService.savePreset(presetToSave);
                    setBotanicalPresets(plantClassificationService.getAllBotanicalPresetsList());
                    setEditingPreset(null);
                    setIsNewPresetModalOpen(false);
                  } finally {
                    setIsSavingPreset(false);
                  }
                }}
                className="px-4 py-2 bg-brand-olive hover:bg-brand-olive-hover text-white font-bold rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                {isSavingPreset ? 'Salvando...' : 'Salvar no Acervo'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
