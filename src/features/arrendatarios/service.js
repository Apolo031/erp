import { collectionApi } from '@/lib/firestore/crud';

export const arrendatariosApi = collectionApi('arrendatarios', { orderByField: 'nombres', direction: 'asc' });

export const SEGURO_OPTIONS = ['No aplica', 'Sí, vigente', 'Por confirmar'];

export const ESTADOS = [
  { value: 'activo', label: 'Al día' },
  { value: 'pendiente', label: 'Mora 30–60 días' },
  { value: 'moroso', label: 'Mora > 60 días' },
  { value: 'terminado', label: 'Contrato terminado' },
];

export function emptyArrendatario() {
  return {
    nombres: '', apellidos: '', cedula: '', telefono: '', celular: '', email: '', direccion: '', ciudad: '',
    empresa: '', actividad: '', representanteLegal: '', referencias: '',
    fiador: '', seguro: 'No aplica',
    inmuebleId: '', inmuebleLabel: '',
    estado: 'activo', estadoLabel: 'Al día',
    notas: '', documentos: [],
  };
}
