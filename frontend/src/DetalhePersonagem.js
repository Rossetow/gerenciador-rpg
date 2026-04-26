import React from 'react';

// Este componente apenas recebe a 'ficha' e a exibe
function DetalhePersonagem({ ficha }) {
  if (!ficha) {
    return (
      <div className="card">
        <h2>Detalhe do Personagem</h2>
        <small>Selecione um personagem da lista para ver os detalhes.</small>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="avatar-container">
        <img
          className="avatar"
          src={ficha.imagem_url ? `http://localhost:8080${ficha.imagem_url}` : 'https://via.placeholder.com/96?text=Avatar'}
          alt={`Avatar de ${ficha.nome_personagem}`}
        />
        <div>
          <h2>{ficha.nome_personagem}</h2>
          <small>Interpretado por: {ficha.interpretado_por}</small>
        </div>
      </div>

      <div className="card-inset">
        <h4>Descrição</h4>
        <p>{ficha.descricao_fisica}</p>
      </div>

      <div className="card-inset">
        <h4>Características</h4>
        <p>{ficha.caracteristicas}</p>
      </div>

      <div className="stats-grid">
        <div className="card-inset">
          <h4>Atributos Principais</h4>
          <ul className="template-list">
            {Object.entries(ficha.atributos).map(([key, value]) => (
              <li className="template-item" key={key}>
                <span className="item-name">{key.replace(/_/g, ' ')}</span>
                <span className="item-value">{value}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card-inset">
          <h4>Habilidades</h4>
          <ul className="template-list">
            {Object.entries(ficha.habilidades).map(([key, value]) => (
              <li className="template-item" key={key}>
                <span className="item-name">{key.replace(/_/g, ' ')}</span>
                <span className="item-value">{value}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="inventario-container">
        <h3>Inventário</h3>
        {(!ficha.inventario || ficha.inventario.length === 0) ? (
          <p className="empty-list">Inventário vazio.</p>
        ) : (
          <ul className="inventario-list">
            {ficha.inventario.map((item) => (
              <li key={item.nome} className="inventario-item">
                <div className="flex-row space-between">
                  <div>
                    <span className="item-name">{item.nome} ({item.tipo || 'Geral'})</span>
                    <div className="item-meta">
                      {typeof item.quantidade !== 'undefined' && <small> Qtd: {item.quantidade} </small>}
                      {typeof item.peso !== 'undefined' && <small> • Peso: {item.peso} </small>}
                      {typeof item.valor !== 'undefined' && <small> • Valor: {item.valor} </small>}
                    </div>
                    {item.descricao && <p>{item.descricao}</p>}
                    {item.dano && (
                      <small>Dano: {item.dano}{item.tipo_dano ? ` (${item.tipo_dano})` : ''}{item.habilidade_requerida ? ` • Habilidade: ${item.habilidade_requerida}` : ''}</small>
                    )}
                    {typeof item.valor_defesa !== 'undefined' && item.valor_defesa > 0 && (
                      <small> Defesa: +{item.valor_defesa}{item.localizacao ? ` • Localização: ${item.localizacao}` : ''}</small>
                    )}
                    {item.efeitos && typeof item.efeitos === 'object' && (
                      <ul className="mt-05">
                        {Object.entries(item.efeitos).map(([k, v]) => (
                          <li key={k}><small>{k}: {String(v)}</small></li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default DetalhePersonagem;
