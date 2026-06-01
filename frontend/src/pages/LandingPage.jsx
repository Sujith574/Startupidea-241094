import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, MapPin, Truck, Phone, CheckCircle2, ShieldCheck, 
  Globe, Building2, Home, Box, ArrowRight, Menu, X, Star, FileCheck, Layers
} from 'lucide-react';
import toast from 'react-hot-toast';
import { submitInquiry, logVisitorPage } from '../lib/api';

const menuTabs = [
  {
    title: 'Profile',
    items: ['APML At a Glance', 'Managing Workers', 'Board of Directors', 'Core Team', 'Vision & Mission', 'Awards Gallery']
  },
  {
    title: 'Why ParcelBridge',
    items: ['Our Quality Standards', 'Innovative Technology', 'Safety Attributes', 'Secure Transit']
  },
  {
    title: 'Services',
    mega: true,
    items: [
      { name: 'Domestic Moving', desc: 'Seamless domestic relocation made simple and stress-free. Every move is handled with precision across India.' },
      { name: 'Self Storage', desc: 'Safe and flexible home storage solutions designed to protect your belongings for short or long durations.' },
      { name: 'Logistics', desc: 'Efficient logistics services ensuring safe and timely movement of goods across locations.' },
      { name: 'Warehousing', desc: 'Comprehensive warehousing solutions offering safe, organized, and scalable storage for goods.' },
      { name: 'ODC Transportation', desc: 'Specialized ODC transportation solutions designed for oversized and heavy cargo.' },
      { name: 'Exim Cargo', desc: 'End-to-end EXIM cargo solutions ensuring smooth import and export operations.' },
      { name: 'International Moving', desc: 'Complete international moving solutions designed for a smooth overseas transition.' },
      { name: 'Car Carriers', desc: 'Reliable car carrier services ensuring safe and timely transportation of vehicles.' },
      { name: 'Supply Chain', desc: 'Integrated supply chain solutions for efficient and seamless movement of goods.' }
    ]
  },
  {
    title: 'Shifting Process',
    items: ['Value Added Services', 'Our USP', 'Safety Features']
  }
];

const stats = [
  { value: '38+', label: 'Years of Trust' },
  { value: '140+', label: 'Branches PAN India' },
  { value: '1.6 Lakh', label: 'Moves Annually' },
  { value: '182', label: 'Countries Covered' },
];

