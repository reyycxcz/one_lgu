import Link from "next/link";

export default function LoginPage() {
  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="font-pixel text-2xl uppercase tracking-wider text-foreground">Sign In</h2>
        <p className="text-xs text-foreground/60 font-sans mt-1">Enter your credentials to access your portal</p>
      </div>

      <form className="space-y-4">
        <div>
          <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-foreground/75 mb-1">
            Email Address
          </label>
          <input
            type="email"
            placeholder="name@barangay.gov.ph"
            className="w-full px-4 py-2 border border-border rounded-lg bg-white font-sans text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            required
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-1">
            <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-foreground/75">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="font-mono text-[9px] uppercase tracking-wider text-foreground/60 hover:text-foreground underline"
            >
              Forgot?
            </Link>
          </div>
          <input
            type="password"
            placeholder="••••••••"
            className="w-full px-4 py-2 border border-border rounded-lg bg-white font-sans text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full green-chip py-2.5 justify-center text-xs tracking-widest font-bold font-mono"
        >
          LOG IN TO PORTAL
        </button>
      </form>

      <div className="mt-6 text-center border-t border-border pt-4">
        <p className="text-xs text-foreground/60">
          New resident?{" "}
          <Link href="/register" className="font-mono text-[11px] font-bold uppercase text-foreground hover:underline">
            Register Here
          </Link>
        </p>
      </div>
    </div>
  );
}
