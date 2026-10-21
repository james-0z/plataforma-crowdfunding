import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface User {
  id: number;
  nombre: string;
  email: string;
  rol: 'user' | 'admin';
}

export const useAuthStore = defineStore('auth', () => {
  // Estado inicial recuperado del almacenamiento local
  const token = ref<string | null>(localStorage.getItem('jwt_token'));
  const user = ref<User | null>(
    localStorage.getItem('auth_user') 
      ? JSON.parse(localStorage.getItem('auth_user') as string) 
      : null
  );

  const isAuthenticated = computed(() => !!token.value);

  const setAuth = (newToken: string, newUser: User) => {
    token.value = newToken;
    user.value = newUser;
    localStorage.setItem('jwt_token', newToken);
    localStorage.setItem('auth_user', JSON.stringify(newUser));
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    // Simulación de autenticación (posteriormente se reemplazará por llamada HTTP)
    if (email && password) {
      const mockUser: User = {
        id: 1,
        nombre: 'James Ordoñez',
        email: email,
        rol: 'user'
      };
      const mockToken = 'mocked_jwt_token_123456';
      setAuth(mockToken, mockUser);
      return true;
    }
    return false;
  };

  const logout = () => {
    token.value = null;
    user.value = null;
    localStorage.removeItem('jwt_token');
    localStorage.removeItem('auth_user');
  };

  return {
    token,
    user,
    isAuthenticated,
    login,
    logout,
    setAuth
  };
});