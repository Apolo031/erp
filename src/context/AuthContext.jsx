'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(null);
  const [empleadoId, setEmpleadoId] = useState(null);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => onAuthStateChanged(auth, (u) => {
    setUser(u);
    setLoading(false);
  }), []);

  useEffect(() => {
    if (!user) {
      setRole(null);
      setEmpleadoId(null);
      setRoleLoading(false);
      return;
    }
    setRoleLoading(true);
    return onSnapshot(doc(db, 'usuarios', user.uid), (snap) => {
      const data = snap.data();
      setRole(data?.role || null);
      setEmpleadoId(data?.empleadoId || null);
      setRoleLoading(false);
    }, () => setRoleLoading(false));
  }, [user]);

  const value = {
    user,
    loading,
    role,
    empleadoId,
    roleLoading,
    isAdmin: role === 'admin',
    isGestionHumana: role === 'admin' || role === 'gestion_humana',
    login: (email, password) => signInWithEmailAndPassword(auth, email, password),
    logout: () => signOut(auth),
    getIdToken: () => (user ? user.getIdToken() : Promise.resolve(null)),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
