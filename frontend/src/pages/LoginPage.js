import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/LoginPage.css";


export default function LoginPage() {
  const { handleLogin } = useAuth();
  const [nome, setNome] = useState("");
  const [role, setRole] = useState("jogador"); // jogador ou mestre
  const [isCadastro, setIsCadastro] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nome.trim()) return alert("Digite um nome");
    setLoading(true);
    try {
      await handleLogin(nome, role, isCadastro);
      navigate(role === "mestre" ? "/mestre" : "/jogador");
    } catch (err) {
      alert("Erro ao autenticar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h1>Gerenciador de Fichas RPG</h1>
      <form onSubmit={handleSubmit} className="card-light">
        <label>Nome:</label>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Digite seu nome"
        />

        <label>Entrar como:</label>
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="jogador">Jogador</option>
          <option value="mestre">Mestre</option>
        </select>

        <div className="btn-group">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {isCadastro ? "Cadastrar" : "Entrar"}
          </button>
          <button
            type="button"
            className="btn btn-link"
            onClick={() => setIsCadastro(!isCadastro)}
          >
            {isCadastro ? "Já tenho conta" : "Criar nova conta"}
          </button>
        </div>
      </form>
    </div>
  );
}
