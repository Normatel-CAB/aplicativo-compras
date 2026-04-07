import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '../firebase'

// ============================
// GENERIC HELPERS
// ============================
export async function getAll<T>(col: string): Promise<(T & { _id: string })[]> {
  const snap = await getDocs(collection(db, col))
  return snap.docs.map(d => ({ _id: d.id, ...d.data() } as T & { _id: string }))
}

export async function add<T extends Record<string, unknown>>(col: string, data: T) {
  const docRef = await addDoc(collection(db, col), {
    ...data,
    _createdAt: serverTimestamp(),
  })
  return docRef.id
}

export async function update(col: string, id: string, data: Record<string, unknown>) {
  await updateDoc(doc(db, col, id), {
    ...data,
    _updatedAt: serverTimestamp(),
  })
}

export async function remove(col: string, id: string) {
  await deleteDoc(doc(db, col, id))
}

export function subscribe<T>(
  col: string,
  callback: (items: (T & { _id: string })[]) => void,
  orderField = '_createdAt',
): Unsubscribe {
  const q = query(collection(db, col), orderBy(orderField, 'desc'))
  return onSnapshot(q, (snap) => {
    const items = snap.docs.map(d => ({ _id: d.id, ...d.data() } as T & { _id: string }))
    callback(items)
  }, (error) => {
    console.error(`Firestore subscribe error (${col}):`, error)
  })
}

// ============================
// COLLECTION NAMES
// ============================
export const COLLECTIONS = {
  SOLICITACOES: 'solicitacoes',
  ORDENS: 'ordens_compra',
  FORNECEDORES: 'fornecedores',
  NOTAS: 'notas_fiscais',
  COTACOES: 'mapa_cotacoes',
  CONFIG: 'configuracoes',
  CONFIG_SETORES: 'config_setores',
  CONFIG_ALCADAS: 'config_alcadas',
} as const
