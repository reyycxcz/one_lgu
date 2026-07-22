import { LguPageHeader } from "@/components/lgu/page-header";
import { AnnouncementForm } from "@/components/lgu/announcement-form";

export default function CreateAnnouncementPage() {
  return (
    <div className="space-y-6">
      <LguPageHeader
        title="Create Announcement"
        description="Publish civic bulletin updates to the public landing page and notify residents instantly."
      />
      <AnnouncementForm />
    </div>
  );
}
