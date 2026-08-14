import { collectionApi } from '@/lib/firestore/crud';

export const propietariosApi = collectionApi('propietarios', { orderByField: 'nombres', direction: 'asc' });

export const TRIBUTARY_FLAGS = [
  { key: 'ivaResponsable', label: 'Responsable del IVA' },
  { key: 'ivaNoResponsable', label: 'No Responsable del IVA' },
  { key: 'retenedor', label: 'Retenedor' },
  { key: 'autoRetenedor', label: 'AutoRetenedor' },
  { key: 'retenedorIvaGranContribuyente', label: 'Retenedor del IVA - Gran Contribuyente' },
  { key: 'retenedorIca', label: 'Retenedor de ICA' },
  { key: 'regimenSimple', label: 'Régimen Simple' },
  { key: 'retenedorIvaRegimenSimple', label: 'Retenedor IVA a Régimen Simple' },
  { key: 'exentoCree', label: 'Exento del Cree' },
  { key: 'sinRut', label: 'Sin Rut' },
  { key: 'personaExtranjero', label: 'Persona Extranjero' },
];

export const TIPO_TITULAR_OPTIONS = ['Persona natural', 'Empresa', 'Herencia', 'Sociedad'];

export function emptyPropietario() {
  return {
    nombres: '', apellidos: '', cedula: '', tipoDocumento: '', telefono: '', celular: '', email: '', emailNotificaciones: '',
    direccion: '', ciudad: '', tipoTitular: '',
    tributaria: Object.fromEntries(TRIBUTARY_FLAGS.map((f) => [f.key, false])),
    banco: '', tipoCuenta: '', numeroCuenta: '', beneficiarioNombre: '', beneficiarioCedula: '',
    notas: '', documentos: [],
  };
}
