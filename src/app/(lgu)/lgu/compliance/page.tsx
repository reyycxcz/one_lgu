"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface BarangayCompliance {
  name: string;
  code: string;
  reports_count: number;
  certifications_count: number;
  complaints_count: number;
}

const statusVariant: Record<string, "default" | "secondary" | "destructive"> = {
  Compliant: "default",
  "Action Required": "secondary",
  Delinquent: "destructive",
};

export default function LguCompliancePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [barangays, setBarangays] = useState<BarangayCompliance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/barangays/compliance")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setBarangays(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = barangays.filter(b =>
    b.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const compliant = barangays.filter(b => b.reports_count > 0).length;
  const actionRequired = barangays.filter(b => b.reports_count === 0 && (b.certifications_count > 0 || b.complaints_count > 0)).length;
  const delinquent = barangays.filter(b => b.reports_count === 0 && b.certifications_count === 0 && b.complaints_count === 0).length;

  return (
    <div className="space-y-8 animate-stagger-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground font-sans tracking-tight">Compliance Monitor</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Track report submissions and compliance status of all barangays.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-6 flex items-start gap-4">
            <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-sans text-sm font-bold text-green-800">Compliant</h4>
              <p className="text-2xl font-bold text-green-900 mt-1">{compliant} / {barangays.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-6 flex items-start gap-4">
            <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-sans text-sm font-bold text-amber-800">Action Required</h4>
              <p className="text-2xl font-bold text-amber-900 mt-1">{actionRequired} / {barangays.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-6 flex items-start gap-4">
            <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
            <div>
              <h4 className="font-sans text-sm font-bold text-red-800">Delinquent</h4>
              <p className="text-2xl font-bold text-red-900 mt-1">{delinquent} / {barangays.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-6 space-y-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search barangay..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border text-[10px] uppercase font-bold text-muted-foreground font-mono">
                  <th className="py-3 px-4">Barangay</th>
                  <th className="py-3 px-4">Reports</th>
                  <th className="py-3 px-4">Certifications</th>
                  <th className="py-3 px-4">Complaints</th>
                  <th className="py-3 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border text-xs font-sans">
                {loading ? (
                  <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">Loading...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">No barangays found.</td></tr>
                ) : (
                  filtered.map((bgy, i) => {
                    const status = bgy.reports_count > 0 ? "Compliant" : bgy.certifications_count > 0 ? "Action Required" : "Delinquent";
                    return (
                      <tr key={i} className="hover:bg-muted/20 transition-colors">
                        <td className="py-4 px-4 font-bold text-foreground">{bgy.name}</td>
                        <td className="py-4 px-4 font-mono">{bgy.reports_count}</td>
                        <td className="py-4 px-4 font-mono">{bgy.certifications_count}</td>
                        <td className="py-4 px-4 font-mono">{bgy.complaints_count}</td>
                        <td className="py-4 px-4">
                          <Badge variant={statusVariant[status]} className="text-[10px]">
                            {status}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
