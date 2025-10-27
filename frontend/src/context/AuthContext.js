// /src/context/AuthContext.js
import React, { createContext, useState, useContext } from 'react';
import { apiLogin } from '../api/mockApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [jogador, setJogador] = useState(null); // O 'Jogador' logado
  const [role, setRole] = useState(null); // 'mestre' ou 'jogador'

  const login = async (nome, asRole) => {
    const jogadorLogado = await apiLogin(nome);
    setJogador(jogadorLogado);
    setRole(asRole);
    // Em um app real, você salvaria isso no localStorage
  };

  const logout = () => {
    setJogador(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ jogador, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);   