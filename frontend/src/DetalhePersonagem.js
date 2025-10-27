import React from 'react';

// Este componente apenas recebe a 'ficha' e a exibe
function DetalhePersonagem({ ficha }) {
  if (!ficha) {
    return (
      <div className="section">
        <h2>Selecione um personagem da lista para ver os detalhes</h2>
      </div>
    );
  }

  return (
    <div className="section">
      <header className="App-header-detalhe">
        <h1>{ficha.nome_personagem}</h1>
        <p><i>Interpretado por: {ficha.interpretado_por}</i></p>
      </header>

      <div className="App-content">
        <div className="section-inner">
          <h2>Descrição</h2>
          <p>{ficha.descricao_fisica}</p>
          <h2>Características</h2>
          <p>{ficha.caracteristicas}</p>
        </div>

        <div className="stats-grid">
          <div className="section-inner">
            <h2>Atributos Principais</h2>
            <ul>
              {Object.entries(ficha.atributos).map(([key, value]) => (
                <li key={key}>
                  <strong>{key.replace(/_/g, ' ')}:</strong> {value}
                </li>
              ))}
            </ul>
          </div>

          <div className="section-inner">
            <h2>Habilidades</h2>
            <ul>
              {Object.entries(ficha.habilidades).map(([key, value]) => (
                <li key={key}>
                  <strong>{key.replace(/_/g, ' ')}:</strong> {value}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="section-inner">
        <h2>Inventário</h2>
        {/* Checamos primeiro se 'ficha.inventario' existe (não é undefined ou null)
            E DEPOIS checamos seu tamanho.
        */}
        {(!ficha.inventario || ficha.inventario.length === 0) ? (
            <p>Inventário vazio.</p>
        ) : (
            ficha.inventario.map((item) => (
            <div key={item.nome} className="item-card">
                <h3>{item.nome} ({item.tipo})</h3>
                <p>{item.descricao}</p>
                <span>Qtd: {item.quantidade}</span>
                <span>Peso: {item.peso}</span>
                <span>Valor: {item.valor}</span>
                {item.efeitos && Object.entries(item.efeitos).map(([key, value]) => (
                <small key={key}><i>{key}: {value}</i></small>
                ))}
            </div>
            ))
        )}
        </div>
      </div>
    </div>
  );
}

export default DetalhePersonagem;