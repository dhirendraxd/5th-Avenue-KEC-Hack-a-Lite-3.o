// Task Flagging System - Predefined issue categories for structured communication

export type FlagSeverity = 'low' | 'medium' | 'high' | 'critical';

export type FlagCategory = 
  | 'equipment_issue'
  | 'schedule_conflict'
  | 'access_problem'
  | 'documentation_needed'
  | 'safety_concern'
  | 'payment_issue'
  | 'communication_needed'
  | 'other';

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
  status: 'open' | 'acknowledged' | 'resolved';
  resolvedAt?: Date;
  resolvedBy?: string;
  resolutionNote?: string;
}

export const flagCategories: FlagOption[] = [
  {
    category: 'equipment_issue',
    label: 'Equipment Issue',
    description: 'Problem with the equipment itself',
    defaultSeverity: 'medium',
    icon: 'wrench',
    quickActions: [
      'Equipment not starting',
      'Missing parts or accessories',
      'Damage found on arrival',
      'Performance issue',
      'Different from listing',
    ],
  },
  {
    category: 'schedule_conflict',
    label: 'Schedule Conflict',
    description: 'Timing or availability issues',
    defaultSeverity: 'high',
    icon: 'calendar-x',
    quickActions: [
      'Cannot make pickup time',
      'Need to return early',
      'Need extension',
      'Owner unavailable',
      'Location closed',
    ],
  },
  {
    category: 'access_problem',
    label: 'Access Problem',
    description: 'Cannot access equipment or location',
    defaultSeverity: 'high',
    icon: 'lock',
    quickActions: [
      'Gate/door locked',
      'Wrong address provided',
      'No one available to meet',
      'Access code not working',
      'Parking not available',
    ],
  },
  {
    category: 'documentation_needed',
    label: 'Documentation Needed',
    description: 'Missing paperwork or information',
    defaultSeverity: 'low',
    icon: 'file-text',
    quickActions: [
      'Need operating manual',
      'Insurance document missing',
      'Need receipt/invoice',
      'Condition report unclear',
      'Contact info needed',
    ],
  },
  {
    category: 'safety_concern',
    label: 'Safety Concern',
    description: 'Safety-related issues requiring attention',
    defaultSeverity: 'critical',
    icon: 'alert-triangle',
    quickActions: [
      'Equipment seems unsafe',
      'Missing safety features',
      'Unclear safety procedures',
      'Environmental hazard',
      'Injury risk identified',
    ],
  },
  {
    category: 'payment_issue',
    label: 'Payment Issue',
    description: 'Billing or payment concerns',
    defaultSeverity: 'medium',
    icon: 'credit-card',
    quickActions: [
      'Incorrect charge amount',
      'Deposit not processed',
      'Refund needed',
      'Payment declined',
      'Invoice discrepancy',
    ],
  },
  {
    category: 'communication_needed',
    label: 'Need to Contact',
    description: 'Need to reach the other party',
    defaultSeverity: 'low',
    icon: 'message-circle',
    quickActions: [
      'Confirm pickup details',
      'Ask a question',
      'Clarify instructions',
      'Report status update',
      'Request callback',
    ],
  },
  {
    category: 'other',
    label: 'Other',
    description: 'Issue not listed above',
    defaultSeverity: 'low',
    icon: 'help-circle',
    quickActions: [],
  },
];

export const severityConfig: Record<FlagSeverity, { label: string; color: string; bgColor: string }> = {
  low: { label: 'Low', color: 'text-muted-foreground', bgColor: 'bg-muted' },
  medium: { label: 'Medium', color: 'text-warning', bgColor: 'bg-warning/10' },
  high: { label: 'High', color: 'text-destructive', bgColor: 'bg-destructive/10' },
  critical: { label: 'Critical', color: 'text-destructive', bgColor: 'bg-destructive/20' },
};

export const getCategoryByKey = (key: FlagCategory): FlagOption | undefined => {
  return flagCategories.find((c) => c.category === key);
};
