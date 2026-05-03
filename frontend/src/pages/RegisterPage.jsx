import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Package, Mail, User, Phone, Truck, Hash, ArrowRight, RefreshCcw } from 'lucide-react';
import toast from 'react-hot-toast';

const VEHICLE_TYPES = ['bike', 'scooter', 'bicycle', 'car'];

export default function RegisterPage() {
  const { loginWithOTP, confirmOTP } = useAuth();
  const [searchParams] = useSearchParams();
  const defaultRole = searchParams.get('role') === 'deliveryPartner' ? 'deliveryPartner' : 'user';

  const [form, setForm] = useState({
    name: '', 
    email: '', 
    phone: '', 
    role: defaultRole,
    vehicleType: 'bike', 
    licenseNumber: '',
  });
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: Details, 2: OTP
  const [loading, setLoading] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await loginWithOTP(form.email);
      setStep(2);
      toast.success('OTP sent! 📧');
    } catch (err) {
      toast.error(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await confirmOTP(form.email, otp, {
        name: form.name,
        phone: form.phone,
        role: form.role,
        vehicleType: form.vehicleType,
        licenseNumber: form.licenseNumber,
      });
      toast.success('Account created successfully! 🎉');
    } catch (err) {
      toast.error(err.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-20">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-brand-600/15 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-white">ParcelBridge</span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">
            {step === 1 ? 'Join ParcelBridge' : 'Verify Account'}
          </h1>
          <p className="text-slate-400">
            {step === 1 ? 'Create your profile to get started' : `Verification code sent to ${form.email}`}
          </p>
        </div>

        <div className="card-glass p-8">
          {step === 1 ? (
            <>
              {/* Role Toggle */}
              <div className="flex rounded-xl bg-white/5 p-1 mb-6">
                {[
                  { val: 'user', label: 'Ship Parcels', icon: <Package className="w-4 h-4" /> },
                  { val: 'deliveryPartner', label: 'Delivery Partner', icon: <Truck className="w-4 h-4" /> },
                ].map((r) => (
                  <button
                    key={r.val}
                    type="button"
                    onClick={() => set('role', r.val)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all duration-200
                      ${form.role === r.val ? 'bg-brand-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                  >
                    {r.icon} {r.label}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <label className="label">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => set('name', e.target.value)}
                      placeholder="John Doe"
                      required
                      className="input-field pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => set('email', e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="input-field pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => set('phone', e.target.value)}
                      placeholder="+91 9876543210"
                      required
                      className="input-field pl-10"
                    />
                  </div>
                </div>

                {form.role === 'deliveryPartner' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label">Vehicle</label>
                        <select
                          value={form.vehicleType}
                          onChange={(e) => set('vehicleType', e.target.value)}
                          className="input-field"
                        >
                          {VEHICLE_TYPES.map((v) => (
                            <option key={v} value={v} className="bg-slate-900">{v}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="label">License No.</label>
                        <input
                          type="text"
                          value={form.licenseNumber}
                          onChange={(e) => set('licenseNumber', e.target.value)}
                          placeholder="ABC12345"
                          required
                          className="input-field"
                        />
                      </div>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary w-full py-3.5 mt-2 disabled:opacity-50"
                >
                  {loading ? (
                    <RefreshCcw className="w-4 h-4 animate-spin" />
                  ) : (
                    <>Next Step <ArrowRight className="ml-2 w-4 h-4" /></>
                  )}
                </button>
              </form>
            </>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-5">
              <div>
                <label className="label">Verification Code</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    maxLength="6"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                    placeholder="123456"
                    required
                    className="input-field pl-10 tracking-[1em] text-center font-bold text-lg"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || otp.length < 6}
                className="btn-primary w-full py-3.5 disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCcw className="w-4 h-4 animate-spin" />
                ) : 'Complete Registration'}
              </button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-slate-400 text-sm w-full hover:text-white transition-colors"
              >
                Go Back
              </button>
            </form>
          )}

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-slate-400 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
