'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCollection } from '@/hooks/useCollection';
import PageHead from '@/components/ui/PageHead';
import DataTable from '@/components/ui/DataTable';
import Pill from '@/components/ui/Pill';
import { TIPO_OPTIONS, ESTADO_OPTIONS, ESTADO_PILL } from '@/features/novedades/service';
import { formatDate } from '@/lib/format';

export default function NovedadesPage() {
  const { items, loading } = useCollection('novedades', { orderByField: 'createdAt', direction: 'desc' });
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [tipoFiltro, setTipoFiltro] = useState('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return items.filter((n) => {
      const matchesTerm = !term || n.empleadoNombre?.toLowerCase().includes(term);
      const matchesEstado = !estadoFiltro || n.estado === estadoFiltro;
      const matchesTipo = !tipoFiltro || n.tipo === tipoFiltro;
      return matchesTerm && matchesEstado && matchesTipo;
    });
  }, [items, search, estadoFiltro, tipoFiltro]);

  const pendientes = items.filter((n) => n.estado === 'pendiente').length;

  const columns = [
    { key: 'empleado', header: 'Empleado', render: (n) => <div className="cell-main">{n.empleadoNombre}</div> },
    { key: 'tipo', header: 'Tipo', render: (n) => n.tipoLabel },
    { key: 'fechas', header: 'Fechas', render: (n) => n.fechaFin && n.fechaFin !== n.fechaInicio ? `${formatDate(n.fechaInicio)} — ${formatDate(n.fechaFin)}` : formatDate(n.fechaInicio) },
    { key: 'estado', header: 'Estado', render: (n) => <Pill status={ESTADO_PILL[n.estado]}>{n.estadoLabel}</Pill> },
  ];

  return (
    <section>
      <PageHead title="Novedades y solicitudes" subtitle={`${items.length} solicitudes · ${pendientes} pendientes de revisión`} />

      <div className="toolbar">
        <input className="search" placeholder="Buscar por empleado..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select style={{ border: '1px solid #DEE1E7', borderRadius: 10, padding: '9px 13px', fontSize: '.85rem', background: '#fff' }} value={tipoFiltro} onChange={(e) => setTipoFiltro(e.target.value)}>
          <option value="">Todos los tipos</option>
          {TIPO_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        <button type="button" className={estadoFiltro === '' ? 'btn btn-primary' : 'btn btn-secondary'} style={{ padding: '7px 16px', fontSize: '.82rem' }} onClick={() => setEstadoFiltro('')}>Todos</button>
        {ESTADO_OPTIONS.map((e) => (
          <button key={e.value} type="button" className={estadoFiltro === e.value ? 'btn btn-primary' : 'btn btn-secondary'} style={{ padding: '7px 16px', fontSize: '.82rem' }} onClick={() => setEstadoFiltro(e.value)}>{e.label}</button>
        ))}
      </div>

      {loading ? (
        <div className="empty-state">Cargando...</div>
      ) : (
        <DataTable columns={columns} rows={filtered} onRowClick={(row) => router.push(`/gestion-humana/novedades/${row.id}`)} emptyMessage="No hay solicitudes con ese filtro." />
      )}
    </section>
  );
}
