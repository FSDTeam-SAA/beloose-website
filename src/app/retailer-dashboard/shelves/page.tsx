import DashboardShell from "@/components/retailer-dashboard/DashboardShell";
import ShelfManagement from "@/components/retailer-dashboard/ShelfManagement";

export default function ShelvesPage() {
  return <DashboardShell title="Shelf Management" subtitle="Live grid map of every shelf, row, column, and inventory position."><ShelfManagement /></DashboardShell>;
}
