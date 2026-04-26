import React, { useState, useEffect } from 'react';
import { apiGetAllJogadores, apiGetJogadoresPorCampanha, apiAdicionarJogador, apiRemoverJogador } from '../api/api';
import './Modal.css';

function GerenciarJogadoresModal({ campanha, onClose }) {
  const [jogadores, setJogadores] = useState([]);
  const [jogadoresNaCampanha, setJogadoresNaCampanha] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJogadores = async () => {
      try {
        setLoading(true);
        const [todosJogadores, jogadoresDaCampanha] = await Promise.all([
          apiGetAllJogadores(),
          apiGetJogadoresPorCampanha(campanha.id),
        ]);

        setJogadores(todosJogadores || []);
        setJogadoresNaCampanha(new Set((jogadoresDaCampanha || []).map(j => j.id)));
      } catch (err) {
        setError('Erro ao carregar jogadores.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchJogadores();
  }, [campanha.id]);

  const handleAddJogador = async (jogadorId) => {
    try {
      await apiAdicionarJogador(campanha.id, jogadorId);
      setJogadoresNaCampanha(prev => new Set(prev).add(jogadorId));
    } catch (error) {
      alert(`Erro ao adicionar jogador: ${error.message}`);
    }
  };

  const handleRemoveJogador = async (jogadorId) => {
    try {
      await apiRemoverJogador(campanha.id, jogadorId);
      setJogadoresNaCampanha(prev => {
        const newSet = new Set(prev);
        newSet.delete(jogadorId);
        return newSet;
      });
    } catch (error) {
      alert(`Erro ao remover jogador: ${error.message}`);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Gerenciar Jogadores na Campanha: {campanha.nome}</h2>
          <button className="modal-close-btn" onClick={onClose} aria-label="Fechar">×</button>
        </div>
        {loading && <p className="text-muted">Carregando jogadores...</p>}
        {error && <p className="text-danger">{error}</p>}
        
        {!loading && !error && (
          <div className="lista-jogadores">
            {jogadores.map(jogador => (
              <div key={jogador.id} className="jogador-item">
                <span>{jogador.nome}{jogador.email ? ` (${jogador.email})` : ''}</span>
                {jogadoresNaCampanha.has(jogador.id) ? (
                  <button onClick={() => handleRemoveJogador(jogador.id)} className="btn btn-danger">Remover</button>
                ) : (
                  <button onClick={() => handleAddJogador(jogador.id)} className="btn btn-success">Adicionar</button>
                )}
              </div>
            ))}
          </div>
        )}

                <div className="modal-footer">
          <button onClick={onClose} className="btn">Fechar</button>
        </div>
      </div>
    </div>
  );
}

export default GerenciarJogadoresModal;
