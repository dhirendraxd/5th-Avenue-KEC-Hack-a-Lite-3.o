import cementImg from "@/assets/cement.jpg";
import rodImg from "@/assets/rod.jpg";
import plyImg from "@/assets/ply.jpg";
import redOxideImg from "@/assets/585fceae9563cc39701441b724a3b88a.jpg";

export type MaterialCategory = "wood" | "metal" | "concrete";

export type MaterialCondition = "sealed" | "new" | "used";

export interface MaterialListing {
  id: string;
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
}

export const materialCategoryLabels: Record<MaterialCategory, string> = {
  wood: "Wood",
  metal: "Metal",
  concrete: "Concrete",
};

export const materialConditionLabels: Record<MaterialCondition, string> = {
  sealed: "Sealed",
  new: "New",
  used: "Used",
};

const conditionPool: MaterialCondition[] = ["new", "used"];

export const pickRandomCondition = (): MaterialCondition =>
  conditionPool[Math.floor(Math.random() * conditionPool.length)];

export const materialImages = {
  cement: cementImg,
  rod: rodImg,
  plywood: plyImg,
  redOxide: redOxideImg,
} as const;

const baseMaterialListings: Array<Omit<MaterialListing, "condition">> = [
  {
    id: "mat-001",
    name: "Cement Bags 4kg - सिमेन्ट",
    category: "concrete",
    imageUrl: materialImages.cement,
    price: 280,
    isFree: false,
    locationName: "Thamel",
    latitude: 27.7157,
    longitude: 85.3123,
    contactName: "Arjun",
    contactPhone: "+91 90000 00001",
    notes: "Pickup after 5 PM.",
  },
  {
    id: "mat-002",
    name: "TMT Rods 12MM - टीएमटी रडी",
    category: "metal",
    imageUrl: materialImages.rod,
    price: 520,
    isFree: false,
    locationName: "Koteshwor",
    latitude: 27.6789,
    longitude: 85.3478,
    contactName: "Neha",
    contactPhone: "+91 90000 00002",
    notes: "Min order 10 rods.",
  },
  {
    id: "mat-003",
    name: "Plywood 8x4 - प्लाइवुड",
    category: "wood",
    imageUrl: materialImages.plywood,
    price: 0,
    isFree: true,
    locationName: "Patan",
    latitude: 27.6644,
    longitude: 85.3188,
    contactName: "Ravi",
    contactPhone: "+91 90000 00003",
    notes: "Some edges worn.",
  },
  {
    id: "mat-004",
    name: "Floor Paint Red - लाल रङ",
    category: "concrete",
    imageUrl: materialImages.redOxide,
    price: 150,
    isFree: false,
    locationName: "Kalanki",
    latitude: 27.6944,
    longitude: 85.281,
    contactName: "Sita",
    contactPhone: "+91 90000 00004",
  },
];

export const mockMaterialListings: MaterialListing[] = baseMaterialListings.map(
  (listing) => ({
    ...listing,
    condition: pickRandomCondition(),
  }),
);
