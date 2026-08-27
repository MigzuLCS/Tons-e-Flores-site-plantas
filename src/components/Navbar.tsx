import React, { useState, useEffect, useRef } from 'react';
import { Flower2, Store, LayoutGrid, QrCode, Plus, Lock, LogOut, Sun, Moon } from 'lucide-react';
import { themeService, type Theme } from '../services/configService';

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
  const lastScrollY = useRef(0);
  const [theme, setTheme] = useState<Theme>(() => themeService.initTheme());

  const handleToggleTheme = () => {
    const nextTheme = themeService.toggleTheme();
    setTheme(nextTheme);
  };

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          const prevScrollY = lastScrollY.current;

          // Se estiver bem no topo da página, sempre mostra
          if (currentScrollY < 30) {
            setIsVisible(true);
          } else if (currentScrollY > prevScrollY && currentScrollY > 80) {
            // Scrollando para baixo -> esconde o header
            setIsVisible(false);
          } else if (currentScrollY < prevScrollY) {
            // Scrollando para cima -> mostra o header novamente
            setIsVisible(true);
          }

          lastScrollY.current = currentScrollY;
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`no-print bg-[#181514]/95 backdrop-blur-md text-stone-100 sticky top-0 z-40 shadow-sm border-b border-[#2C2623] transition-transform duration-300 ease-in-out ${
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
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-[#24201D] group-hover:bg-[#A3B596] group-hover:text-[#181514] rounded-xl sm:rounded-2xl flex items-center justify-center text-[#A3B596] border border-[#3A332F] shadow-xs transition-all shrink-0">
              <Flower2 className="w-5 h-5 sm:w-6 sm:h-6 transition-colors" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="font-bold text-base sm:text-lg leading-tight tracking-tight font-serif-title text-stone-100 group-hover:text-[#A3B596] transition-colors">
                  Tons & Flores
                </span>
                <span className="text-[10px] bg-[#27211E] text-[#B8CBB0] border border-[#3C332E] px-1.5 sm:px-2 py-0.5 rounded-full font-bold">
                  {plantCount}
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-stone-400 font-medium hidden xs:block tracking-wide">
                Boutique & Catálogo Digital
              </p>
            </div>
          </div>

          {/* Abas de Navegação no Desktop (ou se for Admin no desktop) */}
          {isAdmin && (
            <nav className="hidden md:flex items-center bg-[#221E1C] p-1 rounded-2xl border border-[#2F2926] text-xs font-semibold gap-1">
              <button
                onClick={() => onSelectTab('showcase')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  currentTab === 'showcase'
                    ? 'bg-brand-olive text-white shadow-xs font-bold'
                    : 'text-stone-400 hover:text-stone-100 hover:bg-[#2C2522]'
                }`}
              >
                <Store className="w-3.5 h-3.5" />
                <span>Vitrine</span>
              </button>

              <button
                onClick={() => onSelectTab('admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  currentTab === 'admin'
                    ? 'bg-brand-olive text-white shadow-xs font-bold'
                    : 'text-stone-400 hover:text-stone-100 hover:bg-[#2C2522]'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Painel da Loja</span>
              </button>

              <button
                onClick={() => onSelectTab('tags')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                  currentTab === 'tags'
                    ? 'bg-brand-olive text-white shadow-xs font-bold'
                    : 'text-stone-400 hover:text-stone-100 hover:bg-[#2C2522]'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Etiquetas</span>
              </button>
            </nav>
          )}

          {/* Ações da Direita: Na mesma linha horizontal no mobile */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Botão Alternador de Tema Claro / Escuro */}
            <button
              onClick={handleToggleTheme}
              title={theme === 'dark' ? 'Mudar para Modo Claro (Oliva Suave)' : 'Mudar para Modo Escuro (Café & Terracota)'}
              aria-label="Alternar tema"
              className="bg-[#221E1C] hover:bg-[#2C2522] text-stone-300 hover:text-white p-2 sm:p-2.5 rounded-xl border border-[#2F2926] shadow-xs transition-all cursor-pointer flex items-center justify-center"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-300 animate-in spin-in-45 duration-300" />
              ) : (
                <Moon className="w-4 h-4 text-stone-300 hover:text-[#A3B596] animate-in -spin-in-45 duration-300" />
              )}
            </button>

            {isAdmin ? (
              <>
                <button
                  onClick={onOpenAddModal}
                  className="bg-brand-nude hover:bg-brand-nude-hover text-white font-semibold text-xs px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl shadow-xs flex items-center gap-1 sm:gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="text-[11px] sm:text-xs">Nova Planta</span>
                </button>

                <button
                  onClick={onLogout}
                  title="Sair do modo administrador"
                  className="bg-[#221E1C] hover:bg-[#2C2522] text-stone-400 hover:text-stone-200 p-1.5 sm:p-2 rounded-xl border border-[#2F2926] text-xs transition-colors cursor-pointer flex items-center gap-1"
                >
                  <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Sair</span>
                </button>
              </>
            ) : (
              <button
                onClick={onOpenLoginModal}
                className="bg-[#221E1C] hover:bg-[#2C2522] text-stone-200 hover:text-white text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl border border-[#2F2926] shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#A3B596]" />
                <span>Área do Lojista</span>
              </button>
            )}
          </div>

        </div>

        {/* Linha 2 apenas quando o Admin estiver ativo no mobile: Abas em scroll horizontal limpo */}
        {isAdmin && (
          <div className="flex md:hidden items-center justify-center pt-2 mt-1.5 border-t border-[#2C2623]">
            <nav className="flex items-center overflow-x-auto no-scrollbar bg-[#221E1C] p-1 rounded-xl border border-[#2F2926] text-[11px] font-semibold gap-1 max-w-full">
              <button
                onClick={() => onSelectTab('showcase')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  currentTab === 'showcase'
                    ? 'bg-brand-olive text-white shadow-xs font-bold'
                    : 'text-stone-400 hover:text-stone-100'
                }`}
              >
                <Store className="w-3 h-3" />
                <span>Vitrine</span>
              </button>

              <button
                onClick={() => onSelectTab('admin')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  currentTab === 'admin'
                    ? 'bg-brand-olive text-white shadow-xs font-bold'
                    : 'text-stone-400 hover:text-stone-100'
                }`}
              >
                <LayoutGrid className="w-3 h-3" />
                <span>Painel</span>
              </button>

              <button
                onClick={() => onSelectTab('tags')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                  currentTab === 'tags'
                    ? 'bg-brand-olive text-white shadow-xs font-bold'
                    : 'text-stone-400 hover:text-stone-100'
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
