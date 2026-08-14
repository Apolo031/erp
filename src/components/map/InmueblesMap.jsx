'use client';

import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';

const ESTADO_COLOR = {
  arrendado: '#1DA96C',
  disponible: '#2F6FED',
  proceso: '#DE9E11',
  inactivo: '#7B8390',
};

function makeIcon(L, color) {
  return L.divIcon({
    className: '',
    html: `<span style="display:block;width:14px;height:14px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 1px 3px rgba(0,0,0,.4);"></span>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
  });
}

export default function InmueblesMap({ puntos, onSelect }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() => {
    let L;
    let markers = [];
    (async () => {
      L = (await import('leaflet')).default;
      if (!mapRef.current) {
        mapRef.current = L.map(containerRef.current, { scrollWheelZoom: true }).setView([6.25, -75.57], 6);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
          maxZoom: 19,
        }).addTo(mapRef.current);
      }

      markers.forEach((m) => m.remove());
      markers = [];

      const bounds = [];
      puntos.forEach((p) => {
        if (typeof p.lat !== 'number' || typeof p.lng !== 'number') return;
        const icon = makeIcon(L, ESTADO_COLOR[p.estado] || '#7B8390');
        const marker = L.marker([p.lat, p.lng], { icon }).addTo(mapRef.current);
        marker.bindPopup(
          `<strong>${p.direccion || 'Sin dirección'}</strong><br/>${p.tipoLabel || ''} · ${p.ciudad || ''}<br/>${p.propietarioNombre || ''}<br/><span style="color:${ESTADO_COLOR[p.estado] || '#7B8390'};font-weight:600;">${p.estadoLabel || ''}</span>`
        );
        if (onSelect) marker.on('click', () => onSelect(p));
        markers.push(marker);
        bounds.push([p.lat, p.lng]);
      });

      if (bounds.length) mapRef.current.fitBounds(bounds, { padding: [30, 30], maxZoom: 14 });
    })();

    return () => { markers.forEach((m) => m.remove()); };
  }, [puntos, onSelect]);

  useEffect(() => () => { mapRef.current?.remove(); mapRef.current = null; }, []);

  return <div ref={containerRef} style={{ width: '100%', height: '100%', borderRadius: 18 }} />;
}
