import React, { useState } from 'react';

// O estado inicial para um item
const itemBase = {
    nome: '',
    tipo: 'Item', // Tipo genérico
    descricao: '',
    quantidade: 1,
    peso: 0,
    valor: 0,
    efeitos: {},
};

// Dados extras para tipos específicos
const tipoExtra = {
    Arma: {
        tipo_arma: '',
        habilidade_requerida: '',
        dano: '',
        tipo_dano: ''
    },
    Armadura: {
        valor_defesa: 0,
        localizacao: ''
    },
    Consumível: {
        // Nenhum campo extra além de 'efeitos'
    }
}

function Inventario({ inventario, onInventoryChange, onSelectItem }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState(itemBase);

  // Atualiza o formulário de novo item
  const handleNewItemChange = (e) => {
    const { name, value, type } = e.target;
    let val = type === 'number' ? parseFloat(value) || 0 : value;

    let updatedItem = { ...newItem, [name]: val };

    // Se mudou o TIPO, adiciona os campos extras!
    if (name === 'tipo') {
        updatedItem = {
            ...itemBase, // Reseta
            tipo: val, // Seta o novo tipo
            nome: newItem.nome, // Mantém o nome
            ...tipoExtra[val] // Adiciona os campos extras (Arma, Armadura, etc)
        };
    }
    setNewItem(updatedItem);
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    onInventoryChange([...inventario, newItem]);
    setNewItem(itemBase); // Reseta o formulário
    setShowAddForm(false);
  };

  const handleDeleteItem = (index) => {
    if (window.confirm('Tem certeza que quer excluir este item?')) {
      const novaLista = inventario.filter((_, i) => i !== index);
      onInventoryChange(novaLista);
    }
  };

  // Renderiza o formulário de Adicionar Item
  const renderAddForm = () => (
    <form onSubmit={handleAddItem} className="card-light">
      <h4>Adicionar Novo Item</h4>
      <div className="form-group">
        <label>Nome</label>
        <input name="nome" value={newItem.nome} onChange={handleNewItemChange} required />
      </div>
      <div className="form-group">
        <label>Tipo</label>
        <select name="tipo" value={newItem.tipo} onChange={handleNewItemChange}>
          <option value="Item">Item Genérico</option>
          <option value="Consumível">Consumível</option>
          <option value="Arma">Arma</option>
          <option value="Armadura">Armadura</option>
        </select>
      </div>

      {/* Campos dinâmicos baseados no tipo */}
      {newItem.tipo === 'Arma' && (
        <>
            <div className="form-group"><label>Dano</label><input name="dano" value={newItem.dano} onChange={handleNewItemChange} /></div>
            <div className="form-group"><label>Habilidade</label><input name="habilidade_requerida" value={newItem.habilidade_requerida} onChange={handleNewItemChange} /></div>
        </>
      )}
      {newItem.tipo === 'Armadura' && (
        <div className="form-group"><label>Valor Defesa</label><input name="valor_defesa" type="number" value={newItem.valor_defesa} onChange={handleNewItemChange} /></div>
      )}
      
      <div className="btn-group">
        <button type="submit" className="btn btn-primary">Adicionar</button>
        <button type="button" onClick={() => setShowAddForm(false)} className="btn btn-link">Cancelar</button>
      </div>
    </form>
  );

  return (
    <div className="inventario-container">
      <h3>Inventário</h3>
      <ul className="inventario-list">
        {inventario.length === 0 ? (
          <p className="empty-list">Inventário vazio.</p>
        ) : (
          inventario.map((item, index) => (
            <li key={index} className="inventario-item">
              <span className="item-name">
                {item.nome} ({item.tipo})
              </span>
              <div className="item-actions">
                <button
                  onClick={() => onSelectItem(item, index)} // Passa o item E o índice
                  className="btn btn-sm btn-edit"
                >
                  Ver/Editar
                </button>
                <button
                  onClick={() => handleDeleteItem(index)}
                  className="btn btn-sm btn-delete"
                >
                  Excluir
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
      
      {showAddForm ? (
        renderAddForm()
      ) : (
        <button onClick={() => setShowAddForm(true)} className="btn btn-secondary">
          Adicionar Item
        </button>
      )}
    </div>
  );
}

export default Inventario;