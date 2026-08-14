'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageHead from '@/components/ui/PageHead';
import Dropzone from '@/components/ui/Dropzone';
import FormMsg from '@/components/ui/FormMsg';
import { propietariosApi, TRIBUTARY_FLAGS, TIPO_TITULAR_OPTIONS, emptyPropietario } from './service';
import { uploadDocs } from '@/lib/storage/uploadDocs';

export default function PropietarioForm({ id }) {
  const isNew = id === 'nuevo';
  const router = useRouter();
  const draftId = useRef(crypto.randomUUID());

  const [form, setForm] = useState(emptyPropietario());
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    if (isNew) return;
    propietariosApi.get(id).then((data) => {
      if (data) setForm({ ...emptyPropietario(), ...data, tributaria: { ...emptyPropietario().tributaria, ...data.tributaria } });
      setLoading(false);
    });
  }, [id, isNew]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function setFlag(key, value) {
    setForm((f) => ({ ...f, tributaria: { ...f.tributaria, [key]: value } }));
  }

  async function handleFiles(files) {
    const uploaded = await uploadDocs('propietarios', isNew ? draftId.current : id, files);
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
      if (isNew) {
        await propietariosApi.create(form);
      } else {
        await propietariosApi.update(id, form);
      }
      setMsg({ type: 'ok', text: isNew ? 'Propietario guardado correctamente.' : 'Propietario actualizado correctamente.' });
      setTimeout(() => router.push('/propietarios'), 700);
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
        title={isNew ? 'Nuevo propietario' : 'Editar propietario'}
        subtitle="Registra la información de un propietario para asociarlo a uno o varios inmuebles"
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
            <div className="field"><label>Tipo de documento</label><input placeholder="Ej: CC, NIT..." value={form.tipoDocumento} onChange={(e) => set('tipoDocumento', e.target.value)} /></div>
          </div>
          <div className="row">
            <div className="field"><label>Teléfono</label><input value={form.telefono} onChange={(e) => set('telefono', e.target.value)} /></div>
            <div />
          </div>
          <div className="row">
            <div className="field"><label>Celular</label><input value={form.celular} onChange={(e) => set('celular', e.target.value)} /></div>
            <div className="field"><label>Email principal</label><input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} /></div>
          </div>
          <div className="row" style={{ gridTemplateColumns: '1fr' }}>
            <div className="field"><label>Email de información / notificaciones</label><input type="email" placeholder="Correo adicional para envío de información..." value={form.emailNotificaciones} onChange={(e) => set('emailNotificaciones', e.target.value)} /></div>
          </div>
          <div className="row" style={{ gridTemplateColumns: '1fr' }}>
            <div className="field"><label>Dirección</label><input value={form.direccion} onChange={(e) => set('direccion', e.target.value)} /></div>
          </div>
          <div className="row" style={{ gridTemplateColumns: '1fr' }}>
            <div className="field"><label>Ciudad</label><input value={form.ciudad} onChange={(e) => set('ciudad', e.target.value)} /></div>
          </div>
        </div>

        <div className="card">
          <h2>Clasificación tributaria</h2>
          <div className="row">
            <div className="field">
              <label>Tipo de titular de cuenta</label>
              <select value={form.tipoTitular} onChange={(e) => set('tipoTitular', e.target.value)}>
                <option value="">Seleccionar...</option>
                {TIPO_TITULAR_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div />
          </div>
          <div className="checks">
            {TRIBUTARY_FLAGS.map((flag) => (
              <div className="check" key={flag.key}>
                <input type="checkbox" id={flag.key} checked={!!form.tributaria[flag.key]} onChange={(e) => setFlag(flag.key, e.target.checked)} />
                <label htmlFor={flag.key}>{flag.label}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h2>Datos bancarios</h2>
          <div className="row">
            <div className="field"><label>Banco</label><input value={form.banco} onChange={(e) => set('banco', e.target.value)} /></div>
            <div className="field">
              <label>Tipo de cuenta</label>
              <select value={form.tipoCuenta} onChange={(e) => set('tipoCuenta', e.target.value)}>
                <option value="">Seleccionar...</option>
                <option>Ahorros</option>
                <option>Corriente</option>
              </select>
            </div>
          </div>
          <div className="row" style={{ marginBottom: 0 }}>
            <div className="field"><label>Número de cuenta</label><input value={form.numeroCuenta} onChange={(e) => set('numeroCuenta', e.target.value)} /></div>
            <div />
          </div>
        </div>

        <div className="card">
          <h2>Beneficiario del pago <span className="badge">Solo si es distinto al propietario</span></h2>
          <div className="row" style={{ marginBottom: 0 }}>
            <div className="field"><label>Nombre del beneficiario</label><input value={form.beneficiarioNombre} onChange={(e) => set('beneficiarioNombre', e.target.value)} /></div>
            <div className="field"><label>Cédula / NIT del beneficiario</label><input value={form.beneficiarioCedula} onChange={(e) => set('beneficiarioCedula', e.target.value)} /></div>
          </div>
        </div>

        <div className="card">
          <h2>Documentos</h2>
          <Dropzone
            id="prop-docs-input"
            title="Haz clic para subir documentos legales"
            hint="Escrituras, cédula, RUT, poderes... solo PDF"
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
          <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar propietario'}</button>
          <button className="btn btn-secondary" type="button" onClick={() => router.push('/propietarios')}>Cancelar</button>
        </div>
        <FormMsg text={msg?.text} type={msg?.type} />
      </form>
    </section>
  );
}
