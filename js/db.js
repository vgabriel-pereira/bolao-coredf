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
  return onSnapshot(doc(db, "config", "bolao"), (snap) => {
    callback(snap.exists() ? snap.data() : null);
  });
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
  const agora = Timestamp.now();
  const snap = await getDocs(
    query(collection(db, "jogos"),
      where("status", "==", "agendado"),
      orderBy("data", "asc")
    )
  );
  const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  return docs.find(j => j.data.toDate() > agora.toDate()) || docs[0] || null;
}

export async function criarJogo(dados) {
  return await addDoc(collection(db, "jogos"), {
    ...dados,
    status: "agendado",
    placar_brasil: null,
    placar_adversario: null,
    acumulado_anterior: 0,
    criado_em: serverTimestamp()
  });
}

export async function editarJogo(id, dados) {
  await updateDoc(doc(db, "jogos", id), dados);
}

export async function encerrarApostas(id) {
  await updateDoc(doc(db, "jogos", id), { status: "encerrado" });
}

export function onJogos(callback) {
  return onSnapshot(
    query(collection(db, "jogos"), orderBy("data", "asc")),
    (snap) => callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  );
}

// ─── PALPITES ─────────────────────────────────────────────────────────────────

export async function getPalpitesDoJogo(jogoId) {
  const snap = await getDocs(
    query(collection(db, "palpites"),
      where("jogo_id", "==", jogoId),
      orderBy("criado_em", "asc")
    )
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getPalpitesDoParticipante(jogoId, nome) {
  const snap = await getDocs(
    query(collection(db, "palpites"),
      where("jogo_id", "==", jogoId),
      where("participante_nome", "==", nome)
    )
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function registrarPalpite(dados) {
  return await addDoc(collection(db, "palpites"), {
    ...dados,
    status_pagamento: "pendente",
    criado_em: serverTimestamp()
  });
}

export async function atualizarPagamento(palpiteId, status) {
  await updateDoc(doc(db, "palpites", palpiteId), { status_pagamento: status });
}

export function onPalpitesDoJogo(jogoId, callback) {
  return onSnapshot(
    query(collection(db, "palpites"),
      where("jogo_id", "==", jogoId),
      orderBy("criado_em", "asc")
    ),
    (snap) => callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  );
}

// ─── APURAÇÕES ────────────────────────────────────────────────────────────────

export async function getApuracao(jogoId) {
  const snap = await getDoc(doc(db, "apuracoes", jogoId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function getApuracoes() {
  const snap = await getDocs(
    query(collection(db, "apuracoes"), orderBy("criado_em", "desc"))
  );
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function salvarApuracao(jogoId, dados) {
  await setDoc(doc(db, "apuracoes", jogoId), {
    ...dados,
    criado_em: serverTimestamp()
  });
}

export function onApuracoes(callback) {
  return onSnapshot(
    query(collection(db, "apuracoes"), orderBy("criado_em", "desc")),
    (snap) => callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  );
}