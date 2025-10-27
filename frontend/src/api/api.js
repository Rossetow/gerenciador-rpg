const API_BASE = "http://localhost:8080";

async function request(url, options = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  console.log(res);
  if (!res.ok) throw new Error(`Erro na requisição: ${res.status}`);
  return res.json();
}

// --- Autenticação ---
export async function loginJogador(nome) {
  return request(`${API_BASE}/jogador/login`, {
    method: "POST",
    body: JSON.stringify({ nome }),
  });
}
export async function cadastroJogador(nome) {
  return request(`${API_BASE}/jogador/cadastro`, {
    method: "POST",
    body: JSON.stringify({ nome }),
  });
}
export async function loginMestre(nome) {
  return request(`${API_BASE}/mestre/login`, {
    method: "POST",
    body: JSON.stringify({ nome }),
  });
}
export async function cadastroMestre(nome) {
  return request(`${API_BASE}/mestre/cadastro`, {
    method: "POST",
    body: JSON.stringify({ nome }),
  });
}

// --- Campanhas ---
export async function getCampanhas() {
  return request(`${API_BASE}/api/campanhas`);
}
export async function getCampanhasByMestre(mestreId) {
  return request(`${API_BASE}/api/campanhas/mestre/${mestreId}`);
}
export async function getCampanhaById(id) {
  return request(`${API_BASE}/api/campanhas/${id}`);
}
export async function createCampanha(data) {
  return request(`${API_BASE}/api/campanhas`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}
export async function updateCampanhaTemplate(id, data) {
  return request(`${API_BASE}/api/campanhas/${id}/template`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
export async function getPersonagensByCampanha(id) {
  return request(`${API_BASE}/api/campanhas/${id}/personagens`);
}
export async function getPersonagensByCampanhaJogador(campanhaId, jogadorId) {
  return request(`${API_BASE}/api/campanhas/${campanhaId}/jogador/${jogadorId}`);
}

// --- Personagens ---
export async function getPersonagensByJogador(id) {
  return request(`${API_BASE}/api/personagens/jogador/${id}`);
}
export async function getPersonagemById(id) {
  return request(`${API_BASE}/api/personagens/${id}`);
}
export async function createPersonagem(data) {
  return request(`${API_BASE}/api/personagens`, {
    method: "POST",
    body: JSON.stringify(data),
  });
}
export async function updatePersonagem(id, data) {
  return request(`${API_BASE}/api/personagens/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}
export async function deletePersonagem(id) {
  return request(`${API_BASE}/api/personagens/${id}`, { method: "DELETE" });
}

// --- Itens ---
export async function getItensByPersonagem(id) {
  return request(`${API_BASE}/api/personagens/${id}/itens`);
}
export async function addItem(personagemId, item) {
  return request(`${API_BASE}/api/personagens/${personagemId}/itens`, {
    method: "POST",
    body: JSON.stringify(item),
  });
}
export async function updateItem(personagemId, item) {
  return request(`${API_BASE}/api/personagens/${personagemId}/items`, {
    method: "PUT",
    body: JSON.stringify(item),
  });
}
export async function deleteItem(personagemId, itemId) {
  return request(`${API_BASE}/api/personagens/${personagemId}/items/delete`, {
    method: "DELETE",
    body: JSON.stringify({ item_id: itemId }),
  });
}
