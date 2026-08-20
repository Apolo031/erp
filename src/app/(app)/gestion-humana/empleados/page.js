'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCollection } from '@/hooks/useCollection';
import PageHead from '@/components/ui/PageHead';
import DataTable from '@/components/ui/DataTable';
import Pill from '@/components/ui/Pill';

export default function EmpleadosPage() {
  const { items, loading } = useCollection('empleados', { orderByField: 'nombreCompleto', direction: 'asc' });
  const router = useRouter();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return items;
    return items.filter((e) =>
      `${e.nombreCompleto} ${e.identificacion?.numero} ${e.laboral?.cargo} ${e.laboral?.area}`.toLowerCase().includes(term)
    );
  }, [items, search]);

  const columns = [
    {
      key: 'nombre', header: 'Empleado', render: (e) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {e.foto ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={e.foto} alt="" style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }} />
          ) : (
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--blue-bg)', color: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '.8rem' }}>
              {(e.nombreCompleto || '?').trim().charAt(0).toUpperCase()}
            </div>
          )}
          <div className="cell-main">{e.nombreCompleto}</div>
        </div>
      ),
    },
    { key: 'identificacion', header: 'Documento', render: (e) => `${e.identificacion?.tipo || ''} ${e.identificacion?.numero || ''}` },
    { key: 'cargo', header: 'Cargo', render: (e) => e.laboral?.cargo || '—' },
    { key: 'area', header: 'Área', render: (e) => e.laboral?.area || '—' },
    { key: 'estado', header: 'Estado', render: (e) => <Pill status={e.laboral?.estadoContrato === 'activo' ? 'activo' : 'pendiente'}>{e.laboral?.estadoContratoLabel || '—'}</Pill> },
    { key: 'cuenta', header: 'Cuenta', render: (e) => <Pill status={e.tieneCuenta ? 'activo' : 'inactivo'}>{e.tieneCuenta ? 'Creada' : 'Sin crear'}</Pill> },
  ];

  return (
    <section>
      <PageHead
        title="Empleados"
        subtitle={`${items.length} empleados registrados`}
        action={<button className="btn btn-primary" onClick={() => router.push('/gestion-humana/empleados/nuevo')}>+ Nuevo empleado</button>}
      />
      <div className="toolbar">
        <input className="search" placeholder="Buscar por nombre, documento, cargo o área..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <span style={{ fontSize: '.78rem', color: 'var(--mute)' }}>Haz clic sobre una fila para editarla</span>
      </div>
      {loading ? (
        <div className="empty-state">Cargando...</div>
      ) : (
        <DataTable columns={columns} rows={filtered} onRowClick={(row) => router.push(`/gestion-humana/empleados/${row.id}`)} />
      )}
    </section>
  );
}
