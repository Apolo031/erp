import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';
import { requireGestionHumana } from '@/lib/apiAuth';

export const runtime = 'nodejs';

// POST /api/empleados/enlace-contrasena — genera un nuevo enlace para que un
// empleado que ya tiene cuenta defina/reinicie su contraseña. Solo GH/admin.
export async function POST(request) {
  try {
    await requireGestionHumana(request);
    const { email } = await request.json();
    if (!email) return NextResponse.json({ error: 'Falta el email.' }, { status: 400 });

    const link = await adminAuth.generatePasswordResetLink(email);
    return NextResponse.json({ link });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Error al generar el enlace' }, { status: err.status || 500 });
  }
}
