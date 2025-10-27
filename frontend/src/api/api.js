// /src/api/api.js
// Conexão real com a API Go.

// --- Configuração ---
// Altere esta URL se o seu backend Go rodar em uma porta diferente.
const BASE_URL = 'http://localhost:8080';

// --- Helpers de Autenticação ---

/**
 * Salva o token JWT no localStorage.
 * @param {string} token
 */
const setAuthToken = (token) => {
    localStorage.setItem('authToken', token);
};

/**
 * Pega o token JWT do localStorage.
 * @returns {string | null}
 */
const getAuthToken = () => {
    return localStorage.getItem('authToken');
};

/**
 * Remove o token do localStorage (para logout).
 */
export const clearAuthToken = () => {
    localStorage.removeItem('authToken');
};

// --- Helper Principal de Fetch ---

/**
 * Função central para fazer chamadas à API.
 * Gerencia automaticamente a URL base, headers JSON e token de autenticação.
 * @param {string} endpoint O caminho do endpoint (ex: '/api/campanhas')
 * @param {RequestInit} options Opções do Fetch (method, body, etc.)
 * @returns {Promise<any>} O JSON da resposta
 */
const apiFetch = async (endpoint, options = {}) => {
    const token = getAuthToken();

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    // Adiciona o token de autorização se existir e a rota for da API
    if (token && endpoint.startsWith('/api')) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Converte o body para JSON se ele existir
    if (options.body) {
        options.body = JSON.stringify(options.body);
    }

    try {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            ...options,
            headers,
        });

        // Trata erros da API
        if (!response.ok) {
            // Tenta pegar a mensagem de erro do corpo da resposta
            const errorData = await response.json().catch(() => ({}));
            const errorMessage = errorData.error || response.statusText || 'Erro desconhecido na API';
            throw new Error(errorMessage);
        }

        // Trata respostas sem conteúdo (ex: DELETE)
        if (response.status === 204) {
            return null;
        }

        // Retorna o JSON da resposta
        return response.json();

    } catch (error) {
        console.error('Erro na chamada da API:', error);
        throw error; // Propaga o erro para quem chamou
    }
};

// --- Funções da API (Mapeadas do router.go) ---

// --- API de Autenticação ---
// NOTA: As funções de login agora esperam um objeto {email, senha}
// e salvam o token recebido.

export const apiLoginJogador = async (credentials) => {
    const data = await apiFetch('/jogador/login', {
        method: 'POST',
        body: credentials,
    });
    if (data.token) {
        setAuthToken(data.token);
    }
    return data; 
}
export const apiCadastroJogador = (jogadorData) => {
    return apiFetch('/jogador/cadastro', {
        method: 'POST',
        body: jogadorData,
    });
};

export const apiLoginMestre = async (credentials) => {
    const data = await apiFetch('/mestre/login', {
        method: 'POST',
        body: credentials,
    });
    if (data.token) {
        setAuthToken(data.token);
    }
    return data; 
};

export const apiCadastroMestre = (mestreData) => {
    return apiFetch('/mestre/cadastro', {
        method: 'POST',
        body: mestreData,
    });
};


// --- API de Campanhas ---

export const apiGetCampanhas = () => {
    return apiFetch('/api/campanhas'); // GET é o padrão
};

export const apiGetCampanhaById = (id) => {
    return apiFetch(`/api/campanhas/${id}`);
};

export const apiGetCampanhasByMestre = (mestreId) => {
    return apiFetch(`/api/campanhas/mestre/${mestreId}`);
};

export const apiCreateCampanha = (data) => {
    // data = { nome: "...", descricao: "...", mestre_id: "..." }
    // O mestre_id provavelmente virá do token no backend, mas mantendo caso seja explícito
    return apiFetch('/api/campanhas', {
        method: 'POST',
        body: data,
    });
};

/**
 * ATENÇÃO: Seu router.go tem um endpoint para ATUALIZAR O TEMPLATE,
 * não a campanha inteira como o mock fazia.
 * @param {string} id - ID da Campanha
 * @param {object} templateData - O objeto de template
 */
export const apiUpdateCampanhaTemplate = (id, templateData) => {
    return apiFetch(`/api/campanhas/${id}/template`, {
        method: 'PUT',
        body: templateData,
    });
};

export const apiGetPersonagensByCampanha = (campanhaId) => {
    return apiFetch(`/api/campanhas/${campanhaId}/personagens`);
};

export const apiGetPersonagensByCampanhaJogador = (campanhaId, jogadorId) => {
    return apiFetch(`/api/campanhas/${campanhaId}/jogador/${jogadorId}`);
};


// --- API de Personagens ---

export const apiGetPersonagensByJogador = (jogadorId) => {
    return apiFetch(`/api/personagens/jogador/${jogadorId}`);
};

export const apiGetPersonagemById = (id) => {
    return apiFetch(`/api/personagens/${id}`);
};

export const apiCreatePersonagem = (data) => {
    return apiFetch('/api/personagens', {
        method: 'POST',
        body: data,
    });
};

export const apiUpdatePersonagem = (id, data) => {
    return apiFetch(`/api/personagens/${id}`, {
        method: 'PUT',
        body: data,
    });
};

export const apiDeletePersonagem = (id) => {
    return apiFetch(`/api/personagens/${id}`, {
        method: 'DELETE',
    });
};


// --- API de Itens (Novo) ---

export const apiGetItensByPersonagem = (personagemId) => {
    return apiFetch(`/api/personagens/${personagemId}/itens`);
};

export const apiAddItem = (personagemId, itemData) => {
    return apiFetch(`/api/personagens/${personagemId}/itens`, {
        method: 'POST',
        body: itemData,
    });
};

export const apiUpdateItem = (personagemId, itemData) => {
    return apiFetch(`/api/personagens/${personagemId}/itens`, {
        method: 'PUT',
        body: itemData,
    });
};

export const apiDeleteItem = (personagemId, itemData) => {
    return apiFetch(`/api/personagens/${personagemId}/itens`, {
        method: 'DELETE',
        body: itemData, // O ID do item a ser deletado vai no corpo
    });
};