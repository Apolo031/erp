'use client';

import { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';

const DEMO_LABELS = ['Ago', 'Sep', 'Oct', 'Nov', 'Dic', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul'];
const DEMO_DATA = [980, 1010, 1005, 1040, 1075, 1110, 1150, 1130, 1165, 1190, 1215, 1240];

export default function CanonesChart({ labels = DEMO_LABELS, data = DEMO_DATA }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    const blue = '#2F6FED';
    chartRef.current = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels,
        datasets: [{
          data,
          borderColor: blue,
          borderWidth: 2.5,
          pointRadius: 3,
          pointBackgroundColor: '#fff',
          pointBorderColor: blue,
          pointBorderWidth: 2,
          tension: 0.42,
          fill: true,
          backgroundColor: (ctx) => {
            const g = ctx.chart.ctx.createLinearGradient(0, 0, 0, 260);
            g.addColorStop(0, 'rgba(47,111,237,.18)');
            g.addColorStop(1, 'rgba(47,111,237,0)');
            return g;
          },
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: (c) => ' $' + c.parsed.y.toLocaleString('es-CO') + 'M' } },
        },
        scales: {
          x: { grid: { display: false }, ticks: { color: '#7B8390', font: { size: 11 } } },
          y: { grid: { color: '#EEF0F3' }, ticks: { color: '#7B8390', font: { size: 11 }, callback: (v) => '$' + v + 'M' } },
        },
      },
    });

    return () => chartRef.current?.destroy();
  }, [labels, data]);

  return <canvas ref={canvasRef} />;
}
