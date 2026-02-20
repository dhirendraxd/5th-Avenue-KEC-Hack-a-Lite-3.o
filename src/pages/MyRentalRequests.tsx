import { useEffect, useState } from "react";
import Navbar from "@/components/layout/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { subscribeFirebaseRentals } from "@/lib/firebase/rentals";
import { RentalRequest } from "@/lib/mockData";
import { format } from "date-fns";

const statusLabels: Record<string, string> = {
  requested: "Pending",
  approved: "Approved",
  declined: "Declined",
  active: "Active",
  completed: "Completed",
};

const MyRentalRequests = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<RentalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeFirebaseRentals(
      (all) => {
        setRequests(all.filter((r) => r.renter.id === user.id));
        setIsLoading(false);
      },
      () => setIsLoading(false)
    );
    return () => unsubscribe();
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold mb-6">My Rental Requests</h1>
        {isLoading ? (
          <p className="text-muted-foreground">Loading...</p>
        ) : requests.length === 0 ? (
          <p className="text-muted-foreground">No rental requests found.</p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {requests.map((req) => (
              <Card key={req.id}>
                <CardHeader>
                  <CardTitle>{req.equipment.name}</CardTitle>
                  <Badge variant="outline">{statusLabels[req.status]}</Badge>
                </CardHeader>
                <CardContent>
                  <div className="mb-2 text-sm text-muted-foreground">
                    {format(req.startDate, "PPP")} - {format(req.endDate, "PPP")}
                  </div>
                  <div className="mb-2">
                    <span className="font-medium">Location:</span> {req.equipment.locationName || req.equipment.owner.location}
                  </div>
                  {req.ownerNotes && (
                    <div className="mb-2 text-xs text-warning">
                      <span className="font-medium">Owner Notes:</span> {req.ownerNotes}
                    </div>
                  )}
                  {req.purpose && (
                    <div className="mb-1 text-xs">
                      <span className="font-medium">Purpose:</span> {req.purpose}
                    </div>
                  )}
                  {req.destination && (
                    <div className="mb-1 text-xs">
                      <span className="font-medium">Destination:</span> {req.destination}
                    </div>
                  )}
                  {req.notes && (
                    <div className="mb-1 text-xs">
                      <span className="font-medium">Notes:</span> {req.notes}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyRentalRequests;
