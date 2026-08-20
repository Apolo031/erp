'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function AuthGuard({ children }) {
  const { user, loading, role, roleLoading, isAdmin, isGestionHumana } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !user) { router.replace('/login'); return; }
    if (loading || roleLoading || !user) return;

    const enGestionHumana = pathname.startsWith('/gestion-humana');
    const enMiPerfil = pathname.startsWith('/mi-perfil');

    if (role === 'usuario' && !enMiPerfil) {
      router.replace('/mi-perfil');
    } else if (isGestionHumana && !isAdmin && !enGestionHumana && !enMiPerfil) {
      router.replace('/gestion-humana/empleados');
    }
  }, [loading, roleLoading, user, role, isAdmin, isGestionHumana, pathname, router]);

  if (loading || !user || roleLoading) {
    return (
      <div className="login-screen">
        <p style={{ color: 'var(--mute)', fontSize: '.9rem' }}>Cargando...</p>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="login-screen">
        <div className="login-card" style={{ textAlign: 'center' }}>
          <h1 className="display">Sin acceso asignado</h1>
          <p className="sub">Tu cuenta no tiene un rol asignado todavía. Pídele a Gestión Humana que te lo configure.</p>
        </div>
      </div>
    );
  }

  return children;
}
