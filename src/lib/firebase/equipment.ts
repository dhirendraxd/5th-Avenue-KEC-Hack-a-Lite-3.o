import { createDocument, getDocuments, subscribeDocument, subscribeDocuments } from "./firestore";
import {
  Equipment,
  EquipmentCategory,
  EquipmentCondition,
} from "@/lib/mockData";

const EQUIPMENT_COLLECTION = "equipment";

type CancellationPolicyCode =
  | "24hours"
  | "48hours"
  | "72hours"
  | "1week"
  | "strict";

export interface EquipmentCreateInput {
  name: string;
  description: string;
  category: EquipmentCategory;
  pricePerDay: number;
  securityDeposit: number;
  locationId: string;
  locationName: string;
  locationMapUrl?: string;
  condition: EquipmentCondition;
  features: string[];
  usageNotes: string;
  minRentalDays: number;
  bufferDays: number;
  insuranceProtected: boolean;
  cancellationPolicy: CancellationPolicyCode;
  photos: string[];
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  ownerLocation: string;
  ownerVerified: boolean;
}

interface FirestoreEquipmentDocument {
  name: string;
  description: string;
  category: EquipmentCategory;
  images: string[];
  pricePerDay: number;
  securityDeposit: number;
  serviceFeePercent: number;
  ownerId: string;
  ownerName: string;
  ownerEmail: string;
  ownerLocation?: string;
  ownerVerified?: boolean;
  locationId: string;
  locationName: string;
  locationMapUrl?: string;
  minRentalDays: number;
  bufferDays: number;
  condition: EquipmentCondition;
  features: string[];
  usageNotes: string;
  insuranceProtected: boolean;
  cancellationPolicy: string;
  totalRentals: number;
  createdAt: string;
}

const mapCancellationPolicy = (policy: CancellationPolicyCode): string => {
  switch (policy) {
    case "24hours":
      return "Free cancellation up to 24 hours before pickup. No refund after that.";
    case "48hours":
      return "Free cancellation up to 48 hours before pickup. 50% refund within 48 hours.";
    case "72hours":
      return "Free cancellation up to 72 hours before pickup. 25% fee within 72 hours.";
    case "1week":
      return "Free cancellation up to 1 week before pickup. 50% fee within 1 week.";
    case "strict":
      return "Strict policy: no refunds after booking confirmation.";
    default:
      return "Free cancellation up to 48 hours before pickup.";
  }
};

const toEquipment = (
  id: string,
  doc: FirestoreEquipmentDocument,
): Equipment => {
  const owner = {
    id: doc.ownerId,
    name: doc.ownerName,
    rating: 5,
    totalRentals: doc.totalRentals,
    verified: doc.ownerVerified ?? false,
    location: doc.ownerLocation || "N/A",
    memberSince: new Date(),
    responseRate: 100,
    responseTime: "< 24 hours",
  };

  return {
    id,
    name: doc.name,
    description: doc.description,
    category: doc.category,
    images: doc.images,
    pricePerDay: doc.pricePerDay,
    securityDeposit: doc.securityDeposit,
    serviceFeePercent: doc.serviceFeePercent,
    owner,
    availability: {
      blockedDates: [],
      minRentalDays: doc.minRentalDays,
      bufferDays: doc.bufferDays,
      availableRanges: [
        {
          start: new Date(),
          end: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        },
      ],
    },
    features: doc.features,
    usageNotes: doc.usageNotes,
    insuranceProtected: doc.insuranceProtected,
    condition: doc.condition,
    totalRentals: doc.totalRentals,
    reviews: [],
    cancellationPolicy: doc.cancellationPolicy,
    locationId: doc.locationId,
    locationName: doc.locationName,
    locationMapUrl: doc.locationMapUrl,
    createdAt: doc.createdAt,
  };
};

export const getFirebaseEquipment = async (): Promise<Equipment[]> => {
  const documents = await getDocuments<
    FirestoreEquipmentDocument & { id: string }
  >(EQUIPMENT_COLLECTION);
  return documents.map((document) => toEquipment(document.id, document));
};

export const subscribeFirebaseEquipment = (
  onNext: (equipment: Equipment[]) => void,
  onError?: (error: Error) => void
) => {
  return subscribeDocuments<FirestoreEquipmentDocument & { id: string }>(
    EQUIPMENT_COLLECTION,
    (documents) => {
      onNext(documents.map((document) => toEquipment(document.id, document)));
    },
    [],
    onError
  );
};

export const subscribeFirebaseEquipmentById = (
  equipmentId: string,
  onNext: (equipment: Equipment | null) => void,
  onError?: (error: Error) => void
) => {
  return subscribeDocument<FirestoreEquipmentDocument>(
    EQUIPMENT_COLLECTION,
    equipmentId,
    (document) => {
      if (!document) {
        onNext(null);
        return;
      }
      onNext(toEquipment(document.id, document));
    },
    onError
  );
};

export const addFirebaseEquipment = async (
  input: EquipmentCreateInput,
): Promise<Equipment> => {
  const equipmentId = `fb-${globalThis.crypto?.randomUUID?.() || Date.now()}`;

  const locationName = input.locationName || "Custom Location";

  const document: FirestoreEquipmentDocument = {
    name: input.name,
    description: input.description,
    category: input.category,
    images: input.photos,
    pricePerDay: input.pricePerDay,
    securityDeposit: input.securityDeposit,
    serviceFeePercent: 10,
    ownerId: input.ownerId,
    ownerName: input.ownerName,
    ownerEmail: input.ownerEmail,
    ownerLocation: input.ownerLocation,
    ownerVerified: input.ownerVerified,
    locationId: input.locationId,
    locationName,
    locationMapUrl: input.locationMapUrl,
    minRentalDays: input.minRentalDays,
    bufferDays: input.bufferDays,
    condition: input.condition,
    features: input.features,
    usageNotes: input.usageNotes,
    insuranceProtected: input.insuranceProtected,
    cancellationPolicy: mapCancellationPolicy(input.cancellationPolicy),
    totalRentals: 0,
    createdAt: new Date().toISOString(),
  };

  await createDocument(EQUIPMENT_COLLECTION, equipmentId, document);

  return toEquipment(equipmentId, document);
};
