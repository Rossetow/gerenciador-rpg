import React, { createContext, useContext, useState, useEffect } from "react";
import {
  loginJogador,
  loginMestre,
  cadastroJogador,
  cadastroMestre,
} from "../api/api";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [jogador, setJogador] = useState(null);
  const [role, setRole] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("auth");
    if (saved) {
      const { jogador, role } = JSON.parse(saved);
      setJogador(jogador);
      setRole(role);
    }
  }, []);

  const saveAuth = (user, tipo) => {
    localStorage.setItem("auth", JSON.stringify({ jogador: user, role: tipo }));
  };

  const handleLogin = async (nome, tipo, isCadastro = false) => {
    let user;
    if (tipo === "jogador") {
      user = isCadastro ? await cadastroJogador(nome) : await loginJogador(nome);
    } else {
      user = isCadastro ? await cadastroMestre(nome) : await loginMestre(nome);
    }
    setJogador(user);
    setRole(tipo);
    saveAuth(user, tipo);
  };

  const handleLogout = () => {
    setJogador(null);
    setRole(null);
    localStorage.removeItem("auth");
  };

  return (
    <AuthContext.Provider value={{ jogador, role, handleLogin, handleLogout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
