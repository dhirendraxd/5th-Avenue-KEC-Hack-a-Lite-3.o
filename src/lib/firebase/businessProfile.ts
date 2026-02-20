import { createDocument, getDocument } from "./firestore";

const BUSINESS_PROFILES_COLLECTION = "businessProfiles";

export interface BusinessProfile {
  userId: string;
  businessName: string;
  legalBusinessName: string;
  registrationNumber: string;
  panNumber: string;
  contactPhone: string;
  businessAddress: string;
  city: string;
  website: string;
  verificationDocumentUrl: string;
  aboutBusiness: string;
  isProfileComplete: boolean;
  updatedAt: string;
}

export type BusinessProfileInput = Omit<
  BusinessProfile,
  "userId" | "isProfileComplete" | "updatedAt"
>;

const REQUIRED_FIELDS: Array<keyof BusinessProfileInput> = [
  "businessName",
  "legalBusinessName",
  "registrationNumber",
  "panNumber",
  "contactPhone",
  "businessAddress",
  "city",
];

const getStorageKey = (userId: string) =>
  `gearshift_business_profile_${userId}`;

const normalizeInput = (input: BusinessProfileInput): BusinessProfileInput => ({
  businessName: input.businessName.trim(),
  legalBusinessName: input.legalBusinessName.trim(),
  registrationNumber: input.registrationNumber.trim(),
  panNumber: input.panNumber.trim(),
  contactPhone: input.contactPhone.trim(),
  businessAddress: input.businessAddress.trim(),
  city: input.city.trim(),
  website: input.website.trim(),
  verificationDocumentUrl: input.verificationDocumentUrl.trim(),
  aboutBusiness: input.aboutBusiness.trim(),
});

const isProfileInputComplete = (input: BusinessProfileInput): boolean => {
  const normalized = normalizeInput(input);
  return REQUIRED_FIELDS.every((field) => normalized[field].length > 0);
};

const toProfile = (
  userId: string,
  input: BusinessProfileInput,
): BusinessProfile => {
  const normalized = normalizeInput(input);
  return {
    userId,
    ...normalized,
    isProfileComplete: isProfileInputComplete(normalized),
    updatedAt: new Date().toISOString(),
  };
};

export const getStoredBusinessProfile = (
  userId: string,
): BusinessProfile | null => {
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (!raw) return null;
    return JSON.parse(raw) as BusinessProfile;
  } catch {
    return null;
  }
};

const saveStoredBusinessProfile = (
  userId: string,
  profile: BusinessProfile,
) => {
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(profile));
  } catch {
    // Ignore localStorage errors silently
  }
};

export const getBusinessProfile = async (
  userId: string,
): Promise<BusinessProfile | null> => {
  const localProfile = getStoredBusinessProfile(userId);

  try {
    const remoteProfile = await getDocument<BusinessProfile>(
      BUSINESS_PROFILES_COLLECTION,
      userId,
    );

    if (remoteProfile) {
      saveStoredBusinessProfile(userId, remoteProfile);
      return remoteProfile;
    }
  } catch (error) {
    console.error("Failed to load business profile from Firebase:", error);
  }

  return localProfile;
};

export const saveBusinessProfile = async (
  userId: string,
  input: BusinessProfileInput,
): Promise<BusinessProfile> => {
  const profile = toProfile(userId, input);

  try {
    await createDocument(BUSINESS_PROFILES_COLLECTION, userId, profile);
  } catch (error) {
    console.error("Failed to save business profile to Firebase:", error);
  }

  saveStoredBusinessProfile(userId, profile);
  return profile;
};

export const getDefaultBusinessProfileInput = (
  fallbackBusinessName = "",
): BusinessProfileInput => ({
  businessName: fallbackBusinessName,
  legalBusinessName: "",
  registrationNumber: "",
  panNumber: "",
  contactPhone: "",
  businessAddress: "",
  city: "",
  website: "",
  verificationDocumentUrl: "",
  aboutBusiness: "",
});

export const getCompletedFieldsCount = (
  input: BusinessProfileInput,
): number => {
  const normalized = normalizeInput(input);
  return REQUIRED_FIELDS.filter((field) => normalized[field].length > 0).length;
};

export const getRequiredFieldsCount = () => REQUIRED_FIELDS.length;

export const isBusinessProfileReadyForVerification = (
  input: BusinessProfileInput,
): boolean => isProfileInputComplete(input);
