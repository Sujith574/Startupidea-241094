import { useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout';
import { useAuth } from '../contexts/AuthContext';
import { getPartnerJobs, updateJob, getPartnerEarnings } from '../lib/api';
import { Truck, Package, CheckCircle, XCircle, TrendingUp, DollarSign, MapPin, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_OPTIONS = ['PICKED_UP', 'HANDED_TO_COURIER', 'IN_TRANSIT', 'DELIVERED'];

const STATUS_CONFIG = {
  CREATED:           { color: 'bg-blue-500/20 text-blue-400', label: 'Awaiting Accept' },
  PARTNER_ASSIGNED:  { color: 'bg-yellow-500/20 text-yellow-400', label: 'Accepted' },
  PICKED_UP:         { color: 'bg-orange-500/20 text-orange-400', label: 'Picked Up' },
  HANDED_TO_COURIER: { color: 'bg-purple-500/20 text-purple-400', label: 'At Hub' },
  IN_TRANSIT:        { color: 'bg-indigo-500/20 text-indigo-400', label: 'In Transit' },
  DELIVERED:         { color: 'bg-emerald-500/20 text-emerald-400', label: 'Delivered ✓' },
};

export default function PartnerDashboard() {
  const { profile } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [earnings, setEarnings] = useState({ totalDeliveries: 0, totalEarnings: 0 });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(null);
  const [activeTab, setActiveTab] = useState('active');

  const fetchData = async () => {
    try {
      const [jobsData, earnData] = await Promise.all([getPartnerJobs(), getPartnerEarnings()]);
      setJobs(jobsData.jobs || []);
      setEarnings(earnData);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAction = async (jobId, action, status) => {
    setUpdating(jobId);
    try {
      await updateJob(jobId, action ? { action } : { status });
      toast.success(action === 'accept' ? 'Job accepted!' : action === 'reject' ? 'Job rejected' : `Status → ${status}`);
      fetchData();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUpdating(null);
    }
  };

  const activeJobs = jobs.filter((j) => j.status !== 'DELIVERED');
  const completedJobs = jobs.filter((j) => j.status === 'DELIVERED');
  const displayJobs = activeTab === 'active' ? activeJobs : completedJobs;

  return (
    <AppLayout currentPage="/partner">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Partner Dashboard</h1>
        <p className="text-slate-400 mt-1">Welcome, {profile?.name} 🚴</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Deliveries', value: earnings.totalDeliveries, icon: <CheckCircle className="w-5 h-5 text-emerald-400" />, color: 'text-emerald-400' },
          { label: 'Total Earnings', value: `₹${earnings.totalEarnings}`, icon: <DollarSign className="w-5 h-5 text-yellow-400" />, color: 'text-yellow-400' },
          { label: 'Active Jobs', value: activeJobs.length, icon: <Truck className="w-5 h-5 text-brand-400" />, color: 'text-brand-400' },
          { label: 'Pending', value: jobs.filter(j => j.status === 'CREATED').length, icon: <Clock className="w-5 h-5 text-orange-400" />, color: 'text-orange-400' },
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

      {/* Jobs */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2">
            {[
              { key: 'active', label: `Active (${activeJobs.length})` },
              { key: 'completed', label: `Completed (${completedJobs.length})` },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${activeTab === tab.key ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30' : 'text-slate-400 hover:text-white'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-28 rounded-xl bg-white/5 animate-pulse" />)}
          </div>
        ) : displayJobs.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <p className="text-slate-400">{activeTab === 'active' ? 'No active jobs' : 'No completed deliveries yet'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {displayJobs.map((job) => {
              const cfg = STATUS_CONFIG[job.status] || STATUS_CONFIG.CREATED;
              const isUpdating = updating === job.id;

              return (
                <div key={job.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-start justify-between mb-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`badge ${cfg.color} text-xs`}>{cfg.label}</span>
                        <span className="text-xs text-slate-500 font-mono">{job.id?.slice(0, 8)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-slate-300">
                        <MapPin className="w-3 h-3 text-slate-500 flex-shrink-0" />
                        <span className="truncate">{job.pickupAddress}</span>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-slate-400">
                        <MapPin className="w-3 h-3 text-slate-600 flex-shrink-0" />
                        <span className="truncate">→ {job.deliveryAddress}</span>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <div className="text-sm font-semibold text-white">{job.weight} kg</div>
                      <div className="text-xs text-slate-400">{job.parcelType}</div>
                      <div className="text-sm text-emerald-400 font-medium">
                        ₹{Math.round((job.platformFee || 20) * 0.6)} earning
                      </div>
                    </div>
                  </div>

                  {job.status !== 'DELIVERED' && (
                    <div className="flex gap-2 flex-wrap mt-3">
                      {job.status === 'CREATED' && (
                        <>
                          <button
                            onClick={() => handleAction(job.id, 'accept')}
                            disabled={isUpdating}
                            className="btn-success text-xs py-1.5 px-3"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            Accept
                          </button>
                          <button
                            onClick={() => handleAction(job.id, 'reject')}
                            disabled={isUpdating}
                            className="btn-danger text-xs py-1.5 px-3"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Reject
                          </button>
                        </>
                      )}
                      {job.status !== 'CREATED' && STATUS_OPTIONS.filter((s) => {
                        const idx = STATUS_OPTIONS.indexOf(s);
                        const curIdx = STATUS_OPTIONS.indexOf(job.status);
                        return idx === curIdx + 1;
                      }).map((s) => (
                        <button
                          key={s}
                          onClick={() => handleAction(job.id, null, s)}
                          disabled={isUpdating}
                          className="btn-primary text-xs py-1.5 px-3"
                        >
                          {isUpdating ? <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin" /> : null}
                          Mark as {s.replace(/_/g, ' ').toLowerCase()}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
