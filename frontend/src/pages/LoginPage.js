// /src/pages/LoginPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiCadastroJogador, apiCadastroMestre } from '../api/api';

function LoginPage() {
  const [nome, setNome] = useState('');
  const [role, setRole] = useState(null); // 'mestre' ou 'jogador'
  const [isSigningUp, setIsSigningUp] = useState(false); // Para alternar entre login e cadastro
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!nome || !role) return;
    setLoading(true);
    try {
      const user = await login(nome, role);
      if (user?.id) {
        navigate(user.userType === 'mestre' ? '/mestre' : '/jogador');
      } else {
        throw new Error('Não foi possível verificar os dados de login.');
      }
    } catch (error) {
      alert(`Falha no login: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!nome || !role) return;
    setLoading(true);
    try {
      const apiCall = role === 'jogador' ? apiCadastroJogador : apiCadastroMestre;
      await apiCall({ nome });
      alert(`Usuário '${nome}' cadastrado com sucesso como ${role}! Agora você pode fazer o login.`);
      setIsSigningUp(false);
      setNome('');
    } catch (error) {
      alert(`Falha no cadastro: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (role) {
    const formTitle = isSigningUp ? `Cadastrar como ${role}` : `Entrar como ${role}`;
    const buttonText = isSigningUp ? 'Cadastrar' : 'Entrar';
    const handleSubmit = isSigningUp ? handleSignup : handleLogin;

    return (
      <div className="login-container">
        <h2>{formTitle}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nome de usuário:</label>
            <input
              type="text"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              placeholder="Digite seu nome"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? (isSigningUp ? 'Cadastrando...' : 'Entrando...') : buttonText}
          </button>
          <button type="button" onClick={() => setRole(null)} className="btn btn-link">
            Voltar
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="login-container">
      <h1>Bem-vindo ao Gerenciador de Fichas de RPG</h1>
      
      {!isSigningUp ? (
        <>
          <p className="text-muted">Como você quer entrar?</p>
          <div className="btn-group">
            <button onClick={() => setRole('mestre')} className="btn btn-primary">
              Entrar como Mestre
            </button>
            <button onClick={() => setRole('jogador')} className="btn btn-secondary">
              Entrar como Jogador
            </button>
          </div>
          <hr />
          <p className="text-muted">Não tem uma conta?</p>
          <button onClick={() => setIsSigningUp(true)} className="btn btn-link">
            Cadastre-se aqui
          </button>
        </>
      ) : (
        <>
          <p className="text-muted">Como você quer se cadastrar?</p>
          <div className="btn-group">
            <button onClick={() => setRole('mestre')} className="btn btn-primary">
              Cadastrar como Mestre
            </button>
            <button onClick={() => setRole('jogador')} className="btn btn-secondary">
              Cadastrar como Jogador
            </button>
          </div>
          <hr />
          <p className="text-muted">Já tem uma conta?</p>
          <button onClick={() => setIsSigningUp(false)} className="btn btn-link">
            Faça o login
          </button>
        </>
      )}
    </div>
  );
}

export default LoginPage;
