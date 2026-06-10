import {
  getPalpitesDoJogo, getJogo, getConfig,
  salvarApuracao, editarJogo, updateConfig
} from "./db.js";

/**
 * Executa a apuração de um jogo já encerrado com placar informado.
 * Retorna o objeto de apuração gerado.
 */
export async function executarApuracao(jogoId) {
  const jogo = await getJogo(jogoId);
  if (!jogo) throw new Error("Jogo não encontrado.");
  if (jogo.placar_brasil === null || jogo.placar_adversario === null) {
    throw new Error("Informe o placar oficial antes de apurar.");
  }
  if (jogo.status === "apurado") {
    throw new Error("Este jogo já foi apurado.");
  }

  const config = await getConfig();
  const valorPorPalpite = config?.valor_por_palpite ?? 10;
  const acumuladoAnterior = jogo.acumulado_anterior ?? 0;

  const palpites = await getPalpitesDoJogo(jogoId);
  const confirmados = palpites.filter(p => p.status_pagamento === "confirmado");

  const valorArrecadado = confirmados.length * valorPorPalpite;
  const valorTotal = valorArrecadado + acumuladoAnterior;

  // Acerto exato do placar
  const vencedores = confirmados.filter(
    p => p.gols_brasil === jogo.placar_brasil &&
         p.gols_adversario === jogo.placar_adversario
  );

  const temVencedor = vencedores.length > 0;
  const valorPorVencedor = temVencedor
    ? parseFloat((valorTotal / vencedores.length).toFixed(2))
    : 0;

  const apuracao = {
    jogo_id: jogoId,
    adversario: jogo.adversario,
    placar_brasil: jogo.placar_brasil,
    placar_adversario: jogo.placar_adversario,
    total_palpites_confirmados: confirmados.length,
    valor_arrecadado: valorArrecadado,
    acumulado_anterior: acumuladoAnterior,
    valor_total: valorTotal,
    vencedores: vencedores.map(v => ({
      nome: v.participante_nome,
      palpite_id: v.id,
      gols_brasil: v.gols_brasil,
      gols_adversario: v.gols_adversario
    })),
    quantidade_vencedores: vencedores.length,
    valor_por_vencedor: valorPorVencedor,
    acumulou: !temVencedor
  };

  // Salva apuração
  await salvarApuracao(jogoId, apuracao);

  // Marca jogo como apurado
  await editarJogo(jogoId, { status: "apurado" });

  // Atualiza o acumulado global
  const novoAcumulado = temVencedor ? 0 : valorTotal;
  await updateConfig({ acumulado_atual: novoAcumulado });

  return apuracao;
}