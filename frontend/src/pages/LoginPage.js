// /src/pages/LoginPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function LoginPage() {
  const [nome, setNome] = useState('');
  const [role, setRole] = useState(null); // 'mestre' ou 'jogador'
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nome || !role) return;
    setLoading(true);
    await login(nome, role);
    setLoading(false);
    navigate(role === 'mestre' ? '/mestre' : '/jogador');
  };

  if (role) {
    return (
      <div className="login-container">
        <h2>Entrar como {role}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Seu Nome:</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Digite seu nome"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
          <button onClick={() => setRole(null)} className="btn btn-link">
            Voltar
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="login-container">
      <h1>Bem-vindo!</h1>
      <p>Como você quer entrar?</p>
      <div className="btn-group">
        <button onClick={() => setRole('mestre')} className="btn btn-primary">
          Entrar como Mestre
        </button>
        <button onClick={() => setRole('jogador')} className="btn btn-secondary">
          Entrar como Jogador
        </button>
      </div>
    </div>
  );
}

export default LoginPage;