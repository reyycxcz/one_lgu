"use client";

import { useState, useEffect } from "react";
import { updateProfile } from "@/actions/profile";

interface ProfileFormProps {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  barangayCode: string;
  municipality: string;
}

interface City {
  name: string;
  code: string;
}

interface Barangay {
  name: string;
  code: string;
}

export default function ProfileForm({ fullName, email, phone, address, barangayCode, municipality }: ProfileFormProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [selectedCity, setSelectedCity] = useState(municipality || "");
  const [selectedBarangay, setSelectedBarangay] = useState(barangayCode || "");
  const [cities, setCities] = useState<City[]>([]);
  const [barangays, setBarangays] = useState<Barangay[]>([]);
  const [loadingCities, setLoadingCities] = useState(true);
  const [loadingBarangays, setLoadingBarangays] = useState(false);

  function loadBarangays(cityName: string, cities: City[]) {
    const city = cities.find(c => c.name === cityName);
    if (!city) return;

    setLoadingBarangays(true);
    fetch(`/api/barangays?cityCode=${city.code}`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setBarangays(data);
          if (barangayCode) {
            setSelectedBarangay(barangayCode);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoadingBarangays(false));
  }

  // Fetch cities on mount, then the resident's own barangay list
  useEffect(() => {
    fetch("/api/barangays")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const sorted = data.sort((a: City, b: City) => a.name.localeCompare(b.name));
          setCities(sorted);
          if (municipality) {
            loadBarangays(municipality, sorted);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoadingCities(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function handleCityChange(cityName: string) {
    setSelectedCity(cityName);
    setSelectedBarangay("");

    if (!cityName) {
      setBarangays([]);
      return;
    }

    loadBarangays(cityName, cities);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    const formData = new FormData(e.currentTarget);
    const result = await updateProfile(formData);

    if (result?.error) {
      setMessage({ type: "error", text: typeof result.error === "string" ? result.error : "Failed to update profile" });
    } else if (result?.success) {
      setMessage({ type: "success", text: "Profile updated successfully!" });
    }

    setLoading(false);
  }

  return (
    <div className="space-y-6">
      {message && (
        <div className={`p-3 rounded-xl text-sm font-sans ${message.type === "success" ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-medium text-foreground/60 mb-1.5">Full Name</label>
            <input
              type="text"
              name="fullName"
              defaultValue={fullName}
              className="w-full px-4 py-2.5 border border-border rounded-lg bg-white font-sans text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-foreground/60 mb-1.5">Email Address</label>
            <input
              type="email"
              name="email"
              defaultValue={email}
              className="w-full px-4 py-2.5 border border-border rounded-lg bg-white font-sans text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground/60 mb-1.5">Mobile Number</label>
          <input
            type="text"
            name="phone"
            defaultValue={phone}
            placeholder="+63 9XX XXX XXXX"
            className="w-full px-4 py-2.5 border border-border rounded-lg bg-white font-sans text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-foreground/60 mb-1.5">Street Address</label>
          <input
            type="text"
            name="address"
            defaultValue={address}
            placeholder="House No., Street, etc."
            className="w-full px-4 py-2.5 border border-border rounded-lg bg-white font-sans text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-medium text-foreground/60 mb-1.5">City / Municipality</label>
            <select
              name="municipality"
              className="w-full px-4 py-2.5 border border-border rounded-lg bg-white font-sans text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              value={selectedCity}
              onChange={(e) => handleCityChange(e.target.value)}
              disabled={loadingCities}
            >
              <option value="" disabled>
                {loadingCities ? "Loading..." : "Select City"}
              </option>
              {cities.map((city) => (
                <option key={city.code} value={city.name}>{city.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground/60 mb-1.5">Barangay</label>
            <select
              name="barangayCode"
              className="w-full px-4 py-2.5 border border-border rounded-lg bg-white font-sans text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
              value={selectedBarangay}
              onChange={(e) => setSelectedBarangay(e.target.value)}
              disabled={!selectedCity || loadingBarangays}
            >
              <option value="" disabled>
                {loadingBarangays ? "Loading..." : selectedCity ? "Select Barangay" : "Select a city first"}
              </option>
              {barangays.map((bgy) => (
                <option key={bgy.code} value={bgy.code}>{bgy.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-primary text-white rounded-lg font-sans text-xs font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
