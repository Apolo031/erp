import Sidebar from '@/components/layout/Sidebar';
import AuthGuard from '@/components/layout/AuthGuard';

export default function AppLayout({ children }) {
  return (
    <AuthGuard>
      <div className="app">
        <Sidebar />
        <main>{children}</main>
      </div>
    </AuthGuard>
  );
}
