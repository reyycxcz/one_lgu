import { createClient } from "@/lib/supabase/server";
import { toCivicPost } from "@/lib/civic-bulletin";
import HomeClient from "./home-client";

export default async function Home() {
  const supabase = await createClient();

  const { data } = await supabase
    .from("announcements")
    .select("slug, category, title, excerpt, tag, body")
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(4);

  const civicPosts = (data || []).map(toCivicPost);

  return <HomeClient civicPosts={civicPosts} />;
}
