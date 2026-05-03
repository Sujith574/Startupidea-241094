import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { compareCouriers, createShipment } from '../lib/api';
import { Package, MapPin, Weight, ChevronRight, ChevronLeft, Check, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const PARCEL_TYPES = ['Electronics', 'Clothing', 'Documents', 'Food', 'Fragile', 'General'];

const CITY_COORDS = {
  'Mumbai':    { lat: 19.076, lng: 72.8777 },
  'Delhi':     { lat: 28.6139, lng: 77.2090 },
  'Bangalore': { lat: 12.9716, lng: 77.5946 },
  'Hyderabad': { lat: 17.385, lng: 78.4867 },
  'Chennai':   { lat: 13.0827, lng: 80.2707 },
  'Kolkata':   { lat: 22.5726, lng: 88.3639 },
  'Pune':      { lat: 18.5204, lng: 73.8567 },
  'Ahmedabad': { lat: 23.0225, lng: 72.5714 },
};

function detectCityCoords(address) {
  for (const [city, coords] of Object.entries(CITY_COORDS)) {
    if (address.toLowerCase().includes(city.toLowerCase())) return coords;
  }
  return { lat: 17.385 + (Math.random() - 0.5) * 2, lng: 78.4867 + (Math.random() - 0.5) * 2 };
}

export default function BookShipment() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1=Details, 2=Compare, 3=Confirm
  const [loading, setLoading] = useState(false);
  const [quotes, setQuotes] = useState([]);
  const [selectedCourier, setSelectedCourier] = useState(null);

  const [form, setForm] = useState({
    pickupAddress: '',
    deliveryAddress: '',
    weight: '',
    parcelType: 'General',
    dimensions: { length: '', width: '', height: '' },
  });

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setDim = (k, v) => setForm((f) => ({ ...f, dimensions: { ...f.dimensions, [k]: v } }));

  const handleCompare = async (e) => {
    e.preventDefault();
    if (!form.pickupAddress || !form.deliveryAddress || !form.weight) {
      toast.error('Please fill all required fields');
      return;
    }
    setLoading(true);
    try {
      const pickupCoords = detectCityCoords(form.pickupAddress);
      const deliveryCoords = detectCityCoords(form.deliveryAddress);
      const data = await compareCouriers({
        weight: parseFloat(form.weight),
        pickupCoords,
        deliveryCoords,
      });
      setQuotes(data.quotes || []);
      setStep(2);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async () => {
    if (!selectedCourier) {
      toast.error('Please select a courier');
      return;
    }
    setLoading(true);
    try {
      const pickupCoords = detectCityCoords(form.pickupAddress);
      const deliveryCoords = detectCityCoords(form.deliveryAddress);
      const result = await createShipment({
        ...form,
        weight: parseFloat(form.weight),
        pickupCoords,
        deliveryCoords,
        selectedCourier,
      });
      toast.success('Shipment booked successfully! 🎉');
      navigate(`/track/${result.shipmentId}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout currentPage="/book">
      <div className="max-w-2xl mx-auto">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            {['Parcel Details', 'Compare Couriers', 'Confirm'].map((s, i) => (
              <div key={s} className="flex items-center gap-2 flex-1">
                <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all duration-300
                  ${step > i + 1 ? 'bg-emerald-500 text-white' : step === i + 1 ? 'bg-brand-500 text-white' : 'bg-white/10 text-slate-400'}`}>
                  {step > i + 1 ? <Check className="w-4 h-4" /> : i + 1}
                </div>
                <span className={`text-sm font-medium hidden sm:block ${step === i + 1 ? 'text-white' : 'text-slate-400'}`}>{s}</span>
                {i < 2 && <div className={`flex-1 h-px ${step > i + 1 ? 'bg-emerald-500/50' : 'bg-white/10'}`} />}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Parcel Details */}
        {step === 1 && (
          <div className="card animate-slide-up">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
                <Package className="w-5 h-5 text-brand-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Parcel Details</h2>
                <p className="text-slate-400 text-sm">Tell us about your shipment</p>
              </div>
            </div>

            <form onSubmit={handleCompare} className="space-y-5">
              <div>
                <label className="label">
                  <MapPin className="w-3.5 h-3.5 inline mr-1" />
                  Pickup Address *
                </label>
                <input
                  type="text"
                  value={form.pickupAddress}
                  onChange={(e) => set('pickupAddress', e.target.value)}
                  placeholder="e.g. 123 MG Road, Bangalore"
                  required
                  className="input-field"
                />
                <p className="text-xs text-slate-500 mt-1">Include city name for accurate delivery estimates</p>
              </div>

              <div>
                <label className="label">
                  <MapPin className="w-3.5 h-3.5 inline mr-1" />
                  Delivery Address *
                </label>
                <input
                  type="text"
                  value={form.deliveryAddress}
                  onChange={(e) => set('deliveryAddress', e.target.value)}
                  placeholder="e.g. 456 Andheri West, Mumbai"
                  required
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">
                    <Weight className="w-3.5 h-3.5 inline mr-1" />
                    Weight (kg) *
                  </label>
                  <input
                    type="number"
                    value={form.weight}
                    onChange={(e) => set('weight', e.target.value)}
                    placeholder="0.5"
                    min="0.1"
                    step="0.1"
                    required
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label">Parcel Type</label>
                  <select
                    value={form.parcelType}
                    onChange={(e) => set('parcelType', e.target.value)}
                    className="input-field"
                  >
                    {PARCEL_TYPES.map((t) => (
                      <option key={t} value={t} className="bg-slate-900">{t}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="label">Dimensions (cm) — Optional</label>
                <div className="grid grid-cols-3 gap-3">
                  {['length', 'width', 'height'].map((d) => (
                    <input
                      key={d}
                      type="number"
                      value={form.dimensions[d]}
                      onChange={(e) => setDim(d, e.target.value)}
                      placeholder={d.charAt(0).toUpperCase() + d.slice(1)}
                      min="0"
                      className="input-field"
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full py-3.5 mt-2"
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Comparing rates...</>
                ) : (
                  <><Zap className="w-4 h-4" /> Compare Courier Rates <ChevronRight className="w-4 h-4" /></>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Courier Comparison */}
        {step === 2 && (
          <div className="animate-slide-up">
            <div className="card mb-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-brand-500/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-brand-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Compare Couriers</h2>
                  <p className="text-slate-400 text-sm">Select the best option for you</p>
                </div>
              </div>

              <div className="space-y-3">
                {quotes.map((q, i) => (
                  <button
                    key={q.courier}
                    onClick={() => setSelectedCourier(q.courier)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200
                      ${selectedCourier === q.courier
                        ? 'bg-brand-500/15 border-brand-500/50 shadow-lg shadow-brand-500/10'
                        : 'bg-white/5 border-white/10 hover:border-white/20 hover:bg-white/8'
                      }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-2xl">{q.logo}</div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-white">{q.courier}</span>
                            {i === 0 && (
                              <span className="badge bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs">
                                Best Price
                              </span>
                            )}
                          </div>
                          <div className="text-slate-400 text-sm">{q.serviceType} • {q.etaLabel} delivery • {q.distanceKm} km</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-white">₹{q.price}</div>
                        <div className="text-xs text-slate-400">+{Math.round(q.price * 0.1)} platform fee</div>
                      </div>
                    </div>
                    {selectedCourier === q.courier && (
                      <div className="mt-3 flex items-center gap-1 text-brand-400 text-sm font-medium">
                        <Check className="w-4 h-4" />
                        Selected
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-secondary flex-1">
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={() => selectedCourier && setStep(3)}
                disabled={!selectedCourier}
                className="btn-primary flex-1 disabled:opacity-40"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 3 && (
          <div className="animate-slide-up">
            <div className="card mb-4">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                  <Check className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">Confirm Booking</h2>
                  <p className="text-slate-400 text-sm">Review and confirm your shipment</p>
                </div>
              </div>

              {(() => {
                const q = quotes.find((x) => x.courier === selectedCourier) || quotes[0];
                const fee = Math.round((q?.price || 0) * 0.1);
                const total = (q?.price || 0) + fee;
                return (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Pickup</span>
                        <span className="text-white text-right max-w-[60%]">{form.pickupAddress}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Delivery</span>
                        <span className="text-white text-right max-w-[60%]">{form.deliveryAddress}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Weight</span>
                        <span className="text-white">{form.weight} kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Parcel Type</span>
                        <span className="text-white">{form.parcelType}</span>
                      </div>
                      <div className="border-t border-white/10 pt-3 flex justify-between">
                        <span className="text-slate-400">Courier</span>
                        <span className="text-white">{q?.logo} {selectedCourier}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">ETA</span>
                        <span className="text-white">{q?.etaLabel}</span>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-brand-500/10 border border-brand-500/20">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-300">Courier charge</span>
                        <span className="text-white">₹{q?.price}</span>
                      </div>
                      <div className="flex justify-between text-sm mb-3">
                        <span className="text-slate-300">Platform fee (10%)</span>
                        <span className="text-white">₹{fee}</span>
                      </div>
                      <div className="border-t border-brand-500/20 pt-3 flex justify-between">
                        <span className="font-semibold text-white">Total</span>
                        <span className="font-bold text-xl text-brand-400">₹{total}</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="btn-secondary flex-1">
                <ChevronLeft className="w-4 h-4" />
                Back
              </button>
              <button
                onClick={handleBook}
                disabled={loading}
                className="btn-primary flex-1 disabled:opacity-50"
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Booking...</>
                ) : (
                  <><Check className="w-4 h-4" /> Confirm & Book</>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
