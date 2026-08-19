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
    <div className="fixed inset-0 z-50 bg-stone-900/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200 p-6 space-y-5">
        
        {/* Botão Fechar */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-stone-400 hover:text-stone-700 rounded-full hover:bg-stone-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Ícone e Título */}
        <div className="text-center space-y-2 pt-2">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="text-xl font-bold font-serif-title text-stone-900">
            Acesso do Lojista
          </h3>
          <p className="text-xs text-stone-500 max-w-xs mx-auto">
            Digite a senha de administrador para gerenciar o catálogo, cadastrar vasos e imprimir etiquetas.
          </p>
        </div>

        {/* Formulário de Login */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
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
                className={`w-full pl-4 pr-10 py-2.5 text-sm bg-stone-50 border rounded-xl focus:outline-none focus:ring-2 font-medium transition-all ${
                  error 
                    ? 'border-rose-400 focus:ring-rose-400 bg-rose-50/50' 
                    : 'border-stone-300 focus:ring-emerald-500'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-stone-400 hover:text-stone-700 p-0.5 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-1 text-xs text-rose-600 font-semibold mt-1.5 animate-in fade-in">
                <AlertCircle className="w-3.5 h-3.5" />
                Senha incorreta. Tente novamente.
              </div>
            )}
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-3 rounded-xl shadow-md text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            Entrar no Painel da Loja
          </button>
        </form>

        <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200 text-center text-[11px] text-stone-500">
          🔑 Senha padrão inicial: <strong className="text-emerald-800 font-mono">1234</strong>
        </div>

      </div>
    </div>
  );
};
