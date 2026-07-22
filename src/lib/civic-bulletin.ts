// Maps announcements (from the `announcements` table) into the shape the
// landing page's Civic Bulletin section and /civic/[slug] detail page render.

export type CivicIcon = "BookOpen" | "ShieldAlert" | "Sparkles" | "Award" | "Megaphone";

export const CATEGORY_META: Record<string, { icon: CivicIcon; badge: string }> = {
  certification_guide: { icon: "BookOpen", badge: "Certification Guide" },
  dispute_mediation: { icon: "ShieldAlert", badge: "Dispute Mediation" },
  livelihood_programs: { icon: "Sparkles", badge: "Livelihood Programs" },
  clean_and_green: { icon: "Award", badge: "Clean & Green" },
  general: { icon: "Megaphone", badge: "Announcement" },
};

export type CivicPost = {
  slug: string;
  icon: CivicIcon;
  badge: string;
  title: string;
  excerpt: string;
  tag: string;
  body: string[];
};

export function toCivicPost(row: {
  slug: string;
  category: string;
  title: string;
  excerpt: string;
  tag: string;
  body: string;
}): CivicPost {
  const meta = CATEGORY_META[row.category] ?? CATEGORY_META.general;
  return {
    slug: row.slug,
    icon: meta.icon,
    badge: meta.badge,
    title: row.title,
    excerpt: row.excerpt,
    tag: row.tag,
    body: row.body
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter(Boolean),
  };
}
