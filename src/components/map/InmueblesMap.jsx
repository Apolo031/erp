'use client';

import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

const ESTADO_COLOR = {
  arrendado: '#1DA96C',
  disponible: '#2F6FED',
  proceso: '#DE9E11',
  inactivo: '#7B8390',
};

function makeIcon(L, color, active) {
  const size = active ? 20 : 14;
  return L.divIcon({
    className: '',
    html: `<span style="display:block;width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.4);"></span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

/**
 * Mapa Leaflet de inmuebles. `focus` permite que la lista lateral controle la
 * cámara: { bounds: [[lat,lng],...] } encuadra un grupo, { center:[lat,lng], zoom } centra un punto.
 */
export default function InmueblesMap({ puntos, focus, selectedId, onMarkerClick }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef(new Map());

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import('leaflet')).default;
      if (cancelled) return;

      if (!mapRef.current) {
        mapRef.current = L.map(containerRef.current, { scrollWheelZoom: true }).setView([6.25, -75.57], 6);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(mapRef.current);
      }

      markersRef.current.forEach((m) => m.remove());
      markersRef.current = new Map();

      const bounds = [];
      puntos.forEach((p) => {
        if (typeof p.lat !== 'number' || typeof p.lng !== 'number') return;
        const icon = makeIcon(L, ESTADO_COLOR[p.estado] || '#7B8390', p.id === selectedId);
        const marker = L.marker([p.lat, p.lng], { icon }).addTo(mapRef.current);
        marker.bindPopup(
          `<strong>${p.direccion || 'Sin dirección'}</strong><br/>${p.tipoLabel || ''} · ${p.ciudad || ''}<br/>${p.propietarioNombre || ''}<br/><span style="color:${ESTADO_COLOR[p.estado] || '#7B8390'};font-weight:600;">${p.estadoLabel || ''}</span>`
        );
        marker.on('click', () => onMarkerClick?.(p.id));
        markersRef.current.set(p.id, marker);
        bounds.push([p.lat, p.lng]);
      });

      if (!focus && bounds.length) mapRef.current.fitBounds(bounds, { padding: [30, 30], maxZoom: 14 });
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [puntos]);

  useEffect(() => {
    if (!mapRef.current || !focus) return;
    if (focus.bounds && focus.bounds.length) {
      mapRef.current.flyToBounds(focus.bounds, { padding: [40, 40], maxZoom: 15, duration: 0.6 });
    } else if (focus.center) {
      mapRef.current.flyTo(focus.center, focus.zoom || 16, { duration: 0.6 });
    }
  }, [focus]);

  useEffect(() => {
    if (!selectedId) return;
    const marker = markersRef.current.get(selectedId);
    marker?.openPopup();
  }, [selectedId]);

  useEffect(() => () => { mapRef.current?.remove(); mapRef.current = null; }, []);

  return <div ref={containerRef} style={{ width: '100%', height: '100%', borderRadius: 18 }} />;
}
