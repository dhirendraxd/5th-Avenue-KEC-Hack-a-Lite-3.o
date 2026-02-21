const placeholderImage = (label: string, from: string, to: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 500'>
      <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stop-color='${from}'/><stop offset='100%' stop-color='${to}'/></linearGradient></defs>
      <rect width='800' height='500' fill='url(#g)'/>
      <circle cx='140' cy='110' r='86' fill='white' fill-opacity='.08'/>
      <circle cx='670' cy='390' r='120' fill='white' fill-opacity='.12'/>
      <text x='400' y='270' text-anchor='middle' fill='white' fill-opacity='.9' font-family='Arial' font-size='42' font-weight='700'>${label}</text>
    </svg>`,
  )}`;

export type MaterialCategory = "wood" | "metal" | "concrete";

export type MaterialCondition = "sealed" | "new" | "used";

export type HistoryEventType =
  | "listed"
  | "reserved"
  | "sold"
  | "condition_change";

export interface HistoryEvent {
  date: string;
  type: HistoryEventType;
  description: string;
  owner?: string;
  condition?: MaterialCondition;
}

export interface MaterialListing {
  id: string;
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
  sellerId?: string;
  createdAt?: string;
  notes?: string;
  history?: HistoryEvent[];
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

const conditionPool: MaterialCondition[] = ["sealed", "new", "used"];

export const pickRandomCondition = (): MaterialCondition =>
  conditionPool[Math.floor(Math.random() * conditionPool.length)];

export const materialImages = {
  cement: placeholderImage("Cement", "#6b7280", "#334155"),
  rod: placeholderImage("TMT Rods", "#64748b", "#1f2937"),
  plywood: placeholderImage("Plywood", "#a16207", "#78350f"),
  redOxide: placeholderImage("Floor Paint", "#991b1b", "#7f1d1d"),
} as const;

const baseMaterialListings: Array<Omit<MaterialListing, "condition">> = [
  {
    id: "mat-001",
    name: "Cement Bags 4kg",
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
    history: [
      {
        date: "2026-02-21",
        type: "listed",
        description: "First listed by Arjun",
      },
      {
        date: "2026-02-20",
        type: "reserved",
        description: "Reserved by Ramesh Kumar",
        owner: "Ramesh Kumar",
        condition: "new",
      },
      { date: "2026-02-15", type: "sold", description: "Sold to Ramesh Kumar" },
      {
        date: "2026-02-10",
        type: "condition_change",
        description: "Condition updated from sealed to new",
        condition: "new",
      },
    ],
  },
  {
    id: "mat-002",
    name: "TMT Rods 12MM",
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
    history: [
      { date: "2026-02-21", type: "listed", description: "Listed by Neha" },
      {
        date: "2026-02-18",
        type: "reserved",
        description: "Reserved by Prakash Singh",
        owner: "Prakash Singh",
        condition: "used",
      },
      {
        date: "2026-02-12",
        type: "condition_change",
        description: "Condition changed from new to used",
        condition: "used",
      },
    ],
  },
  {
    id: "mat-003",
    name: "Plywood 8x4",
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
    history: [
      {
        date: "2026-02-21",
        type: "listed",
        description: "Listed for free donation by Ravi",
      },
      {
        date: "2026-02-19",
        type: "condition_change",
        description: "Condition noted as used",
        condition: "used",
      },
      {
        date: "2026-02-10",
        type: "sold",
        description: "Previously owned by Rishab Patel",
        owner: "Rishab Patel",
      },
    ],
  },
  {
    id: "mat-004",
    name: "Floor Paint Red",
    category: "concrete",
    imageUrl: materialImages.redOxide,
    price: 150,
    isFree: false,
    locationName: "Kalanki",
    latitude: 27.6944,
    longitude: 85.281,
    contactName: "Sita",
    contactPhone: "+91 90000 00004",
    history: [
      { date: "2026-02-21", type: "listed", description: "Listed by Sita" },
      {
        date: "2026-02-01",
        type: "sold",
        description: "Previously owned by Bikram Tamang",
        owner: "Bikram Tamang",
      },
      {
        date: "2026-01-25",
        type: "condition_change",
        description: "Partially used, condition changed",
        condition: "used",
      },
    ],
  },
];

export const mockMaterialListings: MaterialListing[] = baseMaterialListings.map(
  (listing) => ({
    ...listing,
    condition: pickRandomCondition(),
  }),
);
