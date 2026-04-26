// /src/context/AuthContext.js
import React, { createContext, useState, useContext, useEffect } from 'react';
import { apiLoginJogador, apiLoginMestre, getUserData, clearAuthData } from '../api/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Pode ser um jogador ou mestre
  const [userType, setUserType] = useState(null); // 'jogador' ou 'mestre'
  const [loading, setLoading] = useState(true); // Para checagem inicial

  // Na inicialização, verifica se já existe um usuário salvo no localStorage
  useEffect(() => {
    const storedUser = getUserData();
    if (storedUser && storedUser.id) {
      setUser(storedUser);
      setUserType(storedUser.userType);
    }
    setLoading(false);
  }, []);

  const login = async (nome, asRole) => {
    try {
      if (asRole === 'jogador') {
        await apiLoginJogador({ nome });
      } else if (asRole === 'mestre') {
        await apiLoginMestre({ nome });
      } else {
        throw new Error('Tipo de login inválido.');
      }

      const storedUser = getUserData();
      if (storedUser) {
        setUser(storedUser);
        setUserType(storedUser.userType);
      }

      return storedUser;
    } catch (error) {
      console.error("Falha no login:", error);
      logout();
      throw error;
    }
  };

  const logout = () => {
    clearAuthData(); // Limpa o localStorage
    setUser(null);
    setUserType(null);
  };

  // O valor do contexto inclui o usuário, seu tipo, as funções e o estado de carregamento
  const value = { user, userType, login, logout, loading };

  // Não renderiza os children até que a verificação inicial de auth seja concluída
  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
