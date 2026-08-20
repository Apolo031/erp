import { adminAuth, adminDb } from '@/lib/firebase/admin';

/**
 * Verifica el ID token de Firebase enviado en "Authorization: Bearer <token>"
 * y devuelve el usuario decodificado junto con su rol (leído de
 * usuarios/{uid} en Firestore, la misma fuente que usan las reglas de
 * seguridad). Lanza {status, message} si algo falla.
 */
export async function requireAuth(request) {
  const authHeader = request.headers.get('authorization') || '';
  const match = authHeader.match(/^Bearer (.+)$/);
  if (!match) throw { status: 401, message: 'Falta el token de autenticación.' };

  let decoded;
  try {
    decoded = await adminAuth.verifyIdToken(match[1]);
  } catch (err) {
    throw { status: 401, message: 'Token inválido o expirado.' };
  }

  const roleDoc = await adminDb.collection('usuarios').doc(decoded.uid).get();
  const role = roleDoc.exists ? roleDoc.data().role : null;
  return { ...decoded, role };
}

/** Igual que requireAuth, pero además exige rol admin o gestion_humana. */
export async function requireGestionHumana(request) {
  const decoded = await requireAuth(request);
  if (decoded.role !== 'admin' && decoded.role !== 'gestion_humana') {
    throw { status: 403, message: 'Esta acción requiere el rol de Gestión Humana.' };
  }
  return decoded;
}
