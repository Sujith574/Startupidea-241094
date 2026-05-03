import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { useAuth } from '../contexts/AuthContext';
import { getMyShipments } from '../lib/api';
import { Package, PlusCircle, TrendingUp, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_CONFIG = {
  CREATED:           { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: 'Created' },
  PARTNER_ASSIGNED:  { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', label: 'Partner Assigned' },
  PICKED_UP:         { color: 'bg-orange-500/20 text-orange-400 border-orange-500/30', label: 'Picked Up' },
  HANDED_TO_COURIER: { color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', label: 'At Hub' },
  IN_TRANSIT:        { color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30', label: 'In Transit' },
  DELIVERED:         { color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30', label: 'Delivered' },
};

export default function UserDashboard() {
  const { profile } = useAuth();
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyShipments()
      .then((d) => setShipments(d.shipments || []))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    total: shipments.length,
    active: shipments.filter((s) => s.status !== 'DELIVERED').length,
    delivered: shipments.filter((s) => s.status === 'DELIVERED').length,
    spent: shipments.reduce((sum, s) => sum + (s.totalAmount || 0), 0),
  };

  return (
    <AppLayout currentPage="/dashboard">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Welcome back, {profile?.name?.split(' ')[0] || 'User'} 👋
          </h1>
          <p className="text-slate-400 mt-1">Here's your shipment overview</p>
        </div>
        <Link to="/book" className="btn-primary">
          <PlusCircle className="w-4 h-4" />
          Book New Shipment
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Shipments', value: stats.total, icon: <Package className="w-5 h-5 text-brand-400" />, color: 'text-brand-400' },
          { label: 'Active', value: stats.active, icon: <Clock className="w-5 h-5 text-yellow-400" />, color: 'text-yellow-400' },
          { label: 'Delivered', value: stats.delivered, icon: <CheckCircle className="w-5 h-5 text-emerald-400" />, color: 'text-emerald-400' },
          { label: 'Total Spent', value: `₹${stats.spent.toLocaleString()}`, icon: <TrendingUp className="w-5 h-5 text-purple-400" />, color: 'text-purple-400' },
        ].map((s) => (
          <div key={s.label} className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-slate-400 text-sm">{s.label}</span>
              {s.icon}
            </div>
            <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Shipments List */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">Recent Shipments</h2>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 rounded-xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : shipments.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 mb-2">No shipments yet</p>
            <Link to="/book" className="btn-primary text-sm py-2">
              <PlusCircle className="w-4 h-4" />
              Book your first shipment
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {shipments.map((s) => {
              const cfg = STATUS_CONFIG[s.status] || STATUS_CONFIG.CREATED;
              return (
                <Link
                  key={s.id}
                  to={`/track/${s.id}`}
                  className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10 transition-all duration-200 group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center flex-shrink-0">
                      <Package className="w-5 h-5 text-brand-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-white text-sm truncate">{s.pickupAddress}</p>
                      <p className="text-slate-400 text-xs truncate">→ {s.deliveryAddress}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                    <span className="text-sm text-slate-300 hidden sm:block">₹{s.totalAmount}</span>
                    <span className={`badge border ${cfg.color}`}>{cfg.label}</span>
                    <span className="text-slate-600 group-hover:text-slate-400 transition-colors">›</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
