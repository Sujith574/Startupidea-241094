import { Link } from 'react-router-dom';
import { Package, Zap, Shield, TrendingUp, ChevronRight, MapPin, Clock, Star } from 'lucide-react';

const features = [
  {
    icon: <Zap className="w-6 h-6 text-accent-400" />,
    title: 'Instant Booking',
    desc: 'Compare top couriers — Delhivery, BlueDart, Ekart — in real-time and book in under 60 seconds.',
  },
  {
    icon: <MapPin className="w-6 h-6 text-brand-400" />,
    title: 'Smart Partner Match',
    desc: 'Our Haversine-powered algorithm auto-assigns the nearest available delivery partner to your pickup.',
  },
  {
    icon: <Clock className="w-6 h-6 text-emerald-400" />,
    title: 'Live Status Tracking',
    desc: 'Watch your parcel journey from pickup to delivery with a beautiful timeline interface.',
  },
  {
    icon: <Shield className="w-6 h-6 text-purple-400" />,
    title: 'Secure & Reliable',
    desc: 'Firebase Auth with JWT verification ensures your account and data are always protected.',
  },
];

const stats = [
  { value: '50K+', label: 'Shipments Delivered' },
  { value: '1,200+', label: 'Delivery Partners' },
  { value: '99.2%', label: 'On-Time Rate' },
  { value: '₹0', label: 'Hidden Fees' },
];

const steps = [
  { step: '01', title: 'Create a Shipment', desc: 'Enter pickup & delivery address, parcel weight, and type.' },
  { step: '02', title: 'Compare Couriers', desc: 'See real-time pricing and ETA from multiple courier partners.' },
  { step: '03', title: 'Book & Relax', desc: 'A nearby delivery partner is auto-assigned to collect your parcel.' },
  { step: '04', title: 'Track Live', desc: 'Follow every status update until your parcel is delivered.' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-x-hidden">
      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
              <Package className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-white">ParcelBridge</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="btn-secondary text-sm py-2 px-4">
              Sign In
            </Link>
            <Link to="/register" className="btn-primary text-sm py-2 px-4">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────────────────────── */}
      <section className="relative pt-32 pb-24 px-4">
        {/* Background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-brand-600/20 rounded-full blur-3xl" />
          <div className="absolute top-40 right-0 w-[300px] h-[300px] bg-accent-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto text-center animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-medium mb-6">
            <Star className="w-3.5 h-3.5 fill-brand-400" />
            India's Smartest Logistics Platform
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight mb-6">
            Ship Smarter.
            <br />
            <span className="text-gradient">Bridge Every Mile.</span>
          </h1>

          <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Compare courier rates, auto-assign pickup partners, and track every shipment in real time —
            all on one beautifully simple platform.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary text-base py-4 px-8">
              Start Shipping Free
              <ChevronRight className="w-5 h-5" />
            </Link>
            <Link to="/login" className="btn-secondary text-base py-4 px-8">
              Sign In to Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────────────────────── */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s) => (
            <div key={s.label} className="card text-center">
              <div className="text-3xl font-extrabold text-gradient mb-1">{s.value}</div>
              <div className="text-slate-400 text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ───────────────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              Everything you need to <span className="text-gradient">ship at scale</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">
              Built for businesses and individuals who need speed, reliability, and transparency.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="card group hover:glow-brand">
                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">How it <span className="text-gradient">works</span></h2>
            <p className="text-slate-400">Four steps from booking to delivery.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={s.step} className="relative">
                <div className="card h-full">
                  <div className="text-5xl font-black text-brand-500/20 mb-3">{s.step}</div>
                  <h3 className="font-semibold text-white mb-2">{s.title}</h3>
                  <p className="text-slate-400 text-sm">{s.desc}</p>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 w-6 h-px bg-brand-500/40" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <section className="py-20 px-4">
        <div className="max-w-3xl mx-auto text-center card glow-brand">
          <div className="text-4xl font-bold mb-4">
            Ready to <span className="text-gradient">bridge the gap?</span>
          </div>
          <p className="text-slate-400 mb-8">
            Join thousands of shippers and delivery partners already using ParcelBridge.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary py-4 px-8 text-base">
              Create Free Account
              <ChevronRight className="w-5 h-5" />
            </Link>
            <Link to="/register?role=deliveryPartner" className="btn-secondary py-4 px-8 text-base">
              <TrendingUp className="w-5 h-5" />
              Become a Partner
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="py-8 px-4 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
              <Package className="w-3 h-3 text-white" />
            </div>
            <span className="font-semibold text-slate-300">ParcelBridge</span>
          </div>
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} ParcelBridge. Built for the future of logistics.
          </p>
        </div>
      </footer>
    </div>
  );
}
