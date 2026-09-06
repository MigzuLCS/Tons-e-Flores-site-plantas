/**
 * Tons & Flores • Catálogo Botânico & Gestão de Plantas
 * Copyright (c) 2026 Miguel Luiz (@MigzuLCS). Todos os direitos reservados.
 * 
 * LICENÇA DE USO ACADÊMICO / ACADEMIC VIEW-ONLY LICENSE
 * Este código-fonte é disponibilizado publicamente exclusivamente para fins de consulta
 * acadêmica e avaliação técnica de portfólio. É proibida qualquer cópia, alteração,
 * distribuição, uso comercial ou derivação deste código sem autorização expressa prévia.
 * O software é fornecido "COMO ESTÁ" (AS IS), sem garantias de qualquer tipo.
 * Consulte o arquivo LICENSE na raiz do projeto para obter os termos integrais.
 */

const ADMIN_KEY = 'tonseflores_admin_session';
const PASSWORD_KEY = 'tonseflores_admin_pwd';

const getInitialPassword = (): string => {
  const envPassword = (import.meta.env.VITE_ADMIN_PASSWORD as string | undefined)?.trim();
  return envPassword || 'admin';
};

export const authService = {
  isAuthenticated(): boolean {
    return (
      sessionStorage.getItem(ADMIN_KEY) === 'true' ||
      localStorage.getItem(ADMIN_KEY) === 'true'
    );
  },

  login(password: string): boolean {
    const savedPassword = localStorage.getItem(PASSWORD_KEY) || getInitialPassword();
    if (password === savedPassword) {
      sessionStorage.setItem(ADMIN_KEY, 'true');
      localStorage.setItem(ADMIN_KEY, 'true');
      return true;
    }
    return false;
  },

  logout(): void {
    sessionStorage.removeItem(ADMIN_KEY);
    localStorage.removeItem(ADMIN_KEY);
  },

  changePassword(currentPass: string, newPass: string): boolean {
    const savedPassword = localStorage.getItem(PASSWORD_KEY) || getInitialPassword();
    if (currentPass === savedPassword && newPass.length >= 4) {
      localStorage.setItem(PASSWORD_KEY, newPass);
      return true;
    }
    return false;
  },

  hasCustomPassword(): boolean {
    return localStorage.getItem(PASSWORD_KEY) !== null;
  }
};
