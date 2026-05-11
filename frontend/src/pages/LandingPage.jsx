import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, MapPin, Truck, Phone, CheckCircle2, ShieldCheck, Globe, Building2, Home, Box, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

const services = [
  { icon: <Home className="w-8 h-8 text-brand-400" />, title: 'Domestic Moving', desc: 'Seamless domestic relocation made simple and stress-free across India.' },
  { icon: <Box className="w-8 h-8 text-emerald-400" />, title: 'Household Shifting', desc: 'Careful packing to safe transportation, preserving your memories.' },
  { icon: <Globe className="w-8 h-8 text-purple-400" />, title: 'International Moving', desc: 'Complete international moving solutions designed for overseas transitions.' },
  { icon: <Package className="w-8 h-8 text-orange-400" />, title: 'Warehousing Services', desc: 'Comprehensive warehousing solutions offering safe and scalable storage.' },
  { icon: <Truck className="w-8 h-8 text-blue-400" />, title: 'Car Carriers Service', desc: 'Reliable car carrier services ensuring safe transportation of vehicles.' },
  { icon: <Building2 className="w-8 h-8 text-pink-400" />, title: 'Office Shifting', desc: 'Leading movers offering corporate moving solutions with international standards.' },
];

const stats = [
  { value: '38+', label: 'Years of Trust' },
  { value: '140+', label: 'Branches PAN India' },
  { value: '1.6 Lakh', label: 'Moves Annually' },
  { value: '182', label: 'Countries Covered' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [trackingId, setTrackingId] = useState('');
  const [quoteForm, setQuoteForm] = useState({ name: '', phone: '', from: '', to: '' });

  const handleTrack = (e) => {
    e.preventDefault();
    if (!trackingId.trim()) return toast.error('Please enter a valid tracking ID');
    navigate(`/track/${trackingId}`);
  };

  const handleQuoteSubmit = (e) => {
    e.preventDefault();
    toast.success('Inquiry submitted! Our team will contact you shortly.');
    setQuoteForm({ name: '', phone: '', from: '', to: '' });
  };

  return (
    <div className="min-h-screen bg-slate-950 overflow-x-hidden text-slate-300">
      {/* ── Top Bar ────────────────────────────────────────────────────────── */}
      <div className="bg-brand-600/10 border-b border-brand-500/20 text-brand-400 text-sm py-2 px-4 hidden sm:block">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> (+91) 9 300 300 300</span>
            <span className="text-slate-500 hidden md:inline">For all shifting and logistics solutions</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-400"><ShieldCheck className="w-3.5 h-3.5" /> An ISO 9001:2015 Certified Company</span>
          </div>
        </div>
      </div>

      {/* ── Navbar ─────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center">
              <Package className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-xl text-white">ParcelBridge</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-6 text-sm font-medium">
              <a href="#services" className="hover:text-brand-400 transition-colors">Services</a>
              <a href="#about" className="hover:text-brand-400 transition-colors">About Us</a>
              <a href="#contact" className="hover:text-brand-400 transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </nav>

      {/* ── Hero & Inquiry Form ────────────────────────────────────────────── */}
      <section className="relative pt-20 pb-24 px-4 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-600/10 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3" />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-accent-500/10 rounded-full blur-3xl -translate-x-1/3 translate-y-1/3" />
        </div>

        <div className="relative max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="animate-fade-in text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-brand-400 text-sm font-medium mb-6 backdrop-blur-md">
              <CheckCircle2 className="w-4 h-4" />
              100% Safety Guarantee
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6">
              Shift everything you love <br className="hidden sm:block" />
              <span className="text-gradient">seamlessly.</span>
            </h1>
            <p className="text-lg sm:text-xl text-slate-400 mb-8 max-w-xl mx-auto lg:mx-0">
              With 38+ Years of Professional Moving Experience, We Ensure That ‘Nothing Other Than The Place Changes!’
            </p>
            
            {/* Track Consignment */}
            <div className="card-glass p-2 max-w-md mx-auto lg:mx-0 flex items-center border border-white/10">
              <input
                type="text"
                placeholder="Enter Tracking ID..."
                className="flex-1 bg-transparent border-none text-white px-4 py-2 focus:outline-none focus:ring-0 placeholder-slate-500 text-sm"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
              />
              <button onClick={handleTrack} className="btn-primary py-2 px-6 rounded-lg whitespace-nowrap">
                Track
              </button>
            </div>
          </div>

          {/* Inquiry Form */}
          <div className="animate-slide-up">
            <div className="card-glass p-8 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-transparent pointer-events-none" />
              <h2 className="text-2xl font-bold text-white mb-2">Get a Free Quote</h2>
              <p className="text-slate-400 text-sm mb-6">Experience zero damage shifting anywhere in the world.</p>
              
              <form onSubmit={handleQuoteSubmit} className="space-y-4 relative">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Name</label>
                    <input required type="text" className="input-field" placeholder="John Doe" value={quoteForm.name} onChange={e=>setQuoteForm({...quoteForm, name: e.target.value})} />
                  </div>
                  <div>
                    <label className="label">Phone No</label>
                    <input required type="tel" className="input-field" placeholder="+91 90000 00000" value={quoteForm.phone} onChange={e=>setQuoteForm({...quoteForm, phone: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label">Moving From</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input required type="text" className="input-field pl-10" placeholder="Origin City" value={quoteForm.from} onChange={e=>setQuoteForm({...quoteForm, from: e.target.value})} />
                    </div>
                  </div>
                  <div>
                    <label className="label">Moving To</label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input required type="text" className="input-field pl-10" placeholder="Dest. City" value={quoteForm.to} onChange={e=>setQuoteForm({...quoteForm, to: e.target.value})} />
                    </div>
                  </div>
                </div>
                <button type="submit" className="btn-primary w-full py-4 mt-2 text-base">
                  Submit Inquiry
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────────────────────── */}
      <section className="py-12 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-white/5">
          {stats.map((s) => (
            <div key={s.label} className="text-center px-4">
              <div className="text-3xl md:text-4xl font-extrabold text-brand-400 mb-1">{s.value}</div>
              <div className="text-slate-400 text-sm font-medium uppercase tracking-wider">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Services ───────────────────────────────────────────────────────── */}
      <section id="services" className="py-24 px-4 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">A Moving Solution That Assures <span className="text-gradient">Zero Damage</span></h2>
            <p className="text-slate-400 max-w-2xl mx-auto">We offer unrivaled relocation services as per your specific requirements, deploying our distinctive and brilliant moving techniques.</p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((s, idx) => (
              <div key={idx} className="card group hover:bg-white/[0.08] cursor-pointer transition-all duration-300">
                <div className="mb-6 p-4 rounded-2xl bg-white/5 inline-block group-hover:scale-110 group-hover:bg-white/10 transition-all duration-300">
                  {s.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{s.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed mb-6">{s.desc}</p>
                <div className="flex items-center text-brand-400 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity -translate-x-4 group-hover:translate-x-0 duration-300">
                  Know More <ArrowRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About / Trust ──────────────────────────────────────────────────── */}
      <section id="about" className="py-24 px-4 bg-brand-950/20 border-t border-white/5 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">India’s Largest and Most <span className="text-gradient">Awarded Movers</span></h2>
            <p className="text-slate-400 leading-relaxed mb-6 text-lg">
              ParcelBridge (formerly modeled on industry leaders) is a globally recognized logistics company operating since 1987. We are recognized for imparting excellent services in packing and moving segments.
            </p>
            <p className="text-slate-400 leading-relaxed mb-8">
              We have designed our services proficiently to meet maximum customer satisfaction and rendered them in a way that exceeds the expectations of our clients.
            </p>
            <ul className="space-y-3 mb-8 text-slate-300">
              <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-brand-400" /> Free Pre-Move Survey</li>
              <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-brand-400" /> Innovative Technology & Trucking Cubes</li>
              <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-brand-400" /> Online Consignment Tracking</li>
              <li className="flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-brand-400" /> 6 Million sq. ft. Warehouse Space</li>
            </ul>
          </div>
          <div className="relative">
            <div className="aspect-square md:aspect-video lg:aspect-square rounded-3xl overflow-hidden bg-slate-900 border border-white/10 p-2">
              {/* Decorative graphic placeholder for an image/truck */}
              <div className="w-full h-full rounded-2xl bg-gradient-to-tr from-brand-600/20 to-accent-600/20 flex flex-col items-center justify-center border border-white/5 relative overflow-hidden">
                <Truck className="w-32 h-32 text-white/20 absolute -right-8 -bottom-8 rotate-[-15deg]" />
                <Package className="w-20 h-20 text-brand-400 mb-4 drop-shadow-2xl" />
                <div className="text-2xl font-bold text-white text-center px-4">Trusted by Millions<br/><span className="text-brand-400">Since 1987</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <footer id="contact" className="bg-slate-950 py-12 px-4 border-t border-white/5">
        <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <Package className="w-6 h-6 text-brand-400" />
              <span className="font-bold text-xl text-white">ParcelBridge</span>
            </div>
            <p className="text-slate-400 text-sm mb-6">Your most reliable partner in relocation and logistics. Zero damage, infinite trust.</p>
            <div className="flex items-center gap-2 text-brand-400 font-medium">
              <Phone className="w-4 h-4" /> 9 300 300 300
            </div>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Our Services</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#" className="hover:text-brand-400">Domestic Moving</a></li>
              <li><a href="#" className="hover:text-brand-400">International Moving</a></li>
              <li><a href="#" className="hover:text-brand-400">Car Carriers</a></li>
              <li><a href="#" className="hover:text-brand-400">Warehousing</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li><a href="#" className="hover:text-brand-400">Track Consignment</a></li>
              <li><a href="#" className="hover:text-brand-400">About Us</a></li>
              <li><a href="#" className="hover:text-brand-400">Branches</a></li>
              <li><a href="#" className="hover:text-brand-400">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4">Corporate Office</h4>
            <p className="text-sm text-slate-400 leading-relaxed">
              3rd Floor, ParcelBridge Tower, Plot No 1 To 12, Tech Park Road, North West Delhi, New Delhi, 110034 - (India)
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 text-center text-slate-500 text-sm">
          © {new Date().getFullYear()} ParcelBridge Ltd. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
