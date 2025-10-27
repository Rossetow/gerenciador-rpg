// // /src/api/mockApi.js
// // IMPORTANTE: Isto simula seu backend Go.
// // Mais tarde, você substituirá as funções aqui por chamadas 'fetch' para seu servidor.

// import { v4 as uuidv4 } from 'uuid'; // Vamos usar UUIDs como no Go

// // --- Nosso "Banco de Dados" Falso ---
// const db = {
//   jogadores: [
//     { id: 'mestre-id', nome: 'Mestre' },
//     { id: 'jogador-id', nome: 'JogadorA' },
//   ],
//   campanhas: [
//     {
//       id: 'campanha-1',
//       nome: 'A Tumba do Horror',
//       mestre_id: 'mestre-id',
//       descricao: 'Uma campanha de terror...',
//       template_atributos_base: ['Força', 'Inteligência', 'Vontade', 'Agilidade'],
//       template_habilidades: ['Lutar', 'Investigar', 'Ocultismo'],
//       template_outros: ['Pontos de Vida', 'Pontos de Sanidade'],
//     },
//   ],
//   personagens: [
//     {
//       id: 'personagem-1',
//       nome: 'Grog, o Bárbaro',
//       jogador_id: 'jogador-id',
//       campanha_id: 'campanha-1',
//       descricao_fisica: 'Muito alto, muitas cicatrizes.',
//       caracteristicas: 'Não pensa muito.',
//       atributos_base: { 'Força': 18, 'Inteligência': 6, 'Vontade': 10, 'Agilidade': 12 },
//       habilidades: { 'Lutar': 5, 'Investigar': -1, 'Ocultismo': 0 },
//       outros: { 'Pontos de Vida': 20, 'Pontos de Sanidade': 8 },
//       inventario: [],
//     },
//   ],
// };

// // --- Funções da API ---
// // Todas retornam Promises para simular uma chamada de rede.

// // Simula o "login"
// export const apiLogin = (nome) => {
//   return new Promise((resolve) => {
//     let jogador = db.jogadores.find((j) => j.nome.toLowerCase() === nome.toLowerCase());
//     if (!jogador) {
//       jogador = { id: uuidv4(), nome };
//       db.jogadores.push(jogador);
//     }
//     setTimeout(() => resolve(jogador), 300); // Simula delay
//   });
// };

// // --- API de Campanhas ---
// export const apiGetCampanhas = () => {
//   return new Promise((resolve) => setTimeout(() => resolve(db.campanhas), 300));
// };

// export const apiGetCampanhaById = (id) => {
//   return new Promise((resolve) => {
//     const campanha = db.campanhas.find((c) => c.id === id);
//     setTimeout(() => resolve(campanha), 300);
//   });
// };

// export const apiCreateCampanha = (mestreId, data) => {
//   return new Promise((resolve) => {
//     const novaCampanha = {
//       ...data,
//       id: uuidv4(),
//       mestre_id: mestreId,
//     };
//     db.campanhas.push(novaCampanha);
//     setTimeout(() => resolve(novaCampanha), 300);
//   });
// };

// export const apiUpdateCampanha = (id, data) => {
//     return new Promise((resolve) => {
//         const index = db.campanhas.findIndex(c => c.id === id);
//         if (index !== -1) {
//             db.campanhas[index] = { ...db.campanhas[index], ...data };
//             setTimeout(() => resolve(db.campanhas[index]), 300);
//         }
//     });
// };

// // --- API de Personagens ---
// export const apiGetPersonagensByCampanha = (campanhaId) => {
//     return new Promise((resolve) => {
//         const personagens = db.personagens.filter(p => p.campanha_id === campanhaId);
//         setTimeout(() => resolve(personagens), 300);
//     });
// };

// export const apiGetPersonagensByJogador = (jogadorId) => {
//     return new Promise((resolve) => {
//         const personagens = db.personagens.filter(p => p.jogador_id === jogadorId);
//         setTimeout(() => resolve(personagens), 300);
//     });
// };

// export const apiGetPersonagemById = (id) => {
//     return new Promise((resolve) => {
//         const personagem = db.personagens.find(p => p.id === id);
//         setTimeout(() => resolve(personagem), 300);
//     });
// };

// export const apiCreatePersonagem = (data) => {
//     return new Promise((resolve) => {
//         const novoPersonagem = {
//             ...data,
//             id: uuidv4(),
//         };
//         db.personagens.push(novoPersonagem);
//         setTimeout(() => resolve(novoPersonagem), 300);
//     });
// };

// export const apiUpdatePersonagem = (id, data) => {
//     return new Promise((resolve) => {
//         const index = db.personagens.findIndex(p => p.id === id);
//         if (index !== -1) {
//             db.personagens[index] = { ...db.personagens[index], ...data };
//             setTimeout(() => resolve(db.personagens[index]), 300);
//         }
//     });
// };

// // Instale o UUID: npm install uuid