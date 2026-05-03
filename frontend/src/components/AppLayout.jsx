import { Link, useNavigate } from 'react-router-dom';
import { Package, LogOut, LayoutDashboard, PlusCircle, Truck, Settings } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';

const userLinks = [
  { to: '/dashboard', icon: <LayoutDashboard className="w-4 h-4" />, label: 'Dashboard' },
  { to: '/book', icon: <PlusCircle className="w-4 h-4" />, label: 'Book Shipment' },
];

const partnerLinks = [
  { to: '/partner', icon: <Truck className="w-4 h-4" />, label: 'My Jobs' },
];

const adminLinks = [
  { to: '/admin', icon: <LayoutDashboard className="w-4 h-4" />, label: 'Admin Panel' },
];

export default function AppLayout({ children, currentPage }) {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();

  const links = profile?.role === 'admin' ? adminLinks
    : profile?.role === 'deliveryPartner' ? partnerLinks
    : userLinks;

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out');
    navigate('/');
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Sidebar ────────────────────────────────────────────────────── */}
      <aside className="hidden md:flex flex-col w-64 border-r border-white/5 bg-slate-950/50 backdrop-blur-xl fixed h-full z-40">
        <div className="p-6 border-b border-white/5">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
              <Package className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-white">ParcelBridge</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={`sidebar-link ${currentPage === l.to ? 'active' : ''}`}
            >
              {l.icon}
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-3 py-3 rounded-xl bg-white/5 mb-3">
            <div className="w-8 h-8 rounded-full bg-brand-500/30 flex items-center justify-center text-brand-400 font-bold text-sm">
              {profile?.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">{profile?.name}</p>
              <p className="text-xs text-slate-400 truncate capitalize">{profile?.role}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Content ───────────────────────────────────────────────── */}
      <main className="flex-1 md:ml-64 min-h-screen">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-30">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
              <Package className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-white text-sm">ParcelBridge</span>
          </Link>
          <div className="flex items-center gap-2">
            {links.map((l) => (
              <Link key={l.to} to={l.to} className={`p-2 rounded-lg transition-colors ${currentPage === l.to ? 'bg-brand-500/20 text-brand-400' : 'text-slate-400'}`}>
                {l.icon}
              </Link>
            ))}
            <button onClick={handleLogout} className="p-2 rounded-lg text-red-400">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-6 lg:p-8 animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  );
}
