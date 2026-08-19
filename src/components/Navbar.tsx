import React from 'react';
import { Flower2, Store, LayoutGrid, QrCode, Plus } from 'lucide-react';

export type AppTab = 'showcase' | 'admin' | 'tags';

interface NavbarProps {
  currentTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  onOpenAddModal: () => void;
  plantCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenAddModal,
  plantCount,
}) => {
  return (
    <header className="no-print bg-stone-900 text-stone-100 sticky top-0 z-40 shadow-lg border-b border-stone-800">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Logo & Nome da Loja */}
        <div 
          onClick={() => onSelectTab('showcase')}
          className="flex items-center space-x-3 cursor-pointer group"
        >
          <div className="w-10 h-10 bg-emerald-700 group-hover:bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-md transition-colors">
            <Flower2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg leading-tight tracking-tight font-serif-title text-white">
                Tons & Flores
              </span>
              <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full font-bold">
                {plantCount} Vasos
              </span>
            </div>
            <p className="text-[11px] text-stone-400">Catálogo & Gestão de Plantas</p>
          </div>
        </div>

        {/* Abas de Navegação */}
        <nav className="flex items-center bg-stone-800/90 p-1.5 rounded-2xl border border-stone-700 text-xs font-semibold gap-1">
          <button
            onClick={() => onSelectTab('showcase')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              currentTab === 'showcase'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'text-stone-300 hover:text-white hover:bg-stone-700/50'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Vitrine & Busca</span>
          </button>

          <button
            onClick={() => onSelectTab('admin')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              currentTab === 'admin'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'text-stone-300 hover:text-white hover:bg-stone-700/50'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            <span>Painel da Loja</span>
          </button>

          <button
            onClick={() => onSelectTab('tags')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              currentTab === 'tags'
                ? 'bg-emerald-700 text-white shadow-md'
                : 'text-stone-300 hover:text-white hover:bg-stone-700/50'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Etiquetas QR</span>
          </button>
        </nav>

        {/* Botão de Cadastro Rápido */}
        <div className="hidden md:flex items-center">
          <button
            onClick={onOpenAddModal}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-3.5 py-2 rounded-xl shadow flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            + Nova Planta
          </button>
        </div>

      </div>
    </header>
  );
};
