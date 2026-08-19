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
  DollarSign, 
  Sprout, 
  CheckCircle2, 
  Clock,
  RotateCcw
} from 'lucide-react';
import type { Plant, PlantStatus } from '../types/plant';
import { plantService } from '../services/plantService';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Métricas da Loja
  const stats = useMemo(() => {
    const total = plants.length;
    const available = plants.filter(p => p.status === 'disponivel').length;
    const reserved = plants.filter(p => p.status === 'reservada').length;
    const totalValue = plants
      .filter(p => p.status === 'disponivel')
      .reduce((sum, p) => sum + p.price, 0);

    const locations = new Set(plants.map(p => p.location)).size;

    return { total, available, reserved, totalValue, locations };
  }, [plants]);

  // Lista Filtrada
  const filteredPlants = useMemo(() => {
    return plants.filter(plant => {
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
  }, [plants, searchTerm, statusFilter, categoryFilter]);

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
            Cadastre, edite e acompanhe os vasos e suas localizações na loja
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button 
            onClick={onOpenAddModal}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            + Cadastrar Nova Planta
          </button>

          <button 
            onClick={() => plantService.exportBackup()}
            title="Baixar cópia de segurança em JSON"
            className="bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold px-3 py-2.5 rounded-xl text-xs border border-stone-300 flex items-center gap-1.5 transition-colors"
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
            <div className="text-[11px] font-semibold text-stone-500 uppercase">Total de Vasos</div>
            <div className="text-xl font-extrabold text-stone-900">{stats.total}</div>
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
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-700">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-stone-500 uppercase">Valor Estoque</div>
            <div className="text-lg font-extrabold text-stone-900">
              R$ {stats.totalValue.toFixed(2).replace('.', ',')}
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Busca e Filtros da Tabela */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-stone-400" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por tag, nome ou local..." 
            className="w-full pl-10 pr-4 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto text-xs">
          <select 
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium text-stone-700"
          >
            <option value="all">Todos os Status</option>
            <option value="disponivel">Apenas Disponíveis</option>
            <option value="reservada">Apenas Reservadas</option>
            <option value="vendida">Apenas Vendidas</option>
          </select>

          <select 
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl font-medium text-stone-700"
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
            className="p-2 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Tabela de Plantas */}
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
                            : 'bg-stone-100 border-stone-300 text-stone-600'
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
                        className="p-1.5 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button 
                        onClick={() => onSelectForTag(plant)}
                        title="Gerar Etiqueta QR"
                        className="p-1.5 text-stone-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>

                      <button 
                        onClick={() => onOpenEditModal(plant)}
                        title="Editar planta"
                        className="p-1.5 text-stone-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button 
                        onClick={() => {
                          if (confirm(`Excluir ${plant.name} (#${plant.id})?`)) {
                            onDeletePlant(plant.id);
                          }
                        }}
                        title="Excluir planta"
                        className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-stone-400 text-xs">
                    Nenhuma planta encontrada para os filtros selecionados.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Rodapé da Tabela */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
          <span>Mostrando <strong>{filteredPlants.length}</strong> de {plants.length} registros</span>
          <span>Dica: Clique no ícone de QR Code para imprimir a etiqueta do vaso</span>
        </div>
      </div>

    </div>
  );
};
