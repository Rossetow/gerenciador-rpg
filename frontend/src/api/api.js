// /src/api/api.js
// Conexão real com a API Go.

// --- Configuração ---
// No ambiente Docker, o frontend acessará o backend pelo nome do serviço.
// A porta 8080 é a porta interna do container do backend.
const BASE_URL = 'http://localhost:8080';

// --- Helpers de "Autenticação" ---
// O backend atual não usa tokens, então apenas guardamos os dados do usuário.

/**
 * Salva os dados do usuário logado no localStorage.
 * @param {object} userData
 */
const setUserData = (userData) => {
    localStorage.setItem('userData', JSON.stringify(userData));
};

/**
 * Pega os dados do usuário do localStorage.
 * @returns {object | null}
 */
export const getUserData = () => {
    try {
        return JSON.parse(localStorage.getItem('userData'));
    } catch (e) {
        return null;
    }
};

/**
 * Remove os dados do usuário do localStorage (para logout).
 */
export const clearAuthData = () => {
    localStorage.removeItem('userData');
};


// --- Helper Principal de Fetch ---

/**
 * Função central para fazer chamadas à API.
 * @param {string} endpoint O caminho do endpoint (ex: '/api/campanhas')
 * @param {RequestInit} options Opções do Fetch (method, body, etc.)
 * @returns {Promise<any>} O JSON da resposta
 */
const apiFetch = async (endpoint, options = {}) => {
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

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

// --- API de "Autenticação" ---
// O login é feito apenas com o 'nome'

export const apiLoginJogador = async (credentials) => {
    // credentials é esperado como { nome: '...' }
    const data = await apiFetch('/jogador/login', {
        method: 'POST',
        body: credentials,
    });
    setUserData({ ...data, userType: 'jogador' }); // Salva os dados do jogador
    return data;
};

export const apiCadastroJogador = (jogadorData) => {
    // jogadorData é esperado como { nome: '...' }
    return apiFetch('/jogador/cadastro', {
        method: 'POST',
        body: jogadorData,
    });
};

export const apiLoginMestre = async (credentials) => {
    // credentials é esperado como { nome: '...' }
    const data = await apiFetch('/mestre/login', {
        method: 'POST',
        body: credentials,
    });
    setUserData({ ...data, userType: 'mestre' }); // Salva os dados do mestre
    return data;
};

export const apiCadastroMestre = (mestreData) => {
    return apiFetch('/mestre/cadastro', {
        method: 'POST',
        body: mestreData,
    });
};

// --- API de Jogadores ---

export const apiGetAllJogadores = () => {
    return apiFetch('/api/jogadores');
};

export const apiGetJogadorById = (id) => {
    return apiFetch(`/api/jogadores/${encodeURIComponent(id)}`);
};


// --- API de Campanhas ---

export const apiGetCampanhas = () => {
    return apiFetch('/api/campanhas'); // GET é o padrão
};

export const apiGetCampanhaById = (id) => {
    return apiFetch(`/api/campanhas/${encodeURIComponent(id)}`);
};

export const apiGetCampanhasByMestre = (mestreId) => {
    return apiFetch(`/api/campanhas/mestre/${encodeURIComponent(mestreId)}`);
};

export const apiGetCampanhasByJogador = (jogadorId) => {
    return apiFetch(`/api/campanhas/jogador/${encodeURIComponent(jogadorId)}`);
};

export const apiGetJogadoresPorCampanha = (campanhaId) => {
    return apiFetch(`/api/campanhas/${encodeURIComponent(campanhaId)}/jogadores`);
};

export const apiAdicionarJogador = (campanhaId, jogadorId) => {
    return apiFetch(`/api/campanhas/${campanhaId}/jogadores`, {
        method: 'POST',
        body: { jogador_id: jogadorId },
    });
};

export const apiRemoverJogador = (campanhaId, jogadorId) => {
    return apiFetch(`/api/campanhas/${encodeURIComponent(campanhaId)}/jogadores/${encodeURIComponent(jogadorId)}`, {
        method: 'DELETE',
    });
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
    return apiFetch(`/api/campanhas/${encodeURIComponent(campanhaId)}/personagens`);
};

export const apiGetPersonagensByCampanhaJogador = (campanhaId, jogadorId) => {
    return apiFetch(`/api/campanhas/${encodeURIComponent(campanhaId)}/jogador/${encodeURIComponent(jogadorId)}`);
};


// --- API de Personagens ---

export const apiGetPersonagensByJogador = (jogadorId) => {
    return apiFetch(`/api/personagens/jogador/${encodeURIComponent(jogadorId)}`);
};

export const apiGetPersonagemById = (id) => {
    return apiFetch(`/api/personagens/${encodeURIComponent(id)}`);
};

export const apiCreatePersonagem = (data) => {
    return apiFetch('/api/personagens', {
        method: 'POST',
        body: data,
    });
};

export const apiUpdatePersonagem = (id, data) => {
    return apiFetch(`/api/personagens/${encodeURIComponent(id)}`, {
        method: 'PUT',
        body: data,
    });
};

export const apiDeletePersonagem = (id) => {
    return apiFetch(`/api/personagens/${encodeURIComponent(id)}`, {
        method: 'DELETE',
    });
};


// --- API de Itens (Novo) ---

export const apiGetItensByPersonagem = (personagemId) => {
    return apiFetch(`/api/personagens/${encodeURIComponent(personagemId)}/itens`);
};

export const apiAddItem = (personagemId, itemData) => {
    return apiFetch(`/api/personagens/${encodeURIComponent(personagemId)}/itens`, {
        method: 'POST',
        // O backend espera o body: { "item": { ... } }
        body: { item: itemData },
    });
};

export const apiUpdateItem = (personagemId, itemName, itemData) => {
    return apiFetch(`/api/personagens/${encodeURIComponent(personagemId)}/items`, { // Endpoint corrigido: /items
        method: 'PUT',
        // O backend espera: { "nome": "nome_do_item_antigo", "item": { ... } }
        body: { nome: itemName, item: itemData },
    });
};

export const apiDeleteItem = (personagemId, itemName) => {
    return apiFetch(`/api/personagens/${encodeURIComponent(personagemId)}/items/delete`, { // Endpoint corrigido: /items/delete
        method: 'DELETE',
        // O backend espera: { "nome": "nome_do_item" }
        body: { nome: itemName },
    });
};

// --- API de Imagem do Personagem ---
export const apiUploadPersonagemImagem = async (id, file) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${BASE_URL}/api/personagens/${encodeURIComponent(id)}/imagem`, {
        method: 'POST',
        body: formData, // Não definir Content-Type manualmente (o browser define com boundary)
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const msg = errorData.error || response.statusText || 'Falha no upload da imagem';
        throw new Error(msg);
    }
    return response.json(); // { imagem_url: string }
};
