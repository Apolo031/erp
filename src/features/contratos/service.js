import { collectionApi } from '@/lib/firestore/crud';
import { getNextSequence } from '@/lib/firebase/counters';

export const contratosApi = collectionApi('contratos', { orderByField: 'createdAt', direction: 'desc' });

export const TIPO_CONTRATO_OPTIONS = ['Arriendo', 'Administración', 'Venta'];
export const INCREMENTO_OPTIONS = ['IPC', 'Índice pactado', 'Fijo %'];
export const SEGURO_OPTIONS = ['No aplica', 'Sí, vigente', 'Por confirmar'];

export const ESTADOS = [
  { value: 'activo', label: 'Activo' },
  { value: 'vencido', label: 'Vencido' },
  { value: 'terminado', label: 'Terminado' },
];

export async function nextContratoCodigo() {
  const seq = await getNextSequence('contratos', { start: 0 });
  return `ZC-${new Date().getFullYear()}-${String(seq).padStart(3, '0')}`;
}

export function emptyContrato() {
  return {
    codigo: '', numeroContratoOrigen: '', tipo: 'Arriendo', inmuebleId: '', inmuebleLabel: '', arrendatarioId: '', arrendatarioNombre: '',
    duracion: '', fechaInicio: '', fechaVencimiento: '', canon: '', canonValor: 0,
    incremento: 'IPC', deposito: '', seguro: 'No aplica', notas: '',
    comision: { porcentaje: '', valorCanon: '', porcentajeAdministracion: '', valorAdministracion: '', valorConIva: '' },
    estado: 'activo', estadoLabel: 'Activo', documentos: [],
  };
}
