import { User, Landmark } from "lucide-react";

export default function ResidentProfilePage() {
  const profile = {
    fullName: "Juan Dela Cruz",
    email: "juan.delacruz@gmail.com",
    phone: "+63 912 345 6789",
    address: "Block 2 Lot 4, Sunrise Subdivision",
    barangay: "Barangay San Jose",
    role: "Resident",
    status: "Active Account",
  };

  return (
    <div className="space-y-8 animate-stagger-in">
      {/* Header */}
      <div>
        <span className="micro-label">05 — CREDENTIAL DESK</span>
        <h1 className="font-pixel text-4xl uppercase tracking-wider mt-1">Profile Settings</h1>
        <p className="text-sm text-foreground/60 mt-1">Manage your official contact details and residency records.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Profile Card Summary */}
        <div className="bryl-card p-6 space-y-6 self-start">
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="h-16 w-16 rounded-full bg-primary/20 border border-primary flex items-center justify-center font-bold text-xl text-foreground">
              JD
            </div>
            <div>
              <h2 className="font-sans font-semibold text-lg text-foreground">{profile.fullName}</h2>
              <span className="green-chip text-[9px] mt-1">{profile.status}</span>
            </div>
          </div>

          <div className="space-y-4 border-t border-border/60 pt-4 text-xs font-medium">
            <div className="flex items-center gap-3 text-foreground/75">
              <Landmark className="h-4.5 w-4.5 text-foreground/40 shrink-0" />
              <span>{profile.barangay}</span>
            </div>
            <div className="flex items-center gap-3 text-foreground/75">
              <User className="h-4.5 w-4.5 text-foreground/40 shrink-0" />
              <span>Role: {profile.role}</span>
            </div>
          </div>
        </div>

        {/* Edit Profile Form */}
        <div className="bryl-card p-6 lg:col-span-2 space-y-6">
          <h3 className="font-pixel text-xl uppercase tracking-wider border-b border-border/60 pb-3">Update Information</h3>
          
          <form className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-foreground/75 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  defaultValue={profile.fullName}
                  className="w-full px-4 py-2.5 border border-border rounded-lg bg-white font-sans text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  required
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-foreground/75 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  defaultValue={profile.email}
                  className="w-full px-4 py-2.5 border border-border rounded-lg bg-white font-sans text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                  required
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-foreground/75 mb-2">
                  Mobile Number
                </label>
                <input
                  type="text"
                  defaultValue={profile.phone}
                  className="w-full px-4 py-2.5 border border-border rounded-lg bg-white font-sans text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-foreground/75 mb-2">
                  Resident Barangay Address
                </label>
                <input
                  type="text"
                  defaultValue={profile.address}
                  className="w-full px-4 py-2.5 border border-border rounded-lg bg-white font-sans text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              className="green-chip text-xs py-2.5 px-6 font-bold font-mono"
            >
              SAVE PROFILE INFORMATION
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
