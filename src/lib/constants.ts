import type {
  EquipmentCategory,
  EquipmentCondition,
  RentalStatus,
  SortOption,
  UserRole,
} from "@/lib/mockData";

export const roleLabels: Record<
  UserRole,
  { label: string; description: string; color: string }
> = {
  owner: {
    label: "Business Owner",
    description:
      "Full access to all features including financials and team management",
    color: "text-primary",
  },
  operations_manager: {
    label: "Operations Manager",
    description: "Manage equipment, rentals, and day-to-day operations",
    color: "text-accent",
  },
  finance: {
    label: "Finance Admin",
    description: "View-only access to financial reports and earnings",
    color: "text-success",
  },
};

export const categoryLabels: Record<EquipmentCategory, string> = {
  construction: "Construction",
  events: "Events & Production",
  manufacturing: "Manufacturing",
  cleaning: "Cleaning & Maintenance",
  logistics: "Logistics & Warehouse",
};

export const conditionLabels: Record<
  EquipmentCondition,
  { label: string; color: string }
> = {
  excellent: { label: "Excellent", color: "text-success" },
  good: { label: "Good", color: "text-primary" },
  fair: { label: "Fair", color: "text-warning" },
};

export const statusColors: Record<
  RentalStatus,
  { bg: string; text: string; label: string }
> = {
  requested: {
    bg: "bg-warning/10",
    text: "text-warning",
    label: "Pending Approval",
  },
  approved: { bg: "bg-primary/10", text: "text-primary", label: "Approved" },
  active: { bg: "bg-success/10", text: "text-success", label: "Active" },
  completed: {
    bg: "bg-muted",
    text: "text-muted-foreground",
    label: "Completed",
  },
  declined: {
    bg: "bg-destructive/10",
    text: "text-destructive",
    label: "Declined",
  },
  extension_requested: {
    bg: "bg-accent/10",
    text: "text-accent",
    label: "Extension Requested",
  },
};

export const sortOptions: { value: SortOption; label: string }[] = [
  { value: "most_rented", label: "Most Rented" },
  { value: "highest_rated", label: "Highest Rated" },
  { value: "closest", label: "Closest" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
];
