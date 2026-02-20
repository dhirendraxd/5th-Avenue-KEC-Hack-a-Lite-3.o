import { getDocument, getDocuments } from "./firestore";
import { ChecklistItem, RentalRequest } from "@/lib/mockData";

const RENTALS_COLLECTION = "rentals";

interface FirestoreRentalDocument {
  equipmentId?: string;
  equipmentName?: string;
  equipmentDescription?: string;
  equipmentCategory?: any;
  equipmentImages?: string[];
  equipmentPricePerDay?: number;
  equipmentSecurityDeposit?: number;
  equipmentServiceFeePercent?: number;
  equipmentCancellationPolicy?: string;
  equipmentCondition?: any;
  equipmentFeatures?: string[];
  equipmentUsageNotes?: string;
  equipmentInsuranceProtected?: boolean;
  ownerId?: string;
  ownerName?: string;
  ownerLocation?: string;
  renterId?: string;
  renterName?: string;
  renterLocation?: string;
  startDate?: string;
  endDate?: string;
  totalDays?: number;
  rentalFee?: number;
  serviceFee?: number;
  totalPrice?: number;
  status?: RentalRequest["status"];
  ownerNotes?: string;
  pickupChecklist?: ChecklistItem[];
  returnChecklist?: ChecklistItem[];
  extensionRequest?: RentalRequest["extensionRequest"];
}

const toDate = (value?: string) => {
  if (!value) return new Date();
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? new Date() : date;
};

const toRental = (id: string, doc: FirestoreRentalDocument): RentalRequest => {
  const startDate = toDate(doc.startDate);
  const endDate = toDate(doc.endDate);
  const totalDays =
    doc.totalDays ??
    Math.max(
      1,
      Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24),
      ) + 1,
    );

  const equipment = {
    id: doc.equipmentId || "",
    name: doc.equipmentName || "Equipment",
    description: doc.equipmentDescription || "",
    category: doc.equipmentCategory || "construction",
    images: doc.equipmentImages?.length
      ? doc.equipmentImages
      : ["/placeholder.svg"],
    pricePerDay: doc.equipmentPricePerDay ?? 0,
    securityDeposit: doc.equipmentSecurityDeposit ?? 0,
    serviceFeePercent: doc.equipmentServiceFeePercent ?? 10,
    owner: {
      id: doc.ownerId || "",
      name: doc.ownerName || "Owner",
      rating: 5,
      totalRentals: 0,
      verified: true,
      location: doc.ownerLocation || "N/A",
      memberSince: new Date(),
      responseRate: 100,
      responseTime: "< 24 hours",
    },
    availability: {
      blockedDates: [],
      minRentalDays: 1,
      bufferDays: 0,
      availableRanges: [
        {
          start: new Date(),
          end: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        },
      ],
    },
    features: doc.equipmentFeatures || [],
    usageNotes: doc.equipmentUsageNotes || "",
    insuranceProtected: doc.equipmentInsuranceProtected ?? true,
    condition: doc.equipmentCondition || "good",
    totalRentals: 0,
    reviews: [],
    cancellationPolicy:
      doc.equipmentCancellationPolicy || "Standard cancellation policy.",
  };

  return {
    id,
    equipment,
    renter: {
      id: doc.renterId || "",
      name: doc.renterName || "Renter",
      rating: 5,
      totalRentals: 0,
      verified: true,
      location: doc.renterLocation || "N/A",
      memberSince: new Date(),
      responseRate: 100,
      responseTime: "< 24 hours",
    },
    startDate,
    endDate,
    totalDays,
    rentalFee: doc.rentalFee ?? 0,
    serviceFee: doc.serviceFee ?? 0,
    totalPrice: doc.totalPrice ?? 0,
    status: doc.status || "requested",
    createdAt: new Date(),
    ownerNotes: doc.ownerNotes,
    pickupChecklist: doc.pickupChecklist,
    returnChecklist: doc.returnChecklist,
    extensionRequest: doc.extensionRequest,
  };
};

export const getFirebaseRentals = async (): Promise<RentalRequest[]> => {
  const documents = await getDocuments<
    FirestoreRentalDocument & { id: string }
  >(RENTALS_COLLECTION);
  return documents.map((document) => toRental(document.id, document));
};

export const getFirebaseRentalById = async (
  rentalId: string,
): Promise<RentalRequest | null> => {
  const document = await getDocument<FirestoreRentalDocument>(
    RENTALS_COLLECTION,
    rentalId,
  );
  if (!document) return null;
  return toRental(rentalId, document);
};
