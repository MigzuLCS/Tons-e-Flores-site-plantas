import React, { useState, useEffect, useRef } from 'react';
import { Store, LayoutGrid, QrCode, Plus, Lock, LogOut, Sun, Moon, Menu, X, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { LogoIcon } from './LogoIcon';
import { themeService, type Theme } from '../services/configService';

export type AppTab = 'showcase' | 'manage' | 'admin' | 'tags';

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

  // Touch swipe gestures ultra-suaves para abrir e fechar o menu lateral no mobile
  const [dragProgress, setDragProgress] = useState<number | null>(null); // 0 a 1 (arrasto em tempo real)
  const isDraggingRef = useRef(false);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const isDrawerOpenRef = useRef(isDrawerOpen);
  isDrawerOpenRef.current = isDrawerOpen;

  const DRAWER_WIDTH = 280;

  useEffect(() => {
    isDrawerOpenRef.current = isDrawerOpen;
  }, [isDrawerOpen]);

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      if (window.innerWidth >= 1024) return;
      const touch = e.touches[0];
      const target = e.target as HTMLElement | null;

      // Se tocar diretamente em campos de texto/input, ignora para não atrapalhar digitação
      if (target?.closest('input, textarea, select')) {
        touchStartRef.current = null;
        return;
      }

      const clientX = touch.clientX;
      const clientY = touch.clientY;

      if (!isDrawerOpenRef.current) {
        // Se fechado: aceita toque até 80px da borda ou 25% da largura da tela, ou no trigger invisível
        const maxStartEdge = Math.max(80, window.innerWidth * 0.25);
        if (clientX <= maxStartEdge || target?.closest('.drawer-edge-trigger')) {
          touchStartRef.current = { x: clientX, y: clientY, time: Date.now() };
          isDraggingRef.current = false;
        } else {
          touchStartRef.current = null;
        }
      } else {
        // Se aberto: aceita toque em qualquer ponto para arrastar para a esquerda e fechar
        touchStartRef.current = { x: clientX, y: clientY, time: Date.now() };
        isDraggingRef.current = false;
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartRef.current) return;
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaY = touch.clientY - touchStartRef.current.y;

      // Identifica intenção de gesto horizontal
      if (!isDraggingRef.current) {
        // Para abrir: movimento positivo (direita). Para fechar: movimento negativo (esquerda).
        const isDirectionValid = !isDrawerOpenRef.current ? deltaX > 4 : deltaX < -4;

        if (isDirectionValid && Math.abs(deltaX) > Math.abs(deltaY) * 0.75) {
          isDraggingRef.current = true;
        } else if (Math.abs(deltaY) > 28 && Math.abs(deltaY) > Math.abs(deltaX) * 1.5) {
          // Scroll vertical intencional -> cancela arrasto do menu
          touchStartRef.current = null;
          setDragProgress(null);
          return;
        }
      }

      if (isDraggingRef.current) {
        // Trava o scroll vertical nativo enquanto estiver arrastando o menu horizontalmente
        if (e.cancelable) {
          e.preventDefault();
        }

        if (!isDrawerOpenRef.current) {
          // Deslizando para a direita (abrindo)
          const progress = Math.min(Math.max(0, deltaX / DRAWER_WIDTH), 1);
          setDragProgress(progress);
        } else {
          // Deslizando para a esquerda (fechando)
          const progress = Math.min(Math.max(0, 1 + deltaX / DRAWER_WIDTH), 1);
          setDragProgress(progress);
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      if (!touchStartRef.current) {
        setDragProgress(null);
        isDraggingRef.current = false;
        return;
      }

      const touch = e.changedTouches[0];
      const deltaX = touch.clientX - touchStartRef.current.x;
      const deltaTime = Date.now() - touchStartRef.current.time;
      const velocity = deltaX / (deltaTime || 1);

      if (isDraggingRef.current || Math.abs(deltaX) > 20) {
        if (!isDrawerOpenRef.current) {
          // Abrir: se arrastou > 18% da largura ou deu um flick rápido para a direita
          if (deltaX > DRAWER_WIDTH * 0.18 || velocity > 0.22) {
            setIsDrawerOpen(true);
          } else {
            setIsDrawerOpen(false);
          }
        } else {
          // Fechar: se arrastou > 18% para a esquerda ou deu flick rápido para esquerda
          if (deltaX < -DRAWER_WIDTH * 0.18 || velocity < -0.22) {
            setIsDrawerOpen(false);
          } else {
            setIsDrawerOpen(true);
          }
        }
      }

      touchStartRef.current = null;
      isDraggingRef.current = false;
      setDragProgress(null);
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('touchcancel', handleTouchEnd, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('touchcancel', handleTouchEnd);
    };
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

  const currentPercent = dragProgress !== null ? dragProgress : (isDrawerOpen ? 1 : 0);
  const translateX = -100 + (currentPercent * 100);
  const backdropOpacity = currentPercent * 0.75;
  const isVisibleOrDragging = isDrawerOpen || (dragProgress !== null && dragProgress > 0);

  return (
    <>
      <header
        className={`no-print bg-brand-surface/95 backdrop-blur-md text-brand-text sticky top-0 z-40 shadow-xs border-b border-brand-border transition-transform duration-300 ease-in-out ${
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
                className="lg:hidden bg-brand-surface-subtle hover:bg-brand-border-subtle text-brand-text p-2 rounded-xl border border-brand-border shadow-xs transition-colors cursor-pointer flex items-center justify-center shrink-0"
              >
                <Menu className="w-5 h-5 text-brand-text" />
              </button>

              {/* Logo & Nome da Loja */}
              <div 
                onClick={() => handleNavigate('showcase')}
                className="flex items-center space-x-2 sm:space-x-2.5 cursor-pointer group shrink-0"
              >
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-brand-surface-subtle group-hover:bg-brand-border-subtle rounded-xl sm:rounded-2xl flex items-center justify-center text-brand-olive border border-brand-border shadow-xs transition-all shrink-0">
                  <LogoIcon className="w-5 h-5 sm:w-6 sm:h-6 transition-transform group-hover:scale-105" leafColor="var(--color-brand-olive)" flowerColor="var(--color-brand-nude)" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <span className="font-bold text-sm sm:text-lg leading-tight tracking-tight font-serif-title text-brand-text group-hover:text-brand-olive transition-colors">
                      Tons & Flores
                    </span>
                    <span className="text-[10px] bg-brand-olive-light text-brand-olive-text border border-brand-olive-border px-1.5 sm:px-2 py-0.5 rounded-full font-bold">
                      {plantCount}
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-brand-text-muted font-medium hidden xs:block tracking-wide">
                    Boutique & Catálogo Digital
                  </p>
                </div>
              </div>
            </div>

            {/* Abas de Navegação no Desktop (quando for Admin) */}
            {isAdmin && (
              <nav className="hidden lg:flex items-center bg-brand-surface-subtle p-1 rounded-2xl border border-brand-border text-xs font-semibold gap-1">
                <button
                  onClick={() => onSelectTab('showcase')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    currentTab === 'showcase'
                      ? 'bg-brand-olive text-white shadow-xs font-bold'
                      : 'text-brand-text-muted hover:text-brand-text hover:bg-brand-surface'
                  }`}
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Vitrine</span>
                </button>

                <button
                  onClick={() => onSelectTab('manage')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    currentTab === 'manage'
                      ? 'bg-brand-olive text-white shadow-xs font-bold'
                      : 'text-brand-text-muted hover:text-brand-text hover:bg-brand-surface'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Manejo Rápido</span>
                </button>

                <button
                  onClick={() => onSelectTab('admin')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                    currentTab === 'admin'
                      ? 'bg-brand-olive text-white shadow-xs font-bold'
                      : 'text-brand-text-muted hover:text-brand-text hover:bg-brand-surface'
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
                      : 'text-brand-text-muted hover:text-brand-text hover:bg-brand-surface'
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
                className="bg-brand-surface-subtle hover:bg-brand-border-subtle text-brand-text-muted hover:text-brand-text p-2 sm:p-2.5 rounded-xl border border-brand-border shadow-xs transition-all cursor-pointer flex items-center justify-center"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-300 animate-in spin-in-45 duration-300" />
                ) : (
                  <Moon className="w-4 h-4 text-brand-text-muted hover:text-brand-olive animate-in -spin-in-45 duration-300" />
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
                    className="bg-brand-surface-subtle hover:bg-brand-border-subtle text-brand-text-muted hover:text-brand-text px-3 py-2 rounded-xl border border-brand-border text-xs transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sair</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={onOpenLoginModal}
                  className="hidden lg:flex bg-brand-surface-subtle hover:bg-brand-border-subtle text-brand-text text-xs font-semibold px-3.5 py-2 rounded-xl border border-brand-border shadow-xs items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Lock className="w-3.5 h-3.5 text-brand-olive" />
                  <span>Área do Lojista</span>
                </button>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* Gatilho invisível de borda na esquerda para captura de swipe ultra-fácil */}
      {!isDrawerOpen && (
        <div 
          className="drawer-edge-trigger lg:hidden fixed left-0 top-0 bottom-0 w-8 z-30 touch-pan-y pointer-events-auto"
          aria-hidden="true"
        />
      )}

      {/* ======================================================== */}
      {/* MENU LATERAL EXPANSIVO (DRAWER MOBILE & TABLET)         */}
      {/* ======================================================== */}
      <div 
        className={`lg:hidden fixed inset-0 z-50 ${
          isVisibleOrDragging ? 'pointer-events-auto' : 'pointer-events-none'
        }`}
      >
        {/* Overlay escuro dinâmico */}
        <div 
          onClick={() => setIsDrawerOpen(false)}
          style={{
            opacity: backdropOpacity,
            transition: dragProgress !== null ? 'none' : 'opacity 280ms cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          className="absolute inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Painel lateral deslizante da esquerda com física fluida */}
        <div 
          style={{
            transform: `translateX(${translateX}%)`,
            transition: dragProgress !== null ? 'none' : 'transform 280ms cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          className="absolute left-0 top-0 bottom-0 w-[280px] max-w-[85vw] bg-brand-surface text-brand-text border-r border-brand-border shadow-2xl flex flex-col justify-between p-5 z-10 will-change-transform transform-gpu"
        >
          {/* Topo do Drawer */}
          <div className="space-y-4">
            
            {/* Cabeçalho do Drawer com Logo e Fechar */}
            <div className="flex items-center justify-between pb-3.5 border-b border-brand-border">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-brand-surface-subtle text-brand-olive border border-brand-border flex items-center justify-center shadow-xs">
                  <LogoIcon className="w-4 h-4" leafColor="var(--color-brand-olive)" flowerColor="var(--color-brand-nude)" />
                </div>
                <div>
                  <h2 className="font-bold text-sm text-brand-text font-serif-title leading-tight">Tons & Flores</h2>
                  <p className="text-[10px] text-brand-text-muted">Menu Principal</p>
                </div>
              </div>

              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="w-8 h-8 rounded-xl bg-brand-surface-subtle text-brand-text-muted hover:text-brand-text hover:bg-brand-border-subtle flex items-center justify-center transition-colors cursor-pointer border border-brand-border"
                title="Fechar menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Badge de Identificação de Perfil */}
            <div className="px-3 py-2 bg-brand-surface-subtle rounded-xl border border-brand-border text-xs flex items-center justify-between">
              <span className="text-brand-text-muted">Acesso:</span>
              <span className="font-bold flex items-center gap-1.5 text-brand-olive">
                <span className="w-2 h-2 rounded-full bg-brand-olive animate-pulse"></span>
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
                    ? 'bg-brand-olive text-white font-bold shadow-xs'
                    : 'bg-brand-surface-subtle text-brand-text hover:bg-brand-border-subtle border border-brand-border'
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
                    onClick={() => handleNavigate('manage')}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      currentTab === 'manage'
                        ? 'bg-brand-olive text-white font-bold shadow-xs'
                        : 'bg-brand-surface-subtle text-brand-text hover:bg-brand-border-subtle border border-brand-border'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <SlidersHorizontal className="w-4 h-4" />
                      <span>Manejo Rápido (Loja)</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </button>

                  <button
                    onClick={() => handleNavigate('admin')}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      currentTab === 'admin'
                        ? 'bg-brand-olive text-white font-bold shadow-xs'
                        : 'bg-brand-surface-subtle text-brand-text hover:bg-brand-border-subtle border border-brand-border'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <LayoutGrid className="w-4 h-4" />
                      <span>Painel Completo</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </button>

                  <button
                    onClick={() => handleNavigate('tags')}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      currentTab === 'tags'
                        ? 'bg-brand-olive text-white font-bold shadow-xs'
                        : 'bg-brand-surface-subtle text-brand-text hover:bg-brand-border-subtle border border-brand-border'
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
                    <span>Nova Planta</span>
                  </button>
                </>
              )}
            </nav>
          </div>

          {/* BASE / RODAPÉ DO DRAWER */}
          <div className="pt-4 border-t border-brand-border space-y-2">
            {isAdmin ? (
              <button
                onClick={() => {
                  setIsDrawerOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-brand-nude-light hover:bg-brand-nude-border/40 text-brand-nude-text border border-brand-nude-border text-xs font-bold transition-all cursor-pointer"
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
                className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-brand-surface-subtle hover:bg-brand-border-subtle text-brand-text border border-brand-border text-xs font-semibold transition-all cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-brand-olive" />
                <span>Acesso lojista</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

