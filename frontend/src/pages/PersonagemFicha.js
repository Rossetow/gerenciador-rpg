import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    apiGetPersonagemById,
    apiGetCampanhaById,
    apiUpdatePersonagem,
    apiDeletePersonagem,
    apiGetItensByPersonagem,
    apiAddItem,
    apiUpdateItem,
    apiDeleteItem,
    apiUploadPersonagemImagem,
} from '../api/api';
import { useAuth } from '../context/AuthContext';
import ItemModal from '../components/ItemModal';

// --- Componente do Inventário ---
function Inventario({ personagem, campanha, itens, onInventoryChange, podeEditar }) {
    const [showAdd, setShowAdd] = useState(false);
    const [editingItem, setEditingItem] = useState(null); // { item, index }

    const handleSaveItem = async (formData) => {
        const { tipo, dados } = formData;
        try {
            if (editingItem) {
                await apiUpdateItem(personagem.id, editingItem.item.id, tipo, dados);
                setEditingItem(null);
            } else {
                await apiAddItem({
                    campanha_id: personagem.campanha_id,
                    personagem_id: personagem.id,
                    tipo,
                    dados,
                });
                setShowAdd(false);
            }
            onInventoryChange();
        } catch (error) {
            alert(`Erro ao salvar item: ${error.message}`);
        }
    };

    const handleDeleteItem = async (item) => {
        if (window.confirm(`Tem certeza que quer deletar "${item.dados?.nome || 'este item'}"?`)) {
            try {
                await apiDeleteItem(personagem.id, item.id);
                onInventoryChange();
            } catch (error) {
                alert(`Erro ao deletar item: ${error.message}`);
            }
        }
    };

    return (
        <div className="card-inset">
            <h3>Inventário</h3>
            {podeEditar && (
                <div className="btn-group">
                    <button className="btn btn-primary" onClick={() => setShowAdd(true)}>Adicionar Item</button>
                </div>
            )}
            {showAdd && (
                <ItemModal
                    item={{}}
                    onSave={handleSaveItem}
                    onClose={() => setShowAdd(false)}
                />
            )}
            {editingItem && (
                <ItemModal
                    item={editingItem.item}
                    onSave={handleSaveItem}
                    onClose={() => setEditingItem(null)}
                />
            )}
            <ul className="inventario-list">
                {(itens || []).map((item, index) => {
                    const d = item.dados || {};
                    return (
                        <li key={item.id || index} className="inventario-item">
                            <div className="flex-row space-between">
                                <div>
                                    <span className="item-name">{d.nome} (x{d.quantidade ?? 1})</span>
                                    <div className="item-meta">
                                        {item.tipo && <small> Tipo: {item.tipo} </small>}
                                        {typeof d.peso !== 'undefined' && <small> • Peso: {d.peso} </small>}
                                        {typeof d.valor !== 'undefined' && <small> • Preço: {d.valor} </small>}
                                    </div>
                                    {d.descricao && <p>{d.descricao}</p>}
                                    {item.tipo === 'Arma' && d.dano && (
                                        <small>Dano: {d.dano}{d.tipo_dano ? ` (${d.tipo_dano})` : ''}{d.habilidade_requerida ? ` • Habilidade: ${d.habilidade_requerida}` : ''}</small>
                                    )}
                                    {item.tipo === 'Armadura' && d.valor_defesa > 0 && (
                                        <small>Defesa: +{d.valor_defesa}{d.localizacao ? ` • Localização: ${d.localizacao}` : ''}</small>
                                    )}
                                    {(item.tipo === 'Consumível' || item.tipo === 'Poção') && d.efeito_uso && (
                                        <small>Efeito: {d.efeito_uso}{d.duracao ? ` (${d.duracao})` : ''}</small>
                                    )}
                                    {item.tipo === 'Informação' && d.conteudo && (
                                        <p><small>{d.conteudo}</small></p>
                                    )}
                                    {d.efeitos && <p><small>Efeitos: {d.efeitos}</small></p>}
                                </div>
                                {podeEditar && (
                                    <div className="btn-group">
                                        <button onClick={() => setEditingItem({ item, index })} className="btn btn-sm btn-secondary">Editar</button>
                                        <button onClick={() => handleDeleteItem(item)} className="btn btn-sm btn-delete">X</button>
                                    </div>
                                )}
                            </div>
                        </li>
                    );
                })}
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
    const [itens, setItens] = useState([]);
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
            const [personagemData, itensData] = await Promise.all([
                apiGetPersonagemById(id),
                apiGetItensByPersonagem(id),
            ]);
            setPersonagem(personagemData);
            setItens(itensData || []);

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

    const [editMode, setEditMode] = useState(false);
    const [draft, setDraft] = useState(null);

    const handleFieldChange = (mapName, key, value) => {
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

    const handleTopNumberChange = (key, value) => {
        const n = parseInt(value, 10);
        setDraft(prev => ({ ...prev, [key]: isNaN(n) ? 0 : n }));
    };

    const handleDeleteCharacter = async () => {
        if (window.confirm(`Tem certeza que quer apagar ${personagem.nome}? Esta ação é irreversível.`)) {
            try {
                await apiDeletePersonagem(id);
                alert("Personagem apagado com sucesso.");
                navigate('/jogador');
            } catch (err) {
                alert(`Erro ao apagar personagem: ${err.message}`);
            }
        }
    };

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
                    src={personagem.imagem_url || 'https://via.placeholder.com/96?text=Avatar'}
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
                campanha={campanha}
                itens={itens}
                onInventoryChange={fetchPersonagemData}
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
