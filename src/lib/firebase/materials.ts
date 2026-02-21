import {
  createDocument,
  subscribeDocuments,
  updateDocument,
} from "./firestore";
import {
  MaterialCategory,
  MaterialCondition,
  MaterialListing,
} from "@/lib/materialsMock";

const MATERIALS_COLLECTION = "materials";

interface FirestoreMaterialDocument {
  name: string;
  category: MaterialCategory;
  condition: MaterialCondition;
  imageUrl: string;
  price: number;
  isFree: boolean;
  locationName: string;
  locationMapUrl?: string;
  latitude: number;
  longitude: number;
  contactName: string;
  contactPhone: string;
  notes?: string;
  sellerId?: string;
  createdAt: string;
}

export interface MaterialCreateInput {
  name: string;
  category: MaterialCategory;
  condition: MaterialCondition;
  imageUrl: string;
  price: number;
  isFree: boolean;
  locationName: string;
  locationMapUrl?: string;
  latitude: number;
  longitude: number;
  contactName: string;
  contactPhone: string;
  notes?: string;
  sellerId?: string;
}

const toMaterialListing = (
  id: string,
  document: FirestoreMaterialDocument,
): MaterialListing => ({
  id,
  name: document.name,
  category: document.category,
  condition: document.condition,
  imageUrl: document.imageUrl,
  price: document.price,
  isFree: document.isFree,
  locationName: document.locationName,
  locationMapUrl: document.locationMapUrl,
  latitude: document.latitude,
  longitude: document.longitude,
  contactName: document.contactName,
  contactPhone: document.contactPhone,
  sellerId: document.sellerId,
  createdAt: document.createdAt,
  notes: document.notes,
});

export interface MaterialUpdateInput {
  name?: string;
  price?: number;
  isFree?: boolean;
  locationName?: string;
  locationMapUrl?: string;
  contactPhone?: string;
  notes?: string;
}

export const createFirebaseMaterial = async (
  input: MaterialCreateInput,
): Promise<MaterialListing> => {
  const materialId = `mat-${globalThis.crypto?.randomUUID?.() || Date.now()}`;

  const document: FirestoreMaterialDocument = {
    name: input.name,
    category: input.category,
    condition: input.condition,
    imageUrl: input.imageUrl,
    price: input.isFree ? 0 : input.price,
    isFree: input.isFree,
    locationName: input.locationName,
    latitude: input.latitude,
    longitude: input.longitude,
    contactName: input.contactName,
    contactPhone: input.contactPhone,
    createdAt: new Date().toISOString(),
  };

  if (input.locationMapUrl !== undefined) {
    document.locationMapUrl = input.locationMapUrl;
  }
  if (input.notes !== undefined) {
    document.notes = input.notes;
  }
  if (input.sellerId !== undefined) {
    document.sellerId = input.sellerId;
  }

  await createDocument(MATERIALS_COLLECTION, materialId, document);
  return toMaterialListing(materialId, document);
};

export const subscribeFirebaseMaterials = (
  onNext: (listings: MaterialListing[]) => void,
  onError?: (error: Error) => void,
) => {
  return subscribeDocuments<FirestoreMaterialDocument & { id: string }>(
    MATERIALS_COLLECTION,
    (documents) => {
      onNext(
        documents.map((document) => toMaterialListing(document.id, document)),
      );
    },
    [],
    onError,
  );
};

export const updateFirebaseMaterial = async (
  materialId: string,
  input: MaterialUpdateInput,
) => {
  const payload: Partial<FirestoreMaterialDocument> = {};

  if (input.name !== undefined) payload.name = input.name;
  if (input.isFree !== undefined) payload.isFree = input.isFree;
  if (input.price !== undefined) payload.price = input.price;
  if (input.locationName !== undefined)
    payload.locationName = input.locationName;
  if (input.locationMapUrl !== undefined)
    payload.locationMapUrl = input.locationMapUrl;
  if (input.contactPhone !== undefined)
    payload.contactPhone = input.contactPhone;
  if (input.notes !== undefined) payload.notes = input.notes;

  await updateDocument<FirestoreMaterialDocument>(
    MATERIALS_COLLECTION,
    materialId,
    payload,
  );
};
