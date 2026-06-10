/**
 * admin.js — ponto de entrada reservado para lógica do painel administrativo.
 *
 * A lógica principal do admin está inline em admin.html (bloco <script type="module">),
 * pois o painel é uma SPA simples que não requer módulo separado.
 *
 * Este arquivo reexporta os módulos mais usados no admin para facilitar
 * futuras refatorações ou testes.
 */

export { login, logout, onAuth, usuarioAtual, estaAutenticado } from "./auth.js";
export { listarJogos, buscarJogo, novoJogo, atualizarJogo, fecharApostas, informarPlacar, apostasAbertas, observarJogos } from "./jogos.js";
export { palpitesDoJogo, palpitesDoParticipante, confirmarPagamento, cancelarPagamento, marcarPendente, contarPorStatus } from "./palpites.js";
export { executarApuracao } from "./apuracao.js";
