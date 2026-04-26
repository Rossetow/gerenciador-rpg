import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiGetCampanhasByMestre, apiCreateCampanha } from '../api/api';
import { useAuth } from '../context/AuthContext';

// Componente para o formulário de criação de campanha
function CampanhaForm({ onCampanhaCriada }) {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth(); // O usuário logado (mestre)

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nome.trim()) {
      alert('O nome da campanha é obrigatório.');
      return;
    }
    setLoading(true);
    try {
      // O backend espera 'mestre_id' no corpo da requisição
      const novaCampanha = {
        nome: nome.trim(),
        mestre_id: String(user.id),
        descricao: descricao || ''
      };
      const campanhaCriada = await apiCreateCampanha(novaCampanha);
      onCampanhaCriada(campanhaCriada); // Adiciona a nova campanha à lista
      // Limpa o formulário
      setNome('');
      setDescricao('');
    } catch (error) {
      alert(`Erro ao criar campanha: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <h3>Criar Nova Campanha</h3>
      <div className="form-group">
        <label>Nome da Campanha</label>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex: A Saga do Anel Perdido"
          required
        />
      </div>
      <div className="form-group">
        <label>Descrição (Opcional)</label>
        <textarea
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
          placeholder="Uma breve sinopse da aventura"
        />
      </div>
      <button type="submit" className="btn btn-primary" disabled={loading}>
        {loading ? 'Criando...' : 'Criar Campanha'}
      </button>
    </form>
  );
}

function MestreDashboard() {
  const [campanhas, setCampanhas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth(); // Pega o mestre logado

  useEffect(() => {
    if (user && user.id) {
      setLoading(true);
      apiGetCampanhasByMestre(user.id)
        .then((data) => {
          setCampanhas(data || []); // Garante que campanhas seja um array
        })
        .catch((err) => {
          console.error('Erro ao buscar campanhas:', err);
          setError('Não foi possível carregar suas campanhas.');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [user]); // Roda o efeito sempre que o usuário mudar

  const handleCampanhaCriada = (novaCampanha) => {
    setCampanhas((prevCampanhas) => [...prevCampanhas, novaCampanha]);
  };

  if (loading) return <p className="text-muted">Carregando seu dashboard...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div>
      <h2>Dashboard do Mestre: {user?.nome}</h2>
      <div className="layout-grid">
        <div className="card-list">
          <h3>Suas Campanhas</h3>
          {campanhas.length === 0 ? (
            <p>Você ainda não criou nenhuma campanha. Use o formulário ao lado para começar!</p>
          ) : (
            campanhas.map((c) => (
              // O link deve levar para a página de detalhes da campanha do mestre
              <Link to={`/mestre/campanha/${c.id}`} key={c.id} className="card card-link">
                <h4>{c.nome}</h4>
                {c.descricao && <p>{c.descricao}</p>}
              </Link>
            ))
          )}
        </div>
        <CampanhaForm onCampanhaCriada={handleCampanhaCriada} />
      </div>
    </div>
  );
}

export default MestreDashboard;
