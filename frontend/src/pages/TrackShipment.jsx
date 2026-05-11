import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getShipment } from '../lib/api';
import { Package, MapPin, Check, Clock, Truck, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_STEPS = [
  { key: 'CREATED',           label: 'Order Placed',        icon: <Package className="w-4 h-4" />,  color: 'text-blue-400',    line: 'bg-blue-500/40' },
  { key: 'PARTNER_ASSIGNED',  label: 'Partner Assigned',    icon: <Truck className="w-4 h-4" />,    color: 'text-yellow-400',  line: 'bg-yellow-500/40' },
  { key: 'PICKED_UP',         label: 'Picked Up',           icon: <Check className="w-4 h-4" />,    color: 'text-orange-400',  line: 'bg-orange-500/40' },
  { key: 'HANDED_TO_COURIER', label: 'At Courier Hub',      icon: <MapPin className="w-4 h-4" />,   color: 'text-purple-400',  line: 'bg-purple-500/40' },
  { key: 'IN_TRANSIT',        label: 'In Transit',          icon: <Truck className="w-4 h-4" />,    color: 'text-indigo-400',  line: 'bg-indigo-500/40' },
  { key: 'DELIVERED',         label: 'Delivered',           icon: <Check className="w-4 h-4" />,    color: 'text-emerald-400', line: 'bg-emerald-500/40' },
];

function statusIndex(status) {
  return STATUS_STEPS.findIndex((s) => s.key === status);
}

export default function TrackShipment() {
  const { id } = useParams();
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }
    
    getShipment(id)
      .then((d) => setShipment(d.shipment))
      .catch((err) => toast.error(err.message))
      .finally(() => setLoading(false));

    // Auto-refresh every 30s
    const timer = setInterval(() => {
      getShipment(id)
        .then((d) => setShipment(d.shipment))
        .catch(() => {});
    }, 30000);
    return () => clearInterval(timer);
  }, [id]);

  const currentIndex = shipment ? statusIndex(shipment.status) : -1;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300">
      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
              <Package className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl text-white">ParcelBridge</span>
          </Link>
          <Link to="/" className="text-sm font-medium hover:text-brand-400 transition-colors">
            Back to Home
          </Link>
        </div>
      </nav>

      <div className="p-6 lg:p-8 animate-fade-in max-w-2xl mx-auto mt-8">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/" className="btn-secondary text-sm py-2 px-3">
            <ArrowLeft className="w-4 h-4" />
            Home
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white">Track Consignment</h1>
            {id && <p className="text-slate-400 text-sm font-mono">{id.toUpperCase()}</p>}
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-white/5 animate-pulse" />)}
          </div>
        ) : !shipment ? (
          <div className="card text-center py-12 border border-white/10">
            <Package className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">Consignment not found or tracking ID is invalid.</p>
            <Link to="/" className="btn-primary mt-6">Return to Home</Link>
          </div>
        ) : (
          <div className="space-y-4 animate-slide-up">
            {/* Info Card */}
            <div className="card border border-white/10">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="text-xs text-slate-400 font-mono mb-1">TRACKING ID</div>
                  <div className="font-mono text-sm text-white">{shipment.courier?.trackingId || id.slice(0, 12).toUpperCase()}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400 mb-1">TOTAL</div>
                  <div className="text-lg font-bold text-white">₹{shipment.totalAmount}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {[
                  { label: 'From', value: shipment.pickupAddress },
                  { label: 'To', value: shipment.deliveryAddress },
                  { label: 'Courier', value: `${shipment.courier?.logo || ''} ${shipment.courier?.courier || '—'}` },
                  { label: 'ETA', value: shipment.courier?.etaLabel || '—' },
                  { label: 'Weight', value: `${shipment.weight} kg` },
                  { label: 'Partner', value: shipment.deliveryPartnerName || 'Being assigned...' },
                ].map((r) => (
                  <div key={r.label} className="flex flex-col gap-0.5">
                    <span className="text-xs text-slate-500">{r.label}</span>
                    <span className="text-slate-200">{r.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Timeline */}
            <div className="card border border-white/10">
              <h2 className="text-base font-semibold text-white mb-6">Consignment Timeline</h2>
              <div className="relative">
                {STATUS_STEPS.map((step, i) => {
                  const isDone = i <= currentIndex;
                  const isCurrent = i === currentIndex;
                  const timelineEntry = shipment.statusTimeline?.find((t) => t.status === step.key);

                  return (
                    <div key={step.key} className="flex gap-4 relative">
                      {/* Line */}
                      {i < STATUS_STEPS.length - 1 && (
                        <div className={`absolute left-4 top-8 w-0.5 h-full -translate-x-1/2 ${isDone && i < currentIndex ? step.line : 'bg-white/10'}`} />
                      )}

                      {/* Icon */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-all duration-500
                        ${isDone
                          ? isCurrent
                            ? 'bg-brand-500 shadow-lg shadow-brand-500/40 scale-110'
                            : 'bg-emerald-500/30 text-emerald-400'
                          : 'bg-white/5 text-slate-600'
                        } ${step.color}`}
                      >
                        {isDone && !isCurrent ? <Check className="w-4 h-4" /> : step.icon}
                      </div>

                      {/* Content */}
                      <div className={`pb-6 flex-1 ${i === STATUS_STEPS.length - 1 ? 'pb-0' : ''}`}>
                        <div className={`font-medium text-sm ${isDone ? 'text-white' : 'text-slate-500'}`}>
                          {step.label}
                          {isCurrent && (
                            <span className="ml-2 badge bg-brand-500/20 text-brand-400 border border-brand-500/30 text-xs animate-pulse-slow">
                              Current
                            </span>
                          )}
                        </div>
                        {timelineEntry ? (
                          <div className="text-xs text-slate-500 mt-0.5">
                            {new Date(timelineEntry.timestamp).toLocaleString('en-IN')}
                            {timelineEntry.note && <span className="ml-2">· {timelineEntry.note}</span>}
                          </div>
                        ) : (
                          <div className="text-xs text-slate-600 mt-0.5">Pending</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
