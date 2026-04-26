// /src/api/api.js

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// --- Auth helpers ---

export const setUserData = (userData) => {
    localStorage.setItem('userData', JSON.stringify(userData));
};

export const getUserData = () => {
    try {
        return JSON.parse(localStorage.getItem('userData'));
    } catch (e) {
        return null;
    }
};

export const clearAuthData = () => {
    localStorage.removeItem('userData');
};

// --- Core fetch wrapper ---

const apiFetch = async (endpoint, options = {}) => {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if (options.body) {
        options.body = JSON.stringify(options.body);
    }

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || response.statusText || 'Erro desconhecido na API');
        }

        if (response.status === 204) return null;

        return response.json();
    } catch (error) {
        console.error('Erro na chamada da API:', error);
        throw error;
    }
};

// --- Auth ---

export const apiLoginJogador = async (credentials) => {
    const data = await apiFetch('/jogador/login', { method: 'POST', body: credentials });
    setUserData({ ...data, userType: 'jogador' });
    return data;
};

export const apiCadastroJogador = async (jogadorData) => {
    const data = await apiFetch('/jogador/cadastro', { method: 'POST', body: jogadorData });
    setUserData({ ...data, userType: 'jogador' });
    return data;
};

export const apiLoginMestre = async (credentials) => {
    const data = await apiFetch('/mestre/login', { method: 'POST', body: credentials });
    setUserData({ ...data, userType: 'mestre' });
    return data;
};

export const apiCadastroMestre = async (mestreData) => {
    const data = await apiFetch('/mestre/cadastro', { method: 'POST', body: mestreData });
    setUserData({ ...data, userType: 'mestre' });
    return data;
};

// --- Jogadores ---

export const apiGetAllJogadores = () => apiFetch('/api/jogadores');

export const apiGetJogadorById = (id) => apiFetch(`/api/jogadores/${encodeURIComponent(id)}`);

// --- Campanhas ---

export const apiGetCampanhaById = (id) =>
    apiFetch(`/api/campanhas/${encodeURIComponent(id)}`);

export const apiGetCampanhasByMestre = (mestreId) =>
    apiFetch(`/api/campanhas/mestre/${encodeURIComponent(mestreId)}`);

export const apiGetCampanhasByJogador = (jogadorId) =>
    apiFetch(`/api/campanhas/jogador/${encodeURIComponent(jogadorId)}`);

export const apiGetJogadoresPorCampanha = (campanhaId) =>
    apiFetch(`/api/campanhas/${encodeURIComponent(campanhaId)}/jogadores`);

export const apiAdicionarJogador = (campanhaId, jogadorId) =>
    apiFetch(`/api/campanhas/${campanhaId}/jogadores`, {
        method: 'POST',
        body: { jogador_id: jogadorId },
    });

export const apiRemoverJogador = (campanhaId, jogadorId) =>
    apiFetch(`/api/campanhas/${encodeURIComponent(campanhaId)}/jogadores/${encodeURIComponent(jogadorId)}`, {
        method: 'DELETE',
    });

export const apiCreateCampanha = (data) =>
    apiFetch('/api/campanhas', { method: 'POST', body: data });

export const apiUpdateCampanhaTemplate = (id, templateData) =>
    apiFetch(`/api/campanhas/${id}/template`, { method: 'PUT', body: templateData });

export const apiGetPersonagensByCampanha = (campanhaId) =>
    apiFetch(`/api/campanhas/${encodeURIComponent(campanhaId)}/personagens`);

export const apiGetPersonagensByCampanhaJogador = (campanhaId, jogadorId) =>
    apiFetch(`/api/campanhas/${encodeURIComponent(campanhaId)}/jogador/${encodeURIComponent(jogadorId)}`);

// --- Personagens ---

export const apiGetPersonagensByJogador = (jogadorId) =>
    apiFetch(`/api/personagens/jogador/${encodeURIComponent(jogadorId)}`);

export const apiGetPersonagemById = (id) =>
    apiFetch(`/api/personagens/${encodeURIComponent(id)}`);

export const apiCreatePersonagem = (data) =>
    apiFetch('/api/personagens', { method: 'POST', body: data });

export const apiUpdatePersonagem = (id, data) =>
    apiFetch(`/api/personagens/${encodeURIComponent(id)}`, { method: 'PUT', body: data });

export const apiDeletePersonagem = (id) =>
    apiFetch(`/api/personagens/${encodeURIComponent(id)}`, { method: 'DELETE' });

// --- Itens ---
// Item shape sent to the API: { campanha_id, personagem_id (optional), tipo, dados: { nome, descricao, ... } }
// Item shape received from the API: { id, campanha_id, personagem_id, tipo, dados: { ... } }

export const apiGetItensByPersonagem = (personagemId) =>
    apiFetch(`/api/personagens/${encodeURIComponent(personagemId)}/itens`);

export const apiGetItensByCampanha = (campanhaId) =>
    apiFetch(`/api/campanhas/${encodeURIComponent(campanhaId)}/itens`);

// itemData = { campanha_id, personagem_id (optional), tipo, dados }
export const apiAddItem = (itemData) =>
    apiFetch(`/api/personagens/${encodeURIComponent(itemData.personagem_id || '')}/itens`, {
        method: 'POST',
        body: itemData,
    });

// Uses item UUID — no longer name-based
export const apiUpdateItem = (personagemId, itemId, tipo, dados) =>
    apiFetch(`/api/personagens/${encodeURIComponent(personagemId)}/itens`, {
        method: 'PUT',
        body: { id: itemId, tipo, dados },
    });

export const apiDeleteItem = (personagemId, itemId) =>
    apiFetch(`/api/personagens/${encodeURIComponent(personagemId)}/itens/delete`, {
        method: 'DELETE',
        body: { id: itemId },
    });

// --- Imagem ---

export const apiUploadPersonagemImagem = async (id, file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${BASE_URL}/api/personagens/${encodeURIComponent(id)}/imagem`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || response.statusText || 'Falha no upload da imagem');
    }
    return response.json(); // { imagem_url: string }
};
