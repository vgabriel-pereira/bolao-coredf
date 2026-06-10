import { auth } from "./firebase.js";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.14.0/firebase-auth.js";

/**
 * Realiza login com email e senha no Firebase Authentication.
 * @param {string} email
 * @param {string} senha
 * @returns {Promise<import("firebase/auth").UserCredential>}
 */
export async function login(email, senha) {
  return await signInWithEmailAndPassword(auth, email, senha);
}

/**
 * Realiza logout do usuário autenticado.
 * @returns {Promise<void>}
 */
export async function logout() {
  return await signOut(auth);
}

/**
 * Observa mudanças no estado de autenticação.
 * Chama callback(user) quando o estado muda.
 * user = null quando não autenticado.
 * @param {function} callback
 * @returns {function} unsubscribe
 */
export function onAuth(callback) {
  return onAuthStateChanged(auth, callback);
}

/**
 * Retorna o usuário autenticado atual, ou null.
 * @returns {import("firebase/auth").User|null}
 */
export function usuarioAtual() {
  return auth.currentUser;
}

/**
 * Verifica se há um usuário autenticado.
 * @returns {boolean}
 */
export function estaAutenticado() {
  return auth.currentUser !== null;
}
