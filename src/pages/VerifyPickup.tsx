import { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import BackgroundIllustrations from "@/components/layout/BackgroundIllustrations";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, Shield, ArrowLeft } from "lucide-react";

/**
 * Seller Verification Page
 * Allows sellers to verify pickup by entering the 4-digit code shown to buyers
 * Prevents fake confirmations and ensures secure transactions
 */
const VerifyPickup = () => {
  const { toast } = useToast();
  const [verificationCode, setVerificationCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<"idle" | "success" | "failed">("idle");
  const [verifiedOrder, setVerifiedOrder] = useState<any>(null);

  /**
   * Mock order database with active verification codes
   * In production, this would be fetched from backend
   */
  const mockActiveOrders = [
    {
      code: "1234",
      buyerName: "Rajesh Kumar",
      itemName: "Portland Cement - 50kg bags",
      quantity: "20 bags",
      location: "Thamel",
      price: 15000,
      orderDate: "2026-02-21",
    },
    {
      code: "5678",
      buyerName: "Sita Sharma",
      itemName: "TMT Steel Rods",
      quantity: "50 pieces",
      location: "Koteshwor",
      price: 45000,
      orderDate: "2026-02-21",
    },
    {
      code: "9012",
      buyerName: "Aman Thapa",
      itemName: "Plywood Sheets",
      quantity: "10 sheets",
      location: "Patan",
      price: 8500,
      orderDate: "2026-02-20",
    },
  ];

  /**
   * Verify the entered code against active orders
   * Simulates backend validation
   */
  const handleVerify = () => {
    if (!verificationCode || verificationCode.length !== 4) {
      toast({
        title: "Invalid Code",
        description: "Please enter a 4-digit verification code",
        variant: "destructive",
      });
      return;
    }

    setIsVerifying(true);

    // Simulate verification delay
    setTimeout(() => {
      const order = mockActiveOrders.find(o => o.code === verificationCode);
      
      if (order) {
        setVerificationStatus("success");
        setVerifiedOrder(order);
        toast({
          title: "Pickup Verified! ✓",
          description: `Order for ${order.buyerName} has been confirmed`,
        });
      } else {
        setVerificationStatus("failed");
        toast({
          title: "Invalid Code",
          description: "No order found with this verification code",
          variant: "destructive",
        });
      }
      
      setIsVerifying(false);
    }, 800);
  };

  /**
   * Mark order as completed
   * In production, this would update the backend and notify buyer
   */
  const handleCompleteOrder = () => {
    toast({
      title: "Order Completed! 🎉",
      description: "Transaction marked as complete. Payment released to your account.",
      duration: 5000,
    });
    
    // Reset form
    setVerificationCode("");
    setVerificationStatus("idle");
    setVerifiedOrder(null);
  };

  /**
   * Reset verification form
   */
  const handleReset = () => {
    setVerificationCode("");
    setVerificationStatus("idle");
    setVerifiedOrder(null);
  };

  return (
    <div className="min-h-screen bg-background relative">
      <BackgroundIllustrations variant="marketplace" />
      <Navbar />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 relative materials-shell">
        <div className="materials-ambient" aria-hidden="true" />
        <div className="relative z-10">
          <PageHeader
            title="Verify Pickup Code"
            description="Enter the 4-digit code shown by the buyer to confirm pickup and complete the transaction."
            actions={
              <Button asChild variant="outline" size="default">
                <Link to="/materials/find">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Marketplace
                </Link>
              </Button>
            }
          />

          <div className="max-w-2xl mx-auto space-y-6">
            {/* Verification Input Card */}
            <Card className="card-shadow border-border/70">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-full bg-primary/10">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl font-bold">Enter Verification Code</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {verificationStatus === "idle" ? (
                  <>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        4-Digit Code
                      </label>
                      <Input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={4}
                        placeholder="Enter code (e.g., 1234)"
                        value={verificationCode}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, "");
                          setVerificationCode(value);
                        }}
                        className="h-14 text-center text-2xl font-mono tracking-widest"
                        autoFocus
                      />
                      <p className="text-xs text-muted-foreground">
                        Ask the buyer to show you their verification code
                      </p>
                    </div>

                    <Button
                      onClick={handleVerify}
                      disabled={isVerifying || verificationCode.length !== 4}
                      size="lg"
                      className="w-full shadow-sm"
                    >
                      {isVerifying ? (
                        <>
                          <span className="animate-spin mr-2">⏳</span>
                          Verifying...
                        </>
                      ) : (
                        <>
                          <Shield className="mr-2 h-4 w-4" />
                          Verify Code
                        </>
                      )}
                    </Button>
                  </>
                ) : verificationStatus === "success" && verifiedOrder ? (
                  <>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-2 border-green-500 rounded-xl p-6">
                      <div className="flex items-center justify-center gap-2 mb-4">
                        <CheckCircle className="h-8 w-8 text-green-600" />
                        <p className="text-xl font-bold text-green-900 dark:text-green-100">
                          Code Verified!
                        </p>
                      </div>
                      
                      <div className="space-y-3 bg-white dark:bg-gray-800 rounded-lg p-4 text-sm">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Buyer:</span>
                          <span className="font-semibold">{verifiedOrder.buyerName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Item:</span>
                          <span className="font-semibold text-right">{verifiedOrder.itemName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Quantity:</span>
                          <span className="font-semibold">{verifiedOrder.quantity}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Pickup Location:</span>
                          <span className="font-semibold">📍 {verifiedOrder.location}</span>
                        </div>
                        <div className="flex justify-between border-t pt-2">
                          <span className="text-muted-foreground">Amount:</span>
                          <span className="font-bold text-lg text-primary">
                            NPR {verifiedOrder.price.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-xs text-green-800 dark:text-green-200 mt-4 text-center">
                        Hand over the materials to complete the transaction
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        variant="outline"
                        onClick={handleReset}
                        size="lg"
                      >
                        Verify Another
                      </Button>
                      <Button
                        onClick={handleCompleteOrder}
                        size="lg"
                        className="shadow-sm"
                      >
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Complete Order
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900 border-2 border-red-500 rounded-xl p-6 text-center">
                      <div className="flex items-center justify-center gap-2 mb-3">
                        <XCircle className="h-8 w-8 text-red-600" />
                        <p className="text-xl font-bold text-red-900 dark:text-red-100">
                          Invalid Code
                        </p>
                      </div>
                      <p className="text-sm text-red-800 dark:text-red-200">
                        No active order found with code: <span className="font-mono font-bold">{verificationCode}</span>
                      </p>
                      <p className="text-xs text-red-700 dark:text-red-300 mt-2">
                        Please double-check the code with the buyer
                      </p>
                    </div>

                    <Button
                      variant="outline"
                      onClick={handleReset}
                      size="lg"
                      className="w-full"
                    >
                      Try Again
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Active Orders Preview */}
            <Card className="card-shadow border-border/70">
              <CardHeader>
                <CardTitle className="text-lg">Demo Active Orders</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Try these codes for demo: 1234, 5678, 9012
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockActiveOrders.map((order, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border hover:border-primary/40 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{order.itemName}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.buyerName} • {order.location}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-primary">
                          NPR {order.price.toLocaleString()}
                        </span>
                        <Badge className="font-mono">{order.code}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* How It Works */}
            <Card className="card-shadow border-border/70 bg-muted/20">
              <CardContent className="pt-6 space-y-3">
                <h3 className="font-semibold text-sm text-foreground mb-3">How Verification Works:</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex gap-2">
                    <span className="font-bold text-primary">1.</span>
                    <span>Buyer receives a unique 4-digit code after confirming purchase</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-primary">2.</span>
                    <span>Buyer shows you the code during pickup</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-primary">3.</span>
                    <span>You enter the code here to verify the pickup</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-primary">4.</span>
                    <span>Hand over materials and mark as completed</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="font-bold text-primary">5.</span>
                    <span>Payment is released to your account automatically</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border">
                  <p className="text-xs text-muted-foreground italic">
                    🔒 Verification codes prevent fraudulent pickups and ensure secure transactions for both parties.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

// Badge component for demo codes
const Badge = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20 ${className}`}>
    {children}
  </span>
);

export default VerifyPickup;
