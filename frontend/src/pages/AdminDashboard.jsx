import { useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout';
import {
  getAdminUsers, getAdminShipments, getAdminPartners,
  getAdminAnalytics, assignPartner, updateUserRole
} from '../lib/api';
import {
  Users, Package, Truck, TrendingUp, BarChart3,
  CheckCircle, Search, RefreshCw, UserCog
} from 'lucide-react';
import toast from 'react-hot-toast';

const TABS = ['Analytics', 'Shipments', 'Users', 'Partners'];

const STATUS_COLOR = {
  CREATED: 'bg-blue-500/20 text-blue-400',
  PARTNER_ASSIGNED: 'bg-yellow-500/20 text-yellow-400',
  PICKED_UP: 'bg-orange-500/20 text-orange-400',
  HANDED_TO_COURIER: 'bg-purple-500/20 text-purple-400',
  IN_TRANSIT: 'bg-indigo-500/20 text-indigo-400',
  DELIVERED: 'bg-emerald-500/20 text-emerald-400',
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('Analytics');
  const [analytics, setAnalytics] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [users, setUsers] = useState([]);
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [assignModal, setAssignModal] = useState(null);
  const [assignPartnerId, setAssignPartnerId] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [a, s, u, p] = await Promise.all([
        getAdminAnalytics(),
        getAdminShipments(),
        getAdminUsers(),
        getAdminPartners(),
      ]);
      setAnalytics(a);
      setShipments(s.shipments || []);
      setUsers(u.users || []);
      setPartners(p.partners || []);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const handleAssign = async () => {
    if (!assignPartnerId) return toast.error('Select a partner');
    try {
      await assignPartner({ shipmentId: assignModal, partnerId: assignPartnerId });
      toast.success('Partner assigned!');
      setAssignModal(null);
      fetchAll();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      await updateUserRole(userId, role);
      toast.success('Role updated');
      fetchAll();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const filteredShipments = shipments.filter((s) =>
    s.pickupAddress?.toLowerCase().includes(search.toLowerCase()) ||
    s.deliveryAddress?.toLowerCase().includes(search.toLowerCase()) ||
    s.id?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout currentPage="/admin">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
          <p className="text-slate-400 mt-1">Platform overview and management</p>
        </div>
        <button onClick={fetchAll} disabled={loading} className="btn-secondary text-sm py-2">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 p-1 bg-white/5 rounded-xl w-fit">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${activeTab === t ? 'bg-brand-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Analytics Tab */}
      {activeTab === 'Analytics' && analytics && (
        <div className="animate-fade-in space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Users', value: analytics.totalUsers, icon: <Users className="w-5 h-5 text-brand-400" />, color: 'text-brand-400' },
              { label: 'Total Shipments', value: analytics.totalShipments, icon: <Package className="w-5 h-5 text-yellow-400" />, color: 'text-yellow-400' },
              { label: 'Active Partners', value: analytics.activePartners, icon: <Truck className="w-5 h-5 text-emerald-400" />, color: 'text-emerald-400' },
              { label: 'Total Revenue', value: `₹${(analytics.totalRevenue || 0).toLocaleString()}`, icon: <TrendingUp className="w-5 h-5 text-purple-400" />, color: 'text-purple-400' },
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

          <div className="card">
            <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-brand-400" />
              Shipment Status Breakdown
            </h3>
            <div className="space-y-3">
              {Object.entries(analytics.statusCounts || {}).map(([status, count]) => {
                const pct = analytics.totalShipments > 0 ? Math.round((count / analytics.totalShipments) * 100) : 0;
                return (
                  <div key={status}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300">{status.replace(/_/g, ' ')}</span>
                      <span className="text-slate-400">{count} ({pct}%)</span>
                    </div>
                    <div className="h-2 rounded-full bg-white/5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-400 transition-all duration-700"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Shipments Tab */}
      {activeTab === 'Shipments' && (
        <div className="animate-fade-in">
          <div className="card">
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search shipments..."
                  className="input-field pl-9"
                />
              </div>
              <span className="text-slate-400 text-sm flex items-center">
                {filteredShipments.length} shipments
              </span>
            </div>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {filteredShipments.map((s) => (
                <div key={s.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-mono text-slate-500 mb-0.5">{s.id?.slice(0, 8)}</div>
                    <div className="text-sm text-white truncate">{s.pickupAddress} → {s.deliveryAddress}</div>
                    <div className="text-xs text-slate-400">{s.userEmail} · ₹{s.totalAmount}</div>
                  </div>
                  <div className="flex items-center gap-2 ml-3 flex-shrink-0">
                    <span className={`badge text-xs ${STATUS_COLOR[s.status] || 'bg-slate-500/20 text-slate-400'}`}>
                      {s.status?.replace(/_/g, ' ')}
                    </span>
                    {!s.deliveryPartnerId && (
                      <button
                        onClick={() => setAssignModal(s.id)}
                        className="btn-secondary text-xs py-1 px-2"
                      >
                        Assign
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'Users' && (
        <div className="animate-fade-in card">
          <h3 className="font-semibold text-white mb-4">All Users ({users.length})</h3>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {users.map((u) => (
              <div key={u.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 font-bold text-sm">
                    {u.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{u.name}</p>
                    <p className="text-xs text-slate-400">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge text-xs ${u.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : u.role === 'deliveryPartner' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'}`}>
                    {u.role}
                  </span>
                  <select
                    defaultValue=""
                    onChange={(e) => { if (e.target.value) handleRoleChange(u.id, e.target.value); }}
                    className="text-xs bg-white/5 border border-white/10 text-slate-300 rounded-lg px-2 py-1 focus:outline-none"
                  >
                    <option value="" className="bg-slate-900">Change role...</option>
                    <option value="user" className="bg-slate-900">user</option>
                    <option value="admin" className="bg-slate-900">admin</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Partners Tab */}
      {activeTab === 'Partners' && (
        <div className="animate-fade-in card">
          <h3 className="font-semibold text-white mb-4">Delivery Partners ({partners.length})</h3>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto">
            {partners.map((p) => (
              <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold text-sm">
                    {p.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{p.name}</p>
                    <p className="text-xs text-slate-400">{p.vehicleType} · {p.totalDeliveries} deliveries · ₹{p.totalEarnings} earned</p>
                  </div>
                </div>
                <span className={`badge text-xs ${p.status === 'available' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/20 text-orange-400'}`}>
                  {p.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Assign Modal */}
      {assignModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setAssignModal(null)}>
          <div className="card w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-white mb-4">Assign Delivery Partner</h3>
            <p className="text-slate-400 text-sm mb-4">Shipment: <span className="font-mono">{assignModal?.slice(0, 8)}</span></p>
            <select
              value={assignPartnerId}
              onChange={(e) => setAssignPartnerId(e.target.value)}
              className="input-field mb-4"
            >
              <option value="" className="bg-slate-900">Select partner...</option>
              {partners.filter((p) => p.status === 'available').map((p) => (
                <option key={p.id} value={p.id} className="bg-slate-900">{p.name} ({p.vehicleType})</option>
              ))}
            </select>
            <div className="flex gap-3">
              <button onClick={() => setAssignModal(null)} className="btn-secondary flex-1 py-2">Cancel</button>
              <button onClick={handleAssign} className="btn-primary flex-1 py-2">Assign</button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
