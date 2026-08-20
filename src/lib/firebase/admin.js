import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

// Solo se importa desde código de SERVIDOR (API routes) — nunca desde el cliente.
// La inicialización es perezosa (no ocurre al importar el módulo) para que
// `next build` pueda analizar estas rutas sin que la variable de entorno
// FIREBASE_SERVICE_ACCOUNT_KEY exista todavía en el entorno de build.
function getAdminApp() {
  if (getApps().length) return getApp();
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (!raw) throw new Error('Falta la variable de entorno FIREBASE_SERVICE_ACCOUNT_KEY en el servidor.');
  return initializeApp({ credential: cert(JSON.parse(raw)) });
}

function lazyProxy(getInstance) {
  return new Proxy({}, {
    get: (_, prop) => {
      const instance = getInstance();
      const value = instance[prop];
      return typeof value === 'function' ? value.bind(instance) : value;
    },
  });
}

export const adminAuth = lazyProxy(() => getAuth(getAdminApp()));
export const adminDb = lazyProxy(() => getFirestore(getAdminApp()));
