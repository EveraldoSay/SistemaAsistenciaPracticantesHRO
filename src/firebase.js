// Configuración de Firebase — Proyecto: SistemaAsistenciaPracticanes
import { initializeApp } from 'firebase/app'
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBrLpbt4CLx1AlQvBN4Cpnka21gS-pphCM",
  authDomain: "sistemaasistenciapracticanes.firebaseapp.com",
  projectId: "sistemaasistenciapracticanes",
  storageBucket: "sistemaasistenciapracticanes.firebasestorage.app",
  messagingSenderId: "636487328557",
  appId: "1:636487328557:web:2458350bd0999862bca9a4",
  measurementId: "G-76S7Q438LE",
}

const app = initializeApp(firebaseConfig)
export const db = getFirestore(app)

// Re-exportar utilidades de Firestore para uso en componentes
export {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
}

// ─── Referencias a colecciones ─────────────────────────────────────────────
export const practicantesRef = collection(db, 'practicantes')
export const registrosRef    = collection(db, 'registros_horas')

/**
 * Estructura de documentos en Firestore:
 *
 * practicantes/{id}
 *   - nombre_completo: string
 *   - total_horas_acumuladas: number
 *   - pin: string | ""        ← "" = sin PIN configurado (primera vez)
 *   - creado_en: string (ISO)
 *
 * registros_horas/{id}
 *   - id_practicante: string
 *   - fecha: string            "YYYY-MM-DD"
 *   - hora_entrada: string | null
 *   - hora_salida: string | null
 *   - total_dia_horas: number | null
 *   - estado: "COMPLETO" | "INCOMPLETO"
 *   - nota_admin: string
 *   - modificado_por_admin: boolean
 *   - creado_en: string (ISO)
 */
