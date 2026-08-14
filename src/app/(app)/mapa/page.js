'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useCollection } from '@/hooks/useCollection';
import PageHead from '@/components/ui/PageHead';
import DataTable from '@/components/ui/DataTable';
import Pill from '@/components/ui/Pill';
import { ESTADOS } from '@/features/inmuebles/service';

const InmueblesMap = dynamic(() => import('@/components/map/InmueblesMap'), { ssr: false });

export default function MapaPage() {
  const { items, loading } = useCollection('inmuebles', { orderByField: 'direccion', direction: 'asc' });
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('');

  const conCoords = useMemo(() => items.filter((i) => typeof i.lat === 'number' && typeof i.lng === 'number'), [items]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return conCoords.filter((i) => {
      const matchesTerm = !term || `${i.direccion} ${i.ciudad} ${i.propietarioNombre}`.toLowerCase().includes(term);
      const matchesEstado = !estadoFiltro || i.estado === estadoFiltro;
      return matchesTerm && matchesEstado;
    });
  }, [conCoords, search, estadoFiltro]);

  const columns = [
    { key: 'direccion', header: 'Inmueble', render: (i) => <div className="cell-main">{i.direccion}</div> },
    { key: 'ciudad', header: 'Ciudad' },
    { key: 'tipoLabel', header: 'Tipo' },
    { key: 'propietarioNombre', header: 'Propietario' },
    { key: 'estado', header: 'Estado', render: (i) => <Pill status={i.estado}>{i.estadoLabel}</Pill> },
  ];

  return (
    <section>
      <PageHead
        title="Mapa"
        subtitle={`${conCoords.length} de ${items.length} inmuebles con ubicación · ${items.length - conCoords.length} sin geolocalizar`}
      />

      <div className="toolbar">
        <input className="search" placeholder="Buscar por dirección, ciudad o propietario..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select style={{ border: '1px solid #DEE1E7', borderRadius: 10, padding: '9px 13px', fontSize: '.85rem', background: '#fff' }} value={estadoFiltro} onChange={(e) => setEstadoFiltro(e.target.value)}>
          <option value="">Todos los estados</option>
          {ESTADOS.map((e) => <option key={e.value} value={e.value}>{e.label}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="empty-state">Cargando...</div>
      ) : (
        <>
          <div className="panel" style={{ height: 480, marginBottom: 18, padding: 0, overflow: 'hidden' }}>
            <InmueblesMap puntos={filtered} onSelect={() => {}} />
          </div>
          <DataTable columns={columns} rows={filtered} onRowClick={(row) => router.push(`/inmuebles/${row.id}`)} emptyMessage="Ningún inmueble con ubicación coincide con el filtro." />
        </>
      )}
    </section>
  );
}
