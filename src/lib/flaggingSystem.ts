/**
 * Task Flagging System
 *
 * Structured communication system for rental issues and coordination needs
 * Replaces ad-hoc messaging with predefined categories and quick actions
 *
 * Benefits:
 * - Faster issue reporting (select from list vs typing)
 * - Better tracking and analytics (categorized data)
 * - Proper prioritization (severity levels)
 * - Clearer communication (standardized terminology)
 * - Audit trail (timestamps, status tracking)
 *
 * Used in RentalOperations page for renters to flag problems
 */

/**
 * Severity levels determine urgency and response time
 * - low: Informational, no rush (documentation requests)
 * - medium: Should address soon (equipment issues, payment)
 * - high: Needs prompt attention (schedule conflicts, access)
 * - critical: Immediate action required (safety concerns)
 */
export type FlagSeverity = "low" | "medium" | "high" | "critical";

/**
 * Issue categories cover common rental scenarios
 * Each category has predefined quick actions for faster reporting
 */
export type FlagCategory =
  | "equipment_issue" // Equipment malfunction or damage
  | "schedule_conflict" // Timing problems
  | "access_problem" // Can't get to equipment/location
  | "documentation_needed" // Missing paperwork
  | "safety_concern" // Safety hazards (highest priority)
  | "payment_issue" // Billing problems
  | "communication_needed" // General coordination
  | "other"; // Catch-all for unusual cases

export interface FlagOption {
  category: FlagCategory;
  label: string;
  description: string;
  defaultSeverity: FlagSeverity;
  icon: string;
  quickActions?: string[];
}

export interface TaskFlag {
  id: string;
  rentalId: string;
  category: FlagCategory;
  severity: FlagSeverity;
  selectedIssue: string;
  additionalContext?: string;
  createdAt: Date;
  createdBy: string;
  status: "open" | "acknowledged" | "resolved";
  resolvedAt?: Date;
  resolvedBy?: string;
  resolutionNote?: string;
}
/**
 * Predefined flag categories with quick actions
 *
 * Design philosophy:
 * - Start broad (category) then narrow (specific issue)
 * - Quick actions based on real user feedback and support tickets
 * - Cover 80% of common scenarios, with "other" for edge cases
 * - Severity defaults based on typical urgency of each category
 */ export const flagCategories: FlagOption[] = [
  {
    category: "equipment_issue",
    label: "Equipment Issue",
    description: "Problem with the equipment itself",
    defaultSeverity: "medium",
    icon: "wrench",
    quickActions: [
      "Equipment not starting",
      "Missing parts or accessories",
      "Damage found on arrival",
      "Performance issue",
      "Different from listing",
    ],
  },
  {
    category: "schedule_conflict",
    label: "Schedule Conflict",
    description: "Timing or availability issues",
    defaultSeverity: "high",
    icon: "calendar-x",
    quickActions: [
      "Cannot make pickup time",
      "Need to return early",
      "Need extension",
      "Owner unavailable",
      "Location closed",
    ],
  },
  {
    category: "access_problem",
    label: "Access Problem",
    description: "Cannot access equipment or location",
    defaultSeverity: "high",
    icon: "lock",
    quickActions: [
      "Gate/door locked",
      "Wrong address provided",
      "No one available to meet",
      "Access code not working",
      "Parking not available",
    ],
  },
  {
    category: "documentation_needed",
    label: "Documentation Needed",
    description: "Missing paperwork or information",
    defaultSeverity: "low",
    icon: "file-text",
    quickActions: [
      "Need operating manual",
      "Insurance document missing",
      "Need receipt/invoice",
      "Condition report unclear",
      "Contact info needed",
    ],
  },
  {
    category: "safety_concern",
    label: "Safety Concern",
    description: "Safety-related issues requiring attention",
    defaultSeverity: "critical", // Always critical - safety first!
    icon: "alert-triangle",
    quickActions: [
      "Equipment seems unsafe",
      "Missing safety features",
      "Unclear safety procedures",
      "Environmental hazard",
      "Injury risk identified",
    ],
  },
  {
    category: "payment_issue",
    label: "Payment Issue",
    description: "Billing or payment concerns",
    defaultSeverity: "medium",
    icon: "credit-card",
    quickActions: [
      "Incorrect charge amount",
      "Deposit not processed",
      "Refund needed",
      "Payment declined",
      "Invoice discrepancy",
    ],
  },
  {
    category: "communication_needed",
    label: "Need to Contact",
    description: "Need to reach the other party",
    defaultSeverity: "low",
    icon: "message-circle",
    quickActions: [
      "Confirm pickup details",
      "Ask a question",
      "Clarify instructions",
      "Report status update",
      "Request callback",
    ],
  },
  {
    category: "other",
    label: "Other",
    description: "Issue not listed above",
    defaultSeverity: "low",
    icon: "help-circle",
    quickActions: [],
  },
];

export const severityConfig: Record<
  FlagSeverity,
  { label: string; color: string; bgColor: string }
> = {
  low: { label: "Low", color: "text-muted-foreground", bgColor: "bg-muted" },
  medium: { label: "Medium", color: "text-warning", bgColor: "bg-warning/10" },
  high: {
    label: "High",
    color: "text-destructive",
    bgColor: "bg-destructive/10",
  },
  critical: {
    label: "Critical",
    color: "text-destructive",
    bgColor: "bg-destructive/20",
  },
};

export const getCategoryByKey = (key: FlagCategory): FlagOption | undefined => {
  return flagCategories.find((c) => c.category === key);
};
