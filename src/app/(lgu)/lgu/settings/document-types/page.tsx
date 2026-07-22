import { TypeCategoryList } from "@/components/lgu/type-category-list";

const REPORT_TYPES = ["monthly", "financial", "accomplishment", "compliance"];

export default function DocumentTypesPage() {
  return (
    <TypeCategoryList
      title="Document Types"
      description="Document/report categories that can be submitted as barangay document uploads."
      table="reports"
      column="type"
      values={REPORT_TYPES}
    />
  );
}
