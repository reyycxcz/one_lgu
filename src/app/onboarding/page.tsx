"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { completeOnboarding } from "@/actions/auth";
import { LoginPageLayout } from "@/components/login-form";

interface City {
  name: string;
  code: string;
}

interface Barangay {
  name: string;
  code: string;
}

function OnboardingForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  const router = useRouter();
  const [selectedCity, setSelectedCity] = useState("");
  const [cities, setCities] = useState<City[]>([]);
  const [barangays, setBarangays] = useState<Barangay[]>([]);
  const [loadingCities, setLoadingCities] = useState(true);
  const [loadingBarangays, setLoadingBarangays] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/barangays")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setCities(data.sort((a: City, b: City) => a.name.localeCompare(b.name)));
        }
      })
      .catch(() => setError("Failed to load cities. Please refresh."))
      .finally(() => setLoadingCities(false));
  }, []);

  function handleCityChange(cityName: string) {
    setSelectedCity(cityName);
    setError(null);

    if (!cityName) {
      setBarangays([]);
      return;
    }

    const city = cities.find(c => c.name === cityName);
    if (!city) return;

    setLoadingBarangays(true);
    fetch(`/api/barangays?cityCode=${city.code}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setBarangays(data);
        }
      })
      .catch(() => setError("Failed to load barangays. Please try again."))
      .finally(() => setLoadingBarangays(false));
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await completeOnboarding(formData);

    if (result?.error) {
      const errorMsg = typeof result.error === "string"
        ? result.error
        : typeof result.error === "object"
          ? Object.values(result.error).flat().join(", ")
          : "Something went wrong. Please try again.";
      setError(errorMsg);
      setLoading(false);
      return;
    }

    router.push("/resident/dashboard");
  }

  return (
    <form onSubmit={handleSubmit} className={cn("flex flex-col gap-6 font-sans", className)} {...props}>
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-bold">One last step</h1>
        <p className="text-balance text-sm text-muted-foreground">
          Tell us your municipality and barangay to finish setting up your account
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid gap-6">
        <div className="grid gap-2">
          <Label htmlFor="municipality">Municipality / City</Label>
          <div className="relative">
            <select
              id="municipality"
              name="municipality"
              className="border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
              required
              value={selectedCity}
              onChange={(e) => handleCityChange(e.target.value)}
              disabled={loadingCities}
            >
              <option value="" disabled>
                {loadingCities ? "Loading cities..." : "Select your City / Municipality"}
              </option>
              {cities.map((city) => (
                <option key={city.code} value={city.name}>{city.name}</option>
              ))}
            </select>
            {loadingCities && (
              <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground animate-spin" />
            )}
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="barangayCode">Barangay</Label>
          <div className="relative">
            <select
              id="barangayCode"
              name="barangayCode"
              className="border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50"
              required
              defaultValue=""
              disabled={!selectedCity || loadingBarangays}
            >
              <option value="" disabled>
                {loadingBarangays ? "Loading barangays..." : selectedCity ? "Select your Barangay" : "Select a city first"}
              </option>
              {barangays.map((bgy) => (
                <option key={bgy.code} value={bgy.code}>{bgy.name}</option>
              ))}
            </select>
            {loadingBarangays && (
              <Loader2 className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground animate-spin" />
            )}
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Saving..." : "Continue to Dashboard"}
        </Button>
      </div>
    </form>
  );
}

export default function OnboardingPage() {
  return (
    <LoginPageLayout formTitle="Almost there">
      <OnboardingForm />
    </LoginPageLayout>
  );
}
