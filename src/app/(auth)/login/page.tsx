"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <div className="mb-8">
        <h2 className="font-sans text-2xl font-bold text-foreground">Welcome back</h2>
        <p className="text-sm text-foreground/55 font-sans mt-1">Enter your credentials to access your portal</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-1.5">
          <label className="block font-sans text-xs font-semibold text-foreground/75">
            Email Address
          </label>
          <input
            type="email"
            placeholder="your email"
            className="w-full px-0 py-3 border-0 border-b border-b-[#D9DDD9] bg-transparent font-sans text-sm text-foreground placeholder:text-foreground/35 focus:border-b-primary focus:outline-none transition-colors duration-200"
            required
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="block font-sans text-xs font-semibold text-foreground/75">
              Password
            </label>
            <Link
              href="/forgot-password"
              className="font-sans text-xs font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="your password"
              className="w-full pl-0 pr-8 py-3 border-0 border-b border-b-[#D9DDD9] bg-transparent font-sans text-sm text-foreground placeholder:text-foreground/35 focus:border-b-primary focus:outline-none transition-colors duration-200"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-0 top-1/2 -translate-y-1/2 text-foreground/45 hover:text-foreground transition-colors focus:outline-none"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <button
          type="button"
          className="w-full py-3 mt-2 bg-primary text-white rounded-none font-sans text-sm font-bold tracking-wide transition-all duration-200 hover:bg-primary/95 hover:shadow-[0_4px_12px_rgba(0,177,94,0.2)] active:scale-[0.99]"
        >
          Log In to Portal
        </button>
      </div>

      <div className="mt-8 text-center">
        <p className="text-sm text-foreground/50 font-sans">
          New resident?{" "}
          <Link href="/register" className="font-sans text-sm font-semibold text-primary hover:text-primary/80 transition-colors">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
