import { AnnouncementList } from "@/components/lgu/announcement-list";

export default function SentAnnouncementsPage() {
  return (
    <AnnouncementList
      title="Sent Announcements"
      description="Announcements currently live on the public Civic Bulletin."
      statuses={["published"]}
    />
  );
}
