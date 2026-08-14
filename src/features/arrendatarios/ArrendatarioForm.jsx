'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageHead from '@/components/ui/PageHead';
import Dropzone from '@/components/ui/Dropzone';
import FormMsg from '@/components/ui/FormMsg';
import { arrendatariosApi, SEGURO_OPTIONS, emptyArrendatario } from './service';
import { uploadDocs } from '@/lib/storage/uploadDocs';

export default function ArrendatarioForm({ id }) {
  const isNew = id === 'nuevo';
  const router = useRouter();
  const draftId = useRef(crypto.randomUUID());

  const [form, setForm] = useState(emptyArrendatario());
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    if (isNew) return;
    arrendatariosApi.get(id).then((data) => {
      if (data) setForm({ ...emptyArrendatario(), ...data });
      setLoading(false);
    });
  }, [id, isNew]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleFiles(files) {
    const uploaded = await uploadDocs('arrendatarios', isNew ? draftId.current : id, files);
    setForm((f) => ({ ...f, documentos: [...f.documentos, ...uploaded] }));
  }

  function removeDoc(i) {
    setForm((f) => ({ ...f, documentos: f.documentos.filter((_, idx) => idx !== i) }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.nombres.trim() || !form.apellidos.trim() || !form.cedula.trim()) {
      setMsg({ type: 'error', text: 'Completa los campos obligatorios: nombres, apellidos y cédula/NIT.' });
      return;
    }
    setSaving(true);
    try {
      if (isNew) await arrendatariosApi.create(form);
      else await arrendatariosApi.update(id, form);
      setMsg({ type: 'ok', text: isNew ? 'Arrendatario guardado correctamente.' : 'Arrendatario actualizado correctamente.' });
      setTimeout(() => router.push('/arrendatarios'), 700);
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
        title={isNew ? 'Nuevo arrendatario' : 'Editar arrendatario'}
        subtitle="Registra la información del arrendatario para asociarlo a un contrato"
      />
      <form onSubmit={handleSubmit}>
        <div className="card">
          <h2>Datos personales</h2>
          <div className="row">
            <div className="field"><label>Nombres<span className="req">*</span></label><input value={form.nombres} onChange={(e) => set('nombres', e.target.value)} /></div>
            <div className="field"><label>Apellidos<span className="req">*</span></label><input value={form.apellidos} onChange={(e) => set('apellidos', e.target.value)} /></div>
          </div>
          <div className="row">
            <div className="field"><label>Cédula / NIT<span className="req">*</span></label><input value={form.cedula} onChange={(e) => set('cedula', e.target.value)} /></div>
            <div className="field"><label>Teléfono</label><input value={form.telefono} onChange={(e) => set('telefono', e.target.value)} /></div>
          </div>
          <div className="row">
            <div className="field"><label>Celular</label><input value={form.celular} onChange={(e) => set('celular', e.target.value)} /></div>
            <div className="field"><label>Email</label><input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} /></div>
          </div>
          <div className="row" style={{ gridTemplateColumns: '1fr' }}>
            <div className="field"><label>Dirección</label><input value={form.direccion} onChange={(e) => set('direccion', e.target.value)} /></div>
          </div>
          <div className="row" style={{ gridTemplateColumns: '1fr' }}>
            <div className="field"><label>Ciudad</label><input value={form.ciudad} onChange={(e) => set('ciudad', e.target.value)} /></div>
          </div>
        </div>

        <div className="card">
          <h2>Datos empresariales</h2>
          <div className="row">
            <div className="field"><label>Empresa</label><input value={form.empresa} onChange={(e) => set('empresa', e.target.value)} /></div>
            <div className="field"><label>Actividad económica</label><input value={form.actividad} onChange={(e) => set('actividad', e.target.value)} /></div>
          </div>
          <div className="row" style={{ marginBottom: 0 }}>
            <div className="field"><label>Representante legal</label><input value={form.representanteLegal} onChange={(e) => set('representanteLegal', e.target.value)} /></div>
            <div className="field"><label>Referencias</label><input placeholder="Comerciales o personales" value={form.referencias} onChange={(e) => set('referencias', e.target.value)} /></div>
          </div>
        </div>

        <div className="card">
          <h2>Garantías</h2>
          <div className="row" style={{ marginBottom: 0 }}>
            <div className="field"><label>Fiador / codeudor</label><input placeholder="Nombre del fiador o codeudor" value={form.fiador} onChange={(e) => set('fiador', e.target.value)} /></div>
            <div className="field">
              <label>Seguro de arrendamiento</label>
              <select value={form.seguro} onChange={(e) => set('seguro', e.target.value)}>
                {SEGURO_OPTIONS.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div className="card">
          <h2>Documentos</h2>
          <Dropzone
            id="arr-docs-input"
            title="Haz clic para subir documentos del arrendatario"
            hint="Cédula, cámara de comercio, referencias... solo PDF"
            docs={form.documentos}
            onFiles={handleFiles}
            onRemove={removeDoc}
          />
        </div>

        <div className="card">
          <h2>Notas</h2>
          <div className="field"><textarea rows={3} placeholder="Observaciones adicionales..." value={form.notas} onChange={(e) => set('notas', e.target.value)} /></div>
        </div>

        <div className="actions">
          <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar arrendatario'}</button>
          <button className="btn btn-secondary" type="button" onClick={() => router.push('/arrendatarios')}>Cancelar</button>
        </div>
        <FormMsg text={msg?.text} type={msg?.type} />
      </form>
    </section>
  );
}
