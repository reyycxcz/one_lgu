import Link from "next/link";

export default function RegisterPage() {
  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="font-pixel text-2xl uppercase tracking-wider text-foreground">Resident Signup</h2>
        <p className="text-xs text-foreground/60 font-sans mt-1">Create an account to request certificates and file complaints</p>
      </div>

      <form className="space-y-4">
        <div>
          <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-foreground/75 mb-1">
            Full Name
          </label>
          <input
            type="text"
            placeholder="Juan Dela Cruz"
            className="w-full px-4 py-2 border border-border rounded-lg bg-white font-sans text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            required
          />
        </div>

        <div>
          <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-foreground/75 mb-1">
            Barangay
          </label>
          <select
            className="w-full px-4 py-2 border border-border rounded-lg bg-white font-sans text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            required
            defaultValue=""
          >
            <option value="" disabled>Select your Barangay</option>
            <option value="bgy-001">Barangay San Jose (BGY-001)</option>
            <option value="bgy-002">Barangay Santa Rita (BGY-002)</option>
            <option value="bgy-003">Barangay San Antonio (BGY-003)</option>
          </select>
        </div>

        <div>
          <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-foreground/75 mb-1">
            Email Address
          </label>
          <input
            type="email"
            placeholder="juan.delacruz@gmail.com"
            className="w-full px-4 py-2 border border-border rounded-lg bg-white font-sans text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
            required
          />
        </div>

        <div>
          <label className="block font-mono text-[10px] font-bold uppercase tracking-wider text-foreground/75 mb-1">
            Password
          </label>
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
          CREATE ACCOUNT
        </button>
      </form>

      <div className="mt-6 text-center border-t border-border pt-4">
        <p className="text-xs text-foreground/60">
          Already registered?{" "}
          <Link href="/login" className="font-mono text-[11px] font-bold uppercase text-foreground hover:underline">
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}
