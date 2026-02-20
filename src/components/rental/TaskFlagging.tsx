import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useFlagStore } from '@/lib/flagStore';
import {
  flagCategories,
  severityConfig,
  FlagCategory,
  FlagSeverity,
  FlagOption,
} from '@/lib/flaggingSystem';
import { cn } from '@/lib/utils';
import {
  Flag,
  Wrench,
  CalendarX,
  Lock,
  FileText,
  AlertTriangle,
  CreditCard,
  MessageCircle,
  HelpCircle,
  ChevronRight,
  X,
} from 'lucide-react';

const iconMap: Record<string, React.ElementType> = {
  wrench: Wrench,
  'calendar-x': CalendarX,
  lock: Lock,
  'file-text': FileText,
  'alert-triangle': AlertTriangle,
  'credit-card': CreditCard,
  'message-circle': MessageCircle,
  'help-circle': HelpCircle,
};

interface TaskFlagDialogProps {
  rentalId: string;
  trigger?: React.ReactNode;
  onFlagCreated?: () => void;
}

export const TaskFlagDialog = ({ rentalId, trigger, onFlagCreated }: TaskFlagDialogProps) => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<'category' | 'issue' | 'confirm'>('category');
  const [selectedCategory, setSelectedCategory] = useState<FlagOption | null>(null);
  const [selectedIssue, setSelectedIssue] = useState<string>('');
  const [severity, setSeverity] = useState<FlagSeverity>('medium');
  const [additionalContext, setAdditionalContext] = useState('');
  const { toast } = useToast();
  const addFlag = useFlagStore((state) => state.addFlag);

  const resetForm = () => {
    setStep('category');
    setSelectedCategory(null);
    setSelectedIssue('');
    setSeverity('medium');
    setAdditionalContext('');
  };

  const handleCategorySelect = (category: FlagOption) => {
    setSelectedCategory(category);
    setSeverity(category.defaultSeverity);
    if (category.quickActions && category.quickActions.length > 0) {
      setStep('issue');
    } else {
      setStep('confirm');
    }
  };

  const handleIssueSelect = (issue: string) => {
    setSelectedIssue(issue);
    setStep('confirm');
  };

  const handleSubmit = () => {
    if (!selectedCategory) return;

    addFlag({
      rentalId,
      category: selectedCategory.category,
      severity,
      selectedIssue: selectedIssue || selectedCategory.label,
      additionalContext: additionalContext.trim() || undefined,
      createdBy: 'current-user',
    });

    toast({
      title: 'Issue flagged',
      description: 'The coordinator has been notified and will review this shortly.',
    });

    resetForm();
    setOpen(false);
    onFlagCreated?.();
  };

  const handleBack = () => {
    if (step === 'confirm') {
      setStep(selectedCategory?.quickActions?.length ? 'issue' : 'category');
    } else if (step === 'issue') {
      setStep('category');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (!isOpen) resetForm();
    }}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Flag className="h-4 w-4" />
            Flag Issue
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === 'category' && 'What type of issue?'}
            {step === 'issue' && selectedCategory?.label}
            {step === 'confirm' && 'Confirm Flag'}
          </DialogTitle>
          <DialogDescription>
            {step === 'category' && 'Select the category that best describes your issue'}
            {step === 'issue' && 'Select the specific issue you encountered'}
            {step === 'confirm' && 'Review and submit your flag'}
          </DialogDescription>
        </DialogHeader>

        {step === 'category' && (
          <div className="grid gap-2 py-4">
            {flagCategories.map((category) => {
              const Icon = iconMap[category.icon] || HelpCircle;
              return (
                <button
                  key={category.category}
                  onClick={() => handleCategorySelect(category)}
                  className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted transition-colors text-left w-full"
                >
                  <div className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                    severityConfig[category.defaultSeverity].bgColor
                  )}>
                    <Icon className={cn('h-5 w-5', severityConfig[category.defaultSeverity].color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{category.label}</p>
                    <p className="text-sm text-muted-foreground truncate">{category.description}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </button>
              );
            })}
          </div>
        )}

        {step === 'issue' && selectedCategory && (
          <div className="space-y-4 py-4">
            <div className="grid gap-2">
              {selectedCategory.quickActions?.map((issue) => (
                <button
                  key={issue}
                  onClick={() => handleIssueSelect(issue)}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted transition-colors text-left w-full"
                >
                  <span className="text-foreground">{issue}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </button>
              ))}
            </div>
            <Button variant="ghost" className="w-full" onClick={() => {
              setSelectedIssue('');
              setStep('confirm');
            }}>
              Something else...
            </Button>
          </div>
        )}

        {step === 'confirm' && selectedCategory && (
          <div className="space-y-4 py-4">
            <div className="p-3 rounded-lg bg-muted">
              <p className="text-sm font-medium text-foreground">
                {selectedCategory.label}
                {selectedIssue && ` · ${selectedIssue}`}
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Priority</Label>
              <RadioGroup
                value={severity}
                onValueChange={(v) => setSeverity(v as FlagSeverity)}
                className="flex gap-2"
              >
                {(['low', 'medium', 'high', 'critical'] as FlagSeverity[]).map((s) => (
                  <div key={s} className="flex items-center">
                    <RadioGroupItem value={s} id={s} className="peer sr-only" />
                    <Label
                      htmlFor={s}
                      className={cn(
                        'px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer border transition-colors',
                        severity === s
                          ? cn(severityConfig[s].bgColor, severityConfig[s].color, 'border-current')
                          : 'border-border text-muted-foreground hover:bg-muted'
                      )}
                    >
                      {severityConfig[s].label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="context" className="text-sm font-medium">
                Additional context <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Textarea
                id="context"
                placeholder="Add any helpful details..."
                value={additionalContext}
                onChange={(e) => setAdditionalContext(e.target.value)}
                className="min-h-[80px] resize-none"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground text-right">
                {additionalContext.length}/500
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="flex gap-2 sm:gap-0">
          {step !== 'category' && (
            <Button variant="ghost" onClick={handleBack}>
              Back
            </Button>
          )}
          {step === 'confirm' && (
            <Button onClick={handleSubmit}>
              <Flag className="h-4 w-4 mr-2" />
              Submit Flag
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface FlagListProps {
  rentalId: string;
  showResolved?: boolean;
}

export const FlagList = ({ rentalId, showResolved = false }: FlagListProps) => {
  const flags = useFlagStore((state) => state.getFlagsForRental(rentalId));
  const resolveFlag = useFlagStore((state) => state.resolveFlag);
  const acknowledgeFlag = useFlagStore((state) => state.acknowledgeFlag);
  const { toast } = useToast();

  const visibleFlags = showResolved
    ? flags
    : flags.filter((f) => f.status !== 'resolved');

  if (visibleFlags.length === 0) {
    return null;
  }

  const handleResolve = (flagId: string) => {
    resolveFlag(flagId, 'current-user', 'Resolved');
    toast({
      title: 'Flag resolved',
      description: 'This issue has been marked as resolved.',
    });
  };

  const handleAcknowledge = (flagId: string) => {
    acknowledgeFlag(flagId);
    toast({
      title: 'Flag acknowledged',
      description: 'The reporter has been notified that you are looking into this.',
    });
  };

  return (
    <div className="space-y-3">
      {visibleFlags.map((flag) => {
        const category = flagCategories.find((c) => c.category === flag.category);
        const Icon = category ? iconMap[category.icon] || HelpCircle : HelpCircle;
        
        return (
          <Card
            key={flag.id}
            className={cn(
              'overflow-hidden',
              flag.status === 'resolved' && 'opacity-60'
            )}
          >
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={cn(
                  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg',
                  severityConfig[flag.severity].bgColor
                )}>
                  <Icon className={cn('h-4 w-4', severityConfig[flag.severity].color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-foreground">{flag.selectedIssue}</p>
                    <Badge
                      variant={flag.status === 'open' ? 'warning' : flag.status === 'acknowledged' ? 'info' : 'secondary'}
                      className="text-xs"
                    >
                      {flag.status === 'open' ? 'Open' : flag.status === 'acknowledged' ? 'Reviewing' : 'Resolved'}
                    </Badge>
                    <Badge variant="outline" className={cn('text-xs', severityConfig[flag.severity].color)}>
                      {severityConfig[flag.severity].label}
                    </Badge>
                  </div>
                  {flag.additionalContext && (
                    <p className="mt-1 text-sm text-muted-foreground">{flag.additionalContext}</p>
                  )}
                  <p className="mt-2 text-xs text-muted-foreground">
                    Flagged {flag.createdAt.toLocaleDateString()}
                  </p>
                </div>
                {flag.status !== 'resolved' && (
                  <div className="flex gap-2 shrink-0">
                    {flag.status === 'open' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAcknowledge(flag.id)}
                      >
                        Acknowledge
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResolve(flag.id)}
                    >
                      Resolve
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

interface FlagSummaryBadgeProps {
  rentalId: string;
}

export const FlagSummaryBadge = ({ rentalId }: FlagSummaryBadgeProps) => {
  const flags = useFlagStore((state) => state.getFlagsForRental(rentalId));
  const openFlags = flags.filter((f) => f.status !== 'resolved');
  
  if (openFlags.length === 0) return null;
  
  const hasCritical = openFlags.some((f) => f.severity === 'critical');
  const hasHigh = openFlags.some((f) => f.severity === 'high');
  
  return (
    <Badge 
      variant={hasCritical ? 'destructive' : hasHigh ? 'warning' : 'info'}
      className="gap-1"
    >
      <Flag className="h-3 w-3" />
      {openFlags.length}
    </Badge>
  );
};
