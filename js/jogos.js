import {
  getJogos,
  getJogo,
  getProximoJogo,
  criarJogo,
  editarJogo,
  encerrarApostas,
  onJogos
} from "./db.js";
import { calcularCountdown, prazoEncerrado } from "./ui.js";

/**
 * Retorna o próximo jogo agendado (status "agendado" com data futura).
 * Retorna null se não houver jogo agendado.
 * @returns {Promise<object|null>}
 */
export async function buscarProximoJogo() {
  return await getProximoJogo();
}

/**
 * Retorna todos os jogos ordenados por data.
 * @returns {Promise<object[]>}
 */
export async function listarJogos() {
  return await getJogos();
}

/**
 * Retorna um jogo pelo ID.
 * @param {string} id
 * @returns {Promise<object|null>}
 */
export async function buscarJogo(id) {
  return await getJogo(id);
}

/**
 * Cria um novo jogo no Firestore.
 * @param {string} adversario - Nome do adversário
 * @param {Date|import("firebase/firestore").Timestamp} data - Data/hora do jogo
 * @param {number} acumuladoAnterior - Valor acumulado de jogos anteriores
 * @returns {Promise<import("firebase/firestore").DocumentReference>}
 */
export async function novoJogo(adversario, data, acumuladoAnterior = 0) {
  if (!adversario || !adversario.trim()) throw new Error("Informe o nome do adversário.");
  if (!data) throw new Error("Informe a data e horário do jogo.");
  return await criarJogo({ adversario: adversario.trim(), data, acumulado_anterior: acumuladoAnterior });
}

/**
 * Atualiza dados de um jogo existente.
 * @param {string} id
 * @param {object} dados - Campos a atualizar (adversario, data, placar_brasil, placar_adversario, acumulado_anterior)
 * @returns {Promise<void>}
 */
export async function atualizarJogo(id, dados) {
  if (!id) throw new Error("ID do jogo não informado.");
  return await editarJogo(id, dados);
}

/**
 * Encerra as apostas de um jogo (muda status para "encerrado").
 * @param {string} id
 * @returns {Promise<void>}
 */
export async function fecharApostas(id) {
  if (!id) throw new Error("ID do jogo não informado.");
  return await encerrarApostas(id);
}

/**
 * Informa o placar oficial de um jogo encerrado.
 * @param {string} id
 * @param {number} golsBrasil
 * @param {number} golsAdversario
 * @returns {Promise<void>}
 */
export async function informarPlacar(id, golsBrasil, golsAdversario) {
  if (golsBrasil === null || golsBrasil === undefined || isNaN(golsBrasil)) {
    throw new Error("Informe os gols do Brasil.");
  }
  if (golsAdversario === null || golsAdversario === undefined || isNaN(golsAdversario)) {
    throw new Error("Informe os gols do adversário.");
  }
  return await editarJogo(id, {
    placar_brasil: Number(golsBrasil),
    placar_adversario: Number(golsAdversario)
  });
}

/**
 * Verifica se as apostas de um jogo estão abertas.
 * Regra: apostas encerram às 23h59 do dia anterior ao jogo.
 * @param {object} jogo - Objeto do jogo com campo `data` (Timestamp ou Date)
 * @returns {boolean} true = apostas abertas, false = encerradas
 */
export function apostasAbertas(jogo) {
  if (!jogo) return false;
  if (jogo.status !== "agendado") return false;
  return !prazoEncerrado(jogo.data);
}

/**
 * Retorna o countdown formatado para um jogo.
 * @param {object} jogo
 * @returns {{ encerrado: boolean, dias: number, horas: number, min: number, seg: number }|null}
 */
export function countdownJogo(jogo) {
  if (!jogo?.data) return null;
  return calcularCountdown(jogo.data);
}

/**
 * Observa a lista de jogos em tempo real.
 * @param {function} callback - Chamado com array de jogos quando há mudanças
 * @returns {function} unsubscribe
 */
export function observarJogos(callback) {
  return onJogos(callback);
}
