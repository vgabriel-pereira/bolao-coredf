import { db } from "./firebase.js";
import {
  collection, doc, getDoc, getDocs, addDoc, updateDoc, setDoc,
  query, where, orderBy, onSnapshot, serverTimestamp, Timestamp
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-firestore.js";

// ─── CONFIG ───────────────────────────────────────────────────────────────────
export async function getConfig() {
  const snap = await getDoc(doc(db, "config", "bolao"));
  return snap.exists() ? snap.data() : null;
}
export async function updateConfig(data) {
  await setDoc(doc(db, "config", "bolao"), data, { merge: true });
}
export function onConfig(callback) {
  return onSnapshot(doc(db, "config", "bolao"), snap => callback(snap.exists() ? snap.data() : null));
}

// ─── PARTICIPANTES ────────────────────────────────────────────────────────────
export async function getParticipante(uid) {
  const snap = await getDoc(doc(db, "participantes", uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}
export async function criarParticipante(uid, dados) {
  await setDoc(doc(db, "participantes", uid), { ...dados, criado_em: serverTimestamp() });
}
export async function getParticipantes() {
  const snap = await getDocs(query(collection(db, "participantes"), orderBy("criado_em", "asc")));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

/**
 * Busca participante pelo nome (case-insensitive, normalizado) E chave PIX.
 * Retorna o participante se nome + pix coincidirem, ou null.
 */
export async function buscarParticipantePorNomePix(nome, pix) {
  const nomeNorm = nome.trim().toLowerCase();
  const snap = await getDocs(query(collection(db, "participantes"), where("nome_lower", "==", nomeNorm)));
  if (snap.empty) return null;
  const match = snap.docs.find(d => d.data().pix_chave?.toLowerCase().trim() === pix.trim().toLowerCase());
  return match ? { id: match.id, ...match.data() } : null;
}

/**
 * Verifica se já existe um participante com esse nome (case-insensitive).
 * Retorna o participante encontrado ou null.
 */
export async function buscarParticipantePorNome(nome) {
  const nomeNorm = nome.trim().toLowerCase();
  const snap = await getDocs(query(collection(db, "participantes"), where("nome_lower", "==", nomeNorm)));
  if (snap.empty) return null;
  return { id: snap.docs[0].id, ...snap.docs[0].data() };
}

// ─── JOGOS ────────────────────────────────────────────────────────────────────
export async function getJogos() {
  const snap = await getDocs(query(collection(db, "jogos"), orderBy("data", "asc")));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
export async function getJogo(id) {
  const snap = await getDoc(doc(db, "jogos", id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}
export async function getProximoJogo() {
  const snap = await getDocs(query(collection(db, "jogos"), where("status", "==", "agendado"), orderBy("data", "asc")));
  const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  const agora = new Date();
  return docs.find(j => j.data.toDate() > agora) || docs[0] || null;
}
export async function criarJogo(dados) {
  return await addDoc(collection(db, "jogos"), {
    ...dados, status: "agendado", placar_brasil: null,
    placar_adversario: null, acumulado_anterior: 0, criado_em: serverTimestamp()
  });
}
export async function editarJogo(id, dados) { await updateDoc(doc(db, "jogos", id), dados); }
export async function encerrarApostas(id) { await updateDoc(doc(db, "jogos", id), { status: "encerrado" }); }
export function onJogos(callback) {
  return onSnapshot(query(collection(db, "jogos"), orderBy("data", "asc")),
    snap => callback(snap.docs.map(d => ({ id: d.id, ...d.data() }))));
}

// ─── PALPITES ─────────────────────────────────────────────────────────────────
// ATENÇÃO: as queries abaixo usam apenas where() sem orderBy()
// para evitar a necessidade de índice composto no Firestore.
// A ordenação é feita no cliente após receber os dados.

export async function getPalpitesDoJogo(jogoId) {
  const snap = await getDocs(query(collection(db, "palpites"),
    where("jogo_id", "==", jogoId)));
  const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  // Ordena no cliente por criado_em asc
  return docs.sort((a, b) => {
    const ta = a.criado_em?.toMillis?.() ?? 0;
    const tb = b.criado_em?.toMillis?.() ?? 0;
    return ta - tb;
  });
}

export async function getPalpitesDoParticipante(jogoId, participanteId) {
  const snap = await getDocs(query(collection(db, "palpites"),
    where("jogo_id", "==", jogoId), where("participante_id", "==", participanteId)));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function registrarPalpite(dados) {
  return await addDoc(collection(db, "palpites"), {
    ...dados, status_pagamento: "pendente", criado_em: serverTimestamp()
  });
}

export async function atualizarPagamento(palpiteId, status) {
  await updateDoc(doc(db, "palpites", palpiteId), { status_pagamento: status });
}

export function onPalpitesDoJogo(jogoId, callback) {
  // Sem orderBy para não exigir índice composto — ordenação feita no cliente
  return onSnapshot(
    query(collection(db, "palpites"), where("jogo_id", "==", jogoId)),
    snap => {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      // Ordena no cliente por criado_em asc
      docs.sort((a, b) => {
        const ta = a.criado_em?.toMillis?.() ?? 0;
        const tb = b.criado_em?.toMillis?.() ?? 0;
        return ta - tb;
      });
      callback(docs);
    }
  );
}

// ─── APURAÇÕES ────────────────────────────────────────────────────────────────
export async function getApuracao(jogoId) {
  const snap = await getDoc(doc(db, "apuracoes", jogoId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}
export async function getApuracoes() {
  const snap = await getDocs(query(collection(db, "apuracoes"), orderBy("criado_em", "desc")));
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
export async function salvarApuracao(jogoId, dados) {
  await setDoc(doc(db, "apuracoes", jogoId), { ...dados, criado_em: serverTimestamp() });
}