import React, { useState, useMemo } from 'react';
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
  Tag
} from 'lucide-react';
import type { Plant, PlantStatus } from '../types/plant';
import { plantService } from '../services/plantService';
import { configService } from '../services/configService';


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
  // Aba interna do painel: 'ativas', 'vendidas' ou 'config'
  const [adminTab, setAdminTab] = useState<'ativas' | 'vendidas' | 'config'>('ativas');
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

      {/* Seletor de Seção do Painel (Ativas vs Histórico de Vendidas vs Config) */}
      <div className="flex items-center justify-between border-b border-brand-border">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setAdminTab('ativas');
              setStatusFilter('all');
            }}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              adminTab === 'ativas'
                ? 'border-brand-olive text-brand-text font-bold'
                : 'border-transparent text-brand-text-muted hover:text-brand-text'
            }`}
          >
            <Sprout className="w-4 h-4 text-brand-olive" />
            <span>🌿 Vasos Ativos ({stats.available + stats.reserved})</span>
          </button>

          <button
            onClick={() => {
              setAdminTab('vendidas');
              setStatusFilter('all');
            }}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              adminTab === 'vendidas'
                ? 'border-brand-nude text-brand-text font-bold'
                : 'border-transparent text-brand-text-muted hover:text-brand-text'
            }`}
          >
            <Archive className="w-4 h-4 text-brand-nude" />
            <span>📦 Histórico ({stats.sold})</span>
          </button>

          <button
            onClick={() => setAdminTab('config')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              adminTab === 'config'
                ? 'border-brand-olive text-brand-text font-bold'
                : 'border-transparent text-brand-text-muted hover:text-brand-text'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>⚙️ Configurações</span>
          </button>
        </div>

        <div className="hidden sm:block text-xs text-brand-text-muted pb-3">
          {adminTab === 'ativas' ? (
            <span>Valor em estoque: <strong className="text-brand-text">R$ {stats.stockValue.toFixed(2).replace('.', ',')}</strong></span>
          ) : adminTab === 'vendidas' ? (
            <span>Faturamento histórico: <strong className="text-brand-nude-text">R$ {stats.soldTotalValue.toFixed(2).replace('.', ',')}</strong></span>
          ) : null}
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

      {/* ── Painel de Configurações da Loja ─────────────────────── */}
      {adminTab === 'config' && (
        <div className="space-y-6 animate-in fade-in">

          {/* Categorias */}
          <div className="bg-brand-surface rounded-3xl border border-brand-border shadow-xs p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-brand-olive" />
              <h3 className="text-base font-bold text-brand-text">Categorias de Plantas</h3>
            </div>
            <p className="text-xs text-brand-text-muted">
              As categorias aparecem no formulário de cadastro e nos filtros da vitrine. Adicione novas ou remova as que não usa.
            </p>

            {/* Lista de categorias */}
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <div key={cat} className="flex items-center gap-1.5 bg-brand-olive-light border border-brand-olive-border rounded-xl px-3 py-1.5 text-xs font-semibold text-brand-olive-text">
                  <span>{cat}</span>
                  <button
                    onClick={() => setCategories(configService.removeCategory(cat))}
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
                placeholder="Ex: Bromeliáceas, Aquáticas, Carnívoras..."
                className="flex-1 px-3 py-2 text-xs bg-brand-surface-subtle border border-brand-border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-olive text-brand-text"
                onKeyDown={e => {
                  if (e.key === 'Enter' && newCatName.trim()) {
                    setCategories(configService.addCategory(newCatName));
                    setNewCatName('');
                  }
                }}
              />
              <button
                onClick={() => {
                  if (newCatName.trim()) {
                    setCategories(configService.addCategory(newCatName));
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

    </div>
  );
};
