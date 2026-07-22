import { AnnouncementList } from "@/components/lgu/announcement-list";

export default function NotificationHistoryPage() {
  return (
    <AnnouncementList
      title="Notification History"
      description="Full log of every announcement ever broadcast to residents, including archived ones."
      statuses={["published", "archived"]}
    />
  );
}
