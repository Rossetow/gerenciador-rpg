import React, { useState, useEffect } from 'react';
import './Modal.css';

const defaultDados = {
    nome: '',
    descricao: '',
    quantidade: 1,
    peso: 0,
    valor: 0,
    efeitos: '',
    // Arma
    dano: '',
    tipo_dano: '',
    tipo_arma: '',
    habilidade_requerida: '',
    // Armadura
    valor_defesa: 0,
    localizacao: '',
    tipo_armadura: '',
    // Consumível / Poção
    usos: 1,
    efeito_uso: '',
    duracao: '',
    // Ferramenta
    bonus_habilidade: '',
    // Material
    qualidade: '',
    uso_craft: '',
    // Informação
    conteudo: '',
    idioma: '',
};

function ItemModal({ item, onSave, onClose }) {
    const [tipo, setTipo] = useState('Geral');
    const [dados, setDados] = useState(defaultDados);

    useEffect(() => {
        if (item && item.tipo) {
            setTipo(item.tipo);
            setDados({ ...defaultDados, ...(item.dados || {}) });
        } else {
            setTipo('Geral');
            setDados(defaultDados);
        }
    }, [item]);

    const handleChange = (e) => {
        const { name, value, type } = e.target;
        const val = type === 'number' ? parseFloat(value) || 0 : value;
        setDados(prev => ({ ...prev, [name]: val }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ tipo, dados });
    };

    const renderCommonFields = () => (
        <>
            <div className="form-group">
                <label>Nome do Item</label>
                <input name="nome" value={dados.nome} onChange={handleChange} required />
            </div>

            <div className="form-group">
                <label>Tipo</label>
                <select value={tipo} onChange={e => setTipo(e.target.value)}>
                    <option value="Geral">Geral</option>
                    <option value="Arma">Arma</option>
                    <option value="Armadura">Armadura</option>
                    <option value="Consumível">Consumível</option>
                    <option value="Poção">Poção</option>
                    <option value="Ferramenta">Ferramenta</option>
                    <option value="Material">Material</option>
                    <option value="Informação">Informação</option>
                    <option value="Outro">Outro</option>
                </select>
            </div>

            <div className="form-group">
                <label>Descrição</label>
                <textarea name="descricao" value={dados.descricao} onChange={handleChange} />
            </div>

            <div className="form-grid-3">
                <div className="form-group">
                    <label>Quantidade</label>
                    <input name="quantidade" type="number" value={dados.quantidade} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Peso</label>
                    <input name="peso" type="number" value={dados.peso} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Valor</label>
                    <input name="valor" type="number" value={dados.valor} onChange={handleChange} />
                </div>
            </div>
        </>
    );

    const renderArmaFields = () => (
        <>
            <div className="form-grid-3">
                <div className="form-group">
                    <label>Tipo de Arma</label>
                    <input name="tipo_arma" value={dados.tipo_arma || ''} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Habilidade</label>
                    <input name="habilidade_requerida" value={dados.habilidade_requerida || ''} onChange={handleChange} />
                </div>
                <div className="form-group">
                    <label>Dano</label>
                    <input name="dano" value={dados.dano || ''} onChange={handleChange} placeholder="ex: 1d8" />
                </div>
            </div>
            <div className="form-group">
                <label>Tipo de Dano</label>
                <input name="tipo_dano" value={dados.tipo_dano || ''} onChange={handleChange} placeholder="ex: cortante" />
            </div>
        </>
    );

    const renderArmaduraFields = () => (
        <div className="form-grid-3">
            <div className="form-group">
                <label>Valor de Defesa</label>
                <input name="valor_defesa" type="number" value={dados.valor_defesa || 0} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>Localização</label>
                <input name="localizacao" value={dados.localizacao || ''} onChange={handleChange} placeholder="ex: peito" />
            </div>
            <div className="form-group">
                <label>Tipo de Armadura</label>
                <input name="tipo_armadura" value={dados.tipo_armadura || ''} onChange={handleChange} placeholder="ex: leve" />
            </div>
        </div>
    );

    const renderConsumivelFields = () => (
        <div className="form-grid-2">
            <div className="form-group">
                <label>Usos</label>
                <input name="usos" type="number" value={dados.usos || 1} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>Efeito ao usar</label>
                <input name="efeito_uso" value={dados.efeito_uso || ''} onChange={handleChange} />
            </div>
        </div>
    );

    const renderPocaoFields = () => (
        <div className="form-grid-3">
            <div className="form-group">
                <label>Usos</label>
                <input name="usos" type="number" value={dados.usos || 1} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>Efeito ao usar</label>
                <input name="efeito_uso" value={dados.efeito_uso || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>Duração</label>
                <input name="duracao" value={dados.duracao || ''} onChange={handleChange} placeholder="ex: 1 hora" />
            </div>
        </div>
    );

    const renderFerramentaFields = () => (
        <div className="form-grid-2">
            <div className="form-group">
                <label>Habilidade Requerida</label>
                <input name="habilidade_requerida" value={dados.habilidade_requerida || ''} onChange={handleChange} />
            </div>
            <div className="form-group">
                <label>Bônus de Habilidade</label>
                <input name="bonus_habilidade" value={dados.bonus_habilidade || ''} onChange={handleChange} placeholder="ex: +2" />
            </div>
        </div>
    );

    const renderMaterialFields = () => (
        <div className="form-grid-2">
            <div className="form-group">
                <label>Qualidade</label>
                <input name="qualidade" value={dados.qualidade || ''} onChange={handleChange} placeholder="ex: bruto, refinado" />
            </div>
            <div className="form-group">
                <label>Uso de Craft</label>
                <input name="uso_craft" value={dados.uso_craft || ''} onChange={handleChange} placeholder="ex: Barra de Ferro" />
            </div>
        </div>
    );

    const renderInformacaoFields = () => (
        <>
            <div className="form-group">
                <label>Idioma</label>
                <input name="idioma" value={dados.idioma || ''} onChange={handleChange} placeholder="ex: Comum, Élfico" />
            </div>
            <div className="form-group">
                <label>Conteúdo</label>
                <textarea name="conteudo" value={dados.conteudo || ''} onChange={handleChange} placeholder="O texto ou informação do item..." rows={4} />
            </div>
        </>
    );

    const renderEfeitos = () => (
        <div className="form-group">
            <label>Efeitos (texto livre)</label>
            <textarea
                name="efeitos"
                value={dados.efeitos || ''}
                onChange={handleChange}
                placeholder="Ex: veneno: 1d4 por rodada&#10;luz: 10m"
            />
        </div>
    );

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{item?.tipo ? 'Editar Item' : 'Adicionar Item'}</h2>
                    <button onClick={onClose} className="modal-close-btn">&times;</button>
                </div>
                <form onSubmit={handleSubmit} className="modal-body">
                    {renderCommonFields()}
                    {tipo === 'Arma' && renderArmaFields()}
                    {tipo === 'Armadura' && renderArmaduraFields()}
                    {tipo === 'Consumível' && renderConsumivelFields()}
                    {tipo === 'Poção' && renderPocaoFields()}
                    {tipo === 'Ferramenta' && renderFerramentaFields()}
                    {tipo === 'Material' && renderMaterialFields()}
                    {tipo === 'Informação' && renderInformacaoFields()}
                    {tipo !== 'Informação' && renderEfeitos()}
                    <div className="btn-group">
                        <button type="submit" className="btn btn-primary">Salvar</button>
                        <button type="button" onClick={onClose} className="btn btn-link">Cancelar</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default ItemModal;
