import { collectionApi } from '@/lib/firestore/crud';

export const prestacionesApi = collectionApi('prestaciones', { orderByField: 'fechaVencimiento', direction: 'asc' });

export const TIPO_OPTIONS = [
  { value: 'cesantias', label: 'Cesantías' },
  { value: 'intereses_cesantias', label: 'Intereses a las cesantías' },
  { value: 'prima', label: 'Prima de servicios' },
];

export const TIPO_LABEL = Object.fromEntries(TIPO_OPTIONS.map((t) => [t.value, t.label]));

export const ESTADO_OPTIONS = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'pagada', label: 'Pagada' },
];

export const ESTADO_PILL = { pendiente: 'pendiente', pagada: 'activo' };

export function emptyPrestacion() {
  return {
    empleadoId: '', empleadoNombre: '',
    tipo: 'cesantias', tipoLabel: 'Cesantías',
    periodo: '',
    valorCausado: '', valorPagado: '',
    fechaPago: '', fechaVencimiento: '',
    estado: 'pendiente', estadoLabel: 'Pendiente',
    notas: '',
  };
}

/** Días hasta el vencimiento (negativo si ya venció). Null si no tiene fecha. */
export function diasParaVencer(fechaVencimiento) {
  if (!fechaVencimiento) return null;
  const hoy = new Date(new Date().toISOString().slice(0, 10) + 'T00:00:00');
  const venc = new Date(fechaVencimiento + 'T00:00:00');
  return Math.round((venc - hoy) / 86400000);
}
