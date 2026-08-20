# ERP Zona Centro — mapa del proyecto

Lee esto primero. Te ahorra volver a explorar el repo desde cero.

## Qué es esto

ERP interno de **Zona Centro Inmobiliaria S.A.S**. Dos frentes en producción:
1. **Finca raíz** (Operaciones/Contabilidad/Financiero/Comercial): propietarios, inmuebles, contratos, arrendatarios, mantenimientos, mapa.
2. **Gestión Humana**: registro de empleados + autoservicio (perfil propio, foto).

No confundir con el otro proyecto del mismo cliente: **JV-Negocios-del-Cesar** (`C:\Users\adria\Documents\JV-Negocios-del-Cesar`), que es un dashboard de resultados de **joyerías**, repo y Firebase totalmente aparte. Si el usuario habla de "joyerías", "Bitácora", "PILA" fuera del contexto de empleados, o de "reportes semanales/mensuales", es ese otro proyecto, no este.

## Infraestructura

| | |
|---|---|
| Código | `C:\Users\adria\Documents\sistema erp` → GitHub `Apolo031/erp` (rama `main`) |
| Deploy | Vercel, team `negociosdelcesar`, proyecto `erp` → https://erp-negociosdelcesar.vercel.app |
| Firebase | Proyecto `erp-zc` (Auth + Firestore; **Storage NO está activado** — requiere plan Blaze, el usuario decidió posponerlo) |
| Stack | Next.js 14 (App Router, JS no TS) + Firebase client SDK + firebase-admin (solo API routes) + Leaflet (mapa) + Chart.js (dashboard) |
| Login admin app | `admin@zonacentro.com` (Firebase Auth de `erp-zc` — **no** es el correo de Google del usuario) |

Build local: `npm run build`. Las API routes de Gestión Humana usan `firebase-admin` con inicialización perezosa (`src/lib/firebase/admin.js`), así que el build local NO necesita `FIREBASE_SERVICE_ACCOUNT_KEY` — solo falla en runtime si se llama esa ruta sin la variable puesta en Vercel.

## Dónde vive cada cosa

```
src/app/(app)/<módulo>/page.js          lista
src/app/(app)/<módulo>/[id]/page.js     alta/edición (id="nuevo" = crear)
src/features/<módulo>/service.js        API de Firestore + constantes + emptyX()
src/features/<módulo>/XxxForm.jsx       formulario (usado por [id]/page.js)
src/components/ui/*                     Kpi, DataTable, Pill, PageHead, Dropzone, FormMsg (compartidos)
src/lib/firestore/crud.js               collectionApi(nombre) genérico — create/update/remove/subscribe
src/lib/firebase/client.js              SDK cliente (NEXT_PUBLIC_FIREBASE_*)
src/lib/firebase/admin.js               SDK admin, SOLO server (FIREBASE_SERVICE_ACCOUNT_KEY), init perezosa
src/lib/firebase/counters.js            códigos secuenciales (INM-0143, ZC-2026-036...) vía counters/{nombre}
src/context/AuthContext.jsx             user, role, empleadoId, isAdmin, isGestionHumana, getIdToken()
src/components/layout/AuthGuard.jsx     redirige según rol; usar dentro de (app)/layout.js
src/components/layout/Sidebar.jsx       menú acordeón, un grupo por módulo, visibilidad por rol
```

**Patrón para agregar un módulo nuevo:** copiar la forma de `src/features/inmuebles` (el más completo: subdocumentos, contadores, coordenadas). Registrar sus 2 rutas en `src/app/(app)/<módulo>/`, y agregarlo a `Sidebar.jsx` dentro del grupo que corresponda.

## Módulos y su estado

| Módulo | Ruta | Estado |
|---|---|---|
| Consolidado | `/dashboard` | KPIs + gráfico (algunos valores son de ejemplo, ver comentario en el código) |
| Contratos | `/contratos` | Completo |
| Propietarios | `/propietarios` | Completo |
| Arrendatarios | `/arrendatarios` | Completo |
| Inmuebles | `/inmuebles` | Completo, con `lat`/`lng`, `pais`, `copropietarios[]` |
| Mantenimientos | `/mantenimientos` | Completo |
| Mapa | `/mapa` | Leaflet, agrupado por ciudad (acordeón), filtros estado/país/propietario |
| Contabilidad / Financiero / Comercial | `/contabilidad` `/financiero` `/comercial` | **Placeholders vacíos**, sin construir |
| Gestión Humana → Empleados | `/gestion-humana/empleados` | Completo (ver detalle abajo) |
| Gestión Humana → Novedades | `/gestion-humana/novedades` | Completo: lista + aprobar/rechazar |
| Mi perfil | `/mi-perfil` | Autoservicio: solo lectura + cambiar foto + solicitar/ver novedades propias |

### Gestión Humana — detalle

