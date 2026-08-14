import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({ subsets: ['latin'], weight: ['400', '500', '600'], variable: '--font-inter' });
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['600', '700', '800'], variable: '--font-jakarta' });

// Panel autenticado: no aporta prerenderizar estático y evita que el build
// necesite variables de entorno de Firebase reales en tiempo de compilación.
export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Zona Centro Inmobiliaria · ERP',
  description: 'Panel de administración de propietarios, inmuebles, contratos y arrendatarios',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${inter.variable} ${jakarta.variable}`}>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
