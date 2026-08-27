import React, { useState, useEffect } from 'react';
import { Flower2, Store, LayoutGrid, QrCode, Plus, Lock, LogOut } from 'lucide-react';

export type AppTab = 'showcase' | 'admin' | 'tags';

interface NavbarProps {
  currentTab: AppTab;
  onSelectTab: (tab: AppTab) => void;
  onOpenAddModal: () => void;
  onOpenLoginModal: () => void;
  onLogout: () => void;
  isAdmin: boolean;
  plantCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onOpenAddModal,
  onOpenLoginModal,
  onLogout,
  isAdmin,
  plantCount,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;

          // Se estiver bem no topo da página, sempre mostra
          if (currentScrollY < 30) {
            setIsVisible(true);
          } else if (currentScrollY > lastScrollY && currentScrollY > 80) {
            // Scrollando para baixo -> esconde o header
            setIsVisible(false);
          } else if (currentScrollY < lastScrollY) {
            // Scrollando para cima -> mostra o header novamente
            setIsVisible(true);
          }

          setLastScrollY(currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <header
      className={`no-print bg-stone-900/95 backdrop-blur-md text-stone-100 sticky top-0 z-40 shadow-lg border-b border-stone-800 transition-transform duration-300 ease-in-out ${
        isVisible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3.5">
        {/* Linha Principal: Horizontal em todos os tamanhos de tela */}
        <div className="flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Logo & Nome da Loja */}
          <div 
            onClick={() => onSelectTab('showcase')}
            className="flex items-center space-x-2.5 cursor-pointer group shrink-0"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-700 group-hover:bg-emerald-600 rounded-xl sm:rounded-2xl flex items-center justify-center text-white shadow-md transition-colors shrink-0">
              <Flower2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-bold text-base sm:text-lg leading-tight tracking-tight font-serif-title text-white">
                  Tons & Flores
                </span>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 sm:px-2 py-0.5 rounded-full font-bold">
                  {plantCount}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-stone-400 hidden xs:block">
                Catálogo Digital
              </p>
            </div>
          </div>

          {/* Abas de Navegação no Desktop (ou se for Admin no desktop) */}
          {isAdmin && (
            <nav className="hidden md:flex items-center bg-stone-800/90 p-1 rounded-2xl border border-stone-700 text-xs font-semibold gap-1">
              <button
                onClick={() => onSelectTab('showcase')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  currentTab === 'showcase'
                    ? 'bg-emerald-700 text-white shadow-md'
                    : 'text-stone-300 hover:text-white hover:bg-stone-700/50'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>Vitrine</span>
              </button>

              <button
                onClick={() => onSelectTab('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  currentTab === 'admin'
                    ? 'bg-emerald-700 text-white shadow-md'
                    : 'text-stone-300 hover:text-white hover:bg-stone-700/50'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Painel da Loja</span>
              </button>

              <button
                onClick={() => onSelectTab('tags')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  currentTab === 'tags'
                    ? 'bg-emerald-700 text-white shadow-md'
                    : 'text-stone-300 hover:text-white hover:bg-stone-700/50'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Etiquetas</span>
              </button>
            </nav>
          )}

          {/* Ações da Direita: Na mesma linha horizontal no mobile */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {isAdmin ? (
              <>
                <button
                  onClick={onOpenAddModal}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl shadow flex items-center gap-1 sm:gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="text-[11px] sm:text-xs">Nova Planta</span>
                </button>

                <button
                  onClick={onLogout}
                  title="Sair do modo administrador"
                  className="bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white p-1.5 sm:p-2 rounded-xl border border-stone-700 text-xs transition-colors cursor-pointer flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Sair</span>
                </button>
              </>
            ) : (
              <button
                onClick={onOpenLoginModal}
                className="bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl border border-stone-700 shadow-sm flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" />
                <span>Área do Lojista</span>
              </button>
            )}
          </div>

        </div>

        {/* Linha 2 apenas quando o Admin estiver ativo no mobile: Abas em scroll horizontal limpo */}
        {isAdmin && (
          <div className="flex md:hidden items-center justify-center pt-2 mt-1.5 border-t border-stone-800/80">
            <nav className="flex items-center overflow-x-auto no-scrollbar bg-stone-800/80 p-1 rounded-xl border border-stone-700 text-[11px] font-semibold gap-1 max-w-full">
              <button
                onClick={() => onSelectTab('showcase')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  currentTab === 'showcase'
                    ? 'bg-emerald-700 text-white shadow'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <Store className="w-3 h-3" />
                <span>Vitrine</span>
              </button>

              <button
                onClick={() => onSelectTab('admin')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  currentTab === 'admin'
                    ? 'bg-emerald-700 text-white shadow'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3 h-3" />
                <span>Painel</span>
              </button>

              <button
                onClick={() => onSelectTab('tags')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  currentTab === 'tags'
                    ? 'bg-emerald-700 text-white shadow'
                    : 'text-stone-300 hover:text-white'
                }`}
              >
                <QrCode className="w-3 h-3" />
                <span>Etiquetas</span>
              </button>
            </nav>
          </div>
        )}

      </div>
    </header>
  );
};