- 15 empleados reales ya importados desde datos de Bitácora (`empleados` en Firestore): identificación, datos laborales, salario, seguridad social (EPS/pensión/ARL/caja), bancarios, familiares, pagos fijos.
- El usuario admin (`admin@zonacentro.com`) está vinculado a su propio empleado (Adrian Camilo Aragón Rangel) vía `usuarios/{uid}.empleadoId`.
- Crear cuenta de acceso a un empleado: botón en la ficha → `POST /api/empleados/crear-cuenta` (Admin SDK, sin contraseña — genera un enlace de "definir contraseña" que Gestión Humana copia y le manda al empleado). Requiere `FIREBASE_SERVICE_ACCOUNT_KEY` en Vercel.
- **Novedades y solicitudes** (`novedades` en Firestore): vacaciones, permisos (por horas/jornada), licencias (remunerada/no remunerada), incapacidades. El empleado solicita desde Mi Perfil (con soporte PDF/imagen opcional, mismo límite ~700KB); Gestión Humana aprueba/rechaza con comentario en `/gestion-humana/novedades`. Historial visible en Mi Perfil (propio) y en la ficha del empleado (GH). Requiere el índice compuesto `novedades`: `empleadoId ASC, createdAt DESC` (ya creado en Firebase Console → Firestore → Índices).
- **Próximo paso natural (no construido aún):** usar las novedades aprobadas como insumo real para un futuro módulo de liquidación/nómina. La visión completa (nómina, PILA, prestaciones, IA) está descrita en `C:\Users\adria\Desktop\Inf ERP\gh\SOFTWARE NOMINA BITAKORA.docx` — es la referencia a futuro, no alcance actual.

## Modelo de roles (crítico, no romperlo)

Roles en `usuarios/{uid}.role`: `admin` | `gestion_humana` | `usuario`. Se lee desde `AuthContext` (listener en vivo sobre `usuarios/{uid}`) y se aplica en dos capas:

1. **Firestore rules** (`firestore.rules`, fuente de verdad real):
   - `propietarios/arrendatarios/inmuebles/contratos/mantenimientos`: solo `admin`.
   - `empleados`: lectura/escritura total para `admin`/`gestion_humana`; un `usuario` normal solo puede leer su propio doc (`usuarios/{uid}.empleadoId == docId`) y solo puede *actualizar* los campos `foto`/`updatedAt` de ese mismo doc.
   - `usuarios/{uid}`: cada quien lee el suyo; solo GH/admin escribe (asigna roles).
   - `counters`: admin o GH.
2. **UI** (`AuthGuard.jsx` + `Sidebar.jsx`): redirige/oculta según rol, pero es solo conveniencia — la seguridad real está en las rules.

Para tocar las reglas: el archivo `firestore.rules` del repo es la fuente que se **debe publicar manualmente** en Firebase Console → Firestore → Reglas (no hay CI que lo haga). Si cambias este archivo, publícalo también en la consola o quedan desincronizados.

## Firestore: colecciones

`propietarios`, `arrendatarios`, `inmuebles`, `contratos`, `mantenimientos`, `counters`, `empleados`, `usuarios`, `novedades`. Ver los `service.js` de cada `features/<módulo>` para el shape exacto de cada documento — están escritos como la fuente de verdad del esquema (no hay un schema separado).

`src/lib/firestore/crud.js` soporta `whereClauses: [[campo, operador, valor], ...]` en `collectionApi(nombre, opciones)` — necesario cuando la regla de seguridad es "solo tus propios registros" (ej. `novedades` filtrado por `empleadoId`), porque Firestore rechaza una consulta sin el `where` que la regla espera, aunque el usuario tendría permiso documento por documento. Si agregas un `where` nuevo en un módulo, probablemente necesites un índice compuesto (Firestore te da un link al fallar, o créalo a mano en Firestore → Índices).

## Gotchas ya resueltos (no los reintroduzcas)

- **`export const dynamic = 'force-dynamic'`** en `src/app/layout.js`: necesario porque el panel es 100% autenticado, no tiene sentido pre-renderizar estático, y evita que el build necesite las env vars de Firebase.
- **Inicialización perezosa de `firebase-admin`** (`src/lib/firebase/admin.js`, patrón Proxy): sin esto, `next build` falla si `FIREBASE_SERVICE_ACCOUNT_KEY` no existe en el entorno de build, porque Next evalúa el módulo al recolectar datos de las API routes.
- **Nunca peguar API keys/credenciales en formularios de terceros (Vercel, etc.) yo mismo** — Firebase config pública (`NEXT_PUBLIC_*`) sí se puede escribir en archivos locales `.env.local`; `FIREBASE_SERVICE_ACCOUNT_KEY` (secreto real) el usuario lo pega él mismo en Vercel.
- **Editor de reglas de Firebase Console (Monaco)**: `Ctrl+A` no selecciona de forma confiable. Para reemplazar todo el contenido: click al inicio, `Shift+click` (drag) hasta el final visible, y usar la acción `type` para sobrescribir — sí respeta la selección y reemplaza correctamente.
- **Descargas de Firebase Console (claves de servicio, KML de Google My Maps)** quedan como `.tmp` en Descargas — hay que renombrarlas/moverlas, no aparecen con su nombre final.
- **Storage no está activado** (plan Spark) → las fotos (propietarios, inmuebles, empleados) se guardan como `data:` URL directo en el documento de Firestore, con tope ~700KB por archivo. Si esto empieza a doler, la salida es activar Storage (requiere Blaze).

## Import de datos reales ya hecho

- 266 inmuebles / 234 contratos / 135 arrendatarios / 20 propietarios, desde `CONTRATOS GEOLOCALIZACION.xlsx` + un mapa de Google My Maps ("INMUEBLES ADMINISTRADOS POR ZCI") cruzado por número de contrato para las coordenadas.
- 15 empleados desde el export de Bitácora (`Información total empleados.xlsx`, dentro de `attachments.zip`).
- Los scripts de import fueron ad-hoc (Node + `firebase-admin`, llave de servicio temporal generada y borrada después de usar) — no quedaron guardados en el repo porque eran de un solo uso. Si hay que reimportar o hacer un import similar, el patrón es: generar clave de servicio en Firebase Console → Cuentas de servicio, transformar el Excel con `xlsx` (paquete npm), escribir con `firebase-admin/firestore` en lotes (`batch`), borrar la clave al terminar.
