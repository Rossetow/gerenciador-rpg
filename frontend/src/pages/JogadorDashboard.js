// /src/pages/JogadorDashboard.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiGetPersonagensByJogador, apiGetCampanhas, apiCreatePersonagem, apiGetCampanhaById } from '../api/mockApi';
import { useAuth } from '../context/AuthContext';

// O FORMULÁRIO DINÂMICO
function PersonagemForm({ campanha, jogadorId, onPersonagemCriado }) {
  const [nome, setNome] = useState('');
  const [atributos, setAtributos] = useState({});
  const [habilidades, setHabilidades] = useState({});
  const [outros, setOutros] = useState({});

  // Atualiza o estado do formulário quando os valores são digitados
  const handleMapChange = (map, setMap, key, value) => {
    setMap({ ...map, [key]: parseInt(value, 10) || 0 });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = {
        nome: nome,
        jogador_id: jogadorId,
        campanha_id: campanha.id,
        descricao_fisica: '',
        caracteristicas: '',
        atributos_base: atributos,
        habilidades: habilidades,
        outros: outros,
        inventario: []
    };
    const novoPersonagem = await apiCreatePersonagem(data);
    onPersonagemCriado(novoPersonagem);
  };

  return (
     <form onSubmit={handleSubmit} className="card">
         <h3>Criar Ficha para: {campanha.nome}</h3>
         <div className="form-group">
            <label>Nome do Personagem</label>
            <input value={nome} onChange={e => setNome(e.target.value)} required />
         </div>

        {/* Renderização dinâmica dos campos */}
        {campanha.template_atributos_base.length > 0 && <h4>Atributos</h4>}
        {campanha.template_atributos_base.map(key => (
            <div className="form-group-inline" key={key}>
                <label>{key}</label>
                <input type="number" onChange={e => handleMapChange(atributos, setAtributos, key, e.target.value)} />
            </div>
        ))}
        {/* Repetir para habilidades e outros... */}
        
        <button type="submit" className="btn btn-primary">Salvar Ficha</button>
     </form>
  )
}

function JogadorDashboard() {
  const [meusPersonagens, setMeusPersonagens] = useState([]);
  const [campanhas, setCampanhas] = useState([]);
  const [campanhaSelecionada, setCampanhaSelecionada] = useState(null);
  const [loading, setLoading] = useState(true);
  const { jogador } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    Promise.all([
        apiGetPersonagensByJogador(jogador.id),
        apiGetCampanhas()
    ]).then(([personagensData, campanhasData]) => {
        setMeusPersonagens(personagensData);
        setCampanhas(campanhasData);
        setLoading(false);
    });
  }, [jogador.id]);

  const handlePersonagemCriado = (novoPersonagem) => {
    setMeusPersonagens([...meusPersonagens, novoPersonagem]);
    setCampanhaSelecionada(null); // Fecha o formulário
    navigate(`/personagem/${novoPersonagem.id}`); // Navega para a ficha
  };

  if (loading) return <p>Carregando...</p>;

  return (
    <div>
      <h2>Dashboard do Jogador</h2>
      <div className="layout-grid">
        <div className="card-list">
          <h3>Meus Personagens</h3>
          {meusPersonagens.length === 0 ? (
            <p>Você não criou nenhum personagem.</p>
          ) : (
            meusPersonagens.map(p => (
                <Link to={`/personagem/${p.id}`} key={p.id} className="card card-link">
                    <h4>{p.nome}</h4>
                </Link>
            ))
          )}
        </div>
        <div className="card">
            <h3>Criar Novo Personagem</h3>
            <p>Selecione uma campanha para criar sua ficha:</p>
            {campanhas.map(c => (
                <button 
                    key={c.id} 
                    className="btn btn-secondary"
                    onClick={() => apiGetCampanhaById(c.id).then(setCampanhaSelecionada)}
                >
                    {c.nome}
                </button>
            ))}

            {campanhaSelecionada && (
                <PersonagemForm 
                    campanha={campanhaSelecionada} 
                    jogadorId={jogador.id}
                    onPersonagemCriado={handlePersonagemCriado}
                />
            )}
        </div>
      </div>
    </div>
  );
}

export default JogadorDashboard;