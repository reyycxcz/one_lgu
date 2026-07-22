import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, ShieldAlert, Sparkles, Award } from "lucide-react";
import { civicPosts, getCivicPost } from "@/lib/civic-bulletin";
import type { Metadata } from "next";

const ICONS = { BookOpen, ShieldAlert, Sparkles, Award };

export function generateStaticParams() {
  return civicPosts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getCivicPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function CivicPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getCivicPost(slug);
  if (!post) notFound();

  const Icon = ICONS[post.icon];

  return (
    <div className="relative min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-2 sm:top-4 mx-auto w-full max-w-7xl px-3 sm:px-0 z-50">
        <div className="bg-white/90 backdrop-blur-md border border-[#E3F2E7] rounded-2xl shadow-[0_2px_12px_rgba(20,61,42,0.04)] px-4 sm:px-8 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/images/logo/one_lgu.png"
              width={48}
              height={48}
              className="h-9 sm:h-10 w-auto object-contain"
              alt="OneLGU Logo"
            />
          </Link>
          <Link
            href="/#civic"
            className="inline-flex items-center gap-1.5 font-sans text-xs font-bold text-foreground/60 hover:text-[#143D2A] transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Civic Bulletin
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 pt-16 pb-24">
        <span className="text-[9px] font-bold px-2.5 py-1 rounded-full bg-[#E7FFEA] border border-[#C7FFCF] text-primary">
          {post.badge}
        </span>

        <div className="flex items-center gap-3 mt-6 mb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-secondary text-primary shrink-0">
            <Icon className="h-5 w-5" />
          </div>
          <span className="text-xs font-sans font-semibold text-foreground/50">{post.tag}</span>
        </div>

        <h1 className="font-sans font-medium text-3xl sm:text-4xl md:text-5xl leading-tight text-[#143D2A] mb-8">
          {post.title}
        </h1>

        <div className="space-y-5">
          {post.body.map((paragraph, i) => (
            <p key={i} className="text-foreground/75 font-sans text-base leading-relaxed">
              {paragraph}
            </p>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-[#E3F2E7] flex flex-wrap gap-4">
          <Link
            href="/#civic"
            className="px-6 py-3 border border-[#E3E6E4] hover:border-gray-300 text-foreground bg-white hover:bg-gray-50 rounded-full font-sans text-sm font-bold transition-all duration-200"
          >
            <ArrowLeft className="h-3.5 w-3.5 inline mr-1.5" /> Back to Civic Bulletin
          </Link>
          <Link
            href="/register"
            className="px-6 py-3 bg-primary text-white hover:bg-primary/95 rounded-full font-sans text-sm font-bold transition-all duration-200 shadow-[0_4px_12px_rgba(0,177,94,0.2)]"
          >
            Create an Account
          </Link>
        </div>
      </main>
    </div>
  );
}
