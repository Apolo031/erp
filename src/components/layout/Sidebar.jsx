'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

const NAV_ITEMS = [
  {
    href: '/dashboard',
    label: 'Consolidado',
    icon: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>,
  },
  {
    href: '/contratos',
    label: 'Contratos',
    icon: <><path d="M7 3h8l4 4v14H7z" /><path d="M11 3v5h5" /><path d="M9 13h6M9 17h6" /></>,
  },
  {
    href: '/propietarios',
    label: 'Propietarios',
    icon: <><circle cx="9" cy="8" r="3" /><path d="M2 20c0-3.3 3.1-6 7-6s7 2.7 7 6" /><circle cx="18" cy="9" r="2.4" /><path d="M16 20c.2-2.4 1.9-4.3 4.2-4.8" /></>,
  },
  {
    href: '/arrendatarios',
    label: 'Arrendatarios',
    icon: <><circle cx="12" cy="8" r="3.4" /><path d="M5 20c.5-3.7 3.3-6.2 7-6.2S18.5 16.3 19 20" /></>,
  },
  {
    href: '/inmuebles',
    label: 'Inmuebles',
    icon: <><path d="M3 21V9l9-6 9 6v12" /><path d="M9 21v-7h6v7" /></>,
  },
  {
    href: '/mantenimientos',
    label: 'Mantenimientos',
    icon: <path d="M14.7 6.3a4 4 0 0 0-5.4 5.4L2 19l3 3 7.3-7.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2-2z" />,
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <nav className="side">
      <div className="brand">
        <div className="logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 21V9l9-6 9 6v12" /><path d="M9 21v-7h6v7" />
          </svg>
        </div>
        <div>
          <div className="name">Zona Centro</div>
          <div className="sub">Inmobiliaria</div>
        </div>
      </div>

      {NAV_ITEMS.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={`nav-item${pathname.startsWith(item.href) ? ' active' : ''}`}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {item.icon}
          </svg>
          {item.label}
        </Link>
      ))}

      <div className="nav-footer">
        <button className="nav-item" onClick={logout} type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" />
          </svg>
          Cerrar sesión
        </button>
      </div>
    </nav>
  );
}
