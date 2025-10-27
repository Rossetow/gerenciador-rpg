// /src/pages/MestreDashboard.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiGetCampanhas, apiCreateCampanha } from '../api/mockApi';
import { useAuth } from '../context/AuthContext';

// Componente simples para o formulário
function CampanhaForm({ onCampanhaCriada }) {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const { jogador } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const novaCampanha = {
      nome,
      descricao,
      template_atributos_base: [], // O Mestre edita isso na pág de detalhes
      template_habilidades: [],
      template_outros: [],
    };
    const campanha = await apiCreateCampanha(jogador.id, novaCampanha);
    onCampanhaCriada(campanha);
    setNome('');
    setDescricao('');
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
          required
        />
      </div>
      <div className="form-group">
        <label>Descrição</label>
        <textarea
          value={descricao}
          onChange={(e) => setDescricao(e.target.value)}
        />
      </div>
      <button type="submit" className="btn btn-primary">Criar</button>
    </form>
  );
}

function MestreDashboard() {
  const [campanhas, setCampanhas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGetCampanhas().then((data) => {
      setCampanhas(data);
      setLoading(false);
    });
  }, []);

  const handleCampanhaCriada = (novaCampanha) => {
    setCampanhas([...campanhas, novaCampanha]);
  };

  if (loading) return <p>Carregando...</p>;

  return (
    <div>
      <h2>Dashboard do Mestre</h2>
      <div className="layout-grid">
        <div className="card-list">
          <h3>Suas Campanhas</h3>
          {campanhas.length === 0 ? (
            <p>Nenhuma campanha criada.</p>
          ) : (
            campanhas.map((c) => (
              <Link to={`/mestre/campanha/${c.id}`} key={c.id} className="card card-link">
                <h4>{c.nome}</h4>
                <p>{c.descricao}</p>
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