import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
    apiGetPersonagensByJogador, 
    apiGetCampanhasByJogador, 
    apiCreatePersonagem, 
    apiGetCampanhaById
} from '../api/api';
import { useAuth } from '../context/AuthContext';

// Formulário simplificado para criar um personagem.
// A ficha completa será editada na página do personagem.
function PersonagemForm({ campanha, jogadorId, onPersonagemCriado, onCancel }) {
  const [nome, setNome] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nome.trim()) {
      alert('O nome do personagem é obrigatório.');
      return;
    }
    setLoading(true);
    try {
      // Dados mínimos para criar o personagem no backend
      const data = {
        nome: nome,
        jogador_id: jogadorId,
        campanha_id: campanha.id,
        // O backend inicializa os mapas de atributos, etc.
      };
      const novoPersonagem = await apiCreatePersonagem(data);
      onPersonagemCriado(novoPersonagem);
    } catch (error) {
      alert(`Erro ao criar personagem: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
     <div className="card-inset">
        <h4>Criar Ficha para: "{campanha.nome}"</h4>
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label>Nome do Personagem</label>
                <input 
                  value={nome} 
                  onChange={e => setNome(e.target.value)} 
                  placeholder="Ex: Aragorn"
                  required 
                />
            </div>
            <div className="btn-group">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Salvando...' : 'Salvar Personagem'}
              </button>
              <button type="button" className="btn btn-link" onClick={onCancel}>
                  Cancelar
              </button>
            </div>
        </form>
     </div>
  );
}

function JogadorDashboard() {
  const [meusPersonagens, setMeusPersonagens] = useState([]);
  const [campanhasDisponiveis, setCampanhasDisponiveis] = useState([]);
  const [campanhaSelecionada, setCampanhaSelecionada] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && user.id) {
      setLoading(true);
      setError(null);
      apiGetPersonagensByJogador(user.id)
        .then(personagensData => {
          setMeusPersonagens(personagensData || []);
          return apiGetCampanhasByJogador(user.id);
        })
        .then((campanhasData) => {
          setCampanhasDisponiveis(campanhasData || []);
        })
        .catch(err => {
          console.error("Erro ao carregar dashboard:", err);
          setError("Não foi possível carregar os dados. Tente recarregar a página.");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [user]);

  const handleSelecionarCampanha = (campanhaId) => {
    // Busca os detalhes da campanha para pegar os templates
    apiGetCampanhaById(campanhaId)
      .then(setCampanhaSelecionada)
      .catch(err => alert(`Erro ao carregar detalhes da campanha: ${err.message}`));
  };

  const handlePersonagemCriado = (novoPersonagem) => {
    try {
      if (!novoPersonagem || !novoPersonagem.id) {
        console.warn('Personagem criado sem ID:', novoPersonagem);
        alert('Personagem criado, mas houve um problema ao obter o ID. Retornando ao seu dashboard.');
        setCampanhaSelecionada(null);
        navigate('/jogador');
        return;
      }
      setMeusPersonagens([...meusPersonagens, novoPersonagem]);
      setCampanhaSelecionada(null); // Fecha o formulário
      // Navega para a nova ficha do personagem
      navigate(`/jogador/personagem/${encodeURIComponent(novoPersonagem.id)}`);
    } catch (e) {
      console.error('Erro pós-criação:', e);
      navigate('/jogador');
    }
  };

  if (loading) return <p className="text-muted">Carregando seu dashboard...</p>;
  if (error) return <p className="text-danger">{error}</p>;

  return (
    <div>
      <h2>Dashboard do Jogador: {user?.nome}</h2>
      <div className="layout-grid">
        <div className="card-list">
          <h3>Meus Personagens</h3>
          {meusPersonagens.length === 0 ? (
            <p>Você ainda não tem personagens. Crie um ao lado!</p>
          ) : (
            meusPersonagens.map(p => (
                <Link to={`/jogador/personagem/${encodeURIComponent(p.id)}`} key={p.id} className="card card-link">
                    <h4>{p.nome}</h4>
                    <small>Campanha: ID {apiGetCampanhaById().nome}</small> {/* Melhorar isso depois */}
                </Link>
            ))
          )}
        </div>
        
        <div className="card">
            <h3>Minhas Campanhas</h3>
            <div className="btn-group-vertical">
              {campanhasDisponiveis.length > 0 ? campanhasDisponiveis.map(c => (
                <div key={c.id} className="card-inset">
                  <div className="flex-row space-between">
                    <div>
                      <h4>{c.nome}</h4>
                      {c.descricao && <p>{c.descricao}</p>}
                    </div>
                    <div className="btn-group">
                      <button 
                        className="btn btn-secondary"
                        onClick={() => handleSelecionarCampanha(c.id)}
                      >
                        Criar Personagem
                      </button>
                    </div>
                  </div>
                </div>
              )) : <p>Nenhuma campanha disponível no momento.</p>}
            </div>
            <hr />
            <h3>Criar Novo Personagem</h3>
            {!campanhaSelecionada ? (
              <p>Selecione uma campanha acima para criar sua ficha.</p>
            ) : (
              <PersonagemForm 
                campanha={campanhaSelecionada} 
                jogadorId={user.id}
                onPersonagemCriado={handlePersonagemCriado}
                onCancel={() => setCampanhaSelecionada(null)}
              />
            )}
        </div>
      </div>
    </div>
  );
}

export default JogadorDashboard;
