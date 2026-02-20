import { createDocument, subscribeDocuments } from "./firestore";
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
  latitude: document.latitude,
  longitude: document.longitude,
  contactName: document.contactName,
  contactPhone: document.contactPhone,
  notes: document.notes,
});

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
    notes: input.notes,
    sellerId: input.sellerId,
    createdAt: new Date().toISOString(),
  };

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
