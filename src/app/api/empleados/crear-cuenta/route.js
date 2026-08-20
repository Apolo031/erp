import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';
import { requireGestionHumana } from '@/lib/apiAuth';

export const runtime = 'nodejs';

// POST /api/empleados/crear-cuenta — crea el usuario de Firebase Auth para un
// empleado (sin contraseña) y devuelve un enlace para que el empleado defina
// su propia contraseña. Solo Gestión Humana/admin. Nadie —ni GH ni este
// servidor— llega a ver o definir la contraseña del empleado.
export async function POST(request) {
  try {
    await requireGestionHumana(request);

    const { empleadoId, email, nombre } = await request.json();
    if (!empleadoId || !email) {
      return NextResponse.json({ error: 'Falta empleadoId o email.' }, { status: 400 });
    }

    const empleadoRef = adminDb.collection('empleados').doc(empleadoId);
    const empleadoSnap = await empleadoRef.get();
    if (!empleadoSnap.exists) {
      return NextResponse.json({ error: 'El empleado no existe.' }, { status: 404 });
    }
    if (empleadoSnap.data().uid) {
      return NextResponse.json({ error: 'Este empleado ya tiene una cuenta creada.' }, { status: 409 });
    }

    let userRecord;
    try {
      userRecord = await adminAuth.getUserByEmail(email);
    } catch (err) {
      userRecord = await adminAuth.createUser({ email, displayName: nombre || undefined });
    }

    await adminDb.collection('usuarios').doc(userRecord.uid).set({
      role: 'usuario',
      empleadoId,
      email,
      nombre: nombre || '',
      createdAt: new Date().toISOString(),
    });
    await empleadoRef.update({ uid: userRecord.uid, tieneCuenta: true, correoAcceso: email });

    const link = await adminAuth.generatePasswordResetLink(email);

    return NextResponse.json({ uid: userRecord.uid, link });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Error al crear la cuenta' }, { status: err.status || 500 });
  }
}
