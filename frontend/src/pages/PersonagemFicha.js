import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { apiGetPersonagemById, apiGetCampanhaById, apiUpdatePersonagem } from '../api/mockApi';
import { useAuth } from '../context/AuthContext';
import Inventario from '../components/Inventario'; // <-- Importa o Inventário
import ItemModal from '../components/ItemModal';   // <-- Importa o Modal

function PersonagemFicha() {
  const { id } = useParams();
  const [personagem, setPersonagem] = useState(null);
  const [campanha, setCampanha] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(null);
  const { jogador, role } = useAuth();

  // --- NOVO ESTADO PARA O MODAL ---
  // Guarda { item, index }
  const [itemSelecionado, setItemSelecionado] = useState(null);

  useEffect(() => {
    apiGetPersonagemById(id).then(personagemData => {
      // Garante que o inventário nunca seja 'null'
      if (!personagemData.inventario) {
        personagemData.inventario = [];
      }
      setPersonagem(personagemData);
      setEditData(personagemData);
      
      apiGetCampanhaById(personagemData.campanha_id).then(setCampanha);
    });
  }, [id]);

  const podeEditar = () => {
    if (!jogador || !personagem) return false;
    if (role === 'mestre') return true;
    if (role === 'jogador' && jogador.id === personagem.jogador_id) return true;
    return false;
  };

  // --- Handlers do Modo de Edição Principal (Atributos) ---
  const handleMapChange = (mapName, key, value) => {
    setEditData(prev => ({
      ...prev,
      [mapName]: {
        ...prev[mapName],
        [key]: parseInt(value, 10) || 0,
      },
    }));
  };

  const handleSave = async () => {
    // Salva TUDO, incluindo o inventário que já foi atualizado
    const personagemAtualizado = await apiUpdatePersonagem(id, editData);
    setPersonagem(personagemAtualizado);
    setIsEditing(false);
  };

  // --- NOVO: Handler unificado para salvar o inventário ---
  const handleInventoryChange = async (novaListaInventario) => {
    // 1. Cria o objeto de personagem atualizado
    const dataToSave = {
        ...personagem,
        inventario: novaListaInventario
    };

    // 2. Atualiza o backend (Mock API)
    // Em um backend real, talvez você só enviasse o inventário
    await apiUpdatePersonagem(id, dataToSave);

    // 3. Atualiza os estados locais
    setPersonagem(dataToSave);
    setEditData(dataToSave); // Mantém o 'editData' em sincronia
  };

  // --- NOVO: Handler para salvar um item do modal ---
  const handleSaveItemModal = (itemAtualizado, index) => {
    const novaLista = [...personagem.inventario];
    novaLista[index] = itemAtualizado;
    handleInventoryChange(novaLista);
    setItemSelecionado(null); // Fecha o modal
  };

  if (!personagem || !campanha) return <p>Carregando Ficha...</p>;

  // A ficha principal a ser exibida (ou 'editData' ou 'personagem')
  const FichaAtual = isEditing ? editData : personagem;

  if (isEditing) {
    // --- MODO DE EDIÇÃO (ATRIBUTOS) ---
    return (
      <div className="card">
        <h2>Editando: {editData.nome}</h2>
        {/* ... (Todo o formulário de atributos/habilidades) ... */}
        <div className="form-group">
          <label>Nome</label>
          <input value={editData.nome} onChange={e => setEditData({...editData, nome: e.target.value})} />
        </div>
        <h4>Atributos</h4>
        {campanha.template_atributos_base.map(key => (
          <div className="form-group-inline" key={key}>
            <label>{key}</label>
            <input
              type="number"
              value={editData.atributos_base[key] || 0}
              onChange={e => handleMapChange('atributos_base', key, e.target.value)}
            />
          </div>
        ))}
        {/* TODO: Repetir para Habilidades e Outros */}
        <hr />
        
        {/* O Inventário agora é mostrado no modo de edição, mas desabilitado */}
        {/* Ou você pode optar por escondê-lo. Por simplicidade, vamos mostrar. */}
        <Inventario
            inventario={FichaAtual.inventario || []}
            onInventoryChange={handleInventoryChange}
            onSelectItem={(item, index) => setItemSelecionado({ item, index })}
        />

        <hr />
        <button onClick={handleSave} className="btn btn-primary">Salvar Ficha</button>
        <button onClick={() => setIsEditing(false)} className="btn btn-link">Cancelar</button>
      </div>
    );
  }

  // --- MODO DE VISUALIZAÇÃO ---
  return (
    <div className="card">
      {/* Botão de Edição Principal */}
      {podeEditar() && !isEditing && (
        <button onClick={() => setIsEditing(true)} className="btn btn-secondary btn-edit-ficha">
          Editar Ficha (Atributos)
        </button>
      )}

      <h1>{FichaAtual.nome}</h1>
      
      {/* ... (Visualização dos atributos/habilidades) ... */}
      <div className="stats-grid">
        <div className="card-list">
          <h4>Atributos Base</h4>
          {Object.entries(FichaAtual.atributos_base).map(([key, value]) => (
            <li key={key}><strong>{key}:</strong> {value}</li>
          ))}
        </div>
        <div className="card-list">
          <h4>Habilidades</h4>
          {Object.entries(FichaAtual.habilidades).map(([key, value]) => (
            <li key={key}><strong>{key}:</strong> {value}</li>
          ))}
        </div>
        <div className="card-list">
          <h4>Outros</h4>
          {Object.entries(FichaAtual.outros).map(([key, value]) => (
            <li key={key}><strong>{key}:</strong> {value}</li>
          ))}
        </div>
      </div>

      <hr />
      
      {/* --- NOVO: Seção do Inventário --- */}
      {/* Passamos os handlers para o componente Inventario */}
      {podeEditar() ? (
         <Inventario
            inventario={FichaAtual.inventario || []}
            onInventoryChange={handleInventoryChange}
            onSelectItem={(item, index) => setItemSelecionado({ item, index })}
         />
      ) : (
        <div className="inventario-container">
            <h3>Inventário (Visualização)</h3>
            <ul className="inventario-list">
                {(FichaAtual.inventario || []).map((item, index) => (
                    <li key={index} className="inventario-item">
                        <span className="item-name">{item.nome} ({item.tipo})</span>
                    </li>
                ))}
            </ul>
        </div>
      )}


      {/* --- NOVO: Renderização do Modal --- */}
      {itemSelecionado && (
        <ItemModal
          item={itemSelecionado.item}
          index={itemSelecionado.index}
          onSave={handleSaveItemModal}
          onClose={() => setItemSelecionado(null)}
        />
      )}
    </div>
  );
}

export default PersonagemFicha;