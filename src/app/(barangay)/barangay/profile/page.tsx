import { createClient } from "@/lib/supabase/server";
import { requireSession } from "@/lib/auth/session";
import { Card, CardContent } from "@/components/ui/card";

export default async function BarangayProfilePage() {
  const session = await requireSession();
  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, phone, address, barangays(name, municipality)")
    .eq("id", session.user.id)
    .single();

  const barangayData = profile?.barangays as unknown as { name: string; municipality: string } | null;
  const barangayName = barangayData?.name || "N/A";
  const municipality = barangayData?.municipality || "N/A";

  return (
    <div className="space-y-8 animate-stagger-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground font-sans tracking-tight">My Profile</h1>
        <p className="text-xs text-muted-foreground mt-1 font-medium">View and manage your account details.</p>
      </div>

      <Card className="max-w-2xl">
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4 pb-4 border-b border-border">
            <img
              src={`https://api.dicebear.com/10.x/open-peeps/svg?seed=${profile?.full_name || "User"}`}
              alt="Avatar"
              className="w-16 h-16 rounded-full border border-border"
            />
            <div>
              <h2 className="text-lg font-bold text-foreground">{profile?.full_name || "N/A"}</h2>
              <p className="text-xs text-muted-foreground">{profile?.email || "N/A"}</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Full Name</p>
              <p className="text-sm font-semibold text-foreground">{profile?.full_name || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Email</p>
              <p className="text-sm font-semibold text-foreground">{profile?.email || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Phone</p>
              <p className="text-sm font-semibold text-foreground">{profile?.phone || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Address</p>
              <p className="text-sm font-semibold text-foreground">{profile?.address || "N/A"}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Barangay</p>
              <p className="text-sm font-semibold text-foreground">{barangayName}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Municipality</p>
              <p className="text-sm font-semibold text-foreground">{municipality}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
