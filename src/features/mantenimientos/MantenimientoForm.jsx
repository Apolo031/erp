'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageHead from '@/components/ui/PageHead';
import FormMsg from '@/components/ui/FormMsg';
import { useCollection } from '@/hooks/useCollection';
import { mantenimientosApi, TIPO_OPTIONS, PRIORIDAD_OPTIONS, ESTADO_MAP, nextMantenimientoCodigo, emptyMantenimiento } from './service';

export default function MantenimientoForm({ id }) {
  const isNew = id === 'nuevo';
  const router = useRouter();
  const { items: inmuebles } = useCollection('inmuebles', { orderByField: 'direccion', direction: 'asc' });

  const [form, setForm] = useState(emptyMantenimiento());
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    if (isNew) return;
    mantenimientosApi.get(id).then((data) => {
      if (data) setForm({ ...emptyMantenimiento(), ...data });
      setLoading(false);
    });
  }, [id, isNew]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function selectInmueble(inmuebleId) {
    const inm = inmuebles.find((i) => i.id === inmuebleId);
    setForm((f) => ({ ...f, inmuebleId, inmuebleLabel: inm ? inm.direccion : '' }));
  }

  function selectEstado(estadoSeleccion) {
    const mapped = ESTADO_MAP[estadoSeleccion];
    setForm((f) => ({ ...f, estadoSeleccion, estado: mapped.value, estadoLabel: mapped.label }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.inmuebleId) {
      setMsg({ type: 'error', text: 'Selecciona el inmueble de la solicitud.' });
      return;
    }
    setSaving(true);
    try {
      if (isNew) {
        const record = { ...form, codigo: await nextMantenimientoCodigo() };
        await mantenimientosApi.create(record);
      } else {
        await mantenimientosApi.update(id, form);
      }
      setMsg({ type: 'ok', text: isNew ? 'Solicitud guardada correctamente.' : 'Solicitud actualizada correctamente.' });
      setTimeout(() => router.push('/mantenimientos'), 700);
    } catch (err) {
      setMsg({ type: 'error', text: 'Ocurrió un error al guardar. Intenta de nuevo.' });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="empty-state">Cargando...</div>;

  return (
    <section>
      <PageHead
        title={isNew ? 'Nueva solicitud de mantenimiento' : `Editar solicitud ${form.codigo}`}
        subtitle="Registra una reparación, cotización o solicitud de un inmueble"
      />
      <form onSubmit={handleSubmit}>
        <div className="card">
          <h2>Datos de la solicitud</h2>
          <div className="row">
            <div className="field">
              <label>Inmueble<span className="req">*</span></label>
              <select value={form.inmuebleId} onChange={(e) => selectInmueble(e.target.value)}>
                <option value="">Seleccionar...</option>
                {inmuebles.map((i) => <option key={i.id} value={i.id}>{i.direccion}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Tipo de solicitud<span className="req">*</span></label>
              <select value={form.tipo} onChange={(e) => set('tipo', e.target.value)}>
                {TIPO_OPTIONS.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="row">
            <div className="field"><label>Proveedor</label><input placeholder="Nombre del proveedor" value={form.proveedor} onChange={(e) => set('proveedor', e.target.value)} /></div>
            <div className="field"><label>Costo estimado</label><input placeholder="$" value={form.costo} onChange={(e) => set('costo', e.target.value)} /></div>
          </div>
          <div className="row" style={{ marginBottom: 0 }}>
            <div className="field">
              <label>Prioridad</label>
              <select value={form.prioridad} onChange={(e) => set('prioridad', e.target.value)}>
                {PRIORIDAD_OPTIONS.map((p) => <option key={p}>{p}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Estado</label>
              <select value={form.estadoSeleccion} onChange={(e) => selectEstado(e.target.value)}>
                {Object.keys(ESTADO_MAP).map((k) => <option key={k}>{k}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="card">
          <h2>Descripción</h2>
          <div className="field"><textarea rows={3} placeholder="Detalle del daño, solicitud o cotización..." value={form.descripcion} onChange={(e) => set('descripcion', e.target.value)} /></div>
        </div>
        <div className="actions">
          <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar solicitud'}</button>
          <button className="btn btn-secondary" type="button" onClick={() => router.push('/mantenimientos')}>Cancelar</button>
        </div>
        <FormMsg text={msg?.text} type={msg?.type} />
      </form>
    </section>
  );
}
