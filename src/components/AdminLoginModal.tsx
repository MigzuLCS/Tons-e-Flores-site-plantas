import React, { useState } from 'react';
import { X, Lock, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';
import { authService } from '../services/authService';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (authService.login(password)) {
      setError(false);
      setPassword('');
      onLoginSuccess();
      onClose();
    } else {
      setError(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="relative w-full max-w-sm bg-brand-surface rounded-3xl shadow-xl overflow-hidden border border-brand-border p-6 space-y-5">
        
        {/* Botão Fechar */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-brand-text-muted hover:text-brand-text rounded-full hover:bg-brand-surface-subtle transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Ícone e Título */}
        <div className="text-center space-y-2 pt-2">
          <div className="w-12 h-12 bg-brand-olive-light text-brand-olive rounded-2xl flex items-center justify-center mx-auto shadow-xs border border-brand-olive-border">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold font-serif-title text-brand-text">
            Acesso do Lojista
          </h3>
          <p className="text-xs text-brand-text-muted max-w-xs mx-auto">
            Digite a senha de administrador para gerenciar o catálogo Tons & Flores, cadastrar vasos e imprimir etiquetas.
          </p>
        </div>

        {/* Formulário de Login */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-brand-text mb-1.5">
              Senha de Acesso
            </label>
            <div className="relative">
              <input 
                type={showPassword ? 'text' : 'password'}
                required
                autoFocus
                value={password}
                onChange={e => {
                  setPassword(e.target.value);
                  if (error) setError(false);
                }}
                placeholder="Digite a senha..."
                className={`w-full pl-4 pr-10 py-2.5 text-sm bg-brand-surface-subtle border rounded-xl focus:outline-none focus:ring-2 font-medium transition-all text-brand-text ${
                  error 
                    ? 'border-brand-nude-border focus:ring-brand-nude bg-brand-nude-light text-brand-nude-text' 
                    : 'border-brand-border focus:ring-brand-olive'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-brand-text-muted hover:text-brand-text p-0.5 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-1 text-xs text-brand-nude-text font-semibold mt-1.5 animate-in fade-in">
                <AlertCircle className="w-3.5 h-3.5" />
                Senha incorreta. Tente novamente.
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-brand-olive hover:bg-brand-olive-hover text-white font-semibold py-3 rounded-xl shadow-xs text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            Entrar no Painel da Loja
          </button>
        </form>

        <div className="bg-brand-surface-subtle p-2.5 rounded-xl border border-brand-border text-center text-[11px] text-brand-text-muted">
          🔑 Senha padrão inicial: <strong className="text-brand-olive font-mono">1234</strong>
        </div>

      </div>
    </div>
  );
};
