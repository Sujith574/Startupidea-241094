import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getAdminUsers, getAdminShipments, getAdminPartners,
  getAdminAnalytics, getAdminInquiries, getAdminVisitorLogs,
  assignPartner, updateUserRole, updateInquiryStatus, logVisitorPage
} from '../lib/api';
import {
  Users, Package, Truck, TrendingUp, BarChart3,
  CheckCircle, Search, RefreshCw, LogOut, Eye,
  HelpCircle, ShieldCheck, CheckSquare, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_COLOR = {
  CREATED: 'bg-blue-500/20 text-blue-400',
  PARTNER_ASSIGNED: 'bg-yellow-500/20 text-yellow-400',
  PICKED_UP: 'bg-orange-500/20 text-orange-400',
  HANDED_TO_COURIER: 'bg-purple-500/20 text-purple-400',
  IN_TRANSIT: 'bg-indigo-500/20 text-indigo-400',
  DELIVERED: 'bg-emerald-500/20 text-emerald-400',
};

const INQUIRY_STATUS_COLOR = {
  NEW: 'bg-blue-500/20 text-blue-400',
  CONTACTED: 'bg-yellow-500/20 text-yellow-400',
  IN_PROGRESS: 'bg-purple-500/20 text-purple-400',
  RESOLVED: 'bg-emerald-500/20 text-emerald-400',
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Analytics');
  const [analytics, setAnalytics] = useState(null);
  const [shipments, setShipments] = useState([]);
  const [users, setUsers] = useState([]);
  const [partners, setPartners] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [visitorLogs, setVisitorLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  
  // Modals state
  const [assignModal, setAssignModal] = useState(null);
  const [assignPartnerId, setAssignPartnerId] = useState('');

  // Submit analytics log for admin panel
  useEffect(() => {
    logVisitorPage('/admin').catch(() => {});
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [a, s, u, p, i, v] = await Promise.all([
        getAdminAnalytics(),
        getAdminShipments(),
        getAdminUsers(),
        getAdminPartners(),
        getAdminInquiries(),
        getAdminVisitorLogs(),
      ]);
      setAnalytics(a);
      setShipments(s.shipments || []);
      setUsers(u.users || []);
      setPartners(p.partners || []);
      setInquiries(i.inquiries || []);
      setVisitorLogs(v.logs || []);
    } catch (err) {
      toast.error(err.message || 'Error pulling administration statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleAssign = async () => {
    if (!assignPartnerId) return toast.error('Select a partner');
    try {
      await assignPartner({ shipmentId: assignModal, partnerId: assignPartnerId });
      toast.success('Partner assigned successfully!');
      setAssignModal(null);
      fetchAll();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleRoleChange = async (userId, role) => {
    try {
      await updateUserRole(userId, role);
      toast.success('User role updated');
      fetchAll();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleInquiryStatus = async (id, status) => {
    try {
      await updateInquiryStatus(id, status);
      toast.success('Inquiry updated successfully');
      fetchAll();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('pb_token');
    localStorage.removeItem('pb_user');
    toast.success('Logged out successfully');
    navigate('/admin/login');
  };

  // Filters
  const filteredShipments = shipments.filter((s) =>
    s.pickupAddress?.toLowerCase().includes(search.toLowerCase()) ||
    s.deliveryAddress?.toLowerCase().includes(search.toLowerCase()) ||
    s.id?.toLowerCase().includes(search.toLowerCase())
  );

  const filteredInquiries = inquiries.filter((inq) =>
    inq.name?.toLowerCase().includes(search.toLowerCase()) ||
    inq.phone?.includes(search) ||
    inq.fromCity?.toLowerCase().includes(search.toLowerCase()) ||
    inq.toCity?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans">
      
      {/* ── Sidebar Navigation ────────────────────────────────────────────────────────── */}
      <aside className="w-64 bg-slate-900 border-r border-white/5 flex flex-col justify-between shrink-0">
        <div>
          <div className="h-20 flex items-center gap-2 px-6 border-b border-white/5">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center">
              <Package className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-white text-lg tracking-tight">PB Console</span>
          </div>

          <nav className="p-4 space-y-1">
            {['Analytics', 'Inquiries', 'Shipments', 'Users', 'Partners', 'Visitor Logs'].map((tab) => (
              <button
                key={tab}
                onClick={() => { setActiveTab(tab); setSearch(''); }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                  ${activeTab === tab ? 'bg-brand-500/20 text-white border border-brand-500/35 shadow-md shadow-brand-500/5' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
              >
                {tab === 'Analytics' && <BarChart3 className="w-4 h-4" />}
                {tab === 'Inquiries' && <HelpCircle className="w-4 h-4" />}
                {tab === 'Shipments' && <Package className="w-4 h-4" />}
                {tab === 'Users' && <Users className="w-4 h-4" />}
                {tab === 'Partners' && <Truck className="w-4 h-4" />}
                {tab === 'Visitor Logs' && <Eye className="w-4 h-4" />}
                {tab}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-white/5">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 border border-white/10 rounded-xl text-xs font-semibold text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* ── Main Panel View ──────────────────────────────────────────────────────────── */}
      <main className="flex-1 p-8 overflow-y-auto max-h-screen">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-white">{activeTab}</h1>
            <p className="text-slate-400 text-xs mt-1">Real-time system operations & audit tools.</p>
          </div>
          <button onClick={fetchAll} disabled={loading} className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white rounded-xl border border-white/10 text-sm font-semibold transition-all">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>

        {/* ── Analytics Grid Deck ─────────────────────────────────────────────────────── */}
        {activeTab === 'Analytics' && analytics && (
          <div className="space-y-8 animate-fade-in">
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { label: 'Total Inquiries', value: analytics.totalInquiries, icon: <HelpCircle className="w-5 h-5 text-blue-400" /> },
                { label: 'Visitor Logs', value: analytics.totalVisitorLogs, icon: <Eye className="w-5 h-5 text-indigo-400" /> },
                { label: 'Total Shipments', value: analytics.totalShipments, icon: <Package className="w-5 h-5 text-yellow-400" /> },
                { label: 'Active Partners', value: analytics.activePartners, icon: <Truck className="w-5 h-5 text-emerald-400" /> },
                { label: 'Revenue', value: `₹${(analytics.totalRevenue || 0).toLocaleString()}`, icon: <TrendingUp className="w-5 h-5 text-purple-400" /> },
              ].map((s, i) => (
                <div key={i} className="bg-slate-900 border border-white/5 rounded-2xl p-5">
                  <div className="flex items-center justify-between mb-3 text-slate-400">
                    <span className="text-xs font-bold uppercase tracking-wider">{s.label}</span>
                    {s.icon}
                  </div>
                  <div className="text-2xl font-black text-white">{s.value}</div>
                </div>
              ))}
            </div>

            <div className="bg-slate-900 border border-white/5 rounded-2xl p-6">
              <h3 className="font-bold text-white mb-6 flex items-center gap-2 text-sm uppercase tracking-wider">
                <BarChart3 className="w-5 h-5 text-brand-500" /> Shifting Status Metrics
              </h3>
              <div className="space-y-4">
                {Object.entries(analytics.statusCounts || {}).map(([status, count]) => {
                  const pct = analytics.totalShipments > 0 ? Math.round((count / analytics.totalShipments) * 100) : 0;
                  return (
                    <div key={status}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-300 font-medium">{status.replace(/_/g, ' ')}</span>
                        <span className="text-slate-400 font-bold">{count} orders ({pct}%)</span>
                      </div>
                      <div className="h-2 rounded-full bg-white/5">
                        <div
                          className="h-full rounded-full bg-brand-500 transition-all duration-700"
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

        {/* ── Inquiries View ─────────────────────────────────────────────────────────── */}
        {activeTab === 'Inquiries' && (
          <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter by name, phone, city..."
                  className="w-full pl-9 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-white"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-xs text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3">Client</th>
                    <th className="pb-3">Moving Path</th>
                    <th className="pb-3">Service</th>
                    <th className="pb-3">Date</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {filteredInquiries.map((inq) => (
                    <tr key={inq.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4">
                        <div className="font-bold text-white">{inq.name}</div>
                        <div className="text-xs text-slate-400">{inq.phone}</div>
                      </td>
                      <td className="py-4">
                        <div className="font-medium text-slate-300">{inq.fromCity} ➔ {inq.toCity}</div>
                      </td>
                      <td className="py-4 text-slate-400 text-xs">{inq.serviceType}</td>
                      <td className="py-4 text-slate-500 text-xs">{new Date(inq.createdAt).toLocaleString()}</td>
                      <td className="py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${INQUIRY_STATUS_COLOR[inq.status] || 'bg-slate-500/20 text-slate-400'}`}>
                          {inq.status}
                        </span>
                      </td>
                      <td className="py-4 text-right">
                        <select
                          value={inq.status}
                          onChange={(e) => handleInquiryStatus(inq.id, e.target.value)}
                          className="bg-slate-800 text-xs border border-white/10 text-slate-300 rounded-lg px-2.5 py-1 focus:outline-none"
                        >
                          <option value="NEW">Mark NEW</option>
                          <option value="CONTACTED">Mark CONTACTED</option>
                          <option value="IN_PROGRESS">IN PROGRESS</option>
                          <option value="RESOLVED">RESOLVED</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredInquiries.length === 0 && (
                <div className="py-12 text-center text-slate-500 text-sm">No quote inquiries found.</div>
              )}
            </div>
          </div>
        )}

        {/* ── Shipments View ─────────────────────────────────────────────────────────── */}
        {activeTab === 'Shipments' && (
          <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search shipments..."
                  className="w-full pl-9 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 text-white"
                />
              </div>
            </div>

            <div className="space-y-3">
              {filteredShipments.map((s) => (
                <div key={s.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl bg-white/[0.02] border border-white/5 gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-mono text-slate-500 mb-1">ID: {s.id}</div>
                    <div className="text-sm font-semibold text-white truncate">{s.pickupAddress} ➔ {s.deliveryAddress}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{s.userEmail} · Fee: ₹{s.totalAmount}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_COLOR[s.status] || 'bg-slate-500/20 text-slate-400'}`}>
                      {s.status?.replace(/_/g, ' ')}
                    </span>
                    {!s.deliveryPartnerId ? (
                      <button
                        onClick={() => setAssignModal(s.id)}
                        className="px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-lg text-xs"
                      >
                        Assign Partner
                      </button>
                    ) : (
                      <span className="text-xs text-slate-500 font-mono">Partner: {s.deliveryPartnerName}</span>
                    )}
                  </div>
                </div>
              ))}
              {filteredShipments.length === 0 && (
                <div className="py-12 text-center text-slate-500 text-sm">No shipments registered.</div>
              )}
            </div>
          </div>
        )}

        {/* ── Users View ─────────────────────────────────────────────────────────────── */}
        {activeTab === 'Users' && (
          <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 animate-fade-in">
            <h3 className="font-bold text-white mb-4">Console Users ({users.length})</h3>
            <div className="divide-y divide-white/5">
              {users.map((u) => (
                <div key={u.id} className="flex items-center justify-between py-4">
                  <div>
                    <h4 className="font-bold text-white text-sm">{u.name}</h4>
                    <span className="text-xs text-slate-400 block">{u.email}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${u.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                      {u.role}
                    </span>
                    <select
                      defaultValue=""
                      onChange={(e) => { if (e.target.value) handleRoleChange(u.id, e.target.value); }}
                      className="bg-slate-800 text-xs border border-white/10 text-slate-300 rounded-lg px-2 py-1 focus:outline-none"
                    >
                      <option value="">Modify Access...</option>
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Partners View ──────────────────────────────────────────────────────────── */}
        {activeTab === 'Partners' && (
          <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 animate-fade-in">
            <h3 className="font-bold text-white mb-4">Delivery Fleets ({partners.length})</h3>
            <div className="space-y-3">
              {partners.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-4 rounded-xl bg-white/[0.02]">
                  <div>
                    <h4 className="font-bold text-white text-sm">{p.name}</h4>
                    <p className="text-xs text-slate-400 mt-1">{p.vehicleType} · {p.totalDeliveries} loads · Earnings: ₹{p.totalEarnings}</p>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${p.status === 'available' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-orange-500/20 text-orange-400'}`}>
                    {p.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Visitor Logs View ──────────────────────────────────────────────────────── */}
        {activeTab === 'Visitor Logs' && (
          <div className="bg-slate-900 border border-white/5 rounded-2xl p-6 animate-fade-in">
            <h3 className="font-bold text-white mb-4">Recent Visitor logs</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-xs text-slate-400 font-bold uppercase tracking-wider">
                    <th className="pb-3">Endpoint Page</th>
                    <th className="pb-3">Client Agent / IP</th>
                    <th className="pb-3">Audit Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm font-mono text-slate-300">
                  {visitorLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 text-brand-400 font-bold text-xs">{log.page}</td>
                      <td className="py-3">
                        <div className="text-xs font-semibold text-white">{log.ip}</div>
                        <div className="text-[10px] text-slate-500 truncate max-w-sm">{log.userAgent}</div>
                      </td>
                      <td className="py-3 text-xs text-slate-400">{new Date(log.timestamp).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {visitorLogs.length === 0 && (
                <div className="py-12 text-center text-slate-500 text-sm">No visitor tracking registers available.</div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ── Assign Partner Modal ───────────────────────────────────────────────────── */}
      {assignModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setAssignModal(null)}>
          <div className="bg-slate-900 border border-white/10 w-full max-w-sm rounded-2xl p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-white text-lg mb-2">Select Active Fleet Partner</h3>
            <p className="text-xs text-slate-400 mb-4 font-mono">Shipment: {assignModal.slice(0, 12)}...</p>
            
            <select
              value={assignPartnerId}
              onChange={(e) => setAssignPartnerId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 mb-5"
            >
              <option value="">Select available partner...</option>
              {partners.filter(p => p.status === 'available').map((p) => (
                <option key={p.id} value={p.id}>{p.name} ({p.vehicleType})</option>
              ))}
            </select>

            <div className="flex gap-3">
              <button onClick={() => setAssignModal(null)} className="flex-1 py-3 bg-white/5 hover:bg-white/10 text-white rounded-xl text-sm font-semibold transition-all">
                Cancel
              </button>
              <button onClick={handleAssign} className="flex-1 py-3 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-sm font-semibold transition-all">
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
