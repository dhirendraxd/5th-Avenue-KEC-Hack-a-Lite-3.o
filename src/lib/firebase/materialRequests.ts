import {
  createDocument,
  subscribeDocuments,
  updateDocument,
} from "./firestore";

const MATERIAL_REQUESTS_COLLECTION = "materialRequests";

export type MaterialRequestStatus =
  | "requested"
  | "approved"
  | "declined"
  | "completed";

export interface MaterialRequest {
  id: string;
  materialId: string;
  materialName: string;
  materialImageUrl: string;
  sellerId?: string;
  sellerName: string;
  requesterId?: string;
  requesterName: string;
  pickupLocation: string;
  paymentMethod: "cod" | "advance";
  paymentStatus?: "pending" | "paid";
  paymentPaidAt?: Date;
  paymentReference?: string;
  status: MaterialRequestStatus;
  createdAt: Date;
}

interface FirestoreMaterialRequestDocument {
  materialId: string;
  materialName: string;
  materialImageUrl: string;
  sellerId?: string;
  sellerName: string;
  requesterId?: string;
  requesterName: string;
  pickupLocation: string;
  paymentMethod: "cod" | "advance";
  paymentStatus?: "pending" | "paid";
  paymentPaidAt?: string;
  paymentReference?: string;
  status: MaterialRequestStatus;
  createdAt: string;
}

export interface CreateMaterialRequestInput {
  materialId: string;
  materialName: string;
  materialImageUrl: string;
  sellerId?: string;
  sellerName: string;
  requesterId?: string;
  requesterName: string;
  pickupLocation: string;
  paymentMethod: "cod" | "advance";
}

const toMaterialRequest = (
  id: string,
  doc: FirestoreMaterialRequestDocument,
): MaterialRequest => ({
  id,
  materialId: doc.materialId,
  materialName: doc.materialName,
  materialImageUrl: doc.materialImageUrl,
  sellerId: doc.sellerId,
  sellerName: doc.sellerName,
  requesterId: doc.requesterId,
  requesterName: doc.requesterName,
  pickupLocation: doc.pickupLocation,
  paymentMethod: doc.paymentMethod,
  paymentStatus: doc.paymentStatus || "pending",
  paymentPaidAt: doc.paymentPaidAt ? new Date(doc.paymentPaidAt) : undefined,
  paymentReference: doc.paymentReference,
  status: doc.status,
  createdAt: new Date(doc.createdAt),
});

export const createFirebaseMaterialRequest = async (
  input: CreateMaterialRequestInput,
) => {
  const requestId = `mreq-${globalThis.crypto?.randomUUID?.() || Date.now()}`;

  const doc: FirestoreMaterialRequestDocument = {
    materialId: input.materialId,
    materialName: input.materialName,
    materialImageUrl: input.materialImageUrl,
    sellerId: input.sellerId,
    sellerName: input.sellerName,
    requesterId: input.requesterId,
    requesterName: input.requesterName,
    pickupLocation: input.pickupLocation,
    paymentMethod: input.paymentMethod,
    paymentStatus: "pending",
    status: "requested",
    createdAt: new Date().toISOString(),
  };

  await createDocument(MATERIAL_REQUESTS_COLLECTION, requestId, doc);
  return toMaterialRequest(requestId, doc);
};

export const subscribeFirebaseMaterialRequests = (
  onNext: (requests: MaterialRequest[]) => void,
  onError?: (error: Error) => void,
) => {
  return subscribeDocuments<FirestoreMaterialRequestDocument & { id: string }>(
    MATERIAL_REQUESTS_COLLECTION,
    (docs) => {
      onNext(docs.map((doc) => toMaterialRequest(doc.id, doc)));
    },
    [],
    onError,
  );
};

export const updateFirebaseMaterialRequestStatus = async (
  requestId: string,
  status: MaterialRequestStatus,
) => {
  await updateDocument<FirestoreMaterialRequestDocument>(
    MATERIAL_REQUESTS_COLLECTION,
    requestId,
    { status },
  );
};

export const completeFirebaseMaterialRequestPayment = async (
  requestId: string,
  paymentReference: string,
) => {
  await updateDocument<FirestoreMaterialRequestDocument>(
    MATERIAL_REQUESTS_COLLECTION,
    requestId,
    {
      paymentStatus: "paid",
      paymentPaidAt: new Date().toISOString(),
      paymentReference,
      status: "completed",
    },
  );
};
