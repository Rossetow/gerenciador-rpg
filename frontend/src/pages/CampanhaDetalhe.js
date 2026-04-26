import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  apiGetCampanhaById,
  apiGetPersonagensByCampanha,
  apiUpdateCampanhaTemplate,
  apiGetJogadoresPorCampanha,
  apiCreatePersonagem,
  apiGetJogadorById,
} from '../api/api';
import GerenciarJogadoresModal from '../components/GerenciarJogadoresModal';

// --- TemplateEditor SIMPLIFICADO ---
// Agora usa textareas para edição em massa, o que é mais simples
// e alinhado com a forma como a API salva os dados.

function TemplateEditor({ campanha, onTemplateSave }) {
  // Estado baseado em arrays, com UI de rows (add/remove)
  const [atributos, setAtributos] = useState([...(campanha.template_atributos_base || [])]);
  const [habilidades, setHabilidades] = useState([...(campanha.template_habilidades || [])]);
  const [outros, setOutros] = useState([...(campanha.template_outros || [])]);
  const [loading, setLoading] = useState(false);

  const ensureAtLeastOne = (arr) => (arr.length === 0 ? [''] : arr);

  const onChangeAt = (setter) => (idx, value) => {
    setter(prev => {
      const next = [...prev];
      next[idx] = value;
      return next;
    });
  };

  const onAddRow = (setter) => () => {
    setter(prev => [...prev, '']);
  };

  const onRemoveRow = (setter) => (idx) => {
    setter(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const data = {
        template_atributos_base: (atributos || []).map(s => String(s).trim()).filter(Boolean),
        template_habilidades: (habilidades || []).map(s => String(s).trim()).filter(Boolean),
        template_outros: (outros || []).map(s => String(s).trim()).filter(Boolean),
      };
      await onTemplateSave(data);
      alert('Template da ficha salvo com sucesso!');
    } catch (error) {
      alert(`Erro ao salvar o template: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const renderList = (title, values, setValues, placeholder) => (
    <div className="card-inset">
      <h4>{title}</h4>
      <ul className="template-list">
        {ensureAtLeastOne(values).map((val, idx) => (
          <li key={`${title}-${idx}`} className="template-item">
            <div className="form-group flex-1 mb-0">
              <label className="label-tight">{title} #{idx + 1}</label>
              <input
                value={val}
                onChange={(e) => onChangeAt(setValues)(idx, e.target.value)}
                placeholder={placeholder}
              />
            </div>
            <div className="item-actions">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => onRemoveRow(setValues)(idx)}
                disabled={values.length <= 1}
                title="Remover"
              >
                Remover
              </button>
            </div>
          </li>
        ))}
      </ul>
      <div className="btn-group mt-05">
        <button type="button" className="btn btn-secondary" onClick={onAddRow(setValues)}>
          Adicionar Novo
        </button>
      </div>
    </div>
  );

  return (
    <div className="card">
      <h3>Editor do Template da Ficha</h3>
      <small className="empty-list">Adicione, renomeie ou remova linhas para personalizar os campos da ficha.</small>

      {renderList('Atributo', atributos, setAtributos, 'Ex: Força')}
      {renderList('Habilidade', habilidades, setHabilidades, 'Ex: Furtividade')}
      {renderList('Outro Campo', outros, setOutros, 'Ex: Pontos de Vida')}

      <button onClick={handleSave} className="btn btn-primary btn-full" disabled={loading}>
        {loading ? 'Salvando...' : 'Salvar Template'}
      </button>
    </div>
  );
}

// --- Componente Principal ---
function CampanhaDetalhe() {
  const { id } = useParams();
  const [campanha, setCampanha] = useState(null);
  const [personagens, setPersonagens] = useState([]);
  const [jogadoresMap, setJogadoresMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const { user } = useAuth();

  // Lista de jogadores para criação de personagem pelo mestre
  const [jogadores, setJogadores] = useState([]);

  // Formulário de criação de personagem (mestre)
  const [novoNome, setNovoNome] = useState('');
  const [novoJogadorId, setNovoJogadorId] = useState('');
  const [novaVida, setNovaVida] = useState(0);
  const [novaVidaMaxima, setNovaVidaMaxima] = useState(0);
  const [creating, setCreating] = useState(false);

  const handleCriarPersonagemMestre = async (e) => {
    e.preventDefault();
    if (!novoNome.trim() || !novoJogadorId) {
      alert('Informe nome e jogador.');
      return;
    }
    try {
      setCreating(true);
      const req = {
        nome: novoNome.trim(),
        jogador_id: String(novoJogadorId),
        campanha_id: id,
        vida: parseInt(novaVida, 10) || 0,
        vida_maxima: parseInt(novaVidaMaxima, 10) || 0,
      };
      const novo = await apiCreatePersonagem(req);
      setPersonagens(prev => [...prev, novo]);
      // Reset
      setNovoNome('');
      setNovoJogadorId('');
      setNovaVida(0);
      setNovaVidaMaxima(0);
    } catch (err) {
      alert(`Erro ao criar personagem: ${err.message}`);
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const campanhaData = await apiGetCampanhaById(id);
        setCampanha(campanhaData);
        const personagensData = await apiGetPersonagensByCampanha(id);
        setPersonagens(personagensData || []);
        // Mapeia jogadores da campanha (id -> nome)
        const jogadores = await apiGetJogadoresPorCampanha(id);
        const map = {};
        (jogadores || []).forEach(j => { map[j.id] = j.nome; });
        setJogadoresMap(map);
        setJogadores(jogadores || []);
      } catch (err) {
        console.error("Erro ao carregar detalhes da campanha:", err);
        setError("Não foi possível carregar os dados da campanha.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Completa o mapa de jogadores buscando individualmente por ID quando necessário
  useEffect(() => {
    const fetchMissingJogadores = async () => {
      const ids = (personagens || []).map(p => p.jogador_id);
      for (const jid of ids) {
        if (!jid) continue;
        try {
          const j = await apiGetJogadorById(jid);
          setJogadoresMap(prev => {
            if (prev[jid]) return prev;
            return { ...prev, [jid]: j.nome || jid };
          });
        } catch (err) {
          setJogadoresMap(prev => ({ ...prev, [jid]: prev[jid] || jid }));
        }
      }
    };
    fetchMissingJogadores();
  }, [personagens]);

  // Resolve nome do jogador de forma síncrona, preenchendo cache assincronamente
  const apiGetJogadorByIdCached = (jid) => {
    const nome = jogadoresMap[jid];
    if (nome) return nome;
    if (jid) {
      apiGetJogadorById(jid)
        .then((j) => {
          if (j && j.id) {
            setJogadoresMap((prev) => ({ ...prev, [jid]: j.nome || jid }));
          }
        })
        .catch(() => {
          // Mantém fallback para o próprio ID
        });
    }
    return jid;
  };

  const handleTemplateSave = async (templateData) => {
    // A API de template não retorna a campanha atualizada,
    // então atualizamos o estado localmente para refletir a mudança.
    await apiUpdateCampanhaTemplate(id, templateData);
    setCampanha(prev => ({ ...prev, ...templateData }));
  };

  if (loading) return <p className="text-muted">Carregando detalhes da campanha...</p>;
  if (error) return <p className="text-danger">{error}</p>;
  if (!campanha) return <p>Campanha não encontrada.</p>;

  return (
    <div>
      <h2>Gerenciar Campanha: {campanha.nome}</h2>
      {campanha.descricao && <p>{campanha.descricao}</p>}

      <button onClick={() => setShowModal(true)} className="btn btn-secondary">Gerenciar Jogadores</button>
      
      {showModal && <GerenciarJogadoresModal campanha={campanha} onClose={() => setShowModal(false)} />}

      <div className="layout-grid">
        <div className="card-list">
          <h3>Personagens na Campanha</h3>
          {personagens.length === 0 ? (
            <p>Ainda não há personagens nesta campanha.</p>
          ) : (
            personagens.map((p) => {
              // Vida atual e máxima padronizadas no modelo
              const vidaAtual = typeof p.vida !== 'undefined' ? p.vida : '—';
              const vidaMax = typeof p.vida_maxima !== 'undefined' ? p.vida_maxima : undefined;
              const jogadorNome = apiGetJogadorByIdCached(p.jogador_id);
              const descricaoVida = vidaMax !== undefined ? `${vidaAtual}/${vidaMax}` : `${vidaAtual}`;
              const titulo = `${p.nome} - Vida: ${descricaoVida} (Jogador: ${jogadorNome})`;

              return (
                <Link
                  to={`/mestre/personagem/${encodeURIComponent(p.id)}`}
                  key={p.id}
                  className="card card-link"
                >
                  <h4>{titulo}</h4>
                </Link>
              );
            })
          )}
        </div>
        
        <div>
          <div className="card">
            <h3>Criar Personagem (Mestre)</h3>
            <form onSubmit={handleCriarPersonagemMestre}>
              <div className="form-group">
                <label>Nome</label>
                <input
                  value={novoNome}
                  onChange={e => setNovoNome(e.target.value)}
                  placeholder="Ex: Agron"
                  required
                />
              </div>
              <div className="form-group">
                <label>Jogador</label>
                <select
                  value={novoJogadorId}
                  onChange={e => setNovoJogadorId(e.target.value)}
                  required
                >
                  <option value="">Selecione um jogador</option>
                  {([...jogadores,  user] || []).map(j => (
                    <option key={j.id} value={j.id}>{j.nome}</option>
                  ))}
                </select>
              </div>
              <div className="form-group-inline">
                <label>Vida Atual</label>
                <input
                  type="text"
                  value={novaVida}
                  onChange={e => setNovaVida(e.target.value)}
                />
              </div>
              <div className="form-group-inline">
                <label>Vida Máxima</label>
                <input
                  type="text"
                  value={novaVidaMaxima}
                  onChange={e => setNovaVidaMaxima(e.target.value)}
                />
              </div>
              <div className="btn-group">
                <button type="submit" className="btn btn-primary" disabled={creating}>
                  {creating ? 'Criando...' : 'Criar'}
                </button>
              </div>
            </form>
          </div>

          <TemplateEditor campanha={campanha} onTemplateSave={handleTemplateSave} />
        </div>
      </div>
    </div>
  );
}

export default CampanhaDetalhe;
