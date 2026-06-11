import { getPalpitesDoJogo, getJogo, getConfig, salvarApuracao, editarJogo, updateConfig, getParticipante } from "./db.js";

export async function executarApuracao(jogoId) {
  const jogo = await getJogo(jogoId);
  if (!jogo) throw new Error("Jogo não encontrado.");
  if (jogo.placar_brasil === null || jogo.placar_adversario === null)
    throw new Error("Informe o placar oficial antes de apurar.");
  if (jogo.status === "apurado") throw new Error("Este jogo já foi apurado.");

  const config = await getConfig();
  const valorPorPalpite = config?.valor_por_palpite ?? 10;
  const acumuladoAnterior = jogo.acumulado_anterior ?? 0;

  const palpites = await getPalpitesDoJogo(jogoId);
  const confirmados = palpites.filter(p => p.status_pagamento === "confirmado");
  const valorArrecadado = confirmados.length * valorPorPalpite;
  const valorTotal = valorArrecadado + acumuladoAnterior;

  const vencedores = confirmados.filter(
    p => p.gols_brasil === jogo.placar_brasil && p.gols_adversario === jogo.placar_adversario
  );

  const temVencedor = vencedores.length > 0;
  const valorPorVencedor = temVencedor ? parseFloat((valorTotal / vencedores.length).toFixed(2)) : 0;

  // Buscar chave pix de cada vencedor
  const vencedoresComPix = await Promise.all(vencedores.map(async v => {
    const part = await getParticipante(v.participante_id).catch(() => null);
    return {
      nome: v.participante_nome,
      participante_id: v.participante_id,
      palpite_id: v.id,
      gols_brasil: v.gols_brasil,
      gols_adversario: v.gols_adversario,
      pix_chave: part?.pix_chave || "Não informada"
    };
  }));

  const apuracao = {
    jogo_id: jogoId, adversario: jogo.adversario,
    placar_brasil: jogo.placar_brasil, placar_adversario: jogo.placar_adversario,
    total_palpites_confirmados: confirmados.length,
    valor_arrecadado: valorArrecadado, acumulado_anterior: acumuladoAnterior,
    valor_total: valorTotal, vencedores: vencedoresComPix,
    quantidade_vencedores: vencedores.length,
    valor_por_vencedor: valorPorVencedor, acumulou: !temVencedor
  };

  await salvarApuracao(jogoId, apuracao);
  await editarJogo(jogoId, { status: "apurado" });
  await updateConfig({ acumulado_atual: temVencedor ? 0 : valorTotal });
  return apuracao;
}