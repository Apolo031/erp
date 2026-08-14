import { collectionApi } from '@/lib/firestore/crud';
import { getNextSequence } from '@/lib/firebase/counters';
import { padCode } from '@/lib/format';

export const mantenimientosApi = collectionApi('mantenimientos', { orderByField: 'createdAt', direction: 'desc' });

export const TIPO_OPTIONS = ['Reparación', 'Mantenimiento preventivo', 'PQRS de arrendatario', 'Remodelación'];
export const PRIORIDAD_OPTIONS = ['Normal', 'Alta', 'Urgente'];

export const ESTADO_MAP = {
  'Pendiente de aprobación': { value: 'pendiente', label: 'Pend. aprobación' },
  'En proceso': { value: 'proceso', label: 'En proceso' },
  Finalizado: { value: 'activo', label: 'Finalizado' },
};

export async function nextMantenimientoCodigo() {
  const seq = await getNextSequence('mantenimientos', { start: 0 });
  return padCode('MNT', seq, 3);
}

export function emptyMantenimiento() {
  return {
    codigo: '', inmuebleId: '', inmuebleLabel: '', tipo: 'Reparación', proveedor: '', costo: '',
    prioridad: 'Normal', estadoSeleccion: 'Pendiente de aprobación', estado: 'pendiente', estadoLabel: 'Pend. aprobación',
    descripcion: '',
  };
}
