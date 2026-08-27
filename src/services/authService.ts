const ADMIN_KEY = 'tonseflores_admin_session';
const PASSWORD_KEY = 'tonseflores_admin_pwd';

const getInitialPassword = (): string => {
  const envPassword = (import.meta.env.VITE_ADMIN_PASSWORD as string | undefined)?.trim();
  return envPassword || 'admin';
};

export const authService = {
  isAuthenticated(): boolean {
    return sessionStorage.getItem(ADMIN_KEY) === 'true';
  },

  login(password: string): boolean {
    const savedPassword = localStorage.getItem(PASSWORD_KEY) || getInitialPassword();
    if (password === savedPassword) {
      sessionStorage.setItem(ADMIN_KEY, 'true');
      return true;
    }
    return false;
  },

  logout(): void {
    sessionStorage.removeItem(ADMIN_KEY);
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
