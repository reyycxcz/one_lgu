// Hardcoded Civic Bulletin content for the landing page.
// TODO: replace with a Supabase `announcements` table once the LGU admin
// posting flow (src/app/(lgu)/lgu/announcements) is wired up.

export type CivicPost = {
  slug: string;
  icon: "BookOpen" | "ShieldAlert" | "Sparkles" | "Award";
  badge: string;
  title: string;
  excerpt: string;
  tag: string;
  body: string[];
};

export const civicPosts: CivicPost[] = [
  {
    slug: "how-to-request-barangay-clearances-online",
    icon: "BookOpen",
    badge: "Certification Guide",
    title: "How to Request Barangay Clearances Online",
    excerpt:
      "Follow the simple step-by-step procedure in the citizen desk portal to submit documents and track captain signatures.",
    tag: "Civic Handbook",
    body: [
      "Requesting a Barangay Clearance through OneLGU takes just a few minutes. Log in to the Resident Citizen Portal using your registered account, then navigate to the Certifications section from your dashboard.",
      "Click \"New Request\" and select \"Barangay Clearance\" from the list of available document types. Fill in the required details — purpose of the clearance, valid ID information, and contact details — then upload a clear photo or scan of a valid government ID.",
      "Once submitted, your request is routed to your barangay's clerk for verification. You can track the status in real-time from your dashboard: Submitted → Verified → Approved → Ready for Pickup or Released.",
      "Most clearances are processed within 15–30 minutes during office hours. You will receive an in-app and email notification once your document is ready for digital download or physical pickup at the Barangay Hall.",
    ],
  },
  {
    slug: "katarungang-pambarangay-hearing-rules",
    icon: "ShieldAlert",
    badge: "Dispute Mediation",
    title: "Katarungang Pambarangay Hearing Rules",
    excerpt:
      "Learn about local Lupon Tagapamayapa procedures, summoning schedules, and filing community grievances or disputes.",
    tag: "Resolutions",
    body: [
      "The Katarungang Pambarangay system requires most disputes between residents of the same city or municipality to first go through barangay-level mediation before they can be filed in court.",
      "To file a complaint, submit an Incident Grievance report through the Resident Portal. Your case is assigned to a Lupon Tagapamayapa member — typically a Kagawad — who will act as the mediator.",
      "Both parties are formally summoned to a mediation hearing scheduled through the platform. If the parties reach an agreement, it is documented as a Kasunduang Pag-aayos (settlement agreement), which carries the force of a final court judgment if not repudiated within the reglementary period.",
      "If mediation fails, the Lupon issues a Certificate to File Action, which allows the complainant to escalate the matter to the appropriate court.",
    ],
  },
  {
    slug: "free-livelihood-seminars-and-skills-training",
    icon: "Sparkles",
    badge: "Livelihood Programs",
    title: "Free Livelihood Seminars & Skills Training",
    excerpt:
      "Register at your local Barangay Hall for upcoming municipal skills workshops to improve family income and enterprise.",
    tag: "Upcoming Events",
    body: [
      "The Municipality of Dingras regularly partners with TESDA, DTI, and DOLE to bring free livelihood and skills training programs directly to barangay residents.",
      "Past and upcoming sessions include food processing and preservation, basic dressmaking and tailoring, small enterprise bookkeeping, and digital literacy for micro-entrepreneurs.",
      "Slots are limited per batch and prioritized for household heads and out-of-school youth. Interested residents should coordinate with their Barangay Hall or SK office for the schedule of the next intake.",
      "Completion certificates are issued for programs run in partnership with TESDA, which can support future job applications or small business registration.",
    ],
  },
  {
    slug: "barangay-waste-management-and-clean-schedules",
    icon: "Award",
    badge: "Clean & Green",
    title: "Barangay Waste Management & Clean Schedules",
    excerpt:
      "Participate in weekly community sanitation drives, local segregation campaigns, and environmental sanitation initiatives.",
    tag: "Announcements",
    body: [
      "Under the Ecological Solid Waste Management Act (RA 9003), every barangay in Dingras observes a weekly collection and segregation schedule for biodegradable, recyclable, and residual waste.",
      "Residents are encouraged to segregate waste at the household level before scheduled collection days. Barangays also organize monthly \"Linis Bayan\" clean-up drives covering waterways, drainage canals, and public spaces.",
      "Materials recovery facilities (MRFs) at the barangay level accept recyclables and compostable waste, helping reduce what ends up in the municipal landfill.",
      "Check with your Barangay Hall for your specific collection days and the location of your nearest MRF drop-off point.",
    ],
  },
];

export function getCivicPost(slug: string) {
  return civicPosts.find((p) => p.slug === slug);
}
