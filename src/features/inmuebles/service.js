import { collectionApi } from '@/lib/firestore/crud';
import { getNextSequence } from '@/lib/firebase/counters';
import { padCode } from '@/lib/format';

export const inmueblesApi = collectionApi('inmuebles', { orderByField: 'direccion', direction: 'asc' });

export const TIPO_OPTIONS = [
  { value: 'local', label: 'Local comercial' },
  { value: 'centro', label: 'Centro comercial' },
  { value: 'oficina', label: 'Oficina' },
  { value: 'consultorio', label: 'Consultorio' },
  { value: 'bodega', label: 'Bodega' },
  { value: 'edificio', label: 'Edificio' },
  { value: 'casa', label: 'Casa' },
  { value: 'apartamento', label: 'Apartamento' },
  { value: 'lote', label: 'Lote' },
  { value: 'parqueadero', label: 'Parqueadero' },
  { value: 'otro', label: 'Otro' },
];

export const VIVIENDA_TIPOS = ['casa', 'apartamento'];

export const ASEGURADORA_OPTIONS = ['Sin asegurar', 'Seguros Bolívar', 'Sura', 'Mapfre'];

export const ESTADOS = [
  { value: 'disponible', label: 'Disponible' },
  { value: 'arrendado', label: 'Arrendado' },
  { value: 'proceso', label: 'En remodelación' },
  { value: 'inactivo', label: 'En venta' },
];

export const LOCAL_AMENITIES = [
  { key: 'bodegaInterna', label: 'Bodega interna' },
  { key: 'mezanine', label: 'Mezanine' },
  { key: 'puntoGas', label: 'Punto de gas' },
  { key: 'energiaTrifasica', label: 'Energía trifásica' },
  { key: 'transformador', label: 'Transformador' },
  { key: 'aireAcondicionado', label: 'Aire acondicionado' },
  { key: 'extractor', label: 'Extractor' },
];

export const VIVIENDA_AMENITIES = [
  { key: 'cocina', label: 'Cocina' },
  { key: 'sala', label: 'Sala' },
  { key: 'comedor', label: 'Comedor' },
  { key: 'patio', label: 'Patio' },
  { key: 'balcon', label: 'Balcón' },
  { key: 'terraza', label: 'Terraza' },
  { key: 'deposito', label: 'Depósito' },
  { key: 'zonaSocial', label: 'Zona social' },
];

export async function nextInmuebleCodigo() {
  const seq = await getNextSequence('inmuebles', { start: 100 });
  return padCode('INM', seq);
}

export function emptyInmueble() {
  return {
    codigo: '', codigoInterno: '', tipoVal: 'local', tipoLabel: 'Local comercial',
    propietarioId: '', propietarioNombre: '',
    direccion: '', ciudad: '', pais: '', barrio: '', area: '', piso: '', estrato: '',
    aseguradora: 'Sin asegurar', matricula: '', catastral: '', valorCatastral: '', valorM2: '', descripcion: '',
    agencia: '', grupo: '', zona: '',
    lat: null, lng: null,
    detalleLocal: {
      centroComercial: '', numeroLocal: '', areaVitrina: '', areaExhibicion: '', alturaLibre: '',
      usoPermitido: '', actividadAutorizada: '', canonMinimo: '', canonNegociado: '', horarios: '',
      amenities: Object.fromEntries(LOCAL_AMENITIES.map((a) => [a.key, false])),
    },
    detalleVivienda: {
      habitaciones: '', banos: '', parqueadero: '',
      amenities: Object.fromEntries(VIVIENDA_AMENITIES.map((a) => [a.key, false])),
    },
    servicios: { agua: '', luz: '', gas: '' },
    copropietarios: [],
    estado: 'disponible', estadoLabel: 'Disponible',
    documentos: [],
  };
}
