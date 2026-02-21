import {
  createDocument,
  getDocument,
  getDocuments,
  subscribeDocument,
  subscribeDocuments,
  updateDocument,
} from "./firestore";
import { ChecklistItem, Equipment, RentalRequest } from "@/lib/mockData";

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
  purpose?: string;
  destination?: string;
  notes?: string;
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
  paymentStatus?: "pending" | "paid";
  paymentPaidAt?: string;
  paymentReference?: string;
  createdAt?: string;
}

interface CreateRentalRequestInput {
  equipment: Equipment;
  renterId: string;
  renterName: string;
  renterLocation?: string;
  startDate: Date;
  endDate: Date;
  purpose?: string;
  destination?: string;
  notes?: string;
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
    createdAt: toDate(doc.createdAt),
    ownerNotes: doc.ownerNotes,
    pickupChecklist: doc.pickupChecklist,
    returnChecklist: doc.returnChecklist,
    extensionRequest: doc.extensionRequest,
    paymentStatus:
      doc.paymentStatus ||
      (doc.status === "active" || doc.status === "completed"
        ? "paid"
        : "pending"),
    paymentPaidAt: doc.paymentPaidAt ? toDate(doc.paymentPaidAt) : undefined,
    paymentReference: doc.paymentReference,
    purpose: doc.purpose,
    destination: doc.destination,
    notes: doc.notes,
  };
};

export const createFirebaseRentalRequest = async (
  input: CreateRentalRequestInput,
): Promise<RentalRequest> => {
  const rentalId = `rental-${globalThis.crypto?.randomUUID?.() || Date.now()}`;
  const totalDays = Math.max(
    1,
    Math.ceil(
      (input.endDate.getTime() - input.startDate.getTime()) /
        (1000 * 60 * 60 * 24),
    ) + 1,
  );
  const rentalFee = input.equipment.pricePerDay * totalDays;
  const serviceFee = Math.round(
    (rentalFee * input.equipment.serviceFeePercent) / 100,
  );
  const totalPrice = rentalFee + serviceFee;

  const document: FirestoreRentalDocument = {
    equipmentId: input.equipment.id,
    equipmentName: input.equipment.name,
    equipmentDescription: input.equipment.description,
    equipmentCategory: input.equipment.category,
    equipmentImages: input.equipment.images,
    equipmentPricePerDay: input.equipment.pricePerDay,
    equipmentSecurityDeposit: input.equipment.securityDeposit,
    equipmentServiceFeePercent: input.equipment.serviceFeePercent,
    equipmentCancellationPolicy: input.equipment.cancellationPolicy,
    equipmentCondition: input.equipment.condition,
    equipmentFeatures: input.equipment.features,
    equipmentUsageNotes: input.equipment.usageNotes,
    equipmentInsuranceProtected: input.equipment.insuranceProtected,
    ownerId: input.equipment.owner.id,
    ownerName: input.equipment.owner.name,
    ownerLocation: input.equipment.owner.location,
    renterId: input.renterId,
    renterName: input.renterName,
    renterLocation: input.renterLocation,
    startDate: input.startDate.toISOString(),
    endDate: input.endDate.toISOString(),
    totalDays,
    rentalFee,
    serviceFee,
    totalPrice,
    status: "requested",
    paymentStatus: "pending",
    createdAt: new Date().toISOString(),
    purpose: input.purpose,
    destination: input.destination,
    notes: input.notes,
  };

  await createDocument(RENTALS_COLLECTION, rentalId, document);
  return toRental(rentalId, document);
};

export const createNotificationForOwner = async (
  recipientId: string,
  title: string,
  message: string,
  data: Record<string, any> = {},
) => {
  try {
    const notifId = `notif-${globalThis.crypto?.randomUUID?.() || Date.now()}`;
    const notification = {
      recipientId,
      title,
      message,
      type: "rental_request",
      data,
      read: false,
      createdAt: new Date().toISOString(),
    };

    await createDocument("notifications", notifId, notification as any);
    return true;
  } catch (err) {
    console.error("Failed to create owner notification:", err);
    throw err;
  }
};

export const updateFirebaseRentalStatus = async (
  rentalId: string,
  status: RentalRequest["status"],
  ownerNotes?: string,
) => {
  const payload: Partial<FirestoreRentalDocument> = { status };
  if (ownerNotes !== undefined) {
    payload.ownerNotes = ownerNotes;
  }

  await updateDocument<FirestoreRentalDocument>(
    RENTALS_COLLECTION,
    rentalId,
    payload,
  );
};

export const completeFirebaseRentalPayment = async (
  rentalId: string,
  paymentReference: string,
) => {
  await updateDocument<FirestoreRentalDocument>(RENTALS_COLLECTION, rentalId, {
    status: "active",
    paymentStatus: "paid",
    paymentPaidAt: new Date().toISOString(),
    paymentReference,
  });
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

export const subscribeFirebaseRentals = (
  onNext: (rentals: RentalRequest[]) => void,
  onError?: (error: Error) => void,
) => {
  return subscribeDocuments<FirestoreRentalDocument & { id: string }>(
    RENTALS_COLLECTION,
    (documents) => {
      onNext(documents.map((document) => toRental(document.id, document)));
    },
    [],
    onError,
  );
};

export const subscribeFirebaseRentalById = (
  rentalId: string,
  onNext: (rental: RentalRequest | null) => void,
  onError?: (error: Error) => void,
) => {
  return subscribeDocument<FirestoreRentalDocument>(
    RENTALS_COLLECTION,
    rentalId,
    (document) => {
      if (!document) {
        onNext(null);
        return;
      }
      onNext(toRental(document.id, document));
    },
    onError,
  );
};
