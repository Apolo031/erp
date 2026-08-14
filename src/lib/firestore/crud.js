import {
  collection,
  doc,
  addDoc,
  setDoc,
  deleteDoc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

/**
 * Capa de acceso a datos genérica sobre Firestore, reutilizada por todos los
 * módulos del ERP (propietarios, inmuebles, contratos, arrendatarios,
 * mantenimientos). Cada módulo solo necesita el nombre de su colección.
 */
export function collectionApi(collectionName, { orderByField = 'createdAt', direction = 'desc' } = {}) {
  const colRef = collection(db, collectionName);

  return {
    /** Se suscribe en tiempo real y llama a `onChange(items)` en cada actualización. */
    subscribe(onChange, onError) {
      const q = orderByField ? query(colRef, orderBy(orderByField, direction)) : colRef;
      return onSnapshot(
        q,
        (snap) => onChange(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
        onError
      );
    },

    async get(id) {
      const snap = await getDoc(doc(db, collectionName, id));
      return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    },

    async create(data) {
      const ref = await addDoc(colRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return ref.id;
    },

    async update(id, data) {
      await setDoc(
        doc(db, collectionName, id),
        { ...data, updatedAt: serverTimestamp() },
        { merge: true }
      );
    },

    async remove(id) {
      await deleteDoc(doc(db, collectionName, id));
    },
  };
}
