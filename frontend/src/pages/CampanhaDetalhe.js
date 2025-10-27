import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  apiGetCampanhaById,
  apiGetPersonagensByCampanha,
  apiUpdateCampanha,
} from '../api/mockApi';

// --- TemplateEditor ATUALIZADO ---
// Este componente agora tem um formulário de "Adicionar/Editar"
// e 3 listas interativas para os campos do template.

function TemplateEditor({ campanha, onTemplateSave }) {
  // Estados para as 3 listas de campos
  const [atributos, setAtributos] = useState(campanha.template_atributos_base || []);
  const [habilidades, setHabilidades] = useState(campanha.template_habilidades || []);
  const [outros, setOutros] = useState(campanha.template_outros || []);

  // Estado para o formulário de Adicionar/Editar
  const [campo, setCampo] = useState('');
  const [tipo, setTipo] = useState('atributos');
  const [editConfig, setEditConfig] = useState(null); // Guarda { tipo, index } se estiver editando

  // --- Handlers para Ações ---

  const handleStartEdit = (tipo, index, nome) => {
    setEditConfig({ tipo, index });
    setTipo(tipo);
    setCampo(nome);
  };

  const handleCancelEdit = () => {
    setEditConfig(null);
    setCampo('');
    setTipo('atributos');
  };

  const handleDelete = (tipo, index) => {
    if (!window.confirm('Tem certeza que quer excluir este campo?')) return;

    if (tipo === 'atributos') setAtributos(atributos.filter((_, i) => i !== index));
    if (tipo === 'habilidades') setHabilidades(habilidades.filter((_, i) => i !== index));
    if (tipo === 'outros') setOutros(outros.filter((_, i) => i !== index));
  };

  const handleSubmitForm = (e) => {
    e.preventDefault();
    if (!campo) return;

    if (editConfig) {
      // --- Lógica de ATUALIZAR ---
      const { tipo, index } = editConfig;
      if (tipo === 'atributos') {
        const newList = [...atributos];
        newList[index] = campo;
        setAtributos(newList);
      }
      if (tipo === 'habilidades') {
        const newList = [...habilidades];
        newList[index] = campo;
        setHabilidades(newList);
      }
      if (tipo === 'outros') {
        const newList = [...outros];
        newList[index] = campo;
        setOutros(newList);
      }
      handleCancelEdit(); // Reseta o formulário
    } else {
      // --- Lógica de ADICIONAR ---
      if (tipo === 'atributos') setAtributos([...atributos, campo]);
      if (tipo === 'habilidades') setHabilidades([...habilidades, campo]);
      if (tipo === 'outros') setOutros([...outros, campo]);
      setCampo(''); // Limpa o campo de texto
    }
  };

  // Salva TODAS as listas no "backend"
  const handleSaveTemplate = () => {
    const data = {
      template_atributos_base: atributos,
      template_habilidades: habilidades,
      template_outros: outros,
    };
    onTemplateSave(data);
    alert('Template salvo!');
  };

  // Função auxiliar para renderizar cada "tabela"
  const renderList = (title, list, tipo) => (
    <div className="template-list-container">
      <h4>{title}</h4>
      {list.length === 0 ? (
        <p className="empty-list">Nenhum campo adicionado.</p>
      ) : (
        <ul className="template-list">
          {list.map((nome, index) => (
            <li key={index} className="template-item">
              <span className="item-name">{nome}</span>
              <div className="item-actions">
                <button
                  onClick={() => handleStartEdit(tipo, index, nome)}
                  className="btn btn-sm btn-edit"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(tipo, index)}
                  className="btn btn-sm btn-delete"
                >
                  Excluir
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <div className="card">
      <h3>Editor do Template da Ficha</h3>

      {/* --- Formulário de Adicionar/Editar --- */}
      <form onSubmit={handleSubmitForm} className="card-light">
        <h4>{editConfig ? 'Editar Campo' : 'Adicionar Novo Campo'}</h4>
        <div className="form-group">
          <label>Nome do Campo</label>
          <input value={campo} onChange={(e) => setCampo(e.target.value)} />
        </div>
        <div className="form-group">
          <label>Tipo do Campo</label>
          <select
            value={tipo}
            onChange={(e) => setTipo(e.target.value)}
            disabled={!!editConfig} // Desabilita o 'select' se estiver editando
          >
            <option value="atributos">Atributo Base</option>
            <option value="habilidades">Habilidade</option>
            <option value="outros">Outro</option>
          </select>
        </div>
        <div className="btn-group">
          <button type="submit" className="btn btn-primary">
            {editConfig ? 'Atualizar Campo' : 'Adicionar Campo'}
          </button>
          {editConfig && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="btn btn-link"
            >
              Cancelar Edição
            </button>
          )}
        </div>
      </form>

      {/* --- Listas / "Tabelas" --- */}
      {renderList('Atributos Base', atributos, 'atributos')}
      {renderList('Habilidades', habilidades, 'habilidades')}
      {renderList('Outros', outros, 'outros')}

      {/* --- Botão de Salvar --- */}
      <hr />
      <button onClick={handleSaveTemplate} className="btn btn-primary btn-full">
        Salvar Template Inteiro
      </button>
    </div>
  );
}

// --- Componente Principal (sem mudanças) ---
function CampanhaDetalhe() {
  const { id } = useParams();
  const [campanha, setCampanha] = useState(null);
  const [personagens, setPersonagens] = useState([]);

  useEffect(() => {
    // Vamos garantir que ambos os 'awaits' funcionem
    const fetchData = async () => {
      const campanhaData = await apiGetCampanhaById(id);
      setCampanha(campanhaData);
      const personagensData = await apiGetPersonagensByCampanha(id);
      setPersonagens(personagensData);
    };
    fetchData();
  }, [id]);

  const handleTemplateSave = async (data) => {
    const campanhaAtualizada = await apiUpdateCampanha(id, data);
    setCampanha(campanhaAtualizada);
  };

  if (!campanha) return <p>Carregando campanha...</p>;

  return (
    <div>
      <h2>{campanha.nome}</h2>
      <p>{campanha.descricao}</p>
      <div className="layout-grid">
        <div className="card-list">
          <h3>Personagens na Campanha</h3>
          {personagens.length === 0 ? (
            <p>Nenhum personagem nesta campanha.</p>
          ) : (
            personagens.map((p) => (
              <Link
                to={`/personagem/${p.id}`}
                key={p.id}
                className="card card-link"
              >
                {p.nome}
              </Link>
            ))
          )}
        </div>
        {/* O TemplateEditor é renderizado aqui */}
        <TemplateEditor campanha={campanha} onTemplateSave={handleTemplateSave} />
      </div>
    </div>
  );
}

export default CampanhaDetalhe;