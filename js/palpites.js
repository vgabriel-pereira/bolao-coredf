import {
  registrarPalpite,
  getPalpitesDoJogo,
  getPalpitesDoParticipante,
  atualizarPagamento,
  onPalpitesDoJogo
} from "./db.js";
import { prazoEncerrado } from "./ui.js";

// ─── CONSTANTES ───────────────────────────────────────────────────────────────
export const MAX_PALPITES_POR_PARTICIPANTE = 2;

// ─── VALIDAÇÕES ───────────────────────────────────────────────────────────────

/**
 * Valida se um participante pode registrar novo palpite em um jogo.
 * Verifica: prazo, limite de palpites e duplicidade.
 *
 * @param {object} jogo - Objeto do jogo (com campo `data` e `status`)
 * @param {string} nomeParticipante
 * @param {number} golsBrasil
 * @param {number} golsAdversario
 * @param {object[]} palpitesExistentes - Palpites já registrados pelo participante neste jogo
 * @returns {{ valido: boolean, erro: string|null }}
 */
export function validarPalpite(jogo, nomeParticipante, golsBrasil, golsAdversario, palpitesExistentes) {
  if (!jogo) return { valido: false, erro: "Nenhum jogo disponível." };
  if (jogo.status !== "agendado") return { valido: false, erro: "Este jogo não está aberto para apostas." };
  if (prazoEncerrado(jogo.data)) return { valido: false, erro: "O prazo para palpites encerrou." };
  if (!nomeParticipante?.trim()) return { valido: false, erro: "Informe seu nome antes de apostar." };

  if (golsBrasil === null || golsBrasil === undefined || isNaN(golsBrasil) || golsBrasil < 0) {
    return { valido: false, erro: "Informe os gols do Brasil." };
  }
  if (golsAdversario === null || golsAdversario === undefined || isNaN(golsAdversario) || golsAdversario < 0) {
    return { valido: false, erro: "Informe os gols do adversário." };
  }

  if ((palpitesExistentes?.length ?? 0) >= MAX_PALPITES_POR_PARTICIPANTE) {
    return { valido: false, erro: `Você já registrou o máximo de ${MAX_PALPITES_POR_PARTICIPANTE} palpites para este jogo.` };
  }

  const duplicado = palpitesExistentes?.find(
    p => p.gols_brasil === Number(golsBrasil) && p.gols_adversario === Number(golsAdversario)
  );
  if (duplicado) {
    return { valido: false, erro: "Você já apostou neste placar. Escolha um placar diferente." };
  }

  return { valido: true, erro: null };
}

// ─── REGISTRO ─────────────────────────────────────────────────────────────────

/**
 * Registra um novo palpite após validação completa.
 * Em caso de erro de validação, lança um Error com a mensagem.
 *
 * @param {object} jogo
 * @param {string} nomeParticipante
 * @param {number} golsBrasil
 * @param {number} golsAdversario
 * @returns {Promise<import("firebase/firestore").DocumentReference>}
 */
export async function fazerPalpite(jogo, nomeParticipante, golsBrasil, golsAdversario) {
  const palpitesExistentes = await getPalpitesDoParticipante(jogo.id, nomeParticipante);

  const { valido, erro } = validarPalpite(
    jogo, nomeParticipante, golsBrasil, golsAdversario, palpitesExistentes
  );
  if (!valido) throw new Error(erro);

  return await registrarPalpite({
    jogo_id: jogo.id,
    participante_nome: nomeParticipante.trim(),
    gols_brasil: Number(golsBrasil),
    gols_adversario: Number(golsAdversario)
  });
}

// ─── CONSULTAS ────────────────────────────────────────────────────────────────

/**
 * Retorna todos os palpites de um jogo.
 * @param {string} jogoId
 * @returns {Promise<object[]>}
 */
export async function palpitesDoJogo(jogoId) {
  return await getPalpitesDoJogo(jogoId);
}

/**
 * Retorna os palpites de um participante em um jogo.
 * @param {string} jogoId
 * @param {string} nomeParticipante
 * @returns {Promise<object[]>}
 */
export async function palpitesDoParticipante(jogoId, nomeParticipante) {
  return await getPalpitesDoParticipante(jogoId, nomeParticipante);
}

/**
 * Conta palpites por status em um jogo.
 * @param {object[]} palpites
 * @returns {{ total: number, confirmados: number, pendentes: number, cancelados: number }}
 */
export function contarPorStatus(palpites) {
  return {
    total:       palpites.length,
    confirmados: palpites.filter(p => p.status_pagamento === "confirmado").length,
    pendentes:   palpites.filter(p => p.status_pagamento === "pendente").length,
    cancelados:  palpites.filter(p => p.status_pagamento === "cancelado").length,
  };
}

// ─── PAGAMENTOS ───────────────────────────────────────────────────────────────

/**
 * Confirma o pagamento de um palpite.
 * @param {string} palpiteId
 * @returns {Promise<void>}
 */
export async function confirmarPagamento(palpiteId) {
  return await atualizarPagamento(palpiteId, "confirmado");
}

/**
 * Cancela o pagamento de um palpite.
 * @param {string} palpiteId
 * @returns {Promise<void>}
 */
export async function cancelarPagamento(palpiteId) {
  return await atualizarPagamento(palpiteId, "cancelado");
}

/**
 * Reverte um palpite para status pendente.
 * @param {string} palpiteId
 * @returns {Promise<void>}
 */
export async function marcarPendente(palpiteId) {
  return await atualizarPagamento(palpiteId, "pendente");
}

// ─── TEMPO REAL ───────────────────────────────────────────────────────────────

/**
 * Observa palpites de um jogo em tempo real via onSnapshot.
 * @param {string} jogoId
 * @param {function} callback - Chamado com array de palpites quando há mudanças
 * @returns {function} unsubscribe
 */
export function observarPalpites(jogoId, callback) {
  return onPalpitesDoJogo(jogoId, callback);
}
