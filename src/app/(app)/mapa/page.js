'use client';

import { useMemo, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useCollection } from '@/hooks/useCollection';
import PageHead from '@/components/ui/PageHead';
import Pill from '@/components/ui/Pill';

const InmueblesMap = dynamic(() => import('@/components/map/InmueblesMap'), { ssr: false });

const ESTADO_CHIPS = [
  { value: '', label: 'Todos' },
  { value: 'disponible', label: 'Libres' },
  { value: 'arrendado', label: 'Arrendados' },
  { value: 'proceso', label: 'En remodelación' },
  { value: 'inactivo', label: 'En venta' },
];

export default function MapaPage() {
  const { items, loading } = useCollection('inmuebles', { orderByField: 'direccion', direction: 'asc' });
  const [search, setSearch] = useState('');
  const [estadoFiltro, setEstadoFiltro] = useState('');
  const [propietarioFiltro, setPropietarioFiltro] = useState('');
  const [expandedCities, setExpandedCities] = useState(() => new Set());
  const [selectedId, setSelectedId] = useState(null);
  const [focus, setFocus] = useState(null);

  const conCoords = useMemo(() => items.filter((i) => typeof i.lat === 'number' && typeof i.lng === 'number'), [items]);

  const propietarios = useMemo(() => {
    const set = new Set(conCoords.map((i) => i.propietarioNombre).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [conCoords]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return conCoords.filter((i) => {
      const matchesTerm = !term || `${i.direccion} ${i.ciudad} ${i.propietarioNombre}`.toLowerCase().includes(term);
      const matchesEstado = !estadoFiltro || i.estado === estadoFiltro;
      const matchesPropietario = !propietarioFiltro || i.propietarioNombre === propietarioFiltro;
      return matchesTerm && matchesEstado && matchesPropietario;
    });
  }, [conCoords, search, estadoFiltro, propietarioFiltro]);

  const groupedByCity = useMemo(() => {
    const map = new Map();
    for (const item of filtered) {
      const city = item.ciudad || 'Sin ciudad';
      if (!map.has(city)) map.set(city, []);
      map.get(city).push(item);
    }
    return Array.from(map.entries()).sort((a, b) => b[1].length - a[1].length);
  }, [filtered]);

  function toggleCity(city, list) {
    setExpandedCities((prev) => {
      const next = new Set(prev);
      const wasExpanded = next.has(city);
      if (wasExpanded) next.delete(city);
      else next.add(city);
      return next;
    });
    const bounds = list.map((p) => [p.lat, p.lng]);
    setSelectedId(null);
    setFocus({ bounds });
  }

  function focusItem(item) {
    setSelectedId(item.id);
    setFocus({ center: [item.lat, item.lng], zoom: 16 });
  }

  const arrendadosCount = filtered.filter((i) => i.estado === 'arrendado').length;
  const libresCount = filtered.filter((i) => i.estado === 'disponible').length;

  return (
    <section>
      <PageHead
        title="Mapa"
        subtitle={`${conCoords.length} de ${items.length} inmuebles con ubicación · ${arrendadosCount} arrendados · ${libresCount} libres`}
      />

      <div className="toolbar">
        <input className="search" placeholder="Buscar por dirección, ciudad o propietario..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <select
          style={{ border: '1px solid #DEE1E7', borderRadius: 10, padding: '9px 13px', fontSize: '.85rem', background: '#fff', minWidth: 200 }}
          value={propietarioFiltro}
          onChange={(e) => setPropietarioFiltro(e.target.value)}
        >
          <option value="">Todos los propietarios</option>
          {propietarios.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
        {ESTADO_CHIPS.map((chip) => (
          <button
            key={chip.value}
            type="button"
            className={estadoFiltro === chip.value ? 'btn btn-primary' : 'btn btn-secondary'}
            style={{ padding: '7px 16px', fontSize: '.82rem' }}
            onClick={() => setEstadoFiltro(chip.value)}
          >
            {chip.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="empty-state">Cargando...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 18, alignItems: 'start' }}>
          <div className="panel" style={{ height: 560, overflowY: 'auto', padding: '6px' }}>
            {groupedByCity.length === 0 && <div className="empty-state">Ningún inmueble coincide con el filtro.</div>}
            {groupedByCity.map(([city, list]) => {
              const expanded = expandedCities.has(city);
              const arrendados = list.filter((i) => i.estado === 'arrendado').length;
              const libres = list.filter((i) => i.estado === 'disponible').length;
              return (
                <div key={city} style={{ borderBottom: '1px solid var(--border)' }}>
                  <button
                    type="button"
                    onClick={() => toggleCity(city, list)}
                    style={{
                      width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      background: 'none', border: 'none', cursor: 'pointer', padding: '12px 10px', textAlign: 'left',
                    }}
                  >
                    <span>
                      <span style={{ fontWeight: 700, fontSize: '.86rem' }}>{expanded ? '▾' : '▸'} {city}</span>
                      <div className="cell-sub">{list.length} inmuebles · {arrendados} arrendados · {libres} libres</div>
                    </span>
                  </button>
                  {expanded && (
                    <div style={{ paddingBottom: 6 }}>
                      {list.map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => focusItem(item)}
                          style={{
                            width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8,
                            background: selectedId === item.id ? '#F7F8FA' : 'none', border: 'none', cursor: 'pointer',
                            padding: '8px 10px 8px 24px', textAlign: 'left', borderRadius: 8,
                          }}
                        >
                          <span style={{ fontSize: '.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.direccion}</span>
                          <Pill status={item.estado}>{item.estadoLabel}</Pill>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="panel" style={{ height: 560, padding: 0, overflow: 'hidden' }}>
            <InmueblesMap puntos={filtered} focus={focus} selectedId={selectedId} onMarkerClick={setSelectedId} />
          </div>
        </div>
      )}

      {selectedId && (() => {
        const item = filtered.find((i) => i.id === selectedId);
        if (!item) return null;
        return (
          <div className="card" style={{ marginTop: 18 }}>
            <h2>Inmueble seleccionado</h2>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
              <div>
                <div className="cell-main">{item.direccion}</div>
                <div className="cell-sub">{item.tipoLabel} · {item.ciudad} · {item.propietarioNombre || 'Sin propietario'}</div>
              </div>
              <Link className="btn btn-secondary" href={`/inmuebles/${item.id}`}>Ver ficha completa →</Link>
            </div>
          </div>
        );
      })()}
    </section>
  );
}
