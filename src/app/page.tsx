"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { ArrowRight, FileText, Landmark, Users, Smartphone, MapPin, Lock, Scale, Bell, Zap, CheckCircle2, Clock, Check, BookOpen, ShieldAlert, Sparkles, Award, Plus, Minus, Upload, ClipboardCheck, FileSignature, Menu, X } from "lucide-react";
import { civicPosts } from "@/lib/civic-bulletin";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

const staggerContainer: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.05 } },
};

const viewportOnce = { once: true, margin: "-80px 0px" };

const NAV_LINKS = [
  { href: "#features", label: "Modules" },
  { href: "#civic", label: "Civic" },
  { href: "#portals", label: "Portals" },
  { href: "#security", label: "Benefits" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#faq", label: "FAQ" },
];

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const CIVIC_ICONS = { BookOpen, ShieldAlert, Sparkles, Award };
  const civicCards = civicPosts.map((post) => ({
    ...post,
    icon: CIVIC_ICONS[post.icon],
    desc: post.excerpt,
  }));

  const faqs = [
    { q: "How do I request a Barangay Clearance?", a: "Log in to the Resident Citizen Portal, navigate to Certifications, and click 'New Request.' Select your document type, fill in the required details, and submit. You can track the status in real-time from your dashboard." },
    { q: "How long does it take for my certificate to be approved?", a: "Most documents are verified and signed within 15–30 minutes during office hours. You will receive a notification once your certificate is ready for download or pickup." },
    { q: "Is my personal information secure on OneLGU?", a: "Yes. All data is encrypted in transit and at rest using industry-standard protocols. Role-based access control ensures only authorized barangay officials can view your records." },
    { q: "Can I file a complaint anonymously?", a: "Currently, complaints require identity verification to ensure accountability. However, your details are only visible to the assigned Lupon mediator and barangay officials handling your case." },
    { q: "What documents can I request through the platform?", a: "You can request Barangay Clearances, Certificates of Residency, Certificates of Indigency, First-Time Job Seeker Certificates, and other official barangay documents." },
    { q: "Do I need to visit the Barangay Hall to pick up my certificate?", a: "It depends on the document type. Some certificates are available for digital download with official e-signatures, while others may require physical pickup with a valid ID." },
  ];

  return (
    <div className="relative min-h-screen bg-white flex flex-col justify-between">
      
      {/* Header */}
      <header className="sticky top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-[#E3F2E7] transition-all duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/images/logo/one_lgu.png"
              width={56}
              height={56}
              className="h-11 sm:h-12 w-auto object-contain"
              alt="OneLGU Logo"
            />
          </div>

          <nav className="hidden md:flex items-center gap-12 ml-16">
            {NAV_LINKS.map((link) => (
              <a key={link.href} href={link.href} className="text-xs font-sans font-medium text-foreground/60 hover:text-[#143D2A] transition-colors duration-200">{link.label}</a>
            ))}
          </nav>

          <Link href="/login" className="hidden md:inline-flex group ml-16 px-5 py-1.5 bg-primary text-white rounded-full font-sans text-xs font-bold transition-all duration-200 hover:bg-primary/95 hover:shadow-[0_4px_12px_rgba(0,177,94,0.2)]">
            Log In <ArrowRight className="h-3.5 w-3.5 inline ml-1 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>

          <button
            type="button"
            onClick={() => setMobileNavOpen((v) => !v)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileNavOpen}
            className="md:hidden flex items-center justify-center h-11 w-11 rounded-full text-foreground/70 hover:bg-secondary transition-colors"
          >
            {mobileNavOpen ? <X className="h-6 w-6" strokeWidth={1.5} /> : <Menu className="h-6 w-6" strokeWidth={1.5} />}
          </button>
        </div>

        <AnimatePresence>
          {mobileNavOpen && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="hidden"
              variants={{
                hidden: { opacity: 0, y: -12, transition: { duration: 0.15 } },
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { duration: 0.25, ease: [0.22, 1, 0.36, 1], staggerChildren: 0.06, delayChildren: 0.05 },
                },
              }}
              className="md:hidden absolute top-full left-0 right-0 bg-white border-t border-[#E3F2E7] shadow-[0_8px_24px_rgba(20,61,42,0.08)] px-4 py-4 flex flex-col gap-1"
            >
              {NAV_LINKS.map((link) => (
                <motion.a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileNavOpen(false)}
                  variants={fadeUp}
                  className="text-sm font-sans font-medium text-foreground/70 hover:text-[#143D2A] py-2.5 px-2 rounded-lg hover:bg-secondary/60 transition-colors"
                >
                  {link.label}
                </motion.a>
              ))}
              <motion.div variants={fadeUp}>
                <Link
                  href="/login"
                  onClick={() => setMobileNavOpen(false)}
                  className="mt-2 flex items-center justify-center gap-1.5 px-5 py-2.5 bg-primary text-white rounded-full font-sans text-xs font-bold"
                >
                  Log In <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Hero Section */}
      <main className="flex-grow">
        <section className="relative overflow-hidden">
          {/* Decorative backdrop */}
          <div className="absolute inset-0 -z-10">
            <div
              className="absolute inset-0 opacity-[0.35]"
              style={{
                backgroundImage:
                  "linear-gradient(to right, #E3F2E7 1px, transparent 1px), linear-gradient(to bottom, #E3F2E7 1px, transparent 1px)",
                backgroundSize: "56px 56px",
                maskImage: "radial-gradient(ellipse 70% 60% at 50% 0%, black 40%, transparent 100%)",
                WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 0%, black 40%, transparent 100%)",
              }}
            />
            <div className="absolute -top-40 left-1/2 -translate-x-1/2 h-[480px] w-[780px] rounded-full bg-primary/10 blur-[110px]" />
          </div>

          <motion.div
            className="max-w-6xl mx-auto px-6 pt-20 pb-16 md:pt-28 md:pb-20 flex flex-col items-center text-center"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeUp} className="micro-label mb-6 bg-primary text-white">
              01 — Dingras, Ilocos Norte Digital Portal
            </motion.div>

            <motion.h1 variants={fadeUp} className="font-sans font-medium text-4xl sm:text-6xl md:text-8xl leading-[1.05] md:leading-none max-w-4xl text-foreground mb-8 px-2">
              Digitalizing Local Government
            </motion.h1>

            <motion.p variants={fadeUp} className="text-foreground/80 font-sans text-base md:text-lg max-w-2xl leading-relaxed mb-12 px-2">
              A secure G2C and G2G digital governance network linking municipal offices, barangay halls, and citizens across the Municipality of Dingras, Ilocos Norte through paperless workflows.
            </motion.p>

            <motion.div variants={fadeUp} className="flex flex-wrap gap-4 justify-center mb-16">
              <Link href="/login" className="px-6 py-3 bg-primary text-white hover:bg-primary/95 rounded-full font-sans text-sm font-bold transition-all duration-200 shadow-[0_4px_12px_rgba(0,177,94,0.2)] hover:translate-y-[-1px]">
                Get Started
              </Link>
              <Link href="/register" className="px-6 py-3 border border-[#E3E6E4] hover:border-gray-300 text-foreground bg-white hover:bg-gray-50 rounded-full font-sans text-sm font-bold transition-all duration-200 hover:translate-y-[-1px]">
                Create Account
              </Link>
            </motion.div>

            {/* Stat strip */}
            <motion.div variants={fadeUp} className="w-full max-w-3xl grid grid-cols-3 divide-x divide-[#E3F2E7] border-t border-[#E3F2E7] pt-8">
              <div className="px-2 md:px-4">
                <div className="font-sans font-medium text-xl sm:text-3xl md:text-4xl text-[#143D2A]">31</div>
                <div className="micro-label mt-1 px-0 text-foreground/50 text-[8px] sm:text-[10px]">Barangays Connected</div>
              </div>
              <div className="px-2 md:px-4">
                <div className="font-sans font-medium text-xl sm:text-3xl md:text-4xl text-[#143D2A]">15–30<span className="text-xs sm:text-lg align-top">min</span></div>
                <div className="micro-label mt-1 px-0 text-foreground/50 text-[8px] sm:text-[10px]">Avg. Certificate Turnaround</div>
              </div>
              <div className="px-2 md:px-4">
                <div className="font-sans font-medium text-xl sm:text-3xl md:text-4xl text-[#143D2A]">24/7</div>
                <div className="micro-label mt-1 px-0 text-foreground/50 text-[8px] sm:text-[10px]">Online Availability</div>
              </div>
            </motion.div>
          </motion.div>
        </section>

        <motion.section
          id="features"
          className="max-w-6xl mx-auto px-6 py-16 border-t border-border/60"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerContainer}
        >
          <motion.div variants={fadeUp} className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
            <div>
              <span className="inline-block font-sans text-[10px] font-bold px-3.5 py-1 bg-primary text-white rounded-full">02 — System Modules</span>
              <h2 className="font-sans font-medium text-3xl sm:text-4xl md:text-5xl mt-2 text-foreground">Core Functionalities</h2>
            </div>
            <p className="text-foreground/60 font-sans text-sm max-w-md">
              Streamlining local administrative procedures with automated state tracking, document generators, and verification logs.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Module 1 */}
            <motion.div variants={fadeUp} className="bryl-card relative p-6 space-y-4 overflow-hidden">
              <span className="absolute -top-3 -right-1 font-sans text-6xl sm:text-8xl font-medium text-primary/[0.06] select-none leading-none">01</span>
              <div className="relative flex items-center gap-3">
                <div className="h-11 w-11 shrink-0 rounded-xl bg-secondary flex items-center justify-center text-primary">
                  <Upload className="h-5 w-5" />
                </div>
                <span className="micro-label px-0 text-foreground/50">Management & Storage</span>
              </div>
              <h3 className="relative font-sans font-medium text-2xl">Reports Submission & Auditing</h3>
              <p className="relative text-sm text-foreground/75 leading-relaxed font-sans">
                Allows barangay officials to upload monthly accomplishment reports and financial expense statements directly to Supabase Storage. LGU admins can review, leave feedback notes, and approve or reject submissions to build compliance scores.
              </p>
              <div className="relative border-t border-border/40 pt-3 font-sans text-[10px] text-foreground/50">
                FEATURES: Multi-format Upload • Review History Ledger • Automated PDF Archival
              </div>
            </motion.div>

            {/* Module 2 */}
            <motion.div variants={fadeUp} className="bryl-card relative p-6 space-y-4 overflow-hidden">
              <span className="absolute -top-3 -right-1 font-sans text-6xl sm:text-8xl font-medium text-primary/[0.06] select-none leading-none">02</span>
              <div className="relative flex items-center gap-3">
                <div className="h-11 w-11 shrink-0 rounded-xl bg-secondary flex items-center justify-center text-primary">
                  <ClipboardCheck className="h-5 w-5" />
                </div>
                <span className="micro-label px-0 text-foreground/50">Compliance Hub</span>
              </div>
              <h3 className="relative font-sans font-medium text-2xl">LGU Required Documents Checklist</h3>
              <p className="relative text-sm text-foreground/75 leading-relaxed font-sans">
                Consolidated planning trackers enforcing developmental submissions (such as Annual Investment Programs and Development Plans). LGU dashboards flag delinquent barangays to maintain accountability.
              </p>
              <div className="relative border-t border-border/40 pt-3 font-sans text-[10px] text-foreground/50">
                FEATURES: Compliance Calendar • Automated Reminders • Barangay Performance Scorecards
              </div>
            </motion.div>

            {/* Module 3 */}
            <motion.div variants={fadeUp} className="bryl-card relative p-6 space-y-4 overflow-hidden">
              <span className="absolute -top-3 -right-1 font-sans text-6xl sm:text-8xl font-medium text-primary/[0.06] select-none leading-none">03</span>
              <div className="relative flex items-center gap-3">
                <div className="h-11 w-11 shrink-0 rounded-xl bg-secondary flex items-center justify-center text-primary">
                  <FileSignature className="h-5 w-5" />
                </div>
                <span className="micro-label px-0 text-foreground/50">G2C Service Platform</span>
              </div>
              <h3 className="relative font-sans font-medium text-2xl">Barangay Certification Requests</h3>
              <p className="relative text-sm text-foreground/75 leading-relaxed font-sans">
                Residents request clearances, residency certificates, indigency proofs, and first-time job seeker waivers online. Barangay staff verify inputs, generate official files with pre-loaded signatures, and track status until released.
              </p>
              <div className="relative border-t border-border/40 pt-3 font-sans text-[10px] text-foreground/50">
                FEATURES: Fee waiver validation (RA 11261) • PDF Generation • Multi-Stage Progress Stepper
              </div>
            </motion.div>

            {/* Module 4 */}
            <motion.div variants={fadeUp} className="bryl-card relative p-6 space-y-4 overflow-hidden">
              <span className="absolute -top-3 -right-1 font-sans text-6xl sm:text-8xl font-medium text-primary/[0.06] select-none leading-none">04</span>
              <div className="relative flex items-center gap-3">
                <div className="h-11 w-11 shrink-0 rounded-xl bg-secondary flex items-center justify-center text-primary">
                  <Scale className="h-5 w-5" />
                </div>
                <span className="micro-label px-0 text-foreground/50">Mediation & Arbitration</span>
              </div>
              <h3 className="relative font-sans font-medium text-2xl">Incident Grievance & Complaints</h3>
              <p className="relative text-sm text-foreground/75 leading-relaxed font-sans">
                A digital channel for residents to file complaints and upload supporting media. Officials assign investigator mediators (Kagawads), schedule face-to-face summons hearings, and log community arbitration resolutions.
              </p>
              <div className="relative border-t border-border/40 pt-3 font-sans text-[10px] text-foreground/50">
                FEATURES: Image/Video Evidence attachments • Hearing Scheduler • Mediation Case Log history
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Civic Bulletin & Guides Section */}
        <motion.section
          id="civic"
          className="bg-[#FAFDFB] border-t border-b border-[#E3F2E7] py-20"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerContainer}
        >
          <div className="max-w-6xl mx-auto px-6">
            <motion.div variants={fadeUp} className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
              <div>
                <span className="inline-block font-sans text-[10px] font-bold px-3.5 py-1 bg-primary text-white rounded-full">03 — Civic Bulletin & Guides</span>
                <h2 className="font-sans font-medium text-3xl sm:text-4xl md:text-5xl mt-2 text-[#143D2A]">Civic Bulletin & Updates</h2>
              </div>
              <p className="text-foreground/60 font-sans text-sm max-w-md">
                Stay updated with the latest announcements, local programs, and official guidelines from your local government unit.
              </p>
            </motion.div>

            {/* Content Cards Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {civicCards.map((card) => {
                const Icon = card.icon;
                return (
                  <motion.a
                    key={card.slug}
                    href={`/civic/${card.slug}`}
                    variants={fadeUp}
                    className="group relative flex flex-col justify-between overflow-hidden rounded-2xl bg-white border border-[#E3F2E7] p-6 transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-[#C7FFCF] hover:shadow-[0_8px_24px_rgba(20,61,42,0.06)]"
                  >
                    {/* soft gradient accent that fades in on hover */}
                    <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-primary/5 blur-2xl opacity-0 transition-opacity duration-500 ease-out group-hover:opacity-100" />

                    <div className="relative space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary transition-transform duration-300 ease-out group-hover:scale-105">
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="text-[9px] font-bold px-2.5 py-1 rounded-full bg-[#E7FFEA] border border-[#C7FFCF] text-primary">
                          {card.badge}
                        </span>
                      </div>
                      <h3 className="font-sans text-[15px] font-bold text-[#143D2A] leading-snug transition-colors group-hover:text-primary">
                        {card.title}
                      </h3>
                      <p className="text-xs text-foreground/65 leading-relaxed font-sans">
                        {card.desc}
                      </p>
                    </div>

                    <div className="relative pt-4 border-t border-[#E3F2E7] mt-6 flex justify-between items-center text-[10px] font-sans">
                      <span className="text-foreground/45 font-medium">{card.tag}</span>
                      <span className="inline-flex items-center gap-1 text-primary font-bold">
                        Read More
                        <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-1" />
                      </span>
                    </div>
                  </motion.a>
                );
              })}
            </div>
          </div>
        </motion.section>

        {/* Portals Section */}
        <motion.section
          id="portals"
          className="max-w-6xl mx-auto px-6 py-16 border-t border-border/60"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerContainer}
        >
          <motion.div variants={fadeUp} className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
            <div>
              <span className="inline-block font-sans text-[10px] font-bold px-3.5 py-1 bg-primary text-white rounded-full">04 — Platform Roles</span>
              <h2 className="font-sans font-medium text-3xl sm:text-4xl md:text-5xl mt-2 text-foreground">Three Role-Based Portals</h2>
            </div>
            <p className="text-foreground/60 font-sans text-sm max-w-md">
              Secure routes and layouts ensuring users only see tools and data scoped to their specific administrative clearance level.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* LGU Admin Portal */}
            <motion.div variants={fadeUp} className="bryl-card p-6 flex flex-col justify-between h-80 group">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div className="h-12 w-12 rounded-xl bg-[#143D2A] flex items-center justify-center text-white transition-transform duration-300 group-hover:scale-105">
                    <Landmark className="h-5.5 w-5.5" />
                  </div>
                  <span className="font-sans text-[10px] text-foreground/40 font-semibold">LVL 03 — Super Admin</span>
                </div>
                <h3 className="font-sans font-medium text-2xl mb-2">LGU Console Portal</h3>
                <p className="text-sm text-foreground/75 font-sans leading-relaxed">
                  Consolidated municipal oversight. Admins audit compliance targets for all 31 barangays, evaluate uploaded financial statements, monitor immutable audit logs (L7), and configure system-wide RBAC.
                </p>
              </div>
              <Link href="/login" className="inline-flex items-center gap-1.5 font-sans text-xs text-foreground group-hover:text-primary transition-colors">
                Enter LGU Portal Console <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </motion.div>

            {/* Barangay Portal */}
            <motion.div variants={fadeUp} className="bryl-card p-6 flex flex-col justify-between h-80 group relative border-2 border-primary/15">
              <span className="absolute -top-3 left-6 px-2.5 py-0.5 rounded-full bg-primary text-white text-[9px] font-sans font-bold">Most Used</span>
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-white transition-transform duration-300 group-hover:scale-105">
                    <Users className="h-5.5 w-5.5" />
                  </div>
                  <span className="font-sans text-[10px] text-foreground/40 font-semibold">LVL 02 — Local Official</span>
                </div>
                <h3 className="font-sans font-medium text-2xl mb-2">Barangay Hall Portal</h3>
                <p className="text-sm text-foreground/75 font-sans leading-relaxed">
                  Operations dashboard for Captains, SK, and Clerks. Process resident certification queues, dispatch planning documents, schedule Lupon mediation calendars, and manage local staff accounts.
                </p>
              </div>
              <Link href="/login" className="inline-flex items-center gap-1.5 font-sans text-xs text-foreground group-hover:text-primary transition-colors">
                Enter Barangay Portal <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </motion.div>

            {/* Resident Portal */}
            <motion.div variants={fadeUp} className="bryl-card p-6 flex flex-col justify-between h-80 group">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div className="h-12 w-12 rounded-xl bg-secondary flex items-center justify-center text-primary transition-transform duration-300 group-hover:scale-105">
                    <FileText className="h-5.5 w-5.5" />
                  </div>
                  <span className="font-sans text-[10px] text-foreground/40 font-semibold">LVL 01 — Citizen Portal</span>
                </div>
                <h3 className="font-sans font-medium text-2xl mb-2">Resident Citizen Desk</h3>
                <p className="text-sm text-foreground/75 font-sans leading-relaxed">
                  Direct resident desk. File document certification requests, monitor application status in real-time via steppers, file community grievances, and receive instant in-app alerts.
                </p>
              </div>
              <Link href="/login" className="inline-flex items-center gap-1.5 font-sans text-xs text-foreground group-hover:text-primary transition-colors">
                Enter Resident Desk <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </motion.div>
          </div>
        </motion.section>

        {/* Why OneLGU Benefits Section */}
        <motion.section
          id="security"
          className="bg-[#F8FDF9] border-t border-b border-[#E3F2E7] py-20"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerContainer}
        >
          <div className="max-w-6xl mx-auto px-6 flex flex-col lg:flex-row gap-12">
            {/* Left Column: Header & Stats */}
            <motion.div variants={fadeUp} className="lg:w-1/3 shrink-0 flex flex-col justify-between">
              <div className="space-y-6">
                <div>
                  <span className="inline-block font-sans text-[10px] font-bold px-3.5 py-1 bg-primary text-white rounded-full w-fit">05 — Why OneLGU?</span>
                  <h2 className="font-sans font-medium text-3xl sm:text-4xl md:text-5xl mt-2 mb-4 text-[#143D2A]">Faster Services, Simpler Access</h2>
                  <p className="text-foreground/60 text-sm font-sans leading-relaxed">
                    Skip the queues at your local Barangay Hall. Request clearances and certificates online securely across Dingras, Ilocos Norte.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Right Column: Benefits Cards Grid */}
            <div className="flex-grow grid sm:grid-cols-2 gap-6">
              <motion.div variants={fadeUp} className="bryl-card p-6 space-y-3">
                <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-primary">
                  <Smartphone className="h-5 w-5" />
                </div>
                <h4 className="font-sans text-sm font-bold text-[#143D2A]">Online Requests 24/7</h4>
                <p className="text-xs text-foreground/65 leading-relaxed font-sans">
                  Submit requests for Barangay Clearances, Certificates of Indigency, and other files anytime, anywhere.
                </p>
              </motion.div>

              <motion.div variants={fadeUp} className="bryl-card p-6 space-y-3">
                <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-primary">
                  <MapPin className="h-5 w-5" />
                </div>
                <h4 className="font-sans text-sm font-bold text-[#143D2A]">Real-Time Status Tracking</h4>
                <p className="text-xs text-foreground/65 leading-relaxed font-sans">
                  Monitor the progress of your application instantly—from submission, official sign-off, to release.
                </p>
              </motion.div>

              <motion.div variants={fadeUp} className="bryl-card p-6 space-y-3">
                <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-primary">
                  <Lock className="h-5 w-5" />
                </div>
                <h4 className="font-sans text-sm font-bold text-[#143D2A]">Secured & Private</h4>
                <p className="text-xs text-foreground/65 leading-relaxed font-sans">
                  Your personal information and uploaded files are protected. Access is strictly restricted to authorized officials.
                </p>
              </motion.div>

              <motion.div variants={fadeUp} className="bryl-card p-6 space-y-3">
                <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-primary">
                  <Scale className="h-5 w-5" />
                </div>
                <h4 className="font-sans text-sm font-bold text-[#143D2A]">Paperless Complaints</h4>
                <p className="text-xs text-foreground/65 leading-relaxed font-sans">
                  File incident reports and upload photos or video evidence online. Automated calendars schedule mediation meetings easily.
                </p>
              </motion.div>

              <motion.div variants={fadeUp} className="bryl-card p-6 space-y-3">
                <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-primary">
                  <Bell className="h-5 w-5" />
                </div>
                <h4 className="font-sans text-sm font-bold text-[#143D2A]">Instant Notifications</h4>
                <p className="text-xs text-foreground/65 leading-relaxed font-sans">
                  Receive email notifications when your document is approved, hearing schedules are posted, or actions are needed.
                </p>
              </motion.div>

              <motion.div variants={fadeUp} className="bryl-card p-6 space-y-3">
                <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-primary">
                  <Zap className="h-5 w-5" />
                </div>
                <h4 className="font-sans text-sm font-bold text-[#143D2A]">Faster Processing</h4>
                <p className="text-xs text-foreground/65 leading-relaxed font-sans">
                  Digital queues help clerks verify applications faster, reducing clearance waiting times to minutes.
                </p>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* How It Works Section */}
        <motion.section
          id="how-it-works"
          className="bg-white border-t border-b border-[#E3F2E7] py-20"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerContainer}
        >
          <div className="max-w-6xl mx-auto px-6">
            <motion.div variants={fadeUp} className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
              <div>
                <span className="inline-block font-sans text-[10px] font-bold px-3.5 py-1 bg-primary text-white rounded-full">07 — How It Works</span>
                <h2 className="font-sans font-medium text-3xl sm:text-4xl md:text-5xl mt-2 text-[#143D2A]">Three Simple Steps</h2>
              </div>
              <p className="text-foreground/60 font-sans text-sm max-w-md">
                From registration to document release — the entire process is fully digital.
              </p>
            </motion.div>

            <div className="relative grid md:grid-cols-3 gap-8">
              {/* Connector line (desktop only) */}
              <div className="hidden md:block absolute top-[52px] left-[16.5%] right-[16.5%] h-px bg-[repeating-linear-gradient(90deg,#C7FFCF_0,#C7FFCF_6px,transparent_6px,transparent_12px)]" />

              <motion.div variants={fadeUp} className="relative p-6 border border-[#E3F2E7] bg-[#FAFDFB] space-y-4 rounded-none hover:border-[#C7FFCF] hover:bg-white transition-colors duration-200">
                <div className="flex items-center gap-4">
                  <span className="font-sans text-5xl font-medium text-primary/10">01</span>
                  <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center">
                    <Users className="h-4.5 w-4.5" />
                  </div>
                </div>
                <h3 className="font-sans text-base font-bold text-[#143D2A]">Register & Verify</h3>
                <p className="text-xs text-foreground/65 font-sans leading-relaxed">
                  Create your Resident Citizen account, select your Barangay within Dingras, Ilocos Norte, and verify your identity through the portal. One-time setup, lifetime access.
                </p>
              </motion.div>
              <motion.div variants={fadeUp} className="relative p-6 border border-[#E3F2E7] bg-[#FAFDFB] space-y-4 rounded-none hover:border-[#C7FFCF] hover:bg-white transition-colors duration-200">
                <div className="flex items-center gap-4">
                  <span className="font-sans text-5xl font-medium text-primary/10">02</span>
                  <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center">
                    <FileSignature className="h-4.5 w-4.5" />
                  </div>
                </div>
                <h3 className="font-sans text-base font-bold text-[#143D2A]">Submit Your Request</h3>
                <p className="text-xs text-foreground/65 font-sans leading-relaxed">
                  Choose a service — clearance, certificate, or complaint — fill in the required fields, upload any attachments, and submit instantly.
                </p>
              </motion.div>
              <motion.div variants={fadeUp} className="relative p-6 border border-[#E3F2E7] bg-[#FAFDFB] space-y-4 rounded-none hover:border-[#C7FFCF] hover:bg-white transition-colors duration-200">
                <div className="flex items-center gap-4">
                  <span className="font-sans text-5xl font-medium text-primary/10">03</span>
                  <div className="h-10 w-10 rounded-full bg-primary text-white flex items-center justify-center">
                    <CheckCircle2 className="h-4.5 w-4.5" />
                  </div>
                </div>
                <h3 className="font-sans text-base font-bold text-[#143D2A]">Track & Receive</h3>
                <p className="text-xs text-foreground/65 font-sans leading-relaxed">
                  Monitor your application status in real-time. Once signed and approved by your Barangay Captain, download or pick up your document.
                </p>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* FAQ Section */}
        <motion.section
          id="faq"
          className="max-w-6xl mx-auto px-6 py-20"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={staggerContainer}
        >
          <div className="flex flex-col md:flex-row gap-12 md:gap-20">
            <motion.div variants={fadeUp} className="md:w-1/3 shrink-0">
              <span className="inline-block font-sans text-[10px] font-bold px-3.5 py-1 bg-primary text-white rounded-full w-fit">08 — FAQ</span>
              <h2 className="font-sans font-medium text-3xl sm:text-4xl md:text-5xl mt-2 text-foreground">Frequently Asked Questions</h2>
              <p className="text-foreground/55 text-sm font-sans mt-3 leading-relaxed">
                Everything you need to know about OneLGU services, document requests, and your account.
              </p>
            </motion.div>
            <motion.div variants={fadeUp} className="flex-grow space-y-0">
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
            </motion.div>
          </div>
        </motion.section>

        {/* Final CTA Banner */}
        <motion.section
          className="bg-[#FAFDFB] border-t border-b border-[#E3F2E7] py-16"
          initial="hidden"
          whileInView="visible"
          viewport={viewportOnce}
          variants={fadeUp}
        >
          <div className="max-w-3xl mx-auto px-6 text-center space-y-6">
            <h2 className="font-sans font-medium text-4xl md:text-5xl text-[#143D2A]">Ready to go paperless?</h2>
            <p className="text-foreground/55 text-sm font-sans max-w-lg mx-auto">
              Join thousands of residents who are already using OneLGU to request certificates, file complaints, and access barangay services online.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/register" className="px-8 py-3 bg-primary text-white rounded-full font-sans text-sm font-bold transition-all duration-200 hover:bg-primary/95 hover:shadow-[0_4px_12px_rgba(0,177,94,0.2)] hover:translate-y-[-1px]">
                Get Started <ArrowRight className="h-3.5 w-3.5 inline ml-1" />
              </Link>
              <Link href="/login" className="px-8 py-3 border border-[#E3E6E4] hover:border-gray-300 text-foreground bg-white hover:bg-gray-50 rounded-full font-sans text-sm font-bold transition-all duration-200 hover:translate-y-[-1px]">
                Log In
              </Link>
            </div>
          </div>
        </motion.section>
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
                <span className="font-sans font-bold text-base tracking-tight"><span className="text-primary">ONE</span><span className="text-white" style={{textShadow: "0 0 1px #000, 0 0 1px #000, 0 0 1px #000, 0 0 1px #000"}}>LGU</span></span>
              </div>
              <p className="text-xs text-foreground/65 max-w-sm leading-relaxed font-sans">
                Unified digital governance platform for local government units, barangays, and residents. Connecting communities with secure, paperless, and real-time administrative workflows.
              </p>
            </div>

            {/* Column 2: Portals */}
            <div className="space-y-4">
              <h4 className="font-sans text-xs font-bold text-[#143D2A]/85">Portals</h4>
              <ul className="space-y-2 text-xs font-sans text-foreground/60">
                <li><Link href="/login" className="hover:text-[#143D2A] transition-colors duration-150">LGU Admin Desk</Link></li>
                <li><Link href="/login" className="hover:text-[#143D2A] transition-colors duration-150">Barangay Captain Portal</Link></li>
                <li><Link href="/login" className="hover:text-[#143D2A] transition-colors duration-150">SK Youth Console</Link></li>
                <li><Link href="/login" className="hover:text-[#143D2A] transition-colors duration-150">Resident Citizen Portal</Link></li>
              </ul>
            </div>

            {/* Column 3: Services */}
            <div className="space-y-4">
              <h4 className="font-sans text-xs font-bold text-[#143D2A]/85">Services</h4>
              <ul className="space-y-2 text-xs font-sans text-foreground/60">
                <li><Link href="/login" className="hover:text-[#143D2A] transition-colors duration-150">Clearance Certificates</Link></li>
                <li><Link href="/login" className="hover:text-[#143D2A] transition-colors duration-150">Certificate of Residency</Link></li>
                <li><Link href="/login" className="hover:text-[#143D2A] transition-colors duration-150">Certificate of Indigency</Link></li>
                <li><Link href="/login" className="hover:text-[#143D2A] transition-colors duration-150">Incident Grievance Reports</Link></li>
              </ul>
            </div>

            {/* Column 4: Support */}
            <div className="space-y-4">
              <h4 className="font-sans text-xs font-bold text-[#143D2A]/85">Support</h4>
              <ul className="space-y-2 text-xs font-sans text-foreground/60">
                <li><Link href="#" className="hover:text-[#143D2A] transition-colors duration-150">How to Register</Link></li>
                <li><Link href="#" className="hover:text-[#143D2A] transition-colors duration-150">Frequently Asked Questions</Link></li>
                <li><Link href="#" className="hover:text-[#143D2A] transition-colors duration-150">Contact Barangay</Link></li>
                <li><Link href="#" className="hover:text-[#143D2A] transition-colors duration-150">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[#E3F2E7] pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-[10px] font-sans text-foreground/45">
            <div>© 2026 OneLGU Project. Ilocos Norte.</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
