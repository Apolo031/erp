'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageHead from '@/components/ui/PageHead';
import Dropzone from '@/components/ui/Dropzone';
import FormMsg from '@/components/ui/FormMsg';
import { useCollection } from '@/hooks/useCollection';
import { contratosApi, TIPO_CONTRATO_OPTIONS, INCREMENTO_OPTIONS, SEGURO_OPTIONS, nextContratoCodigo, emptyContrato } from './service';
import { uploadDocs } from '@/lib/storage/uploadDocs';
import { parseMoney } from '@/lib/parseMoney';
import { formatCOP } from '@/lib/format';

export default function ContratoForm({ id }) {
  const isNew = id === 'nuevo';
  const router = useRouter();
  const draftId = useRef(crypto.randomUUID());

  const { items: inmuebles } = useCollection('inmuebles', { orderByField: 'direccion', direction: 'asc' });
  const { items: arrendatarios } = useCollection('arrendatarios', { orderByField: 'nombres', direction: 'asc' });

  const [form, setForm] = useState(emptyContrato());
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    if (isNew) return;
    contratosApi.get(id).then((data) => {
      if (data) setForm({ ...emptyContrato(), ...data, comision: { ...emptyContrato().comision, ...data.comision } });
      setLoading(false);
    });
  }, [id, isNew]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function setComision(field, value) {
    setForm((f) => ({ ...f, comision: { ...f.comision, [field]: value } }));
  }

  async function handleFiles(files) {
    const uploaded = await uploadDocs('contratos', isNew ? draftId.current : id, files);
    setForm((f) => ({ ...f, documentos: [...f.documentos, ...uploaded] }));
  }

  function removeDoc(i) {
    setForm((f) => ({ ...f, documentos: f.documentos.filter((_, idx) => idx !== i) }));
  }

  function selectInmueble(inmuebleId) {
    const inm = inmuebles.find((i) => i.id === inmuebleId);
    setForm((f) => ({ ...f, inmuebleId, inmuebleLabel: inm ? inm.direccion : '' }));
  }

  function selectArrendatario(arrendatarioId) {
    const a = arrendatarios.find((x) => x.id === arrendatarioId);
    setForm((f) => ({ ...f, arrendatarioId, arrendatarioNombre: a ? `${a.nombres} ${a.apellidos}` : '' }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.inmuebleId || !form.arrendatarioId || !form.canon.trim()) {
      setMsg({ type: 'error', text: 'Completa los campos obligatorios: inmueble, arrendatario y canon mensual.' });
      return;
    }
    setSaving(true);
    try {
      const record = { ...form, canonValor: parseMoney(form.canon) };
      if (isNew) {
        record.codigo = await nextContratoCodigo();
        await contratosApi.create(record);
      } else {
        await contratosApi.update(id, record);
      }
      setMsg({ type: 'ok', text: isNew ? 'Contrato guardado correctamente.' : 'Contrato actualizado correctamente.' });
      setTimeout(() => router.push('/contratos'), 700);
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
        title={isNew ? 'Nuevo contrato' : `Editar contrato ${form.codigo}`}
        subtitle="Asocia un arrendatario a un inmueble y define las condiciones del contrato"
      />
      <form onSubmit={handleSubmit}>
        <div className="card">
          <h2>Datos del contrato</h2>
          <div className="row">
            <div className="field">
              <label>Tipo de contrato<span className="req">*</span></label>
              <select value={form.tipo} onChange={(e) => set('tipo', e.target.value)}>
                {TIPO_CONTRATO_OPTIONS.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Inmueble<span className="req">*</span></label>
              <select value={form.inmuebleId} onChange={(e) => selectInmueble(e.target.value)}>
                <option value="">Seleccionar...</option>
                {inmuebles.map((i) => <option key={i.id} value={i.id}>{i.direccion}</option>)}
              </select>
            </div>
          </div>
          <div className="row">
            <div className="field">
              <label>Arrendatario<span className="req">*</span></label>
              <select value={form.arrendatarioId} onChange={(e) => selectArrendatario(e.target.value)}>
                <option value="">Seleccionar...</option>
                {arrendatarios.map((a) => <option key={a.id} value={a.id}>{a.nombres} {a.apellidos}</option>)}
              </select>
            </div>
            <div className="field"><label>Duración (meses)</label><input type="number" placeholder="Ej: 36" value={form.duracion} onChange={(e) => set('duracion', e.target.value)} /></div>
          </div>
          <div className="row">
            <div className="field"><label>Fecha de inicio<span className="req">*</span></label><input type="date" value={form.fechaInicio} onChange={(e) => set('fechaInicio', e.target.value)} /></div>
            <div className="field"><label>Fecha de vencimiento<span className="req">*</span></label><input type="date" value={form.fechaVencimiento} onChange={(e) => set('fechaVencimiento', e.target.value)} /></div>
          </div>
          <div className="row">
            <div className="field"><label>Canon mensual<span className="req">*</span></label><input placeholder="$" value={form.canon} onChange={(e) => set('canon', e.target.value)} /></div>
            <div className="field">
              <label>Incremento anual</label>
              <select value={form.incremento} onChange={(e) => set('incremento', e.target.value)}>
                {INCREMENTO_OPTIONS.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <div className="row" style={{ marginBottom: 0 }}>
            <div className="field"><label>Depósito / garantía</label><input placeholder="$" value={form.deposito} onChange={(e) => set('deposito', e.target.value)} /></div>
            <div className="field">
              <label>Seguro de arrendamiento</label>
              <select value={form.seguro} onChange={(e) => set('seguro', e.target.value)}>
                {SEGURO_OPTIONS.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="card">
          <h2>Comisión de la agencia {form.numeroContratoOrigen ? <span className="badge">Contrato origen Nº {form.numeroContratoOrigen}</span> : null}</h2>
          <div className="row">
            <div className="field"><label>Porcentaje sobre canon</label><input type="number" step="0.1" placeholder="%" value={form.comision.porcentaje} onChange={(e) => setComision('porcentaje', e.target.value)} /></div>
            <div className="field"><label>Valor comisión sobre canon</label><input placeholder="$" value={form.comision.valorCanon} onChange={(e) => setComision('valorCanon', e.target.value)} /></div>
          </div>
          <div className="row" style={{ marginBottom: 0 }}>
            <div className="field"><label>Porcentaje administración</label><input type="number" step="0.1" placeholder="%" value={form.comision.porcentajeAdministracion} onChange={(e) => setComision('porcentajeAdministracion', e.target.value)} /></div>
            <div className="field"><label>Valor comisión + IVA</label><input placeholder="$" value={form.comision.valorConIva} onChange={(e) => setComision('valorConIva', e.target.value)} /></div>
          </div>
        </div>

        <div className="card">
          <h2>Documentos</h2>
          <Dropzone
            id="cont-docs-input"
            title="Haz clic para subir documentos del contrato"
            hint="Contrato firmado, otrosí, pólizas... solo PDF"
            docs={form.documentos}
            onFiles={handleFiles}
            onRemove={removeDoc}
          />
        </div>

        <div className="card">
          <h2>Notas</h2>
          <div className="field"><textarea rows={3} placeholder="Cláusulas u observaciones adicionales..." value={form.notas} onChange={(e) => set('notas', e.target.value)} /></div>
        </div>

        <div className="actions">
          <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar contrato'}</button>
          <button className="btn btn-secondary" type="button" onClick={() => router.push('/contratos')}>Cancelar</button>
        </div>
        <FormMsg text={msg?.text} type={msg?.type} />
        {form.canon && <p style={{ fontSize: '.78rem', color: 'var(--mute)' }}>Valor detectado: {formatCOP(parseMoney(form.canon))}</p>}
      </form>
    </section>
  );
}
