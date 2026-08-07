import { TypeCategoryList } from "@/components/lgu/type-category-list";
import { requireSuperAdmin } from "@/lib/auth/session";

const COMPLAINT_TYPES = [
  "noise_complaint",
  "garbage_illegal_dumping",
  "road_infrastructure",
  "streetlight_problem",
  "stray_aggressive_animals",
  "other",
];

export default async function ComplaintCategoriesPage() {
  await requireSuperAdmin();
  return (
    <TypeCategoryList
      title="Complaint Categories"
      description="Categories residents choose from when filing a complaint."
      table="complaints"
      column="type"
      values={COMPLAINT_TYPES}
    />
  );
}
