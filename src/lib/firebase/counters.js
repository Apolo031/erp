import { doc, runTransaction } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';

/**
 * Incrementa de forma atómica el contador `counters/{name}` y devuelve el
 * siguiente valor. Evita códigos duplicados aunque dos usuarios guarden
 * un registro al mismo tiempo.
 */
export async function getNextSequence(name, { start = 0 } = {}) {
  const ref = doc(db, 'counters', name);
  const next = await runTransaction(db, async (tx) => {
    const snap = await tx.get(ref);
    const current = snap.exists() ? snap.data().value ?? start : start;
    const value = current + 1;
    tx.set(ref, { value }, { merge: true });
    return value;
  });
  return next;
}
