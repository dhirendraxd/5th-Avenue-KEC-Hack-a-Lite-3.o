import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShieldCheck, AlertTriangle, PenLine } from "lucide-react";

interface TermsAgreementDialogProps {
  open: boolean;
  onAccept: (signature: string) => void;
}

export default function TermsAgreementDialog({
  open,
  onAccept,
}: TermsAgreementDialogProps) {
  const [hasReadTerms, setHasReadTerms] = useState(false);
  const [hasReadSafety, setHasReadSafety] = useState(false);
  const [hasReadLiability, setHasReadLiability] = useState(false);
  const [signature, setSignature] = useState("");

  const canAccept = hasReadTerms && hasReadSafety && hasReadLiability && signature.trim().length > 0;

  const handleAccept = () => {
    if (canAccept) {
      onAccept(signature);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="max-w-[95vw] sm:max-w-2xl md:max-w-3xl h-[95vh] sm:h-[90vh] p-0 gap-0 flex flex-col overflow-hidden" hideCloseButton>
        <DialogHeader className="px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b shrink-0">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-blue-100 rounded-lg flex-shrink-0">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-lg sm:text-xl md:text-2xl leading-tight">
                Platform Agreement & Safety Terms
              </DialogTitle>
              <DialogDescription className="mt-1 text-xs sm:text-sm">
                Please read and accept all terms before using Upyog
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 px-4 sm:px-6 py-3 sm:py-4 overflow-y-auto">
          <div className="space-y-4 sm:space-y-6 pr-2 sm:pr-4">
            {/* Terms of Service */}
            <section>
              <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                <span>Terms of Service</span>
              </h3>
              <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
                <p>
                  By using Upyog, you agree to comply with all applicable
                  laws and regulations regarding equipment rental and materials
                  trading. You acknowledge that:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>
                    All information provided must be accurate and up-to-date
                  </li>
                  <li>
                    You are responsible for the safe operation of rented
                    equipment
                  </li>
                  <li>
                    Equipment must be returned in the same condition as received
                  </li>
                  <li>
                    You will honor all rental agreements and payment obligations
                  </li>
                  <li>
                    Platform fees and service charges apply to all transactions
                  </li>
                  <li>
                    Upyog reserves the right to suspend accounts violating
                    these terms
                  </li>
                </ul>
              </div>
            </section>

            {/* Safety & Compliance */}
            <section>
              <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 flex-shrink-0" />
                <span>Safety & Compliance Requirements</span>
              </h3>
              <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
                <p className="font-medium text-foreground">
                  Equipment Owners Must:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>
                    Ensure all equipment meets safety standards and regulations
                  </li>
                  <li>
                    Provide accurate condition reports and maintenance records
                  </li>
                  <li>Disclose any known defects or operational limitations</li>
                  <li>
                    Maintain valid insurance coverage for listed equipment
                  </li>
                  <li>
                    Provide safety manuals and operational instructions
                  </li>
                  <li>
                    Perform regular maintenance and safety inspections
                  </li>
                </ul>

                <p className="font-medium text-foreground mt-4">
                  Renters Must:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>
                    Possess proper licenses and certifications to operate
                    equipment
                  </li>
                  <li>Conduct thorough pre-use inspections before operation</li>
                  <li>
                    Follow all manufacturer guidelines and safety protocols
                  </li>
                  <li>
                    Report any malfunctions or safety concerns immediately
                  </li>
                  <li>Use equipment only for its intended purpose</li>
                  <li>
                    Maintain equipment properly during the rental period
                  </li>
                </ul>
              </div>
            </section>

            {/* Liability & Insurance */}
            <section>
              <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">
                Liability & Insurance
              </h3>
              <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
                <p>
                  <strong>Equipment Damage & Loss:</strong> Renters are
                  financially responsible for any damage, loss, or theft of
                  equipment during the rental period. Security deposits may be
                  retained to cover damages. Equipment insurance is strongly
                  recommended.
                </p>
                <p>
                  <strong>Personal Injury & Third-Party Claims:</strong> Renters
                  assume full responsibility for injuries or property damage
                  caused by equipment operation. Owners and renters should
                  maintain appropriate liability insurance coverage.
                </p>
                <p>
                  <strong>Platform Limitation:</strong> Upyog acts as a
                  marketplace facilitator only. We are not liable for equipment
                  condition, rental disputes, or incidents arising from equipment
                  use. All transactions are between owners and renters.
                </p>
                <p>
                  <strong>Dispute Resolution:</strong> Parties agree to resolve
                  disputes through good-faith negotiation. Unresolved disputes
                  may be escalated to platform mediation or legal arbitration.
                </p>
              </div>
            </section>

            {/* Prohibited Activities */}
            <section>
              <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3 text-red-600">
                Prohibited Activities & Violations
              </h3>
              <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
                <p className="text-foreground font-medium">
                  The following activities will result in immediate account
                  suspension or termination:
                </p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>
                    Providing false or misleading information about equipment
                    condition
                  </li>
                  <li>
                    Fraudulent payment activities or payment disputes in bad
                    faith
                  </li>
                  <li>
                    Subletting or unauthorized transfer of rented equipment
                  </li>
                  <li>
                    Using equipment for illegal activities or prohibited purposes
                  </li>
                  <li>
                    Tampering with safety features or equipment modifications
                  </li>
                  <li>
                    Harassment, threats, or abusive behavior toward other users
                  </li>
                  <li>
                    Attempting to circumvent platform fees or payment systems
                  </li>
                  <li>Listing stolen, counterfeit, or illegal equipment</li>
                </ul>
              </div>
            </section>

            {/* Payment & Fees */}
            <section>
              <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">
                Payment Terms & Fees
              </h3>
              <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
                <p>
                  <strong>Service Fees:</strong> Upyog charges 8-12%
                  service fees on rental transactions. This fee covers payment
                  processing, platform maintenance, insurance protection, and
                  customer support.
                </p>
                <p>
                  <strong>Payment Timing:</strong> Full payment (rental fee +
                  service fee + security deposit) must be completed before
                  equipment pickup. Extension payments must be completed before
                  the extension period begins.
                </p>
                <p>
                  <strong>Refund Policy:</strong> Cancellations made 48+ hours
                  before pickup receive full refunds. Late cancellations may
                  incur penalties as per the equipment's cancellation policy.
                </p>
                <p>
                  <strong>Security Deposits:</strong> Deposits are held during
                  the rental period and released within 3-5 business days after
                  successful equipment return and inspection.
                </p>
              </div>
            </section>

            {/* Data Privacy */}
            <section>
              <h3 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">
                Privacy & Data Protection
              </h3>
              <div className="space-y-2 text-sm text-muted-foreground leading-relaxed">
                <p>
                  We collect and process personal data to facilitate rentals,
                  process payments, and improve platform services. Your data is
                  protected according to GDPR standards and will never be sold
                  to third parties.
                </p>
                <p>
                  Transaction records, condition logs, and communications are
                  stored for dispute resolution and legal compliance purposes.
                  You may request data export or account deletion at any time.
                </p>
              </div>
            </section>
          </div>
        </ScrollArea>

        <DialogFooter className="flex-col sm:flex-col gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 border-t bg-muted/30 shrink-0">
          <div className="space-y-2.5 sm:space-y-3 w-full">
            {/* Signature Field */}
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="signature" className="text-xs sm:text-sm font-semibold flex items-center gap-1.5 sm:gap-2">
                <PenLine className="w-3.5 h-3.5 sm:w-4 sm:h-4 flex-shrink-0" />
                <span>Digital Signature (Full Name) *</span>
              </Label>
              <Input
                id="signature"
                type="text"
                placeholder="Enter your full name as consent"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                className="font-medium text-sm sm:text-base h-9 sm:h-10"
              />
              <p className="text-[10px] sm:text-xs text-muted-foreground leading-tight">
                By entering your name, you electronically sign and agree to be legally bound by these terms
              </p>
            </div>

            {/* Agreement Checkboxes */}
            <div className="space-y-2 sm:space-y-2.5 pt-1 sm:pt-2 border-t">
              <div className="flex items-start gap-2 sm:gap-3">
                <Checkbox
                  id="terms"
                  checked={hasReadTerms}
                  onCheckedChange={(checked) =>
                    setHasReadTerms(checked as boolean)
                  }
                  className="mt-0.5 shrink-0"
                />
                <Label htmlFor="terms" className="text-xs sm:text-sm leading-snug sm:leading-relaxed cursor-pointer">
                  I have read and agree to the <strong>Terms of Service</strong>{" "}
                  and understand my obligations as a platform user
                </Label>
              </div>

            <div className="flex items-start gap-2 sm:gap-3">
              <Checkbox
                id="safety"
                checked={hasReadSafety}
                onCheckedChange={(checked) =>
                  setHasReadSafety(checked as boolean)
                }
                className="mt-0.5 shrink-0"
              />
              <Label htmlFor="safety" className="text-xs sm:text-sm leading-snug sm:leading-relaxed cursor-pointer">
                I acknowledge the <strong>Safety & Compliance Requirements</strong>{" "}
                and will operate/list equipment responsibly and legally
              </Label>
            </div>

              <div className="flex items-start gap-2 sm:gap-3">
                <Checkbox
                  id="liability"
                  checked={hasReadLiability}
                  onCheckedChange={(checked) =>
                    setHasReadLiability(checked as boolean)
                  }
                  className="mt-0.5 shrink-0"
                />
                <Label htmlFor="liability" className="text-xs sm:text-sm leading-snug sm:leading-relaxed cursor-pointer">
                  I understand the <strong>Liability & Insurance</strong> terms
                  and accept responsibility for equipment damage and safety
                </Label>
              </div>
            </div>
          </div>

          <div className="w-full space-y-2">
            <Button
              onClick={handleAccept}
              disabled={!canAccept}
              className="w-full text-sm sm:text-base h-10 sm:h-11"
              size="lg"
            >
              <ShieldCheck className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="hidden sm:inline">Accept Terms & Continue to Dashboard</span>
              <span className="sm:hidden">Accept & Continue</span>
            </Button>

            {!canAccept && (
              <p className="text-[10px] sm:text-xs text-muted-foreground text-center leading-tight">
                {signature.trim().length === 0
                  ? "Please enter your name and accept all terms to continue"
                  : "You must accept all terms to use the platform"}
              </p>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
