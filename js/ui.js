// ─── FORMATAÇÃO ───────────────────────────────────────────────────────────────
export function formatarData(ts) {
  if (!ts) return "—";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleDateString("pt-BR", { weekday:"short", day:"2-digit", month:"2-digit", year:"numeric" });
}
export function formatarDataHora(ts) {
  if (!ts) return "—";
  const d = ts.toDate ? ts.toDate() : new Date(ts);
  return d.toLocaleString("pt-BR", { day:"2-digit", month:"2-digit", year:"numeric", hour:"2-digit", minute:"2-digit" });
}
export function formatarMoeda(v) {
  return new Intl.NumberFormat("pt-BR", { style:"currency", currency:"BRL" }).format(v ?? 0);
}
export function badgePagamento(s) {
  const m = { pendente:{l:"Pendente",c:"badge-pendente"}, confirmado:{l:"Confirmado",c:"badge-confirmado"}, cancelado:{l:"Cancelado",c:"badge-cancelado"} };
  const x = m[s] || m.pendente;
  return `<span class="badge ${x.c}">${x.l}</span>`;
}
export function badgeJogo(s) {
  const m = { agendado:{l:"Agendado",c:"badge-agendado"}, encerrado:{l:"Encerrado",c:"badge-encerrado"}, apurado:{l:"Apurado",c:"badge-apurado"} };
  const x = m[s] || m.agendado;
  return `<span class="badge ${x.c}">${x.l}</span>`;
}
export function calcularCountdown(dataJogo) {
  if (!dataJogo) return null;
  const jogo = dataJogo.toDate ? dataJogo.toDate() : new Date(dataJogo);
  const prazo = new Date(jogo);
  prazo.setDate(prazo.getDate() - 1);
  prazo.setHours(23, 59, 0, 0);
  const diff = prazo - new Date();
  if (diff <= 0) return { encerrado: true };
  return {
    encerrado: false,
    dias:  Math.floor(diff / 86400000),
    horas: Math.floor((diff % 86400000) / 3600000),
    min:   Math.floor((diff % 3600000) / 60000),
    seg:   Math.floor((diff % 60000) / 1000)
  };
}
export function prazoEncerrado(dataJogo) {
  const c = calcularCountdown(dataJogo);
  return !c || c.encerrado;
}
export function toast(msg, tipo = "info") {
  const c = document.getElementById("toast-container") || (() => { const d = document.createElement("div"); d.id = "toast-container"; document.body.appendChild(d); return d; })();
  const el = document.createElement("div");
  el.className = `toast toast-${tipo}`;
  el.innerHTML = msg;
  c.appendChild(el);
  setTimeout(() => el.classList.add("show"), 10);
  setTimeout(() => { el.classList.remove("show"); setTimeout(() => el.remove(), 300); }, 3800);
}
export function abrirModal(id) { document.getElementById(id)?.classList.add("active"); }
export function fecharModal(id) { document.getElementById(id)?.classList.remove("active"); }
export function setLoading(btn, sim) {
  if (!btn) return;
  btn.disabled = sim;
  btn.dataset.original = btn.dataset.original || btn.innerHTML;
  btn.innerHTML = sim ? '<span class="spinner"></span> Aguarde...' : btn.dataset.original;
}
export function exportarCSV(dados, nome) {
  if (!dados.length) return;
  const cab = Object.keys(dados[0]).join(";");
  const lin = dados.map(d => Object.values(d).map(v => `"${v}"`).join(";"));
  const blob = new Blob(["\uFEFF" + [cab,...lin].join("\n")], { type:"text/csv;charset=utf-8;" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = nome;
  a.click();
}