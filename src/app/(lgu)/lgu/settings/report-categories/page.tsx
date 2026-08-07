import { TypeCategoryList } from "@/components/lgu/type-category-list";
import { requireSuperAdmin } from "@/lib/auth/session";

const REPORT_TYPES = ["monthly", "financial", "accomplishment", "compliance"];

export default async function ReportCategoriesPage() {
  await requireSuperAdmin();
  return (
    <TypeCategoryList
      title="Report Categories"
      description="Categories barangay officials use when submitting reports."
      table="reports"
      column="type"
      values={REPORT_TYPES}
    />
  );
}
