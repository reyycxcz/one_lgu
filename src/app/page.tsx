import Link from "next/link";
import Image from "next/image";
import { ArrowRight, FileText, Landmark, Users, Smartphone, MapPin, Lock, Scale, Bell, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-white overflow-hidden flex flex-col justify-between">
      {/* Background patterns */}
      <div className="absolute inset-0 bg-[radial-gradient(#7CFF8A_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.15] pointer-events-none" />
      
      {/* Header */}
      <header className="border-b border-[#E3F2E7] sticky top-0 bg-white/90 backdrop-blur-md z-50 transition-all duration-200">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image 
              src="/images/logo/one_lgu.png" 
              width={32}
              height={32}
              className="h-8 w-auto object-contain" 
              alt="OneLGU Logo" 
            />
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm font-sans font-medium text-foreground/60 hover:text-[#143D2A] transition-colors duration-200">Features</a>
            <a href="#portals" className="text-sm font-sans font-medium text-foreground/60 hover:text-[#143D2A] transition-colors duration-200">Portals</a>
            <a href="#security" className="text-sm font-sans font-medium text-foreground/60 hover:text-[#143D2A] transition-colors duration-200">Benefits</a>
          </nav>

          <Link href="/login" className="px-6 py-2 bg-primary text-white rounded-full font-sans text-xs font-bold tracking-wide transition-all duration-200 hover:bg-primary/95 hover:shadow-[0_4px_12px_rgba(0,177,94,0.2)] hover:translate-y-[-1px]">
            Log In Portal <ArrowRight className="h-3.5 w-3.5 inline ml-1" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-grow">
        <section className="max-w-6xl mx-auto px-6 py-20 md:py-28 flex flex-col items-center text-center">
          <div className="micro-label mb-4 animate-fade-in">
            01 — UNIFIED MUNICIPAL ADMINISTRATION
          </div>
          
          <h1 className="font-pixel text-5xl md:text-7xl tracking-wide uppercase leading-none max-w-4xl text-foreground mb-8 animate-fade-in">
            DIGITALIZING LOCAL GOVERNMENT
          </h1>
          
          <p className="text-foreground/80 font-sans text-lg max-w-2xl leading-relaxed mb-12 animate-fade-in">
            A secure government-to-citizen (G2C) and government-to-government (G2G) digital governance network linking municipal admins, barangay officers, and residents through paperless workflows.
          </p>

          <div className="flex flex-wrap gap-4 justify-center animate-fade-in">
            <Link href="/login" className="px-6 py-3 bg-primary text-white hover:bg-primary/95 rounded-full font-sans text-sm font-bold tracking-wide transition-all duration-200 shadow-[0_4px_12px_rgba(0,177,94,0.2)] hover:translate-y-[-1px]">
              Enter Platform Portal
            </Link>
            <Link href="/register" className="px-6 py-3 border border-[#E3E6E4] hover:border-gray-300 text-foreground bg-white hover:bg-gray-50 rounded-full font-sans text-sm font-bold tracking-wide transition-all duration-200 hover:translate-y-[-1px]">
              Citizen Signup Desk
            </Link>
          </div>

        </section>

        {/* Features / Modules Section */}
        <section id="features" className="max-w-6xl mx-auto px-6 py-16 border-t border-border/60">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
            <div>
              <span className="micro-label">02 — SYSTEM MODULES</span>
              <h2 className="font-pixel text-3xl uppercase tracking-wider mt-2">Core Functionalities</h2>
            </div>
            <p className="text-foreground/60 font-sans text-sm max-w-md">
              Streamlining local administrative procedures with automated state tracking, document generators, and verification logs.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Module 1 */}
            <div className="bryl-card p-6 space-y-4">
              <div className="flex justify-between items-start">
                <span className="font-sans text-xs font-bold text-white bg-primary px-2.5 py-1 rounded-lg">01</span>
                <span className="micro-label">MANAGEMENT & STORAGE</span>
              </div>
              <h3 className="font-pixel text-xl uppercase tracking-wide">Reports Submission & Auditing</h3>
              <p className="text-sm text-foreground/75 leading-relaxed font-sans">
                Allows barangay officials to upload monthly accomplishment reports and financial expense statements directly to Supabase Storage. LGU admins can review, leave feedback notes, and approve or reject submissions to build compliance scores.
              </p>
              <div className="border-t border-border/40 pt-3 font-mono text-[10px] text-foreground/50">
                FEATURES: Multi-format Upload • Review History Ledger • Automated PDF Archival
              </div>
            </div>

            {/* Module 2 */}
            <div className="bryl-card p-6 space-y-4">
              <div className="flex justify-between items-start">
                <span className="font-sans text-xs font-bold text-white bg-primary px-2.5 py-1 rounded-lg">02</span>
                <span className="micro-label">COMPLIANCE HUB</span>
              </div>
              <h3 className="font-pixel text-xl uppercase tracking-wide">LGU Required Documents Checklist</h3>
              <p className="text-sm text-foreground/75 leading-relaxed font-sans">
                Consolidated planning trackers enforcing developmental submissions (such as Annual Investment Programs and Development Plans). LGU dashboards flag delinquent barangays to maintain accountability.
              </p>
              <div className="border-t border-border/40 pt-3 font-mono text-[10px] text-foreground/50">
                FEATURES: Compliance Calendar • Automated Reminders • Barangay Performance Scorecards
              </div>
            </div>

            {/* Module 3 */}
            <div className="bryl-card p-6 space-y-4">
              <div className="flex justify-between items-start">
                <span className="font-sans text-xs font-bold text-white bg-primary px-2.5 py-1 rounded-lg">03</span>
                <span className="micro-label">G2C SERVICE PLATFORM</span>
              </div>
              <h3 className="font-pixel text-xl uppercase tracking-wide">Barangay Certification Requests</h3>
              <p className="text-sm text-foreground/75 leading-relaxed font-sans">
                Residents request clearances, residency certificates, indigency proofs, and first-time job seeker waivers online. Barangay staff verify inputs, generate official files with pre-loaded signatures, and track status until released.
              </p>
              <div className="border-t border-border/40 pt-3 font-mono text-[10px] text-foreground/50">
                FEATURES: Fee waiver validation (RA 11261) • PDF Generation • Multi-Stage Progress Stepper
              </div>
            </div>

            {/* Module 4 */}
            <div className="bryl-card p-6 space-y-4">
              <div className="flex justify-between items-start">
                <span className="font-sans text-xs font-bold text-white bg-primary px-2.5 py-1 rounded-lg">04</span>
                <span className="micro-label">MEDIATION & ARBITRATION</span>
              </div>
              <h3 className="font-pixel text-xl uppercase tracking-wide">Incident Grievance & Complaints</h3>
              <p className="text-sm text-foreground/75 leading-relaxed font-sans">
                A digital channel for residents to file complaints and upload supporting media. Officials assign investigator mediators (Kagawads), schedule face-to-face summons hearings, and log community arbitration resolutions.
              </p>
              <div className="border-t border-border/40 pt-3 font-mono text-[10px] text-foreground/50">
                FEATURES: Image/Video Evidence attachments • Hearing Scheduler • Mediation Case Log history
              </div>
            </div>
          </div>
        </section>

        {/* Portals Section */}
        <section id="portals" className="max-w-6xl mx-auto px-6 py-16 border-t border-border/60">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
            <div>
              <span className="micro-label">03 — PLATFORM ROLES</span>
              <h2 className="font-pixel text-3xl uppercase tracking-wider mt-2">Three Role-Based Portals</h2>
            </div>
            <p className="text-foreground/60 font-sans text-sm max-w-md">
              Secure routes and layouts ensuring users only see tools and data scoped to their specific administrative clearance level.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* LGU Admin Portal */}
            <div className="bryl-card p-6 flex flex-col justify-between h-80">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <Landmark className="h-6 w-6 text-foreground" />
                  <span className="font-mono text-xs uppercase text-foreground/40 font-semibold">LEVEL 03 — SUPER ADMIN</span>
                </div>
                <h3 className="font-pixel text-xl uppercase tracking-wide mb-2">LGU Console Portal</h3>
                <p className="text-sm text-foreground/75 font-sans leading-relaxed">
                  Consolidated municipal oversight. Admins audit compliance targets for all 5 barangays, evaluate uploaded financial statements, monitor immutable audit logs (L7), and configure system-wide RBAC.
                </p>
              </div>
              <Link href="/login" className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-foreground hover:underline">
                Enter LGU Portal Console <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Barangay Portal */}
            <div className="bryl-card p-6 flex flex-col justify-between h-80">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <Users className="h-6 w-6 text-foreground" />
                  <span className="font-mono text-xs uppercase text-foreground/40 font-semibold">LEVEL 02 — LOCAL OFFICIAL</span>
                </div>
                <h3 className="font-pixel text-xl uppercase tracking-wide mb-2">Barangay Hall Portal</h3>
                <p className="text-sm text-foreground/75 font-sans leading-relaxed">
                  Operations dashboard for Captains, SK, and Clerks. Process resident certification queues, dispatch planning documents, schedule Lupon mediation calendars, and manage local staff accounts.
                </p>
              </div>
              <Link href="/login" className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-foreground hover:underline">
                Enter Barangay Portal <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Resident Portal */}
            <div className="bryl-card p-6 flex flex-col justify-between h-80">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <FileText className="h-6 w-6 text-foreground" />
                  <span className="font-mono text-xs uppercase text-foreground/40 font-semibold">LEVEL 01 — CITIZEN PORTAL</span>
                </div>
                <h3 className="font-pixel text-xl uppercase tracking-wide mb-2">Resident Citizen Desk</h3>
                <p className="text-sm text-foreground/75 font-sans leading-relaxed">
                  Direct resident desk. File document certification requests, monitor application status in real-time via steppers, file community grievances, and receive instant in-app alerts.
                </p>
              </div>
              <Link href="/login" className="inline-flex items-center gap-1.5 font-mono text-xs uppercase tracking-wider text-foreground hover:underline">
                Enter Resident Desk <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>

        {/* Why OneLGU Benefits Section */}
        <section id="security" className="bg-[#F8FDF9] border-t border-b border-[#E3F2E7] py-16">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="micro-label text-[#143D2A] bg-[#E7FFEA] border-[#C7FFCF]">04 — BAKIT ONELGU?</span>
              <h2 className="font-pixel text-3xl uppercase tracking-wider mt-2 mb-4 text-[#143D2A]">Mas Mabilis, Mas Madali</h2>
              <p className="text-foreground/60 text-sm font-sans">
                Hindi na kailangan pumila sa barangay hall. Lahat ng serbisyo, isang click lang.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bryl-card p-6 space-y-3">
                <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-primary">
                  <Smartphone className="h-5 w-5" />
                </div>
                <h4 className="font-sans text-sm font-bold text-[#143D2A]">Online Request 24/7</h4>
                <p className="text-xs text-foreground/65 leading-relaxed font-sans">
                  Mag-request ng Barangay Clearance, Certificate of Indigency, at iba pa kahit gabi o weekend — walang pila, walang sayang na oras.
                </p>
              </div>

              <div className="bryl-card p-6 space-y-3">
                <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-primary">
                  <MapPin className="h-5 w-5" />
                </div>
                <h4 className="font-sans text-sm font-bold text-[#143D2A]">Real-Time Status Tracking</h4>
                <p className="text-xs text-foreground/65 leading-relaxed font-sans">
                  Makikita mo agad kung saan na ang request mo — submitted, verified, approved, o ready na for pickup. Hindi ka na need mag-follow up pa.
                </p>
              </div>

              <div className="bryl-card p-6 space-y-3">
                <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-primary">
                  <Lock className="h-5 w-5" />
                </div>
                <h4 className="font-sans text-sm font-bold text-[#143D2A]">Secured & Private</h4>
                <p className="text-xs text-foreground/65 leading-relaxed font-sans">
                  Lahat ng personal data at uploaded documents mo ay encrypted at protected. Ikaw lang at ang barangay mo ang may access.
                </p>
              </div>

              <div className="bryl-card p-6 space-y-3">
                <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-primary">
                  <Scale className="h-5 w-5" />
                </div>
                <h4 className="font-sans text-sm font-bold text-[#143D2A]">Paperless Complaints</h4>
                <p className="text-xs text-foreground/65 leading-relaxed font-sans">
                  Mag-file ng reklamo online at i-attach ang photos o videos bilang ebidensya. Automatic ang scheduling ng mediation sa barangay.
                </p>
              </div>

              <div className="bryl-card p-6 space-y-3">
                <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-primary">
                  <Bell className="h-5 w-5" />
                </div>
                <h4 className="font-sans text-sm font-bold text-[#143D2A]">Instant Notifications</h4>
                <p className="text-xs text-foreground/65 leading-relaxed font-sans">
                  Makakatanggap ka ng alerts kapag approved na ang document mo, may schedule na ang mediation, o may bagong update sa request mo.
                </p>
              </div>

              <div className="bryl-card p-6 space-y-3">
                <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-primary">
                  <Zap className="h-5 w-5" />
                </div>
                <h4 className="font-sans text-sm font-bold text-[#143D2A]">Faster Processing</h4>
                <p className="text-xs text-foreground/65 leading-relaxed font-sans">
                  Barangay officials can verify at approve agad dahil digital na lahat. Mas mabilis ang release ng certificates kumpara sa manual na proseso.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E3F2E7] bg-[#FAFDFB] pt-16 pb-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            {/* Column 1: Brand Info */}
            <div className="col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <Image 
                  src="/images/logo/one_lgu.png" 
                  width={28}
                  height={28}
                  className="h-7 w-auto object-contain" 
                  alt="OneLGU Logo"
                />
                <span className="font-sans font-bold text-base tracking-tight text-[#143D2A]">ONELGU</span>
              </div>
              <p className="text-xs text-foreground/65 max-w-sm leading-relaxed font-sans">
                Unified digital governance platform for local government units, barangays, and residents. Connecting communities with secure, paperless, and real-time administrative workflows.
              </p>
            </div>

            {/* Column 2: Portals */}
            <div className="space-y-4">
              <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-[#143D2A]/85">Portals</h4>
              <ul className="space-y-2 text-xs font-sans text-foreground/60">
                <li><Link href="/login" className="hover:text-[#143D2A] transition-colors duration-150">LGU Admin Desk</Link></li>
                <li><Link href="/login" className="hover:text-[#143D2A] transition-colors duration-150">Barangay Captain Portal</Link></li>
                <li><Link href="/login" className="hover:text-[#143D2A] transition-colors duration-150">SK Youth Console</Link></li>
                <li><Link href="/login" className="hover:text-[#143D2A] transition-colors duration-150">Resident Citizen Portal</Link></li>
              </ul>
            </div>

            {/* Column 3: Services */}
            <div className="space-y-4">
              <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-[#143D2A]/85">Services</h4>
              <ul className="space-y-2 text-xs font-sans text-foreground/60">
                <li><Link href="/login" className="hover:text-[#143D2A] transition-colors duration-150">Clearance Certificates</Link></li>
                <li><Link href="/login" className="hover:text-[#143D2A] transition-colors duration-150">Certificate of Residency</Link></li>
                <li><Link href="/login" className="hover:text-[#143D2A] transition-colors duration-150">Certificate of Indigency</Link></li>
                <li><Link href="/login" className="hover:text-[#143D2A] transition-colors duration-150">Incident Grievance Reports</Link></li>
              </ul>
            </div>

            {/* Column 4: Support */}
            <div className="space-y-4">
              <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-[#143D2A]/85">Suporta</h4>
              <ul className="space-y-2 text-xs font-sans text-foreground/60">
                <li><Link href="#" className="hover:text-[#143D2A] transition-colors duration-150">Paano Mag-Register</Link></li>
                <li><Link href="#" className="hover:text-[#143D2A] transition-colors duration-150">Mga Madalas na Tanong</Link></li>
                <li><Link href="#" className="hover:text-[#143D2A] transition-colors duration-150">Kontakin ang Barangay</Link></li>
                <li><Link href="#" className="hover:text-[#143D2A] transition-colors duration-150">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[#E3F2E7] pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-sans text-foreground/45">
            <div>© 2026 ONELGU PROJECT. LAOAG CITY, ILOCOS NORTE.</div>
            <div className="flex gap-4 flex-wrap justify-center">
              <a href="#" className="hover:text-[#143D2A] transition-colors">PRIVACY PROTOCOL</a>
              <span>•</span>
              <a href="#" className="hover:text-[#143D2A] transition-colors">TERMS OF USE</a>
              <span>•</span>
              <a href="#" className="hover:text-[#143D2A] transition-colors">DEVELOPER DOCS</a>
              <span>•</span>
              <a href="#" className="hover:text-[#143D2A] transition-colors">RLS SPECIFICATION</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
