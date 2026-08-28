import React, { useState, useEffect, useRef } from 'react';
import { Flower2, Store, LayoutGrid, QrCode, Plus, Lock, LogOut, Sun, Moon, Menu, X, ChevronRight } from 'lucide-react';
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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
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

  // Previne scroll de fundo quando o menu lateral estiver aberto
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  const handleNavigate = (tab: AppTab) => {
    onSelectTab(tab);
    setIsDrawerOpen(false);
  };

  return (
    <>
      <header
        className={`no-print bg-[#181514]/95 backdrop-blur-md text-stone-100 sticky top-0 z-40 shadow-sm border-b border-[#2C2623] transition-transform duration-300 ease-in-out ${
          isVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3.5">
          {/* Linha Principal: Logo e Menu Lateral colados na esquerda */}
          <div className="flex items-center justify-between gap-2 sm:gap-4">
            
            {/* LADO ESQUERDO: Botão Hambúrguer + Logo e Nome da Loja colados lado a lado */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              
              {/* Botão de Menu Lateral (Mobile & Tablet) */}
              <button
                onClick={() => setIsDrawerOpen(true)}
                aria-label="Abrir menu de navegação"
                title="Abrir menu"
                className="lg:hidden bg-[#221E1C] hover:bg-[#2C2522] text-stone-200 hover:text-white p-2 rounded-xl border border-[#2F2926] shadow-xs transition-colors cursor-pointer flex items-center justify-center shrink-0"
              >
                <Menu className="w-5 h-5 text-stone-200" />
              </button>

              {/* Logo & Nome da Loja */}
              <div 
                onClick={() => handleNavigate('showcase')}
                className="flex items-center space-x-2 sm:space-x-2.5 cursor-pointer group shrink-0"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-[#24201D] group-hover:bg-[#A3B596] group-hover:text-[#181514] rounded-xl sm:rounded-2xl flex items-center justify-center text-[#A3B596] border border-[#3A332F] shadow-xs transition-all shrink-0">
                  <Flower2 className="w-4 h-4 sm:w-6 sm:h-6 transition-colors" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="font-bold text-sm sm:text-lg leading-tight tracking-tight font-serif-title text-stone-100 group-hover:text-[#A3B596] transition-colors">
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
            </div>

            {/* Abas de Navegação no Desktop (quando for Admin) */}
            {isAdmin && (
              <nav className="hidden lg:flex items-center bg-[#221E1C] p-1 rounded-2xl border border-[#2F2926] text-xs font-semibold gap-1">
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

            {/* AÇÕES DA DIREITA: Alternador de tema + botões desktop */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Botão Alternador de Tema Claro / Escuro */}
              <button
                onClick={handleToggleTheme}
                title={theme === 'dark' ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
                aria-label="Alternar tema"
                className="bg-[#221E1C] hover:bg-[#2C2522] text-stone-300 hover:text-white p-2 sm:p-2.5 rounded-xl border border-[#2F2926] shadow-xs transition-all cursor-pointer flex items-center justify-center"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-300 animate-in spin-in-45 duration-300" />
                ) : (
                  <Moon className="w-4 h-4 text-stone-300 hover:text-[#A3B596] animate-in -spin-in-45 duration-300" />
                )}
              </button>

              {/* Botões visíveis no Desktop */}
              {isAdmin ? (
                <div className="hidden lg:flex items-center gap-2">
                  <button
                    onClick={onOpenAddModal}
                    className="bg-brand-nude hover:bg-brand-nude-hover text-white font-semibold text-xs px-3.5 py-2 rounded-xl shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Nova Planta</span>
                  </button>

                  <button
                    onClick={onLogout}
                    title="Sair do modo administrador"
                    className="bg-[#221E1C] hover:bg-[#2C2522] text-stone-400 hover:text-stone-200 px-3 py-2 rounded-xl border border-[#2F2926] text-xs transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sair</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={onOpenLoginModal}
                  className="hidden lg:flex bg-[#221E1C] hover:bg-[#2C2522] text-stone-200 hover:text-white text-xs font-semibold px-3.5 py-2 rounded-xl border border-[#2F2926] shadow-xs items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-[#A3B596]" />
                  <span>Área do Lojista</span>
                </button>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* ======================================================== */}
      {/* MENU LATERAL EXPANSIVO (DRAWER MOBILE & TABLET)         */}
      {/* ======================================================== */}
      <div 
        className={`lg:hidden fixed inset-0 z-50 transition-all duration-300 ${
          isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Overlay escuro */}
        <div 
          onClick={() => setIsDrawerOpen(false)}
          className="absolute inset-0 bg-black/75 backdrop-blur-xs transition-opacity duration-300"
        />

        {/* Painel lateral deslizante da esquerda */}
        <div 
          className={`absolute left-0 top-0 bottom-0 w-[280px] max-w-[85vw] bg-[#1A1615] text-stone-100 border-r border-[#2F2926] shadow-2xl flex flex-col justify-between p-5 transition-transform duration-300 ease-out z-10 ${
            isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {/* Topo do Drawer */}
          <div className="space-y-4">
            
            {/* Cabeçalho do Drawer com Logo e Fechar */}
            <div className="flex items-center justify-between pb-3.5 border-b border-[#2D2623]">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#24201D] text-[#A3B596] border border-[#3A332F] flex items-center justify-center shadow-xs">
                  <Flower2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="font-bold text-sm text-stone-100 font-serif-title leading-tight">Tons & Flores</h2>
                  <p className="text-[10px] text-stone-400">Menu Principal</p>
                </div>
              </div>

              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="w-8 h-8 rounded-xl bg-[#251F1D] text-stone-400 hover:text-stone-100 hover:bg-[#2F2825] flex items-center justify-center transition-colors cursor-pointer border border-[#332A26]"
                title="Fechar menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Badge de Identificação de Perfil */}
            <div className="px-3 py-2 bg-[#221D1A] rounded-xl border border-[#2E2724] text-xs flex items-center justify-between">
              <span className="text-stone-400">Acesso:</span>
              <span className={`font-bold flex items-center gap-1.5 ${isAdmin ? 'text-emerald-400' : 'text-[#A3B596]'}`}>
                <span className={`w-2 h-2 rounded-full ${isAdmin ? 'bg-emerald-400 animate-pulse' : 'bg-[#A3B596]'}`}></span>
                {isAdmin ? 'Administrador' : 'Visitante'}
              </span>
            </div>

            {/* ITENS DE NAVEGAÇÃO SUPERIORES */}
            <nav className="space-y-1.5 pt-1">
              {/* Opção Vitrine (Para todos) */}
              <button
                onClick={() => handleNavigate('showcase')}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  currentTab === 'showcase'
                    ? 'bg-[#A3B596] text-[#181514] font-bold shadow-xs'
                    : 'bg-[#221D1A] text-stone-200 hover:bg-[#2C2522] border border-[#2E2724]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Store className="w-4 h-4" />
                  <span>Vitrine</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 opacity-60" />
              </button>

              {/* Opções exclusivas do Admin no Drawer */}
              {isAdmin && (
                <>
                  <button
                    onClick={() => handleNavigate('admin')}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      currentTab === 'admin'
                        ? 'bg-[#A3B596] text-[#181514] font-bold shadow-xs'
                        : 'bg-[#221D1A] text-stone-200 hover:bg-[#2C2522] border border-[#2E2724]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <LayoutGrid className="w-4 h-4" />
                      <span>Painel lojista</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </button>

                  <button
                    onClick={() => handleNavigate('tags')}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      currentTab === 'tags'
                        ? 'bg-[#A3B596] text-[#181514] font-bold shadow-xs'
                        : 'bg-[#221D1A] text-stone-200 hover:bg-[#2C2522] border border-[#2E2724]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <QrCode className="w-4 h-4" />
                      <span>Etiquetas</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </button>

                  <button
                    onClick={() => {
                      setIsDrawerOpen(false);
                      onOpenAddModal();
                    }}
                    className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-bold bg-brand-nude hover:bg-brand-nude-hover text-white shadow-xs transition-colors cursor-pointer mt-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Nova Planta</span>
                  </button>
                </>
              )}
            </nav>
          </div>

          {/* BASE / RODAPÉ DO DRAWER */}
          <div className="pt-4 border-t border-[#2D2623] space-y-2">
            {isAdmin ? (
              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-red-950/40 hover:bg-red-900/50 text-red-300 hover:text-red-200 border border-red-900/40 text-xs font-bold transition-all cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sair da Conta</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  onOpenLoginModal();
                }}
                className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#221D1A] hover:bg-[#2C2522] text-stone-200 hover:text-white border border-[#2E2724] text-xs font-semibold transition-all cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-[#A3B596]" />
                <span>Acesso lojista</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

