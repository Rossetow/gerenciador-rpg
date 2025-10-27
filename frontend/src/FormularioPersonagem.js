import React, { useState } from 'react';

// Valor inicial (e padrão) para um novo personagem
const fichaInicial = {
  nome_personagem: '',
  interpretado_por: '',
  descricao_fisica: '',
  caracteristicas: '',
  // Vamos deixar atributos e habilidades com valores padrão por enquanto
  // Em um app real, o formulário teria inputs para todos eles.
  atributos: {
    forca: 10, esquivar: 10, inteligencia: 10, sorte: 10, poder: 10,
    constituicao: 10, destreza: 10, criacao_conserto: 10, aparencia: 10, educacao: 10,
  },
  habilidades: {
    arremessar: 5, atirar: 5, lutar: 5, defender: 5, escutar: 5,
    encontrar: 5, sentido: 5, disfarce: 5, furtividade: 5, labia: 5,
    escalar: 5, intimidar: 5, pescar: 5, emboscada_caca: 5,
  },
  inventario: [],
};

// O componente recebe 'onPersonagemCriado' como uma prop
// Esta é uma função que será chamada para atualizar a lista no App.js
function FormularioPersonagem({ onPersonagemCriado }) {
  const [ficha, setFicha] = useState(fichaInicial);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Manipulador para atualizar o estado do formulário
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFicha((prevFicha) => ({
      ...prevFicha,
      [name]: value,
    }));
  };

  // Manipulador para enviar o formulário
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch('http://localhost:8080/api/personagem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ficha),
      });

      if (!response.ok) {
        throw new Error('Falha ao criar personagem');
      }

      const novoPersonagem = await response.json();
      onPersonagemCriado(novoPersonagem); // Envia o novo personagem para o App.js
      setFicha(fichaInicial); // Limpa o formulário
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="section form-cadastro">
      <h2>Criar Novo Personagem</h2>
      {error && <p className="error">{error}</p>}
      <div className="form-group">
        <label>Nome do Personagem:</label>
        <input
          type="text"
          name="nome_personagem"
          value={ficha.nome_personagem}
          onChange={handleChange}
          required
        />
      </div>
      <div className="form-group">
        <label>Interpretado por:</label>
        <input
          type="text"
          name="interpretado_por"
          value={ficha.interpretado_por}
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <label>Descrição Física:</label>
        <textarea
          name="descricao_fisica"
          value={ficha.descricao_fisica}
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <label>Características:</label>
        <textarea
          name="caracteristicas"
          value={ficha.caracteristicas}
          onChange={handleChange}
        />
      </div>
      <button type="submit" disabled={submitting}>
        {submitting ? 'Salvando...' : 'Salvar Personagem'}
      </button>
    </form>
  );
}

export default FormularioPersonagem;