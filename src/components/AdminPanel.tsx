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
  Tag,
  Droplets
} from 'lucide-react';
import type { Plant, PlantStatus } from '../types/plant';
import { plantService } from '../services/plantService';
import { configService, type WateringOption } from '../services/configService';


interface AdminPanelProps {
  plants: Plant[];
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

  // Estado de configurações (categorias e regas)
  const [categories, setCategories] = useState<string[]>(() => configService.getCategories());
  const [wateringOpts, setWateringOpts] = useState<WateringOption[]>(() => configService.getWateringOptions());
  const [newCatName, setNewCatName] = useState('');
  const [newWaterLabel, setNewWaterLabel] = useState('');
  const [newWaterEmoji, setNewWaterEmoji] = useState('💧');


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
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (plantService.importBackup(content)) {
        alert('Backup importado com sucesso!');
        onRefresh();
      } else {
        alert('Erro ao importar arquivo. Verifique o formato JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    if (confirm('Tem certeza que deseja restaurar as plantas de exemplo? Seus cadastros atuais serão redefinidos.')) {
      plantService.resetToInitial();
      onRefresh();
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12 animate-in fade-in">
      
      {/* Cabeçalho do Painel */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Painel Administrativo</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold font-serif-title text-stone-900 mt-1">
            Gestão do Catálogo & Vasos
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Cadastre, edite, altere status e acompanhe o estoque e histórico de vendas
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={onOpenAddModal}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow flex items-center gap-2 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            + Cadastrar Nova Planta
          </button>

          <button 
            onClick={() => plantService.exportBackup()}
            title="Baixar cópia de segurança em JSON"
            className="bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold px-3 py-2.5 rounded-xl text-xs border border-stone-300 flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            Backup
          </button>

          <label 
            title="Restaurar backup de arquivo JSON"
            className="bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold px-3 py-2.5 rounded-xl text-xs border border-stone-300 flex items-center gap-1.5 cursor-pointer transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            Importar
            <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" />
          </label>
        </div>
      </div>

      {/* Cards de Métricas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-stone-100 flex items-center justify-center text-stone-700">
            <Sprout className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-stone-500 uppercase">Em Estoque</div>
            <div className="text-xl font-extrabold text-stone-900">{stats.available + stats.reserved}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-stone-500 uppercase">Disponíveis</div>
            <div className="text-xl font-extrabold text-emerald-700">{stats.available}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-stone-500 uppercase">Reservadas</div>
            <div className="text-xl font-extrabold text-amber-700">{stats.reserved}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-700">
            <Archive className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-stone-500 uppercase">Total Vendidas</div>
            <div className="text-xl font-extrabold text-purple-700">{stats.sold}</div>
          </div>
        </div>
      </div>

      {/* Seletor de Seção do Painel (Ativas vs Histórico de Vendidas vs Config) */}
      <div className="flex items-center justify-between border-b border-stone-200">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setAdminTab('ativas');
              setStatusFilter('all');
            }}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              adminTab === 'ativas'
                ? 'border-emerald-700 text-emerald-900'
                : 'border-transparent text-stone-400 hover:text-stone-700'
            }`}
          >
            <Sprout className="w-4 h-4" />
            <span>🌿 Vasos Ativos ({stats.available + stats.reserved})</span>
          </button>

          <button
            onClick={() => {
              setAdminTab('vendidas');
              setStatusFilter('all');
            }}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              adminTab === 'vendidas'
                ? 'border-purple-700 text-purple-900'
                : 'border-transparent text-stone-400 hover:text-stone-700'
            }`}
          >
            <Archive className="w-4 h-4" />
            <span>📦 Histórico ({stats.sold})</span>
          </button>

          <button
            onClick={() => setAdminTab('config')}
            className={`pb-3 px-4 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
              adminTab === 'config'
                ? 'border-stone-700 text-stone-900'
                : 'border-transparent text-stone-400 hover:text-stone-700'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>⚙️ Configurações</span>
          </button>
        </div>

        <div className="hidden sm:block text-xs text-stone-500 pb-3">
          {adminTab === 'ativas' ? (
            <span>Valor em estoque: <strong className="text-stone-900">R$ {stats.stockValue.toFixed(2).replace('.', ',')}</strong></span>
          ) : adminTab === 'vendidas' ? (
            <span>Faturamento histórico: <strong className="text-purple-900">R$ {stats.soldTotalValue.toFixed(2).replace('.', ',')}</strong></span>
          ) : null}
        </div>
      </div>


      {/* Barra de Busca e Filtros da Tabela — oculta na aba Config */}
      {adminTab !== 'config' && (
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder={adminTab === 'ativas' ? "Buscar vasos ativos..." : "Buscar no histórico de vendidas..."} 
            className="w-full pl-10 pr-4 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto text-xs">
          {adminTab === 'ativas' && (
            <select 
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium text-stone-700 cursor-pointer"
            >
              <option value="all">Todos os Status Ativos</option>
              <option value="disponivel">Apenas Disponíveis</option>
              <option value="reservada">Apenas Reservadas</option>
            </select>
          )}

          <select 
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium text-stone-700 cursor-pointer"
          >
            <option value="all">Todas as Categorias</option>
            <option value="Folhagens">Folhagens</option>
            <option value="Pendentes">Pendentes</option>
            <option value="Suculentas & Cactos">Suculentas & Cactos</option>
            <option value="Flores">Flores</option>
            <option value="Arbustos & Árvores">Arbustos & Árvores</option>
          </select>

          <button 
            onClick={handleResetData}
            title="Redefinir catálogo inicial"
            className="p-2 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
      )}

      {/* Tabela de Plantas — oculta na aba Config */}
      {adminTab !== 'config' && (
      <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">

          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-50 border-b border-stone-200 font-bold uppercase tracking-wider text-stone-500 text-[10px]">
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
            <tbody className="divide-y divide-stone-200/70">
              {filteredPlants.length > 0 ? (
                filteredPlants.map((plant) => (
                  <tr key={plant.id} className="hover:bg-stone-50/80 transition-colors">
                    
                    {/* Código / Tag */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="font-mono font-bold text-xs bg-stone-100 text-stone-800 px-2 py-1 rounded border border-stone-200">
                        #{plant.id}
                      </span>
                    </td>

                    {/* Planta */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img 
                          src={plant.imageUrl} 
                          alt={plant.name} 
                          className="w-10 h-10 rounded-lg object-cover border border-stone-200 shrink-0" 
                        />
                        <div>
                          <div className="font-bold text-stone-900 text-xs">{plant.name}</div>
                          <div className="text-[11px] text-stone-500 italic">{plant.scientificName} • {plant.potSize}</div>
                        </div>
                      </div>
                    </td>

                    {/* Categoria */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-[11px] font-medium text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">
                        {plant.category}
                      </span>
                    </td>

                    {/* Localização */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 text-stone-600 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{plant.location}</span>
                      </div>
                    </td>

                    {/* Preço */}
                    <td className="px-4 py-3 whitespace-nowrap font-bold text-stone-900">
                      R$ {plant.price.toFixed(2).replace('.', ',')}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <select 
                        value={plant.status}
                        onChange={(e) => onStatusChange(plant, e.target.value as PlantStatus)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border focus:outline-none cursor-pointer ${
                          plant.status === 'disponivel'
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                            : plant.status === 'reservada'
                            ? 'bg-amber-50 border-amber-300 text-amber-800'
                            : 'bg-purple-50 border-purple-300 text-purple-800'
                        }`}
                      >
                        <option value="disponivel">🟢 Disponível</option>
                        <option value="reservada">🟡 Reservada</option>
                        <option value="vendida">🟣 Vendida</option>
                      </select>
                    </td>

                    {/* Ações */}
                    <td className="px-4 py-3 whitespace-nowrap text-right space-x-1">
                      <button 
                        onClick={() => onViewPlant(plant)}
                        title="Ver ficha mobile"
                        className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {plant.status !== 'vendida' ? (
                        <button 
                          onClick={() => onSelectForTag(plant)}
                          title="Gerar Etiqueta QR"
                          className="p-1.5 text-stone-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <QrCode className="w-4 h-4" />
                        </button>
                      ) : (
                        <button 
                          onClick={() => onStatusChange(plant, 'disponivel')}
                          title="Reativar e colocar em estoque"
                          className="p-1.5 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      )}

                      <button 
                        onClick={() => onOpenEditModal(plant)}
                        title="Editar planta"
                        className="p-1.5 text-stone-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
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
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-stone-400 text-xs">
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
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
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
          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Tag className="w-5 h-5 text-emerald-700" />
              <h3 className="text-base font-bold text-stone-900">Categorias de Plantas</h3>
            </div>
            <p className="text-xs text-stone-500">
              As categorias aparecem no formulário de cadastro e nos filtros da vitrine. Adicione novas ou remova as que não usa.
            </p>

            {/* Lista de categorias */}
            <div className="flex flex-wrap gap-2">
              {categories.map(cat => (
                <div key={cat} className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-emerald-900">
                  <span>{cat}</span>
                  <button
                    onClick={() => setCategories(configService.removeCategory(cat))}
                    title="Remover categoria"
                    className="text-emerald-500 hover:text-rose-600 cursor-pointer transition-colors"
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
                className="flex-1 px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl cursor-pointer transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Adicionar
              </button>
              <button
                onClick={() => setCategories(configService.resetCategories())}
                title="Restaurar categorias padrão"
                className="px-3 py-2 bg-stone-100 hover:bg-stone-200 text-stone-600 text-xs font-semibold rounded-xl cursor-pointer border border-stone-300 flex items-center gap-1"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Restaurar padrão
              </button>
            </div>
          </div>

          {/* Frequências de Rega */}
          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Droplets className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-stone-900">Frequências de Rega</h3>
            </div>
            <p className="text-xs text-stone-500">
              As três opções padrão não podem ser removidas. Adicione opções extras para casos específicos da sua loja.
            </p>

            {/* Lista de opções de rega */}
            <div className="space-y-2">
              {wateringOpts.map(opt => {
                const isDefault = ['baixa', 'moderada', 'frequente'].includes(opt.value);
                return (
                  <div key={opt.value} className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-xs font-semibold ${isDefault ? 'bg-blue-50 border-blue-200 text-blue-900' : 'bg-stone-50 border-stone-200 text-stone-800'}`}>
                    <span>{opt.emoji} {opt.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] text-stone-400 bg-stone-100 px-2 py-0.5 rounded-lg">{opt.value}</span>
                      {!isDefault && (
                        <button
                          onClick={() => setWateringOpts(configService.removeWateringOption(opt.value))}
                          className="text-stone-400 hover:text-rose-600 cursor-pointer transition-colors"
                        >
                          <XIcon className="w-3.5 h-3.5" />
                        </button>
                      )}
                      {isDefault && <span className="text-[10px] text-blue-500 font-medium">padrão</span>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Adicionar nova opção de rega */}
            <div className="flex gap-2 items-center flex-wrap">
              <input
                type="text"
                value={newWaterEmoji}
                onChange={e => setNewWaterEmoji(e.target.value)}
                placeholder="💧"
                maxLength={4}
                className="w-16 px-3 py-2 text-sm text-center bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="text"
                value={newWaterLabel}
                onChange={e => setNewWaterLabel(e.target.value)}
                placeholder="Ex: Nebulização Diária, Hidropônico..."
                className="flex-1 px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => {
                  if (newWaterLabel.trim()) {
                    setWateringOpts(configService.addWateringOption(newWaterLabel, newWaterEmoji));
                    setNewWaterLabel('');
                    setNewWaterEmoji('💧');
                  }
                }}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-xl cursor-pointer transition-colors flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                Adicionar
              </button>
            </div>
          </div>

          {/* Senha de Acesso (futura expansão) */}
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 text-xs text-amber-900 space-y-1">
            <p className="font-bold flex items-center gap-1.5">🔑 Alteração de Senha — Em Breve</p>
            <p className="text-amber-700">A troca de senha de administrador estará disponível em uma próxima atualização.</p>
          </div>

        </div>
      )}

    </div>
  );
};
