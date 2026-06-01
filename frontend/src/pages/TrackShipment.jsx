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
    <div className="min-h-screen bg-slate-50 text-slate-800">
      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-brand-500 flex items-center justify-center text-white">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-lg text-slate-900 uppercase">ParcelBridge</span>
          </Link>
          <Link to="/" className="text-sm font-bold text-brand-500 hover:text-brand-600 transition-colors">
            Back to Home
          </Link>
        </div>
      </nav>

      <div className="p-6 lg:p-8 animate-fade-in max-w-2xl mx-auto mt-8">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/" className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 rounded-lg text-sm bg-white text-slate-600 hover:bg-slate-50 font-bold transition-all">
            <ArrowLeft className="w-4 h-4" />
            Home
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900">Track Consignment</h1>
            {id && <p className="text-slate-500 text-xs font-mono">{id.toUpperCase()}</p>}
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-white animate-pulse border border-slate-200" />)}
          </div>
        ) : !shipment ? (
          <div className="bg-white border border-slate-200 rounded-2xl text-center py-12 px-6 shadow-md">
            <Package className="w-12 h-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 font-medium">Consignment not found or tracking ID is invalid.</p>
            <Link to="/" className="mt-6 inline-block px-6 py-2.5 bg-brand-500 text-white rounded-lg font-bold text-sm shadow-md shadow-brand-500/25">Return to Home</Link>
          </div>
        ) : (
          <div className="space-y-6 animate-slide-up">
            {/* Info Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md">
              <div className="flex items-start justify-between mb-6 pb-4 border-b border-slate-100">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">TRACKING ID</div>
                  <div className="font-mono text-sm font-black text-slate-800">{shipment.courier?.trackingId || id.slice(0, 12).toUpperCase()}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-1">TOTAL COST</div>
                  <div className="text-xl font-black text-brand-500">₹{shipment.totalAmount}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                {[
                  { label: 'Pickup Origin Address', value: shipment.pickupAddress },
                  { label: 'Destination Address', value: shipment.deliveryAddress },
                  { label: 'Assigned Courier Service', value: `${shipment.courier?.logo || ''} ${shipment.courier?.courier || 'Standard Cargo'}` },
                  { label: 'Estimated Arrival', value: shipment.courier?.etaLabel || '2-4 Days' },
                  { label: 'Consignment Weight', value: `${shipment.weight} kg` },
                  { label: 'Delivery Partner Fleet', value: shipment.deliveryPartnerName || 'Assigning fleet driver...' },
                ].map((r) => (
                  <div key={r.label} className="flex flex-col gap-0.5">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{r.label}</span>
                    <span className="text-slate-700 font-semibold">{r.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Status Timeline */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md">
              <h2 className="text-lg font-black text-slate-900 mb-6 border-b border-slate-100 pb-3">Consignment Timeline</h2>
              <div className="relative">
                {STATUS_STEPS.map((step, i) => {
                  const isDone = i <= currentIndex;
                  const isCurrent = i === currentIndex;
                  const timelineEntry = shipment.statusTimeline?.find((t) => t.status === step.key);

                  return (
                    <div key={step.key} className="flex gap-4 relative">
                      {/* Line */}
                      {i < STATUS_STEPS.length - 1 && (
                        <div className={`absolute left-4 top-8 w-0.5 h-full -translate-x-1/2 ${isDone && i < currentIndex ? 'bg-brand-500' : 'bg-slate-200'}`} />
                      )}

                      {/* Icon */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 z-10 transition-all duration-500
                        ${isDone
                          ? isCurrent
                            ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/40 scale-110'
                            : 'bg-emerald-500 text-white'
                          : 'bg-slate-100 text-slate-400 border border-slate-200'
                        }`}
                      >
                        {isDone && !isCurrent ? <Check className="w-4.5 h-4.5" /> : step.icon}
                      </div>

                      {/* Content */}
                      <div className={`pb-6 flex-1 ${i === STATUS_STEPS.length - 1 ? 'pb-0' : ''}`}>
                        <div className={`font-bold text-sm ${isDone ? 'text-slate-800' : 'text-slate-400'}`}>
                          {step.label}
                          {isCurrent && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-500/10 text-brand-500 border border-brand-500/20 uppercase tracking-wider animate-pulse">
                              Active
                            </span>
                          )}
                        </div>
                        {timelineEntry ? (
                          <div className="text-xs text-slate-500 mt-1">
                            {new Date(timelineEntry.timestamp).toLocaleString('en-IN')}
                            {timelineEntry.note && <span className="ml-2 text-brand-500">· {timelineEntry.note}</span>}
                          </div>
                        ) : (
                          <div className="text-xs text-slate-400 mt-1">Status pending</div>
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
