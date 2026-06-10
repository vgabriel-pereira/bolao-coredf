// ─── FORMATAÇÃO ───────────────────────────────────────────────────────────────

export function formatarData(timestamp) {
  if (!timestamp) return "—";
  const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return d.toLocaleDateString("pt-BR", {
    weekday: "short", day: "2-digit", month: "2-digit", year: "numeric"
  });
}

export function formatarDataHora(timestamp) {
  if (!timestamp) return "—";
  const d = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit"
  });
}

export function formatarMoeda(valor) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency", currency: "BRL"
  }).format(valor ?? 0);
}

export function formatarPlacar(b, a) {
  if (b === null || b === undefined || a === null || a === undefined) return "— x —";
  return `${b} x ${a}`;
}

// ─── STATUS BADGES ────────────────────────────────────────────────────────────

export function badgePagamento(status) {
  const map = {
    pendente:   { label: "Pendente",   cls: "badge-pendente" },
    confirmado: { label: "Confirmado", cls: "badge-confirmado" },
    cancelado:  { label: "Cancelado",  cls: "badge-cancelado" }
  };
  const s = map[status] || map.pendente;
  return `<span class="badge ${s.cls}">${s.label}</span>`;
}

export function badgeJogo(status) {
  const map = {
    agendado:  { label: "Agendado",  cls: "badge-agendado" },
    encerrado: { label: "Encerrado", cls: "badge-encerrado" },
    apurado:   { label: "Apurado",   cls: "badge-apurado" }
  };
  const s = map[status] || map.agendado;
  return `<span class="badge ${s.cls}">${s.label}</span>`;
}

// ─── COUNTDOWN ────────────────────────────────────────────────────────────────

export function calcularCountdown(dataJogo) {
  if (!dataJogo) return null;
  const jogo = dataJogo.toDate ? dataJogo.toDate() : new Date(dataJogo);

  // Prazo = 23h59 do dia anterior
  const prazo = new Date(jogo);
  prazo.setDate(prazo.getDate() - 1);
  prazo.setHours(23, 59, 0, 0);

  const diff = prazo - new Date();
  if (diff <= 0) return { encerrado: true };

  const dias   = Math.floor(diff / 86400000);
  const horas  = Math.floor((diff % 86400000) / 3600000);
  const min    = Math.floor((diff % 3600000) / 60000);
  const seg    = Math.floor((diff % 60000) / 1000);

  return { encerrado: false, dias, horas, min, seg };
}

export function prazoEncerrado(dataJogo) {
  const c = calcularCountdown(dataJogo);
  return !c || c.encerrado;
}

// ─── TOAST ────────────────────────────────────────────────────────────────────

export function toast(msg, tipo = "info") {
  const container = document.getElementById("toast-container") || criarToastContainer();
  const el = document.createElement("div");
  el.className = `toast toast-${tipo}`;
  el.textContent = msg;
  container.appendChild(el);
  setTimeout(() => el.classList.add("show"), 10);
  setTimeout(() => {
    el.classList.remove("show");
    setTimeout(() => el.remove(), 300);
  }, 3500);
}

function criarToastContainer() {
  const div = document.createElement("div");
  div.id = "toast-container";
  document.body.appendChild(div);
  return div;
}

// ─── MODAL ────────────────────────────────────────────────────────────────────

export function abrirModal(id) {
  document.getElementById(id)?.classList.add("active");
}

export function fecharModal(id) {
  document.getElementById(id)?.classList.remove("active");
}

// ─── LOADING ──────────────────────────────────────────────────────────────────

export function setLoading(btn, sim) {
  if (!btn) return;
  btn.disabled = sim;
  btn.dataset.original = btn.dataset.original || btn.textContent;
  btn.textContent = sim ? "Aguarde..." : btn.dataset.original;
}

// ─── EXPORTAR CSV ─────────────────────────────────────────────────────────────

export function exportarCSV(dados, nomeArquivo) {
  if (!dados.length) return;
  const cabecalho = Object.keys(dados[0]).join(";");
  const linhas = dados.map(d => Object.values(d).map(v => `"${v}"`).join(";"));
  const csv = [cabecalho, ...linhas].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = nomeArquivo;
  a.click();
  URL.revokeObjectURL(url);
}