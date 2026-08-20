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
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

/**
 * Capa de acceso a datos genérica sobre Firestore, reutilizada por todos los
 * módulos del ERP (propietarios, inmuebles, contratos, arrendatarios,
 * mantenimientos). Cada módulo solo necesita el nombre de su colección.
 *
 * `whereClauses`: array de [campo, operador, valor] — necesario para que las
 * reglas de seguridad basadas en igualdad (p.ej. "solo tus propios
 * registros") acepten la consulta; sin el where correspondiente, Firestore
 * rechaza la lectura aunque el usuario tendría permiso documento por documento.
 */
export function collectionApi(collectionName, { orderByField = 'createdAt', direction = 'desc', whereClauses = [] } = {}) {
  const colRef = collection(db, collectionName);

  return {
    /** Se suscribe en tiempo real y llama a `onChange(items)` en cada actualización. */
    subscribe(onChange, onError) {
      const constraints = whereClauses.map(([field, op, value]) => where(field, op, value));
      if (orderByField) constraints.push(orderBy(orderByField, direction));
      const q = constraints.length ? query(colRef, ...constraints) : colRef;
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
