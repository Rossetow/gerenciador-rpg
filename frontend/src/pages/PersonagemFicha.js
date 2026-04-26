import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    apiGetPersonagemById,
    apiGetCampanhaById,
    apiUpdatePersonagem,
    apiDeletePersonagem,
    apiAddItem,
    apiUpdateItem,
    apiDeleteItem,
    apiUploadPersonagemImagem,
} from '../api/api';
import { useAuth } from '../context/AuthContext';
import ItemModal from '../components/ItemModal';

// --- Componente do Inventário ---
// (Movido para este arquivo para simplificar a passagem de props e estado)
function Inventario({ personagem, onInventoryChange, podeEditar }) {
    const [newItem, setNewItem] = useState({
        nome: '',
        tipo: 'Geral',
        quantidade: 1,
        descricao: '',
        peso: 0,
        valor: 0,
        efeitosTexto: '',
        // Campos opcionais por tipo
        dano: '',
        tipo_dano: '',
        habilidade_requerida: '',
        valor_defesa: 0,
        localizacao: ''
    });

    const handleAddItem = async () => {
        if (!newItem.nome.trim()) {
            alert('O nome do item é obrigatório.');
            return;
        }

        // Converte efeitosTexto em mapa { chave: valor }
        const efeitos = {};
        if (newItem.efeitosTexto && newItem.efeitosTexto.trim()) {
            newItem.efeitosTexto.split('\n').forEach(linha => {
                const idx = linha.indexOf(':');
                if (idx > -1) {
                    const k = linha.slice(0, idx).trim();
                    const v = linha.slice(idx + 1).trim();
                    if (k) efeitos[k] = v;
                }
            });
        }

        // Monta payload com campos comuns
        const payload = {
            nome: newItem.nome.trim(),
            tipo: newItem.tipo,
            descricao: newItem.descricao || '',
            quantidade: parseInt(newItem.quantidade, 10) || 1,
            peso: parseFloat(newItem.peso) || 0,
            valor: parseInt(newItem.valor, 10) || 0,
        };

        if (Object.keys(efeitos).length > 0) {
            payload.efeitos = efeitos;
        }

        // Campos específicos por tipo (opcionais)
        if (newItem.tipo === 'Arma') {
            if (newItem.dano) payload.dano = newItem.dano;
            if (newItem.tipo_dano) payload.tipo_dano = newItem.tipo_dano;
            if (newItem.habilidade_requerida) payload.habilidade_requerida = newItem.habilidade_requerida;
        } else if (newItem.tipo === 'Armadura') {
            const vd = parseInt(newItem.valor_defesa, 10);
            if (!isNaN(vd) && vd > 0) payload.valor_defesa = vd;
            if (newItem.localizacao) payload.localizacao = newItem.localizacao;
        }

        try {
            await apiAddItem(personagem.id, payload);
            // Recarrega o personagem para refletir o inventário atualizado
            onInventoryChange();
            // Reset do formulário
            setNewItem({
                nome: '',
                tipo: 'Geral',
                quantidade: 1,
                descricao: '',
                peso: 0,
                valor: 0,
                efeitosTexto: '',
                dano: '',
                tipo_dano: '',
                habilidade_requerida: '',
                valor_defesa: 0,
                localizacao: ''
            });
        } catch (error) {
            alert(`Erro ao adicionar item: ${error.message}`);
        }
    };
    
    const handleDeleteItem = async (itemName) => {
        if (window.confirm(`Tem certeza que quer deletar o item "${itemName}"?`)) {
            try {
                await apiDeleteItem(personagem.id, itemName);
                onInventoryChange(); // Re-busca o personagem
            } catch (error) {
                alert(`Erro ao deletar item: ${error.message}`);
            }
        }
    };

    // Modal de criação de item
    const [showAdd, setShowAdd] = useState(false);
    const handleSaveNewItem = async (formData) => {
        // Converte efeitosTexto em mapa { chave: valor }
        const efeitos = {};
        if (formData.efeitosTexto && String(formData.efeitosTexto).trim()) {
            String(formData.efeitosTexto).split('\n').forEach((linha) => {
                const idx = linha.indexOf(':');
                if (idx > -1) {
                    const k = linha.slice(0, idx).trim();
                    const v = linha.slice(idx + 1).trim();
                    if (k) efeitos[k] = v;
                }
            });
        }

        const payload = {
            nome: String(formData.nome || '').trim(),
            tipo: formData.tipo || 'Geral',
            descricao: formData.descricao || '',
            quantidade: parseInt(formData.quantidade, 10) || 1,
            peso: parseFloat(formData.peso) || 0,
            valor: parseInt(formData.valor, 10) || 0,
        };
        if (Object.keys(efeitos).length > 0) {
            payload.efeitos = efeitos;
        }
        if (payload.tipo === 'Arma') {
            if (formData.dano) payload.dano = formData.dano;
            if (formData.tipo_dano) payload.tipo_dano = formData.tipo_dano;
            if (formData.habilidade_requerida) payload.habilidade_requerida = formData.habilidade_requerida;
        } else if (payload.tipo === 'Armadura') {
            const vd = parseInt(formData.valor_defesa, 10);
            if (!isNaN(vd) && vd > 0) payload.valor_defesa = vd;
            if (formData.localizacao) payload.localizacao = formData.localizacao;
        }

        try {
            await apiAddItem(personagem.id, payload);
            setShowAdd(false);
            onInventoryChange();
        } catch (error) {
            alert(`Erro ao adicionar item: ${error.message}`);
        }
    };


    return (
        <div className="card-inset">
            <h3>Inventário</h3>
            {podeEditar && (
                <>
                    <div className="btn-group">
                        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>Adicionar Item</button>
                    </div>
                    {showAdd && (
                        <ItemModal
                            item={{}}
                            index={null}
                            onSave={handleSaveNewItem}
                            onClose={() => setShowAdd(false)}
                        />
                    )}
                </>
            )}
            <ul className="inventario-list">
                {(personagem.inventario || []).map((item, index) => (
                    <li key={index} className="inventario-item">
                        <div className="flex-row space-between">
                            <div>
                                <span className="item-name">{item.nome} (x{item.quantidade})</span>
                                <div className="item-meta">
                                    {item.tipo && <small> Tipo: {item.tipo} </small>}
                                    {typeof item.peso !== 'undefined' && <small> • Peso: {item.peso} </small>}
                                    {typeof item.valor !== 'undefined' && <small> • Preço: {item.valor} </small>}
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
                            {podeEditar && (
                                <button onClick={() => handleDeleteItem(item.nome)} className="btn btn-sm btn-delete">X</button>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}


// --- Componente Principal da Ficha ---
function PersonagemFicha() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, userType } = useAuth();
    
    const [personagem, setPersonagem] = useState(null);
    const [campanha, setCampanha] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [uploadingImage, setUploadingImage] = useState(false);

    const handleUploadImage = async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        try {
            setUploadingImage(true);
            const resp = await apiUploadPersonagemImagem(id, file);
            setPersonagem(prev => ({ ...prev, imagem_url: resp.imagem_url }));
        } catch (err) {
            alert(`Falha ao enviar imagem: ${err.message}`);
        } finally {
            setUploadingImage(false);
            e.target.value = '';
        }
    };

    const fetchPersonagemData = useCallback(async () => {
        try {
            const personagemData = await apiGetPersonagemById(id);
            if (!personagemData.inventario) personagemData.inventario = [];
            setPersonagem(personagemData);

            const campanhaData = await apiGetCampanhaById(personagemData.campanha_id);
            setCampanha(campanhaData);
        } catch (err) {
            setError("Não foi possível carregar a ficha do personagem.");
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        fetchPersonagemData();
    }, [fetchPersonagemData]);

    // Modo de edição da ficha (ativado por botão Editar)
    const [editMode, setEditMode] = useState(false);
    const [draft, setDraft] = useState(null);

    const handleFieldChange = (mapName, key, value) => {
        // Atualiza apenas o rascunho durante a edição
        setDraft(prev => ({
            ...prev,
            [mapName]: {
                ...(prev?.[mapName] || {}),
                [key]: value,
            },
        }));
    };

    const handleNumberChange = (mapName, key, value) => {
        handleFieldChange(mapName, key, parseInt(value, 10) || 0);
    };

    // Atualiza campos numéricos no topo do Personagem (ex.: vida, vida_maxima)
    const handleTopNumberChange = (key, value) => {
        const n = parseInt(value, 10);
        const safe = isNaN(n) ? 0 : n;
        setDraft(prev => ({
            ...prev,
            [key]: safe,
        }));
    };
    
    const handleDeleteCharacter = async () => {
        if(window.confirm(`Tem certeza que quer apagar ${personagem.nome}? Esta ação é irreversível.`)) {
            try {
                await apiDeletePersonagem(id);
                alert("Personagem apagado com sucesso.");
                navigate('/jogador'); // Volta para o dashboard do jogador
            } catch (err) {
                alert(`Erro ao apagar personagem: ${err.message}`);
            }
        }
    }

    const podeEditar = user && (user.id === personagem?.jogador_id || userType === 'mestre');
    const model = editMode && draft ? draft : personagem;

    if (loading) return <p className="text-muted">Carregando ficha...</p>;
    if (error) return <p className="text-danger">{error}</p>;
    if (!personagem || !campanha) return <p>Personagem ou campanha não encontrados.</p>;

    return (
        <div className="card">
            <div className="avatar-container">
                <img
                    className="avatar"
                    src={personagem.imagem_url ? `http://localhost:8080${personagem.imagem_url}` : 'https://via.placeholder.com/96?text=Avatar'}
                    alt={`Avatar de ${personagem.nome}`}
                />
                <div>
                    <h2>Ficha de {personagem.nome}</h2>
                    <small>Campanha: {campanha.nome}</small>
                    <div className="btn-group mt-05">
                        <label className="btn btn-outline" htmlFor="personagem-image-upload">
                            {uploadingImage ? 'Enviando...' : 'Alterar imagem'}
                        </label>
                        <input
                            id="personagem-image-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleUploadImage}
                            disabled={uploadingImage}
                            className="visually-hidden-file"
                        />
                    </div>
                </div>
            </div>

            <div className="card-inset">
                <h4>Vital</h4>
                <div className="form-group-inline">
                    <label>Vida Atual</label>
                    <input
                        type="text"
                        value={model.vida ?? 0}
                        onChange={e => handleTopNumberChange('vida', e.target.value)}
                        readOnly={!(podeEditar && editMode)}
                    />
                </div>
                <div className="form-group-inline">
                    <label>Vida Máxima</label>
                    <input
                        type="text"
                        value={model.vida_maxima ?? 0}
                        onChange={e => handleTopNumberChange('vida_maxima', e.target.value)}
                        readOnly={!(podeEditar && editMode)}
                    />
                </div>
            </div>

            {podeEditar && (
                <div className="toolbar">
                    {!editMode ? (
                        <button className="btn btn-secondary" onClick={() => {
                            setDraft(personagem);
                            setEditMode(true);
                        }}>Editar</button>
                    ) : (
                        <div className="btn-group">
                            <button className="btn btn-primary" onClick={async () => {
                                try {
                                    await apiUpdatePersonagem(model.id, draft);
                                    setEditMode(false);
                                    await fetchPersonagemData();
                                } catch (e) {
                                    alert(`Erro ao salvar: ${e.message}`);
                                }
                            }}>Salvar</button>
                            <button className="btn btn-outline" onClick={() => {
                                setDraft(personagem);
                                setEditMode(false);
                            }}>Cancelar</button>
                        </div>
                    )}
                </div>
            )}

            <div className="stats-grid">
                {/* Atributos Base */}
                <div className="card-inset">
                    <h4>Atributos Base</h4>
                    {(campanha.template_atributos_base || []).map(key => (
                        <div className="form-group-inline" key={key}>
                            <label>{key}</label>
                            <input
                                type="text"
                                value={model.atributos_base?.[key] || 0}
                                onChange={e => handleNumberChange('atributos_base', key, e.target.value)}
                                readOnly={!(podeEditar && editMode)}
                            />
                        </div>
                    ))}
                </div>

                {/* Habilidades */}
                <div className="card-inset">
                    <h4>Habilidades</h4>
                    {(campanha.template_habilidades || []).map(key => (
                        <div className="form-group-inline" key={key}>
                            <label>{key}</label>
                            <input
                                type="text"
                                value={model.habilidades?.[key] || 0}
                                onChange={e => handleNumberChange('habilidades', key, e.target.value)}
                                readOnly={!(podeEditar && editMode)}
                            />
                        </div>
                    ))}
                </div>

                {/* Outros */}
                <div className="card-inset">
                    <h4>Outros</h4>
                    {(campanha.template_outros || []).map(key => (
                        <div className="form-group-inline" key={key}>
                            <label>{key}</label>
                            <input
                                type="text"
                                value={model.outros?.[key] || 0}
                                onChange={e => handleNumberChange('outros', key, e.target.value)}
                                readOnly={!(podeEditar && editMode)}
                            />
                        </div>
                    ))}
                </div>
            </div>

            <hr />
            
            <Inventario 
                personagem={personagem} 
                onInventoryChange={fetchPersonagemData} // Re-busca os dados para ter o inventário mais recente
                podeEditar={podeEditar}
            />

            {podeEditar && (
                <div className="card-inset danger-zone">
                    <h4>Zona de Perigo</h4>
                    <button onClick={handleDeleteCharacter} className="btn btn-delete">
                        Apagar Personagem Permanentemente
                    </button>
                </div>
            )}
        </div>
    );
}

export default PersonagemFicha;
