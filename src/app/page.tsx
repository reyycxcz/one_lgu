"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, FileText, Landmark, Users, Smartphone, MapPin, Lock, Scale, Bell, Zap, CheckCircle2, Clock, Check, BookOpen, ShieldAlert, Sparkles, Award, Plus, Minus } from "lucide-react";


export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    { q: "How do I request a Barangay Clearance?", a: "Log in to the Resident Citizen Portal, navigate to Certifications, and click 'New Request.' Select your document type, fill in the required details, and submit. You can track the status in real-time from your dashboard." },
    { q: "How long does it take for my certificate to be approved?", a: "Most documents are verified and signed within 15–30 minutes during office hours. You will receive a notification once your certificate is ready for download or pickup." },
    { q: "Is my personal information secure on OneLGU?", a: "Yes. All data is encrypted in transit and at rest using industry-standard protocols. Role-based access control ensures only authorized barangay officials can view your records." },
    { q: "Can I file a complaint anonymously?", a: "Currently, complaints require identity verification to ensure accountability. However, your details are only visible to the assigned Lupon mediator and barangay officials handling your case." },
    { q: "What documents can I request through the platform?", a: "You can request Barangay Clearances, Certificates of Residency, Certificates of Indigency, First-Time Job Seeker Certificates, and other official barangay documents." },
    { q: "Do I need to visit the Barangay Hall to pick up my certificate?", a: "It depends on the document type. Some certificates are available for digital download with official e-signatures, while others may require physical pickup with a valid ID." },
  ];

  return (
    <div className="relative min-h-screen bg-white overflow-hidden flex flex-col justify-between">
      
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
            <a href="#portals" className="text-sm font-sans font-medium text-[#143D2A] hover:text-[#143D2A] transition-colors duration-200">Portals</a>
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
          <div className="micro-label mb-4 animate-fade-in text-[#143D2A] bg-[#E7FFEA] border-[#C7FFCF]">
            01 — PROVINCE OF ILOCOS NORTE DIGITAL PORTAL
          </div>
          
          <h1 className="font-sans font-bold text-5xl md:text-7xl tracking-wide uppercase leading-none max-w-4xl text-foreground mb-8 animate-fade-in">
            DIGITALIZING LOCAL GOVERNMENT
          </h1>
          
          <p className="text-foreground/80 font-sans text-lg max-w-2xl leading-relaxed mb-12 animate-fade-in">
            A secure G2C and G2G digital governance network linking municipal offices, barangay halls, and citizens across the Province of Ilocos Norte through paperless workflows.
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

        <section id="features" className="max-w-6xl mx-auto px-6 py-16 border-t border-border/60">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
            <div>
              <span className="inline-block font-sans text-[10px] font-bold tracking-wider uppercase px-3.5 py-1 bg-primary text-white rounded-full">02 — SYSTEM MODULES</span>
              <h2 className="font-sans font-bold text-4xl uppercase tracking-wider mt-2 text-foreground">Core Functionalities</h2>
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
              <h3 className="font-sans font-bold text-xl uppercase tracking-wide">Reports Submission & Auditing</h3>
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
              <h3 className="font-sans font-bold text-xl uppercase tracking-wide">LGU Required Documents Checklist</h3>
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
              <h3 className="font-sans font-bold text-xl uppercase tracking-wide">Barangay Certification Requests</h3>
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
              <h3 className="font-sans font-bold text-xl uppercase tracking-wide">Incident Grievance & Complaints</h3>
              <p className="text-sm text-foreground/75 leading-relaxed font-sans">
                A digital channel for residents to file complaints and upload supporting media. Officials assign investigator mediators (Kagawads), schedule face-to-face summons hearings, and log community arbitration resolutions.
              </p>
              <div className="border-t border-border/40 pt-3 font-mono text-[10px] text-foreground/50">
                FEATURES: Image/Video Evidence attachments • Hearing Scheduler • Mediation Case Log history
              </div>
            </div>
          </div>
        </section>

        {/* Civic Bulletin & Guides Section */}
        <section className="bg-[#FAFDFB] border-t border-b border-[#E3F2E7] py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
              <div>
                <span className="inline-block font-sans text-[10px] font-bold tracking-wider uppercase px-3.5 py-1 bg-primary text-white rounded-full">03 — CIVIC BULLETIN & GUIDES</span>
                <h2 className="font-sans font-bold text-4xl uppercase tracking-wider mt-2 text-[#143D2A]">Civic Bulletin & Updates</h2>
              </div>
              <p className="text-foreground/60 font-sans text-sm max-w-md">
                Stay updated with the latest announcements, local programs, and official guidelines from your local government unit.
              </p>
            </div>

            {/* Content Cards Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1: Guide */}
              <div className="bryl-card p-6 flex flex-col justify-between bg-white border border-[#E3F2E7] rounded-none hover:border-[#C7FFCF] transition-colors duration-200">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold tracking-wider px-2 py-0.5 bg-[#E7FFEA] border border-[#C7FFCF] text-primary uppercase">Certification Guide</span>
                    <BookOpen className="h-4 w-4 text-[#143D2A]/60" />
                  </div>
                  <h3 className="font-sans text-sm font-bold text-[#143D2A] leading-snug">How to Request Barangay Clearances Online</h3>
                  <p className="text-xs text-foreground/65 leading-relaxed font-sans">
                    Follow the simple step-by-step procedure in the citizen desk portal to submit documents and track captain signatures.
                  </p>
                </div>
                <div className="pt-4 border-t border-[#E3F2E7] mt-6 flex justify-between items-center text-[10px] text-foreground/45 font-mono">
                  <span>CIVIC HANDBOOK</span>
                  <span className="text-primary font-bold">READ MORE →</span>
                </div>
              </div>

              {/* Card 2: Mediation */}
              <div className="bryl-card p-6 flex flex-col justify-between bg-white border border-[#E3F2E7] rounded-none hover:border-[#C7FFCF] transition-colors duration-200">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold tracking-wider px-2 py-0.5 bg-[#E7FFEA] border border-[#C7FFCF] text-primary uppercase">Dispute Mediation</span>
                    <ShieldAlert className="h-4 w-4 text-[#143D2A]/60" />
                  </div>
                  <h3 className="font-sans text-sm font-bold text-[#143D2A] leading-snug">Katarungang Pambarangay Hearing Rules</h3>
                  <p className="text-xs text-foreground/65 leading-relaxed font-sans">
                    Learn about local Lupon Tagapamayapa procedures, summoning schedules, and filing community grievances or disputes.
                  </p>
                </div>
                <div className="pt-4 border-t border-[#E3F2E7] mt-6 flex justify-between items-center text-[10px] text-foreground/45 font-mono">
                  <span>RESOLUTIONS</span>
                  <span className="text-primary font-bold">READ MORE →</span>
                </div>
              </div>

              {/* Card 3: Livelihood */}
              <div className="bryl-card p-6 flex flex-col justify-between bg-white border border-[#E3F2E7] rounded-none hover:border-[#C7FFCF] transition-colors duration-200">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold tracking-wider px-2 py-0.5 bg-[#E7FFEA] border border-[#C7FFCF] text-primary uppercase">Livelihood Programs</span>
                    <Sparkles className="h-4 w-4 text-[#143D2A]/60" />
                  </div>
                  <h3 className="font-sans text-sm font-bold text-[#143D2A] leading-snug">Free Livelihood Seminars & Skills Training</h3>
                  <p className="text-xs text-foreground/65 leading-relaxed font-sans">
                    Register at your local Barangay Hall for upcoming municipal skills workshops to improve family income and enterprise.
                  </p>
                </div>
                <div className="pt-4 border-t border-[#E3F2E7] mt-6 flex justify-between items-center text-[10px] text-foreground/45 font-mono">
                  <span>UPCOMING EVENTS</span>
                  <span className="text-primary font-bold">READ MORE →</span>
                </div>
              </div>

              {/* Card 4: Health */}
              <div className="bryl-card p-6 flex flex-col justify-between bg-white border border-[#E3F2E7] rounded-none hover:border-[#C7FFCF] transition-colors duration-200">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[9px] font-bold tracking-wider px-2 py-0.5 bg-[#E7FFEA] border-[#C7FFCF] border text-primary uppercase">Clean & Green</span>
                    <Award className="h-4 w-4 text-[#143D2A]/60" />
                  </div>
                  <h3 className="font-sans text-sm font-bold text-[#143D2A] leading-snug">Barangay Waste Management & Clean Schedules</h3>
                  <p className="text-xs text-foreground/65 leading-relaxed font-sans">
                    Participate in weekly community sanitation drives, local segregation campaigns, and environmental sanitation initiatives.
                  </p>
                </div>
                <div className="pt-4 border-t border-[#E3F2E7] mt-6 flex justify-between items-center text-[10px] text-foreground/45 font-mono">
                  <span>ANNOUNCEMENTS</span>
                  <span className="text-primary font-bold">READ MORE →</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Portals Section */}
        <section id="portals" className="max-w-6xl mx-auto px-6 py-16 border-t border-border/60">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
            <div>
              <span className="inline-block font-sans text-[10px] font-bold tracking-wider uppercase px-3.5 py-1 bg-primary text-white rounded-full">04 — PLATFORM ROLES</span>
              <h2 className="font-sans font-bold text-4xl uppercase tracking-wider mt-2 text-foreground">Three Role-Based Portals</h2>
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
                <h3 className="font-sans font-bold text-xl uppercase tracking-wide mb-2">LGU Console Portal</h3>
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
                <h3 className="font-sans font-bold text-xl uppercase tracking-wide mb-2">Barangay Hall Portal</h3>
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
                <h3 className="font-sans font-bold text-xl uppercase tracking-wide mb-2">Resident Citizen Desk</h3>
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
        <section id="security" className="bg-[#F8FDF9] border-t border-b border-[#E3F2E7] py-20">
          <div className="max-w-6xl mx-auto px-6 flex flex-col lg:flex-row gap-12">
            {/* Left Column: Header & Stats */}
            <div className="lg:w-1/3 shrink-0 flex flex-col justify-between">
              <div className="space-y-6">
                <div>
                  <span className="inline-block font-sans text-[10px] font-bold tracking-wider uppercase px-3.5 py-1 bg-primary text-white rounded-full w-fit">05 — WHY ONELGU?</span>
                  <h2 className="font-sans font-bold text-4xl uppercase tracking-wider mt-2 mb-4 text-[#143D2A]">Faster Services, Simpler Access</h2>
                  <p className="text-foreground/60 text-sm font-sans leading-relaxed">
                    Skip the queues at your local Barangay Hall. Request clearances and certificates online securely across Ilocos Norte.
                  </p>
                </div>

                {/* Integrated Stats Grid */}
                <div className="grid grid-cols-2 gap-6 pt-8 border-t border-[#E3F2E7]">
                  <div className="space-y-1">
                    <span className="block font-sans text-3xl font-bold text-primary">5</span>
                    <span className="block font-sans text-[10px] font-bold text-foreground/50 uppercase tracking-wider leading-tight">Barangays Connected</span>
                  </div>
                  <div className="space-y-1">
                    <span className="block font-sans text-3xl font-bold text-primary">12+</span>
                    <span className="block font-sans text-[10px] font-bold text-foreground/50 uppercase tracking-wider leading-tight">Services Available</span>
                  </div>
                  <div className="space-y-1">
                    <span className="block font-sans text-3xl font-bold text-primary">24/7</span>
                    <span className="block font-sans text-[10px] font-bold text-foreground/50 uppercase tracking-wider leading-tight">Online Access</span>
                  </div>
                  <div className="space-y-1">
                    <span className="block font-sans text-3xl font-bold text-primary">&lt;15m</span>
                    <span className="block font-sans text-[10px] font-bold text-foreground/50 uppercase tracking-wider leading-tight">Processing Time</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Benefits Cards Grid */}
            <div className="flex-grow grid sm:grid-cols-2 gap-6">
              <div className="bryl-card p-6 space-y-3">
                <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-primary">
                  <Smartphone className="h-5 w-5" />
                </div>
                <h4 className="font-sans text-sm font-bold text-[#143D2A]">Online Requests 24/7</h4>
                <p className="text-xs text-foreground/65 leading-relaxed font-sans">
                  Submit requests for Barangay Clearances, Certificates of Indigency, and other files anytime, anywhere.
                </p>
              </div>

              <div className="bryl-card p-6 space-y-3">
                <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-primary">
                  <MapPin className="h-5 w-5" />
                </div>
                <h4 className="font-sans text-sm font-bold text-[#143D2A]">Real-Time Status Tracking</h4>
                <p className="text-xs text-foreground/65 leading-relaxed font-sans">
                  Monitor the progress of your application instantly—from submission, official sign-off, to release.
                </p>
              </div>

              <div className="bryl-card p-6 space-y-3">
                <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-primary">
                  <Lock className="h-5 w-5" />
                </div>
                <h4 className="font-sans text-sm font-bold text-[#143D2A]">Secured & Private</h4>
                <p className="text-xs text-foreground/65 leading-relaxed font-sans">
                  Your personal information and uploaded files are protected. Access is strictly restricted to authorized officials.
                </p>
              </div>

              <div className="bryl-card p-6 space-y-3">
                <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-primary">
                  <Scale className="h-5 w-5" />
                </div>
                <h4 className="font-sans text-sm font-bold text-[#143D2A]">Paperless Complaints</h4>
                <p className="text-xs text-foreground/65 leading-relaxed font-sans">
                  File incident reports and upload photos or video evidence online. Automated calendars schedule mediation meetings easily.
                </p>
              </div>

              <div className="bryl-card p-6 space-y-3">
                <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-primary">
                  <Bell className="h-5 w-5" />
                </div>
                <h4 className="font-sans text-sm font-bold text-[#143D2A]">Instant Notifications</h4>
                <p className="text-xs text-foreground/65 leading-relaxed font-sans">
                  Receive email notifications when your document is approved, hearing schedules are posted, or actions are needed.
                </p>
              </div>

              <div className="bryl-card p-6 space-y-3">
                <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-primary">
                  <Zap className="h-5 w-5" />
                </div>
                <h4 className="font-sans text-sm font-bold text-[#143D2A]">Faster Processing</h4>
                <p className="text-xs text-foreground/65 leading-relaxed font-sans">
                  Digital queues help clerks verify applications faster, reducing clearance waiting times to minutes.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="bg-white border-t border-b border-[#E3F2E7] py-20">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
              <div>
                <span className="inline-block font-sans text-[10px] font-bold tracking-wider uppercase px-3.5 py-1 bg-primary text-white rounded-full">07 — HOW IT WORKS</span>
                <h2 className="font-sans font-bold text-4xl uppercase tracking-wider mt-2 text-[#143D2A]">Three Simple Steps</h2>
              </div>
              <p className="text-foreground/60 font-sans text-sm max-w-md">
                From registration to document release — the entire process is fully digital.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="relative p-6 border border-[#E3F2E7] bg-[#FAFDFB] space-y-4 rounded-none hover:border-[#C7FFCF] transition-colors duration-200">
                <span className="font-sans text-5xl font-bold text-primary/10">01</span>
                <h3 className="font-sans text-base font-bold text-[#143D2A]">Register & Verify</h3>
                <p className="text-xs text-foreground/65 font-sans leading-relaxed">
                  Create your Resident Citizen account, select your Barangay within Ilocos Norte, and verify your identity through the portal. One-time setup, lifetime access.
                </p>
              </div>
              <div className="relative p-6 border border-[#E3F2E7] bg-[#FAFDFB] space-y-4 rounded-none hover:border-[#C7FFCF] transition-colors duration-200">
                <span className="font-sans text-5xl font-bold text-primary/10">02</span>
                <h3 className="font-sans text-base font-bold text-[#143D2A]">Submit Your Request</h3>
                <p className="text-xs text-foreground/65 font-sans leading-relaxed">
                  Choose a service — clearance, certificate, or complaint — fill in the required fields, upload any attachments, and submit instantly.
                </p>
              </div>
              <div className="relative p-6 border border-[#E3F2E7] bg-[#FAFDFB] space-y-4 rounded-none hover:border-[#C7FFCF] transition-colors duration-200">
                <span className="font-sans text-5xl font-bold text-primary/10">03</span>
                <h3 className="font-sans text-base font-bold text-[#143D2A]">Track & Receive</h3>
                <p className="text-xs text-foreground/65 font-sans leading-relaxed">
                  Monitor your application status in real-time. Once signed and approved by your Barangay Captain, download or pick up your document.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="max-w-6xl mx-auto px-6 py-20">
          <div className="flex flex-col md:flex-row gap-12 md:gap-20">
            <div className="md:w-1/3 shrink-0">
              <span className="inline-block font-sans text-[10px] font-bold tracking-wider uppercase px-3.5 py-1 bg-primary text-white rounded-full w-fit">08 — FAQ</span>
              <h2 className="font-sans font-bold text-4xl uppercase tracking-wider mt-2 text-foreground">Frequently Asked Questions</h2>
              <p className="text-foreground/55 text-sm font-sans mt-3 leading-relaxed">
                Everything you need to know about OneLGU services, document requests, and your account.
              </p>
            </div>
            <div className="flex-grow space-y-0">
              {faqs.map((faq, i) => (
                <div key={i} className="border-b border-border/60">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex justify-between items-center py-5 text-left gap-4 group"
                  >
                    <span className="font-sans text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{faq.q}</span>
                    {openFaq === i ? (
                      <Minus className="h-4 w-4 text-primary shrink-0" />
                    ) : (
                      <Plus className="h-4 w-4 text-foreground/40 shrink-0 group-hover:text-primary transition-colors" />
                    )}
                  </button>
                  {openFaq === i && (
                    <div className="pb-5 pr-8">
                      <p className="text-sm text-foreground/60 font-sans leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA Banner */}
        <section className="bg-[#FAFDFB] border-t border-b border-[#E3F2E7] py-16">
          <div className="max-w-3xl mx-auto px-6 text-center space-y-6">
            <h2 className="font-sans text-2xl md:text-3xl font-bold text-[#143D2A]">Ready to go paperless?</h2>
            <p className="text-foreground/55 text-sm font-sans max-w-lg mx-auto">
              Join thousands of residents who are already using OneLGU to request certificates, file complaints, and access barangay services online.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/register" className="px-8 py-3 bg-primary text-white rounded-full font-sans text-sm font-bold tracking-wide transition-all duration-200 hover:bg-primary/95 hover:shadow-[0_4px_12px_rgba(0,177,94,0.2)] hover:translate-y-[-1px]">
                Create Your Account <ArrowRight className="h-3.5 w-3.5 inline ml-1" />
              </Link>
              <Link href="/login" className="px-8 py-3 border border-[#E3E6E4] hover:border-gray-300 text-foreground bg-white hover:bg-gray-50 rounded-full font-sans text-sm font-bold tracking-wide transition-all duration-200 hover:translate-y-[-1px]">
                Log In to Portal
              </Link>
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
              <h4 className="font-sans text-xs font-bold uppercase tracking-wider text-[#143D2A]/85">Support</h4>
              <ul className="space-y-2 text-xs font-sans text-foreground/60">
                <li><Link href="#" className="hover:text-[#143D2A] transition-colors duration-150">How to Register</Link></li>
                <li><Link href="#" className="hover:text-[#143D2A] transition-colors duration-150">Frequently Asked Questions</Link></li>
                <li><Link href="#" className="hover:text-[#143D2A] transition-colors duration-150">Contact Barangay</Link></li>
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
