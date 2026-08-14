# ERP Inmobiliaria · Zona Centro

Panel de administración para una inmobiliaria: propietarios, inmuebles, contratos,
arrendatarios y mantenimientos. Construido con **Next.js (App Router)** y **Firebase**
(Auth, Firestore, Storage), pensado para desplegarse en **Vercel**.

## Arquitectura

```
src/
  app/                    Rutas (App Router)
    (app)/                Grupo protegido por login: dashboard, propietarios, contratos...
    login/                Pantalla de acceso
  features/<modulo>/      Por cada módulo: service.js (Firestore) + Form.jsx
  components/
    layout/                Sidebar, AppShell, guard de autenticación
    ui/                    Kpi, DataTable, Dropzone, Pill... (design system compartido)
    charts/                Gráficos (Chart.js)
  context/AuthContext.jsx  Sesión de Firebase Auth
  hooks/useCollection.js   Suscripción en tiempo real a una colección de Firestore
  lib/
    firebase/client.js     Inicialización del SDK (Auth, Firestore, Storage)
    firebase/counters.js   Generador de códigos secuenciales (INM-0143, ZC-2026-036...)
    firestore/crud.js      Capa CRUD genérica reutilizada por todos los módulos
    storage/uploadDocs.js  Subida de PDFs a Firebase Storage
```

Cada módulo nuevo (por ejemplo "gastos" o "reportes") solo necesita:
1. Un `service.js` que llame a `collectionApi('nombre_coleccion')`.
2. Un formulario que reutilice los componentes de `components/ui`.
3. Dos rutas: `app/(app)/modulo/page.js` (lista) y `app/(app)/modulo/[id]/page.js` (crear/editar, con `id = 'nuevo'` para crear).

Esa es la razón de ser de la capa genérica en `lib/firestore/crud.js`: agregar módulos no
implica reescribir la lógica de guardado, tiempo real ni permisos.

## 1. Configurar Firebase

1. En [Firebase Console](https://console.firebase.google.com) crea (o reutiliza) un proyecto.
2. Habilita **Authentication → Email/contraseña** y crea el primer usuario (el equipo de Zona Centro).
3. Habilita **Firestore Database** (modo producción) y **Storage**.
4. En *Configuración del proyecto → General → Tus apps*, crea una app web y copia las
   credenciales al archivo `.env.local` (basado en `.env.local.example`):

   ```
   NEXT_PUBLIC_FIREBASE_API_KEY=...
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
   NEXT_PUBLIC_FIREBASE_APP_ID=...
   ```

5. Actualiza `.firebaserc` con el ID real del proyecto (reemplaza `TU_FIREBASE_PROJECT_ID`).
6. Despliega las reglas (requiere [Firebase CLI](https://firebase.google.com/docs/cli)):

   ```bash
   npm install -g firebase-tools
   firebase login
   firebase deploy --only firestore:rules,storage
   ```

   Las reglas (`firestore.rules`, `storage.rules`) exigen usuario autenticado para leer o
   escribir cualquier dato — no hay acceso público.

## 2. Desarrollo local

```bash
npm install
npm run dev
```

Abre http://localhost:3000 — redirige a `/login`. Inicia sesión con el usuario creado en
Firebase Authentication.

## 3. Desplegar en Vercel

1. Importa el repositorio de GitHub en [Vercel](https://vercel.com/new).
2. En *Environment Variables*, agrega las mismas seis variables `NEXT_PUBLIC_FIREBASE_*`
   del paso 1 (Production, Preview y Development).
3. Deploy. Cada push a `main` genera un nuevo deploy en producción.

## Estado actual / próximos pasos

- Los cinco módulos (Propietarios, Inmuebles, Contratos, Arrendatarios, Mantenimientos)
  están conectados a Firestore en tiempo real, con subida de documentos PDF a Storage.
- El gráfico de tendencia de cánones en el Dashboard usa datos de ejemplo hasta que se
  registre un histórico real (mes a mes) — próximo módulo natural: "Reportes".
- Los KPIs financieros de gastos, comisiones y rentabilidad quedan en 0 hasta agregar un
  módulo de "Gastos" que los alimente; el resto del Dashboard ya lee datos reales.
- La autenticación es un guard simple de Firebase Auth (sin roles todavía). Si se necesitan
  roles (admin vs. agente), se puede agregar un campo `rol` en Firestore bajo `usuarios/{uid}`
  y extender `AuthContext`.
