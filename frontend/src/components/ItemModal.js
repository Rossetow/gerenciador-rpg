import React, { useState, useEffect } from 'react';
import './Modal.css';

function ItemModal({ item, index, onSave, onClose }) {
  // O estado 'formData' guarda as edições
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    // Quando o item (prop) muda, atualiza o estado do formulário
    setFormData(item);
  }, [item]);

  if (!formData) return null;

  // Handler genérico para atualizar o estado do formulário
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    // Converte números
    const val = type === 'number' ? parseFloat(value) || 0 : value;
    setFormData((prev) => ({
      ...prev,
      [name]: val,
    }));
  };

  // Handler para campos específicos (Arma, Armadura)
  const handleSpecificChange = (e) => {
    // O backend espera que os campos "Item" e "Arma" estejam achatados
    handleChange(e);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData, index);
  };

  // Renderiza os campos de formulário comuns a TODOS os itens
  const renderCommonFields = () => (
    <>
      <div className="form-group">
        <label>Nome do Item</label>
        <input
          name="nome"
          value={formData.nome}
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <label>Descrição</label>
        <textarea
          name="descricao"
          value={formData.descricao}
          onChange={handleChange}
        />
      </div>
      <div className="form-grid-3">
        <div className="form-group">
          <label>Quantidade</label>
          <input
            name="quantidade"
            type="number"
            value={formData.quantidade}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Peso</label>
          <input
            name="peso"
            type="number"
            value={formData.peso}
            onChange={handleChange}
          />
        </div>
        <div className="form-group">
          <label>Valor</label>
          <input
            name="valor"
            type="number"
            value={formData.valor}
            onChange={handleChange}
          />
        </div>
      </div>
    </>
  );

  // Renderiza campos específicos para 'Arma'
  const renderArmaFields = () => (
    <>
      <div className="form-grid-3">
        <div className="form-group">
          <label>Tipo de Arma</label>
          <input
            name="tipo_arma"
            value={formData.tipo_arma || ''}
            onChange={handleSpecificChange}
          />
        </div>
        <div className="form-group">
          <label>Habilidade</label>
          <input
            name="habilidade_requerida"
            value={formData.habilidade_requerida || ''}
            onChange={handleSpecificChange}
          />
        </div>
        <div className="form-group">
          <label>Dano</label>
          <input
            name="dano"
            value={formData.dano || ''}
            onChange={handleSpecificChange}
          />
        </div>
      </div>
      <div className="form-group">
        <label>Tipo de Dano</label>
        <input
          name="tipo_dano"
          value={formData.tipo_dano || ''}
          onChange={handleSpecificChange}
        />
      </div>
    </>
  );

  // Renderiza campos específicos para 'Armadura'
  const renderArmaduraFields = () => (
    <>
      <div className="form-grid-2">
        <div className="form-group">
          <label>Valor de Defesa</label>
          <input
            name="valor_defesa"
            type="number"
            value={formData.valor_defesa || 0}
            onChange={handleSpecificChange}
          />
        </div>
        <div className="form-group">
          <label>Localização</label>
          <input
            name="localizacao"
            value={formData.localizacao || ''}
            onChange={handleSpecificChange}
          />
        </div>
      </div>
    </>
  );
  
  // TODO: Implementar UI para editar o map 'Efeitos'
  const renderEfeitos = () => (
     <div className="form-group">
        <label>Efeitos (Visualização)</label>
        <pre className="code-block">
            {JSON.stringify(formData.efeitos || {}, null, 2)}
        </pre>
     </div>
  );


  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Editar Item: {item.nome}</h2>
          <button onClick={onClose} className="modal-close-btn">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          {renderCommonFields()}

          {/* Renderização Dinâmica baseada no TIPO */}
          {formData.tipo === 'Arma' && renderArmaFields()}
          {formData.tipo === 'Armadura' && renderArmaduraFields()}
          {/* 'Consumível' não tem campos extras além dos Efeitos */}

          {renderEfeitos()}
          
          <div className="btn-group">
            <button type="submit" className="btn btn-primary">Salvar Alterações</button>
            <button type="button" onClick={onClose} className="btn btn-link">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ItemModal;