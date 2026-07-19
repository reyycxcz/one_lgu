import { Card, CardContent } from "@/components/ui/card";

export default function LguUsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans font-black text-4xl uppercase tracking-wider mt-1">User Roles</h1>
        <p className="text-sm text-muted-foreground mt-1">Assign, edit, and audit system permission roles for Super Admins, Barangay Officials, and LGU Reviewers.</p>
      </div>
      <Card>
        <CardContent className="py-16 flex items-center justify-center text-center">
          <p className="text-sm text-muted-foreground font-mono uppercase tracking-wider">User roles table and permissions mapping interface placeholder</p>
        </CardContent>
      </Card>
    </div>
  );
}

