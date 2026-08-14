'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import PageHead from '@/components/ui/PageHead';
import Dropzone from '@/components/ui/Dropzone';
import FormMsg from '@/components/ui/FormMsg';
import { useCollection } from '@/hooks/useCollection';
import {
  inmueblesApi, TIPO_OPTIONS, VIVIENDA_TIPOS, ASEGURADORA_OPTIONS, LOCAL_AMENITIES, VIVIENDA_AMENITIES,
  nextInmuebleCodigo, emptyInmueble,
} from './service';
import { uploadDocs } from '@/lib/storage/uploadDocs';

const MAX_COPROPIETARIOS = 6;

export default function InmuebleForm({ id }) {
  const isNew = id === 'nuevo';
  const router = useRouter();
  const draftId = useRef(crypto.randomUUID());

  const { items: propietarios } = useCollection('propietarios', { orderByField: 'nombres', direction: 'asc' });

  const [form, setForm] = useState(emptyInmueble());
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [ownerSel, setOwnerSel] = useState('');
  const [ownerPct, setOwnerPct] = useState('');

  useEffect(() => {
    if (isNew) return;
    inmueblesApi.get(id).then((data) => {
      if (data) {
        setForm({
          ...emptyInmueble(),
          ...data,
          detalleLocal: { ...emptyInmueble().detalleLocal, ...data.detalleLocal },
          detalleVivienda: { ...emptyInmueble().detalleVivienda, ...data.detalleVivienda },
          servicios: { ...emptyInmueble().servicios, ...data.servicios },
        });
      }
      setLoading(false);
    });
  }, [id, isNew]);

  function set(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }
  function setLocal(field, value) {
    setForm((f) => ({ ...f, detalleLocal: { ...f.detalleLocal, [field]: value } }));
  }
  function setLocalAmenity(key, value) {
    setForm((f) => ({ ...f, detalleLocal: { ...f.detalleLocal, amenities: { ...f.detalleLocal.amenities, [key]: value } } }));
  }
  function setVivienda(field, value) {
    setForm((f) => ({ ...f, detalleVivienda: { ...f.detalleVivienda, [field]: value } }));
  }
  function setViviendaAmenity(key, value) {
    setForm((f) => ({ ...f, detalleVivienda: { ...f.detalleVivienda, amenities: { ...f.detalleVivienda.amenities, [key]: value } } }));
  }
  function setServicio(field, value) {
    setForm((f) => ({ ...f, servicios: { ...f.servicios, [field]: value } }));
  }

  function selectTipo(tipoVal) {
    const opt = TIPO_OPTIONS.find((t) => t.value === tipoVal);
    set('tipoVal', tipoVal);
    set('tipoLabel', opt?.label || '');
  }

  function selectPropietario(propietarioId) {
    const p = propietarios.find((x) => x.id === propietarioId);
    setForm((f) => ({ ...f, propietarioId, propietarioNombre: p ? `${p.nombres} ${p.apellidos}` : '' }));
  }

  function addCopropietario() {
    const p = propietarios.find((x) => x.id === ownerSel);
    const pct = parseFloat(ownerPct);
    if (!p || !pct || pct <= 0) return;
    if (form.copropietarios.length >= MAX_COPROPIETARIOS) return;
    const used = form.copropietarios.reduce((a, o) => a + o.pct, 0);
    if (used + pct > 100) return;
    setForm((f) => ({ ...f, copropietarios: [...f.copropietarios, { propietarioId: p.id, nombre: `${p.nombres} ${p.apellidos}`, pct }] }));
    setOwnerPct('');
  }

  function removeCopropietario(i) {
    setForm((f) => ({ ...f, copropietarios: f.copropietarios.filter((_, idx) => idx !== i) }));
  }

  const usedPct = form.copropietarios.reduce((a, o) => a + o.pct, 0);
  const ownerHint = form.copropietarios.length >= MAX_COPROPIETARIOS
    ? 'Se alcanzó el máximo de 6 propietarios.'
    : `Puede distribuir hasta ${(100 - usedPct).toFixed(2)}% más entre los socios (máx. ${MAX_COPROPIETARIOS - form.copropietarios.length} adicionales)`;

  async function handleFiles(files) {
    const uploaded = await uploadDocs('inmuebles', isNew ? draftId.current : id, files);
    setForm((f) => ({ ...f, documentos: [...f.documentos, ...uploaded] }));
  }
  function removeDoc(i) {
    setForm((f) => ({ ...f, documentos: f.documentos.filter((_, idx) => idx !== i) }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.direccion.trim() || !form.ciudad.trim() || !form.propietarioId) {
      setMsg({ type: 'error', text: 'Completa los campos obligatorios: dirección, ciudad y propietario principal.' });
      return;
    }
    setSaving(true);
    try {
      if (isNew) {
        const record = { ...form, codigo: await nextInmuebleCodigo() };
        await inmueblesApi.create(record);
      } else {
        await inmueblesApi.update(id, form);
      }
      setMsg({ type: 'ok', text: isNew ? 'Inmueble guardado correctamente.' : 'Inmueble actualizado correctamente.' });
      setTimeout(() => router.push('/inmuebles'), 700);
    } catch (err) {
      setMsg({ type: 'error', text: 'Ocurrió un error al guardar. Intenta de nuevo.' });
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="empty-state">Cargando...</div>;

  const showLocal = form.tipoVal === 'local';
  const showVivienda = VIVIENDA_TIPOS.includes(form.tipoVal);

  return (
    <section>
      <PageHead
        title={isNew ? 'Nuevo inmueble' : `Editar inmueble ${form.codigo}`}
        subtitle="Registra un inmueble y su información específica según el tipo"
      />
      <form onSubmit={handleSubmit}>
        <div className="card">
          <h2>Datos del inmueble</h2>
          <div className="row">
            <div className="field">
              <label>Tipo<span className="req">*</span></label>
              <select value={form.tipoVal} onChange={(e) => selectTipo(e.target.value)}>
                {TIPO_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div className="field">
              <label>Propietario principal<span className="req">*</span></label>
              <select value={form.propietarioId} onChange={(e) => selectPropietario(e.target.value)}>
                <option value="">Seleccionar...</option>
                {propietarios.map((p) => <option key={p.id} value={p.id}>{p.nombres} {p.apellidos}</option>)}
              </select>
            </div>
          </div>
          <div className="row" style={{ gridTemplateColumns: '1fr' }}>
            <div className="field"><label>Dirección<span className="req">*</span></label><input value={form.direccion} onChange={(e) => set('direccion', e.target.value)} /></div>
          </div>
          <div className="row">
            <div className="field"><label>Ciudad<span className="req">*</span></label><input value={form.ciudad} onChange={(e) => set('ciudad', e.target.value)} /></div>
            <div className="field"><label>Barrio</label><input value={form.barrio} onChange={(e) => set('barrio', e.target.value)} /></div>
          </div>
          <div className="row">
            <div className="field"><label>Área (m²)</label><input type="number" value={form.area} onChange={(e) => set('area', e.target.value)} /></div>
            <div className="field"><label>Piso</label><input value={form.piso} onChange={(e) => set('piso', e.target.value)} /></div>
          </div>
          <div className="row">
            <div className="field"><label>Estrato (1–6)</label><input type="number" min="1" max="6" value={form.estrato} onChange={(e) => set('estrato', e.target.value)} /></div>
            <div className="field">
              <label>Aseguradora</label>
              <select value={form.aseguradora} onChange={(e) => set('aseguradora', e.target.value)}>
                {ASEGURADORA_OPTIONS.map((o) => <option key={o}>{o}</option>)}
              </select>
            </div>
          </div>
          <div className="row">
            <div className="field"><label>Matrícula inmobiliaria</label><input value={form.matricula} onChange={(e) => set('matricula', e.target.value)} /></div>
            <div className="field"><label>Número catastral</label><input value={form.catastral} onChange={(e) => set('catastral', e.target.value)} /></div>
          </div>
          <div className="row">
            <div className="field"><label>Avalúo catastral</label><input placeholder="$" value={form.valorCatastral} onChange={(e) => set('valorCatastral', e.target.value)} /></div>
            <div className="field"><label>Valor m²</label><input placeholder="$" value={form.valorM2} onChange={(e) => set('valorM2', e.target.value)} /></div>
          </div>
          <div className="row cols3">
            <div className="field"><label>Código interno</label><input value={form.codigoInterno} onChange={(e) => set('codigoInterno', e.target.value)} /></div>
            <div className="field"><label>Agencia / grupo</label><input value={form.grupo} onChange={(e) => set('grupo', e.target.value)} /></div>
            <div className="field"><label>Zona</label><input value={form.zona} onChange={(e) => set('zona', e.target.value)} /></div>
          </div>
          <div className="row">
            <div className="field"><label>Latitud</label><input type="number" step="any" value={form.lat ?? ''} onChange={(e) => set('lat', e.target.value === '' ? null : Number(e.target.value))} /></div>
            <div className="field"><label>Longitud</label><input type="number" step="any" value={form.lng ?? ''} onChange={(e) => set('lng', e.target.value === '' ? null : Number(e.target.value))} /></div>
          </div>
          <div className="row" style={{ gridTemplateColumns: '1fr', marginBottom: 0 }}>
            <div className="field"><label>Descripción</label><textarea rows={2} value={form.descripcion} onChange={(e) => set('descripcion', e.target.value)} /></div>
          </div>
        </div>

        {showLocal && (
          <div className="card">
            <h2>Detalle · local comercial <span className="badge">Solo para este tipo</span></h2>
            <div className="row">
              <div className="field"><label>Centro comercial / plaza</label><input value={form.detalleLocal.centroComercial} onChange={(e) => setLocal('centroComercial', e.target.value)} /></div>
              <div className="field"><label>Número del local</label><input value={form.detalleLocal.numeroLocal} onChange={(e) => setLocal('numeroLocal', e.target.value)} /></div>
            </div>
            <div className="row cols3">
              <div className="field"><label>Área de vitrina (m²)</label><input type="number" value={form.detalleLocal.areaVitrina} onChange={(e) => setLocal('areaVitrina', e.target.value)} /></div>
              <div className="field"><label>Área de exhibición (m²)</label><input type="number" value={form.detalleLocal.areaExhibicion} onChange={(e) => setLocal('areaExhibicion', e.target.value)} /></div>
              <div className="field"><label>Altura libre (m)</label><input type="number" step="0.1" value={form.detalleLocal.alturaLibre} onChange={(e) => setLocal('alturaLibre', e.target.value)} /></div>
            </div>
            <div className="row">
              <div className="field"><label>Uso permitido</label><input placeholder="Ej: comercial, mixto..." value={form.detalleLocal.usoPermitido} onChange={(e) => setLocal('usoPermitido', e.target.value)} /></div>
              <div className="field"><label>Actividad comercial autorizada</label><input value={form.detalleLocal.actividadAutorizada} onChange={(e) => setLocal('actividadAutorizada', e.target.value)} /></div>
            </div>
            <div className="row">
              <div className="field"><label>Canon mínimo</label><input placeholder="$" value={form.detalleLocal.canonMinimo} onChange={(e) => setLocal('canonMinimo', e.target.value)} /></div>
              <div className="field"><label>Canon negociado</label><input placeholder="$" value={form.detalleLocal.canonNegociado} onChange={(e) => setLocal('canonNegociado', e.target.value)} /></div>
            </div>
            <div className="row" style={{ gridTemplateColumns: '1fr', marginBottom: 14 }}>
              <div className="field"><label>Horarios permitidos</label><input placeholder="Ej: 8:00 a.m. – 9:00 p.m." value={form.detalleLocal.horarios} onChange={(e) => setLocal('horarios', e.target.value)} /></div>
            </div>
            <div className="check-row">
              {LOCAL_AMENITIES.map((a) => (
                <div className="check" key={a.key}>
                  <input type="checkbox" id={`local-${a.key}`} checked={!!form.detalleLocal.amenities[a.key]} onChange={(e) => setLocalAmenity(a.key, e.target.checked)} />
                  <label htmlFor={`local-${a.key}`}>{a.label}</label>
                </div>
              ))}
            </div>
          </div>
        )}

        {showVivienda && (
          <div className="card">
            <h2>Detalle · vivienda <span className="badge">Solo para casa / apartamento</span></h2>
            <div className="row cols3">
              <div className="field"><label>Habitaciones</label><input type="number" value={form.detalleVivienda.habitaciones} onChange={(e) => setVivienda('habitaciones', e.target.value)} /></div>
              <div className="field"><label>Baños</label><input type="number" value={form.detalleVivienda.banos} onChange={(e) => setVivienda('banos', e.target.value)} /></div>
              <div className="field"><label>Parqueadero</label><input type="number" value={form.detalleVivienda.parqueadero} onChange={(e) => setVivienda('parqueadero', e.target.value)} /></div>
            </div>
            <div className="check-row">
              {VIVIENDA_AMENITIES.map((a) => (
                <div className="check" key={a.key}>
                  <input type="checkbox" id={`viv-${a.key}`} checked={!!form.detalleVivienda.amenities[a.key]} onChange={(e) => setViviendaAmenity(a.key, e.target.checked)} />
                  <label htmlFor={`viv-${a.key}`}>{a.label}</label>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="card">
          <h2>Servicios públicos</h2>
          <div className="row cols3">
            <div className="field"><label><span className="util-icon" style={{ background: 'var(--blue-bg)' }}>💧</span> Agua — N.° de contrato</label><input placeholder="Ej: 123456789" value={form.servicios.agua} onChange={(e) => setServicio('agua', e.target.value)} /></div>
            <div className="field"><label><span className="util-icon" style={{ background: 'var(--amber-bg)' }}>💡</span> Luz — N.° de contrato</label><input placeholder="Ej: 987654321" value={form.servicios.luz} onChange={(e) => setServicio('luz', e.target.value)} /></div>
            <div className="field"><label><span className="util-icon" style={{ background: '#FEECEA' }}>🔥</span> Gas — N.° de contrato</label><input placeholder="Ej: 456789123" value={form.servicios.gas} onChange={(e) => setServicio('gas', e.target.value)} /></div>
          </div>
        </div>

        <div className="card">
          <h2>Documentos</h2>
          <Dropzone
            id="inm-docs-input"
            title="Haz clic para subir documentos del inmueble"
            hint="Escritura, certificados, avalúos, licencias, paz y salvos... solo PDF"
            docs={form.documentos}
            onFiles={handleFiles}
            onRemove={removeDoc}
          />
        </div>

        <div className="card">
          <h2>Propietarios y copropietarios</h2>
          <div className="owner-add">
            <select value={ownerSel} onChange={(e) => setOwnerSel(e.target.value)}>
              <option value="">Seleccionar propietario...</option>
              {propietarios.map((p) => <option key={p.id} value={p.id}>{p.nombres} {p.apellidos}</option>)}
            </select>
            <input className="pct" type="number" min="0" max="100" placeholder="0" value={ownerPct} onChange={(e) => setOwnerPct(e.target.value)} />
            <span className="pct-sign">%</span>
            <button type="button" className="btn-add" onClick={addCopropietario}>+ Agregar</button>
          </div>
          <div className="owner-hint">{ownerHint}</div>
          <div className="owner-list">
            {form.copropietarios.map((o, i) => (
              <div className="owner-chip" key={o.propietarioId + i}>
                <span>{o.nombre}</span>
                <span><span className="pct-val">{o.pct}%</span> &nbsp; <button type="button" onClick={() => removeCopropietario(i)}>✕</button></span>
              </div>
            ))}
          </div>
        </div>

        <div className="actions">
          <button className="btn btn-primary" type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar inmueble'}</button>
          <button className="btn btn-secondary" type="button" onClick={() => router.push('/inmuebles')}>Cancelar</button>
        </div>
        <FormMsg text={msg?.text} type={msg?.type} />
      </form>
    </section>
  );
}