const verticalServices = [
  { id: 'dom', title: 'Domestic Moving', desc: 'Comprehensive and customized domestic relocation plans to fit your calendar and budget perfectly.', icon: <Home className="w-6 h-6" /> },
  { id: 'store', title: 'Self Storage', desc: 'Perfect solution for temporary storage of household effects, with total safety assurance and retrieval.', icon: <Box className="w-6 h-6" /> },
  { id: 'car', title: 'Car Carriers', desc: 'Specialized vehicle trailers and closed trucks designed for risk-free transport of your cars.', icon: <Truck className="w-6 h-6" /> },
  { id: 'log', title: 'Logistics', desc: 'Commercial distribution networks with live status reports, reliable fleets and scheduled runs.', icon: <Layers className="w-6 h-6" /> },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [trackingId, setTrackingId] = useState('');
  
  // Hero Tab forms state
  const [activeHeroTab, setActiveHeroTab] = useState('Domestic');
  const [quoteForm, setQuoteForm] = useState({ name: '', phone: '', from: '', to: '' });
  
  // Vertical services tab state
  const [activeVertTab, setActiveVertTab] = useState('dom');
  
  // Responsive menu toggle
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);

  // PWA Installation Trigger State
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstallable, setIsInstallable] = useState(false);

  // Submit analytics page visit and set PWA installer hooks
  useEffect(() => {
    logVisitorPage('/').catch(() => {});

    const handleBeforeInstall = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstallable(false);
      setDeferredPrompt(null);
    }
  };

  const handleTrack = (e) => {
    e.preventDefault();
    if (!trackingId.trim()) return toast.error('Please enter a valid tracking ID');
    // Log tracking attempt
    logVisitorPage(`/track/${trackingId}`).catch(() => {});
    navigate(`/track/${trackingId}`);
  };

  const handleQuoteSubmit = async (e) => {
    e.preventDefault();
    if (!quoteForm.name || !quoteForm.phone || !quoteForm.from || !quoteForm.to) {
      return toast.error('Please fill out all fields.');
    }
    try {
      await submitInquiry({
        name: quoteForm.name,
        phone: quoteForm.phone,
        fromCity: quoteForm.from,
        toCity: quoteForm.to,
        serviceType: `${activeHeroTab} Moving/Shifting`,
      });
      toast.success('Your quote inquiry has been submitted! Our team will contact you shortly.');
      setQuoteForm({ name: '', phone: '', from: '', to: '' });
    } catch (err) {
      toast.error('Failed to submit quote inquiry. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans selection:bg-brand-500 selection:text-white">
      
      {/* ── Top utility bar ────────────────────────────────────────────────────────── */}
      <div className="bg-slate-900 text-white text-xs py-2 px-4 border-b border-white/5">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-brand-500" /> Call Us: (+91) 9 300 300 300</span>
            <span className="hidden sm:inline text-slate-400">|</span>
            <span className="hidden sm:inline text-slate-400">For all shifting and logistics solutions</span>
          </div>
          <div className="flex items-center gap-4 text-slate-300">
            <a href="#about" className="hover:text-brand-400 transition-colors">Shifting Process</a>
            <span>|</span>
            <a href="#services" className="hover:text-brand-400 transition-colors">Online Payment</a>
            <span>|</span>
            <a href="#contact" className="hover:text-brand-400 transition-colors">Customer Care</a>
          </div>
        </div>
      </div>

      {/* ── Sticky Header & Mega-Menu ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="w-12 h-12 rounded-xl bg-brand-500 flex items-center justify-center text-white shadow-md">
                <Package className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <span className="font-black text-2xl tracking-tight text-slate-900 block leading-none">PARCELBRIDGE</span>
                <span className="text-[10px] text-brand-500 uppercase tracking-widest font-bold">Relocation Service</span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8 font-semibold text-slate-700 text-sm">
              {menuTabs.map((m, idx) => (
                <div 
                  key={idx} 
                  className="relative group py-6"
                  onMouseEnter={() => setActiveDropdown(idx)}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button className="hover:text-brand-500 transition-colors flex items-center gap-1">
                    {m.title}
                  </button>

                  {/* Dropdown Menu */}
                  {activeDropdown === idx && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 bg-white border border-slate-100 rounded-xl shadow-2xl p-6 min-w-[280px] w-max max-w-4xl grid gap-3 animate-fade-in z-50">
                      {m.mega ? (
                        <div className="grid grid-cols-3 gap-6 w-[700px]">
                          {m.items.map((item, sIdx) => (
                            <div key={sIdx} className="hover:bg-slate-50 p-3 rounded-lg transition-colors cursor-pointer group/item">
                              <h4 className="font-bold text-slate-900 group-hover/item:text-brand-500 transition-colors mb-1 text-sm">{item.name}</h4>
                              <p className="text-slate-500 text-xs leading-normal">{item.desc}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        m.items.map((item, sIdx) => (
                          <a key={sIdx} href="#services" className="block text-slate-600 hover:text-brand-500 hover:bg-slate-50 py-2 px-3 rounded-lg transition-all text-sm">
                            {item}
                          </a>
                        ))
                      )}
                    </div>
                  )}
                </div>
              ))}
              <a href="#about" className="hover:text-brand-500 transition-colors py-6">About Us</a>
              <a href="#contact" className="hover:text-brand-500 transition-colors py-6">Contact</a>
            </nav>

            {/* CTA Phone & Tracking */}
            <div className="hidden sm:flex items-center gap-4">
              {isInstallable && (
                <button 
                  onClick={handleInstallClick}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg text-sm transition-all border border-slate-700 shadow"
                >
                  Download Web App
                </button>
              )}
              <a 
                href="tel:9300300300" 
                className="flex items-center gap-2 px-4 py-2 bg-brand-50 hover:bg-brand-100 text-brand-600 font-bold rounded-lg text-sm transition-colors border border-brand-200"
              >
                <Phone className="w-4 h-4" /> 9 300 300 300
              </a>
              <a 
                href="#track-consignment" 
                className="px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-lg text-sm transition-all shadow-md shadow-brand-500/20"
              >
                Track Consignment
              </a>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="lg:hidden">
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-slate-800 p-2 focus:outline-none"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-slate-100 p-4 space-y-4 shadow-inner">
            {menuTabs.map((m, idx) => (
              <div key={idx} className="space-y-1">
                <div className="font-bold text-slate-800 text-sm border-b pb-1">{m.title}</div>
                <div className="pl-3 space-y-1">
                  {m.mega ? (
                    m.items.map((item, sIdx) => (
                      <a key={sIdx} href="#services" className="block text-slate-500 text-xs py-1 hover:text-brand-500">
                        {item.name}
                      </a>
                    ))
                  ) : (
                    m.items.map((item, sIdx) => (
                      <a key={sIdx} href="#services" className="block text-slate-500 text-xs py-1 hover:text-brand-500">
                        {item}
                      </a>
                    ))
                  )}
                </div>
              </div>
            ))}
            <div className="flex flex-col gap-2 pt-4">
              {isInstallable && (
                <button 
                  onClick={handleInstallClick}
                  className="w-full py-3 bg-slate-900 text-white font-bold text-center rounded-xl text-sm"
                >
                  Download Web App
                </button>
              )}
              <a 
                href="tel:9300300300"
                className="w-full flex items-center justify-center gap-2 py-3 bg-brand-50 text-brand-600 font-bold rounded-xl border border-brand-200"
              >
                <Phone className="w-4 h-4" /> 9 300 300 300
              </a>
              <a 
                href="#track-consignment" 
                className="w-full py-3 bg-brand-500 text-white font-bold text-center rounded-xl"
              >
                Track Consignment
              </a>
            </div>
          </div>
        )}
      </header>

      {/* ── Hero Slider Section with Tabbed Inquiry Form ───────────────────────────── */}
      <section className="relative bg-slate-900 text-white overflow-hidden py-16 lg:py-24">
        {/* Background Overlay */}
        <div className="absolute inset-0 bg-cover bg-center mix-blend-overlay opacity-25" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1200')` }} />
        
        <div className="relative max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-12 items-center z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30 text-xs font-bold mb-6 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" /> 100% Secure & Insured Relocations
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none mb-6">
              Shift everything you love <br />
              <span className="text-brand-500">with absolute safety.</span>
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed mb-8 max-w-xl">
              With 38+ Years of Professional Shifting Standards, We Ensure That <strong className="text-white">“Nothing Other Than The Place Changes!”</strong>
            </p>

            <div className="grid grid-cols-2 gap-4 max-w-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 text-brand-400">
                  <Star className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">4.9/5 Rating</h4>
                  <p className="text-slate-400 text-xs">Customer Satisfaction</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center border border-white/10 text-brand-400">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">ISO Certified</h4>
                  <p className="text-slate-400 text-xs">Quality Management</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Tabs Grid Box */}
          <div className="bg-white text-slate-800 rounded-2xl shadow-2xl p-6 sm:p-8 border border-slate-100">
            <h3 className="font-black text-2xl text-slate-900 mb-2">Get a Free Relocation Estimate</h3>
            <p className="text-slate-500 text-xs mb-6">Submit details below and receive immediate consultant callback.</p>
            
            {/* Service selector tabs */}
            <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-100 pb-4">
              {['Domestic', 'Household', 'International', 'Parcel', 'Car'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveHeroTab(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-tight transition-all
                    ${activeHeroTab === tab ? 'bg-brand-500 text-white shadow-md' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Inquiry Form */}
            <form onSubmit={handleQuoteSubmit} className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Full Name</label>
                  <input 
                    required 
                    type="text" 
                    placeholder="John Doe" 
                    value={quoteForm.name} 
                    onChange={e => setQuoteForm({...quoteForm, name: e.target.value})} 
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Contact Phone</label>
                  <input 
                    required 
                    type="tel" 
                    placeholder="+91 98765 43210" 
                    value={quoteForm.phone} 
                    onChange={e => setQuoteForm({...quoteForm, phone: e.target.value})} 
                    className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm"
                  />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Origin City</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      required 
                      type="text" 
                      placeholder="e.g. Mumbai" 
                      value={quoteForm.from} 
                      onChange={e => setQuoteForm({...quoteForm, from: e.target.value})} 
                      className="w-full pl-9 pr-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Destination City</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      required 
                      type="text" 
                      placeholder="e.g. Delhi" 
                      value={quoteForm.to} 
                      onChange={e => setQuoteForm({...quoteForm, to: e.target.value})} 
                      className="w-full pl-9 pr-4 py-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full py-4 mt-2 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-brand-500/35 hover:-translate-y-0.5"
              >
                Send Request Callback
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* ── Stats Bar Section ──────────────────────────────────────────────────────── */}
      <section className="bg-brand-500 text-white py-10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((s, idx) => (
            <div key={idx} className="text-center md:border-r md:border-white/20 last:border-0">
              <h3 className="text-3xl md:text-5xl font-black">{s.value}</h3>
              <p className="text-xs uppercase tracking-wider text-brand-100 font-bold mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Consignment Tracker Row Box ────────────────────────────────────────────── */}
      <section id="track-consignment" className="py-12 bg-white border-b border-slate-100">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h3 className="font-black text-2xl text-slate-900 mb-2">Track Consignment Live</h3>
          <p className="text-slate-500 text-xs mb-6">Input consignment reference or docket code below for live delivery logs.</p>
          
          <form onSubmit={handleTrack} className="flex gap-2 max-w-lg mx-auto bg-slate-50 p-1.5 rounded-xl border border-slate-200 shadow-inner">
            <input 
              type="text" 
              placeholder="Docket ID, e.g. TR-87321" 
              value={trackingId}
              onChange={e => setTrackingId(e.target.value)}
              className="flex-1 bg-transparent border-0 focus:outline-none focus:ring-0 text-sm px-3 text-slate-800"
            />
            <button 
              type="submit" 
              className="px-6 py-2.5 bg-brand-500 hover:bg-brand-600 text-white font-bold rounded-lg text-sm shadow-md transition-all"
            >
              Track Shifting
            </button>
          </form>
        </div>
      </section>

      {/* ── Vertical Shifting Options Slider: What We Cater ──────────────────────────── */}
      <section id="services" className="py-20 lg:py-28 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              A Shifting Solution for <span className="text-brand-500">Every Business & Household</span>
            </h2>
            <p className="text-slate-500 text-sm mt-3">
              We deploy innovative transport structures, expert cargo handlers, and tracking models to cater to relocation services pan-India.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8 items-start">
            {/* Sidebar list buttons */}
            <div className="space-y-2 lg:col-span-1">
              {verticalServices.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setActiveVertTab(v.id)}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl text-left border transition-all duration-200
                    ${activeVertTab === v.id 
                      ? 'bg-white border-brand-500 shadow-lg text-slate-900 font-bold scale-[1.02]' 
                      : 'bg-white/50 border-slate-100 hover:border-slate-300 hover:bg-white text-slate-600'}`}
                >
                  <span className={`p-2.5 rounded-lg ${activeVertTab === v.id ? 'bg-brand-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                    {v.icon}
                  </span>
                  <div>
                    <h4 className="text-sm font-bold block">{v.title}</h4>
                    <span className="text-xs text-slate-400 font-normal">Know specifications</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Detail Container Card */}
            <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl shadow-xl p-8 relative min-h-[300px] flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-brand-50 text-brand-500 flex items-center justify-center mb-6">
                  {verticalServices.find(v => v.id === activeVertTab)?.icon}
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-3">
                  {verticalServices.find(v => v.id === activeVertTab)?.title} Specification & Standard
                </h3>
                <p className="text-slate-600 leading-relaxed text-sm mb-6">
                  {verticalServices.find(v => v.id === activeVertTab)?.desc}
                </p>

                <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-6 text-slate-600">
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-brand-500" /> Insured Transit Packing
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-brand-500" /> Dedicated Moving Coordinator
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-brand-500" /> GPS Vehicle Tracking Enabled
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-brand-500" /> Clean Weather-Proof Storage
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <a 
                  href="#services"
                  onClick={() => {
                    const mappedTab = { dom: 'Domestic', store: 'Household', car: 'Car', log: 'Parcel' }[activeVertTab] || 'Domestic';
                    setActiveHeroTab(mappedTab);
                    window.scrollTo({ top: 400, behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-brand-500 font-bold hover:underline"
                >
                  Configure Shifting Now <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Why ParcelBridge Block ─────────────────────────────────────────────────── */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 leading-tight">
              India's Largest Shifting Network <span className="text-brand-500">Committed to Quality</span>
            </h2>
            <p className="text-slate-600 text-sm leading-relaxed mt-4 mb-6">
              Our shipping procedures focus on protecting domestic and commercial assets during transport. By utilizing structural protection cubes and secure multi-layer bubble wrap, we shield valuables throughout long-haul road and air cargo transit.
            </p>
            
            <ul className="space-y-3.5">
              <li className="flex items-center gap-3 text-sm text-slate-700 font-semibold">
                <CheckCircle2 className="w-5 h-5 text-brand-500" /> Custom Structural Trucking Cubes
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-700 font-semibold">
                <CheckCircle2 className="w-5 h-5 text-brand-500" /> Dedicated Shifting Consultants
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-700 font-semibold">
                <CheckCircle2 className="w-5 h-5 text-brand-500" /> 6 Million Square Feet Controlled Warehouse space
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-700 font-semibold">
                <CheckCircle2 className="w-5 h-5 text-brand-500" /> Zero damage claims policies
              </li>
            </ul>
          </div>

          <div className="relative">
            <div className="aspect-video sm:aspect-square bg-slate-100 rounded-3xl overflow-hidden shadow-xl border border-slate-200/60 p-3 relative flex items-center justify-center">
              <div className="absolute inset-0 bg-cover bg-center rounded-2xl filter brightness-90" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1516576880881-140175b02b29?auto=format&fit=crop&q=80&w=600')` }} />
              <div className="relative z-10 bg-slate-950/80 backdrop-blur-md rounded-2xl p-6 text-center max-w-sm text-white border border-white/10">
                <Package className="w-10 h-10 text-brand-500 mx-auto mb-3" />
                <h4 className="font-black text-lg">Trusted Since 1987</h4>
                <p className="text-xs text-slate-400 mt-1">Delivering standard relocations with zero complaints nationwide.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ───────────────────────────────────────────────────────────── */}
      <section className="py-20 lg:py-28 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-xs font-bold text-brand-500 uppercase tracking-widest block mb-2">Reviews</span>
            <h2 className="text-3xl font-black text-slate-900">What Our Customers Say</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Sanjay Sharma', role: 'Business Owner, Mumbai', quote: 'The packaging of glass items and electronic items was extremely standard. Zero damage experienced during shifting to Pune.' },
              { name: 'Amit Verma', role: 'IT Manager, Delhi', quote: 'Amazing shifting coordinators. The vehicle container tracking ID let me check exact locations. Highly recommended logistics.' },
              { name: 'Priya Nair', role: 'Household Relocation, Kochi', quote: 'Prompt delivery of household items. Friendly workers who loaded and arranged furniture securely in our new home.' }
            ].map((t, idx) => (
              <div key={idx} className="bg-white border border-slate-100 rounded-2xl p-6 shadow-md relative">
                <div className="flex gap-1 text-yellow-400 mb-4">
                  {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <p className="text-slate-600 italic text-sm leading-relaxed mb-6">"{t.quote}"</p>
                <div className="border-t border-slate-100 pt-4">
                  <h4 className="font-bold text-slate-900 text-sm">{t.name}</h4>
                  <p className="text-slate-400 text-xs">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────────────── */}
      <footer id="contact" className="bg-slate-900 text-slate-400 pt-16 pb-8 border-t border-brand-500/20">
        <div className="max-w-7xl mx-auto px-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-3 text-white mb-6">
              <div className="w-10 h-10 rounded-lg bg-brand-500 flex items-center justify-center">
                <Package className="w-5 h-5 text-white" />
              </div>
              <span className="font-black text-xl tracking-tight">PARCELBRIDGE</span>
            </div>
            <p className="text-xs leading-relaxed mb-6 text-slate-400">
              India's leading moving network provider. Safe packing, cargo monitoring, and on-time transport.
            </p>
            <div className="flex items-center gap-2 text-brand-400 font-bold text-sm">
              <Phone className="w-4 h-4" /> (+91) 9 300 300 300
            </div>
          </div>
          <div>
            <h4 className="text-white font-bold text-sm mb-5 uppercase tracking-wider">Services Offered</h4>
            <ul className="space-y-2.5 text-xs">
              <li><a href="#services" className="hover:text-brand-500 transition-colors">Domestic Moving Solutions</a></li>
              <li><a href="#services" className="hover:text-brand-500 transition-colors">International Air Relocation</a></li>
              <li><a href="#services" className="hover:text-brand-500 transition-colors">Car Trailer Carriers</a></li>
              <li><a href="#services" className="hover:text-brand-500 transition-colors">Dry and Secure Storage</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold text-sm mb-5 uppercase tracking-wider">Support Links</h4>
            <ul className="space-y-2.5 text-xs">
              <li><a href="#track-consignment" className="hover:text-brand-500 transition-colors">Track Consignment Live</a></li>
              <li><a href="#about" className="hover:text-brand-500 transition-colors">Quality Standard Reports</a></li>
              <li><a href="#contact" className="hover:text-brand-500 transition-colors">Customer Care Portal</a></li>
              <li><a href="#contact" className="hover:text-brand-500 transition-colors">Terms of Relocation</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold text-sm mb-5 uppercase tracking-wider">Corporate Hub</h4>
            <p className="text-xs leading-relaxed mb-4 text-slate-400">
              3rd Floor, ParcelBridge Tower, Plot No 12, Tech Park Road, North West Delhi, New Delhi, 110034 - (India)
            </p>
            <span className="text-[10px] bg-brand-500/20 text-brand-400 border border-brand-500/30 px-2 py-1 rounded font-semibold">
              ISO 9001:2015 Registered
            </span>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-800 text-center text-xs text-slate-500">
          © {new Date().getFullYear()} ParcelBridge Shipping Ltd. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
