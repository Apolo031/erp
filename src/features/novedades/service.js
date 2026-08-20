import { collectionApi } from '@/lib/firestore/crud';

export const novedadesApi = collectionApi('novedades', { orderByField: 'createdAt', direction: 'desc' });

export const TIPO_OPTIONS = [
  { value: 'vacaciones', label: 'Vacaciones' },
  { value: 'permiso_horas', label: 'Permiso por horas' },
  { value: 'permiso_jornada', label: 'Permiso por jornada' },
  { value: 'licencia_remunerada', label: 'Licencia remunerada' },
  { value: 'licencia_no_remunerada', label: 'Licencia no remunerada' },
  { value: 'incapacidad', label: 'Incapacidad' },
];

export const TIPO_LABEL = Object.fromEntries(TIPO_OPTIONS.map((t) => [t.value, t.label]));

export const ESTADO_OPTIONS = [
  { value: 'pendiente', label: 'Pendiente' },
  { value: 'aprobada', label: 'Aprobada' },
  { value: 'rechazada', label: 'Rechazada' },
];

export const ESTADO_PILL = { pendiente: 'pendiente', aprobada: 'activo', rechazada: 'vencido' };

export function emptyNovedad() {
  return {
    empleadoId: '', empleadoNombre: '',
    tipo: 'vacaciones', tipoLabel: 'Vacaciones',
    fechaInicio: '', fechaFin: '', horaInicio: '', horaFin: '',
    motivo: '',
    soporte: null,
    estado: 'pendiente', estadoLabel: 'Pendiente',
    comentarioGestion: '', gestionadoPor: '', gestionadoEn: '',
  };
}
