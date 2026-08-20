import { collectionApi } from '@/lib/firestore/crud';

export const empleadosApi = collectionApi('empleados', { orderByField: 'nombreCompleto', direction: 'asc' });

export const TIPO_DOCUMENTO_OPTIONS = ['CC', 'CE', 'PA', 'RC', 'TI', 'NIT'];
export const GENERO_OPTIONS = ['Femenino', 'Masculino', 'Otro'];
export const ESTADO_CIVIL_OPTIONS = ['Soltero', 'Casado', 'Unión libre', 'Divorciado', 'Viudo'];
export const TIPO_CONTRATO_OPTIONS = ['Término indefinido', 'Término fijo', 'Obra o labor', 'Prestación de servicios', 'Aprendizaje'];
export const ESTADO_CONTRATO_OPTIONS = [
  { value: 'activo', label: 'Activo' },
  { value: 'terminado', label: 'Terminado' },
  { value: 'vacaciones', label: 'En vacaciones' },
  { value: 'incapacidad', label: 'En incapacidad' },
];
export const FORMA_PAGO_OPTIONS = ['Transferencia', 'Efectivo', 'Cheque'];
export const TIPO_CUENTA_OPTIONS = ['Cuenta de ahorros', 'Cuenta corriente'];
export const TIPO_SALARIO_OPTIONS = ['Salario ordinario', 'Salario integral', 'Por horas'];
export const PARENTESCO_OPTIONS = ['Cónyuge', 'Hijo(a)', 'Padre', 'Madre', 'Hermano(a)', 'Otro'];

export function emptyEmpleado() {
  return {
    identificacion: { tipo: 'CC', numero: '', fechaExpedicion: '', ciudadExpedicion: '' },
    nombreCompleto: '', fechaNacimiento: '', genero: '', estadoCivil: '',
    paisResidencia: 'Colombia', ciudadResidencia: '', direccion: '',
    telefonoFijo: '', telefonoCelular: '', correoElectronico: '',
    laboral: {
      area: '', cargo: '', estadoContrato: 'activo', estadoContratoLabel: 'Activo',
      fechaIngreso: '', fechaTerminacion: '', tipoContrato: 'Término indefinido',
      sede: '', centroDeTrabajo: '',
    },
    salario: { tipo: 'Salario ordinario', valor: '', valorHora: '', formaPago: 'Transferencia' },
    bancario: { tipoCuenta: 'Cuenta de ahorros', numeroCuenta: '', banco: '' },
    seguridadSocial: { eps: '', fondoPension: '', arl: '', cajaCompensacion: '', claseRiesgo: '' },
    familiares: [],
    pagosFijos: [],
    foto: '', fotoNombre: '',
    uid: '', tieneCuenta: false, correoAcceso: '',
    notas: '', documentos: [],
  };
}
