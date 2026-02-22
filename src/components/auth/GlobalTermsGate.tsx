import { useMemo } from "react";
import { useLocation } from "react-router-dom";
import TermsAgreementDialog from "@/components/dashboard/TermsAgreementDialog";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const HIDDEN_PATHS = ["/auth"];

export default function GlobalTermsGate() {
  const { isAuthenticated, isLoading, hasAcceptedTerms, acceptTerms } = useAuth();
  const { toast } = useToast();
  const location = useLocation();

  const shouldShow = useMemo(() => {
    if (isLoading || !isAuthenticated || hasAcceptedTerms) return false;
    return !HIDDEN_PATHS.includes(location.pathname);
  }, [isAuthenticated, isLoading, hasAcceptedTerms, location.pathname]);

  if (!shouldShow) return null;

  return (
    <TermsAgreementDialog
      open
      onAccept={async (signature: string) => {
        await acceptTerms(signature);
        toast({
          title: "Welcome to Upyog!",
          description: "You’re all set. Your agreement is saved for future sessions.",
        });
      }}
    />
  );
}