import { TypeCategoryList } from "@/components/lgu/type-category-list";

const REPORT_TYPES = ["monthly", "financial", "accomplishment", "compliance"];

export default function ReportCategoriesPage() {
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
