// GearShift V3 Mock Data - B2B Equipment Rental Marketplace

export type EquipmentCategory =
  | "construction"
  | "events"
  | "manufacturing"
  | "cleaning"
  | "logistics";

export type RentalStatus =
  | "requested"
  | "approved"
  | "active"
  | "completed"
  | "declined"
  | "extension_requested";

export type EquipmentCondition = "excellent" | "good" | "fair";

export type UserRole = "owner" | "operations_manager" | "finance";

export interface Review {
  id: string;
  renterId: string;
  renterName: string;
  rating: number;
  comment: string;
  date: Date;
  highlights: string[];
}

export interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
  equipmentCount: number;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  locationAccess: string[]; // Location IDs they can access
}

export interface Business {
  id: string;
  name: string;
  logo?: string;
  rating: number;
  totalRentals: number;
  verified: boolean;
  location: string;
  distance?: number;
  repeatRenter?: boolean;
  memberSince: Date;
  responseRate: number;
  responseTime: string;
  locations?: Location[];
  teamMembers?: TeamMember[];
}

export interface AvailabilitySettings {
  blockedDates: Date[];
  minRentalDays: number;
  bufferDays: number;
  availableRanges: { start: Date; end: Date }[];
}

export interface Equipment {
  id: string;
  name: string;
  description: string;
  category: EquipmentCategory;
  images: string[];
  pricePerDay: number;
  securityDeposit: number;
  serviceFeePercent: number;
  owner: Business;
  availability: AvailabilitySettings;
  features: string[];
  usageNotes: string;
  insuranceProtected: boolean;
  condition: EquipmentCondition;
  totalRentals: number;
  reviews: Review[];
  cancellationPolicy: string;
  isFavorite?: boolean;
  locationId?: string; // V3: Multi-location support
  locationName?: string;
  locationMapUrl?: string;
  createdAt?: string;
  operatorAvailable?: boolean; // Whether operator/driver is available
  operatorIncluded?: boolean; // Whether operator is included in base price
  operatorPricePerDay?: number; // Additional cost per day if operator not included
  operatorQualifications?: string; // Operator certifications/experience
}

export interface RentalRequest {
  id: string;
  equipment: Equipment;
  renter: Business;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  rentalFee: number;
  serviceFee: number;
  totalPrice: number;
  status: RentalStatus;
  createdAt: Date;
  ownerNotes?: string;
  pickupChecklist?: ChecklistItem[];
  returnChecklist?: ChecklistItem[];
  extensionRequest?: {
    newEndDate: Date;
    additionalDays: number;
    additionalCost: number;
    status: "pending" | "approved" | "declined";
    paymentStatus?: "pending" | "paid";
    paymentReference?: string;
  };
  paymentStatus?: "pending" | "paid";
  paymentPaidAt?: Date;
  paymentReference?: string;
  purpose?: string;
  destination?: string;
  notes?: string;
  operatorRequested?: boolean; // Whether renter wants an operator
  operatorFee?: number; // Total operator fee for rental period
}

export interface ChecklistItem {
  id: string;
  label: string;
  checked: boolean;
  assessment?: "pass" | "attention" | "critical";
  notes?: string;
}

export interface CurrentUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  businessId: string;
  businessName: string;
  avatar?: string;
  locationAccess: string[];
}

export const roleLabels: Record<
  UserRole,
  { label: string; description: string; color: string }
> = {
  owner: {
    label: "Business Owner",
    description:
      "Full access to all features including financials and team management",
    color: "text-primary",
  },
  operations_manager: {
    label: "Operations Manager",
    description: "Manage equipment, rentals, and day-to-day operations",
    color: "text-accent",
  },
  finance: {
    label: "Finance Admin",
    description: "View-only access to financial reports and earnings",
    color: "text-success",
  },
};

export const defaultPickupChecklist: ChecklistItem[] = [
  { id: "p1", label: "Equipment matches listing photos", checked: false },
  {
    id: "p2",
    label: "All accessories and attachments present",
    checked: false,
  },
  { id: "p3", label: "Fuel/power level noted", checked: false },
  { id: "p4", label: "Any existing damage documented", checked: false },
  { id: "p5", label: "Operating instructions received", checked: false },
];

export const defaultReturnChecklist: ChecklistItem[] = [
  { id: "r1", label: "Equipment cleaned and ready", checked: false },
  { id: "r2", label: "All accessories returned", checked: false },
  { id: "r3", label: "Fuel/power level restored", checked: false },
  { id: "r4", label: "Any new damage reported", checked: false },
  { id: "r5", label: "Keys/access returned", checked: false },
];

// V3: Multi-location data
export const mockLocations: Location[] = [
  {
    id: "loc1",
    name: "Main Warehouse",
    address: "1234 Industrial Blvd",
    city: "San Francisco",
    state: "CA",
    zipCode: "94107",
    isDefault: true,
    equipmentCount: 4,
  },
  {
    id: "loc2",
    name: "East Bay Depot",
    address: "567 Commerce Way",
    city: "Oakland",
    state: "CA",
    zipCode: "94612",
    isDefault: false,
    equipmentCount: 2,
  },
  {
    id: "loc3",
    name: "South Bay Storage",
    address: "890 Tech Park Drive",
    city: "San Jose",
    state: "CA",
    zipCode: "95110",
    isDefault: false,
    equipmentCount: 1,
  },
];

// V3: Team members
export const mockTeamMembers: TeamMember[] = [
  {
    id: "tm1",
    name: "John Mitchell",
    email: "john@buildright.com",
    role: "owner",
    locationAccess: ["loc1", "loc2", "loc3"],
  },
  {
    id: "tm2",
    name: "Sarah Chen",
    email: "sarah@buildright.com",
    role: "operations_manager",
    locationAccess: ["loc1", "loc2"],
  },
  {
    id: "tm3",
    name: "Mike Johnson",
    email: "mike@buildright.com",
    role: "finance",
    locationAccess: ["loc1", "loc2", "loc3"],
  },
];

export const mockBusinesses: Business[] = [
  {
    id: "b1",
    name: "BuildRight Construction",
    rating: 4.8,
    totalRentals: 47,
    verified: true,
    location: "San Francisco, CA",
    distance: 2.3,
    memberSince: new Date("2022-03-15"),
    responseRate: 98,
    responseTime: "< 2 hours",
    locations: mockLocations,
    teamMembers: mockTeamMembers,
  },
  {
    id: "b2",
    name: "EventPro Solutions",
    rating: 4.9,
    totalRentals: 123,
    verified: true,
    location: "Oakland, CA",
    distance: 5.1,
    repeatRenter: true,
    memberSince: new Date("2021-08-22"),
    responseRate: 100,
    responseTime: "< 1 hour",
  },
  {
    id: "b3",
    name: "PrecisionTech Manufacturing",
    rating: 4.7,
    totalRentals: 31,
    verified: true,
    location: "San Jose, CA",
    distance: 12.4,
    memberSince: new Date("2023-01-10"),
    responseRate: 95,
    responseTime: "< 4 hours",
  },
  {
    id: "b4",
    name: "CleanForce Services",
    rating: 4.6,
    totalRentals: 89,
    verified: true,
    location: "Berkeley, CA",
    distance: 8.7,
    repeatRenter: true,
    memberSince: new Date("2022-11-05"),
    responseRate: 92,
    responseTime: "< 6 hours",
  },
];

const sampleReviews: Review[] = [
  {
    id: "rev1",
    renterId: "b2",
    renterName: "EventPro Solutions",
    rating: 5,
    comment:
      "Excellent condition, started right up. Owner was very helpful with operating tips.",
    date: new Date("2024-01-15"),
    highlights: ["Well maintained", "On-time handoff"],
  },
  {
    id: "rev2",
    renterId: "b3",
    renterName: "PrecisionTech Manufacturing",
    rating: 4,
    comment:
      "Good equipment, minor wear but performed as expected for our project.",
    date: new Date("2024-01-08"),
    highlights: ["Reliable performance"],
  },
  {
    id: "rev3",
    renterId: "b4",
    renterName: "CleanForce Services",
    rating: 5,
    comment:
      "Second time renting this. Always in great shape and owner is professional.",
    date: new Date("2023-12-20"),
    highlights: ["Well maintained", "Professional owner", "Repeat customer"],
  },
];

const equipmentImagePlaceholder = (label: string, from: string, to: string) =>
  `data:image/svg+xml,${encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1024 640'>
      <defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0%' stop-color='${from}'/><stop offset='100%' stop-color='${to}'/></linearGradient></defs>
      <rect width='1024' height='640' fill='url(#g)'/>
      <circle cx='210' cy='160' r='120' fill='white' fill-opacity='.08'/>
      <circle cx='860' cy='500' r='170' fill='white' fill-opacity='.12'/>
      <text x='512' y='350' text-anchor='middle' fill='white' fill-opacity='.9' font-family='Arial' font-size='52' font-weight='700'>${label}</text>
    </svg>`,
  )}`;

const equipmentImages = {
  excavator: equipmentImagePlaceholder("Excavator", "#1f2937", "#334155"),
  forklift: equipmentImagePlaceholder("Forklift", "#0f766e", "#155e75"),
  generator: equipmentImagePlaceholder("Generator", "#374151", "#1f2937"),
  event: equipmentImagePlaceholder("Event Package", "#4338ca", "#1d4ed8"),
  cnc: equipmentImagePlaceholder("CNC Machine", "#111827", "#4b5563"),
  washer: equipmentImagePlaceholder("Pressure Washer", "#0c4a6e", "#0369a1"),
} as const;

export const mockEquipment: Equipment[] = [
  {
    id: "e1",
    name: "CAT 320 Excavator",
    description:
      "Heavy-duty hydraulic excavator perfect for earthmoving, trenching, and demolition projects. Well-maintained with low hours.",
    category: "construction",
    images: [equipmentImages.excavator],
    pricePerDay: 850,
    securityDeposit: 5000,
    serviceFeePercent: 10,
    owner: mockBusinesses[0],
    availability: {
      blockedDates: [new Date("2024-02-14"), new Date("2024-02-15")],
      minRentalDays: 3,
      bufferDays: 1,
      availableRanges: [
        { start: new Date("2024-01-15"), end: new Date("2024-06-30") },
      ],
    },
    features: ["GPS Tracking", "Climate Control Cab", "Quick Coupler"],
    usageNotes: "Operator certification required. Fuel not included.",
    insuranceProtected: true,
    condition: "excellent",
    totalRentals: 24,
    reviews: sampleReviews,
    cancellationPolicy:
      "Free cancellation up to 48 hours before pickup. 50% refund within 48 hours. No refund for no-shows.",
    locationId: "loc1",
    locationName: "Main Warehouse",
  },
  {
    id: "e2",
    name: "Toyota 8FGU25 Forklift",
    description:
      "Reliable 5,000 lb capacity forklift ideal for warehouse and loading dock operations. Excellent fuel efficiency.",
    category: "logistics",
    images: [equipmentImages.forklift],
    pricePerDay: 275,
    securityDeposit: 2000,
    serviceFeePercent: 10,
    owner: mockBusinesses[0],
    availability: {
      blockedDates: [],
      minRentalDays: 1,
      bufferDays: 0,
      availableRanges: [
        { start: new Date("2024-01-01"), end: new Date("2024-12-31") },
      ],
    },
    features: ["Pneumatic Tires", "Side Shift", "Fork Positioning"],
    usageNotes: "Valid forklift certification required for operators.",
    insuranceProtected: true,
    condition: "good",
    totalRentals: 67,
    reviews: [sampleReviews[1], sampleReviews[2]],
    cancellationPolicy:
      "Free cancellation up to 24 hours before pickup. No refund after that.",
    locationId: "loc1",
    locationName: "Main Warehouse",
  },
  {
    id: "e3",
    name: "50kW Diesel Generator",
    description:
      "Commercial-grade portable generator for construction sites, events, and emergency backup. Ultra-quiet operation.",
    category: "events",
    images: [equipmentImages.generator],
    pricePerDay: 425,
    securityDeposit: 3000,
    serviceFeePercent: 10,
    owner: mockBusinesses[1],
    availability: {
      blockedDates: [
        new Date("2024-03-01"),
        new Date("2024-03-02"),
        new Date("2024-03-03"),
      ],
      minRentalDays: 2,
      bufferDays: 1,
      availableRanges: [
        { start: new Date("2024-02-01"), end: new Date("2024-12-31") },
      ],
    },
    features: ["Auto Transfer Switch", "Sound Attenuated", "Digital Controls"],
    usageNotes:
      "Diesel fuel not included. Delivery available for additional fee.",
    insuranceProtected: true,
    condition: "excellent",
    totalRentals: 89,
    reviews: sampleReviews,
    cancellationPolicy:
      "Free cancellation up to 72 hours before pickup. 25% fee within 72 hours.",
    locationId: "loc2",
    locationName: "East Bay Depot",
  },
  {
    id: "e4",
    name: "Professional Event Lighting & Audio Package",
    description:
      "Complete lighting and sound system for corporate events, conferences, and productions. Includes setup guide.",
    category: "events",
    images: [equipmentImages.event],
    pricePerDay: 650,
    securityDeposit: 4000,
    serviceFeePercent: 10,
    owner: mockBusinesses[1],
    availability: {
      blockedDates: [],
      minRentalDays: 1,
      bufferDays: 0,
      availableRanges: [
        { start: new Date("2024-01-20"), end: new Date("2024-08-15") },
      ],
    },
    features: ["16-Channel Mixer", "LED Par Cans", "Wireless Microphones"],
    usageNotes:
      "Basic setup assistance included. Full technician support available.",
    insuranceProtected: true,
    condition: "good",
    totalRentals: 45,
    reviews: [sampleReviews[0]],
    cancellationPolicy: "Free cancellation up to 48 hours before pickup.",
    locationId: "loc2",
    locationName: "East Bay Depot",
  },
  {
    id: "e5",
    name: "Haas VF-2 CNC Milling Machine",
    description:
      "Precision vertical machining center for prototyping and small batch production. Includes tool library.",
    category: "manufacturing",
    images: [equipmentImages.cnc],
    pricePerDay: 1200,
    securityDeposit: 10000,
    serviceFeePercent: 10,
    owner: mockBusinesses[2],
    availability: {
      blockedDates: [],
      minRentalDays: 5,
      bufferDays: 2,
      availableRanges: [
        { start: new Date("2024-03-01"), end: new Date("2024-09-30") },
      ],
    },
    features: [
      "40-Taper Spindle",
      "20-Position Tool Changer",
      "Probing System",
    ],
    usageNotes: "CNC programming experience required. Training available.",
    insuranceProtected: true,
    condition: "excellent",
    totalRentals: 12,
    reviews: [sampleReviews[1]],
    cancellationPolicy:
      "Free cancellation up to 1 week before pickup. 50% fee within 1 week.",
    locationId: "loc3",
    locationName: "South Bay Storage",
  },
  {
    id: "e6",
    name: "Commercial Pressure Washer System",
    description:
      "Industrial-grade hot water pressure washer for deep cleaning, surface preparation, and maintenance.",
    category: "cleaning",
    images: [equipmentImages.washer],
    pricePerDay: 185,
    securityDeposit: 800,
    serviceFeePercent: 10,
    owner: mockBusinesses[3],
    availability: {
      blockedDates: [],
      minRentalDays: 1,
      bufferDays: 0,
      availableRanges: [
        { start: new Date("2024-01-01"), end: new Date("2024-12-31") },
      ],
    },
    features: ["4000 PSI", "Hot Water", "50ft Hose"],
    usageNotes: "Safety training video must be viewed before use.",
    insuranceProtected: true,
    condition: "fair",
    totalRentals: 156,
    reviews: sampleReviews,
    cancellationPolicy: "Free cancellation anytime before pickup.",
    locationId: "loc1",
    locationName: "Main Warehouse",
  },
];

export const mockRentalRequests: RentalRequest[] = [
  {
    id: "r1",
    equipment: mockEquipment[0],
    renter: mockBusinesses[1],
    startDate: new Date("2024-02-15"),
    endDate: new Date("2024-02-22"),
    totalDays: 7,
    rentalFee: 5950,
    serviceFee: 595,
    totalPrice: 6545,
    status: "requested",
    createdAt: new Date("2024-02-10"),
    pickupChecklist: defaultPickupChecklist,
    returnChecklist: defaultReturnChecklist,
  },
  {
    id: "r2",
    equipment: mockEquipment[1],
    renter: mockBusinesses[2],
    startDate: new Date("2024-02-01"),
    endDate: new Date("2024-02-05"),
    totalDays: 4,
    rentalFee: 1100,
    serviceFee: 110,
    totalPrice: 1210,
    status: "approved",
    createdAt: new Date("2024-01-28"),
    ownerNotes:
      "Please coordinate pickup time the day before. Equipment will be at main warehouse.",
    pickupChecklist: defaultPickupChecklist,
    returnChecklist: defaultReturnChecklist,
  },
  {
    id: "r3",
    equipment: mockEquipment[2],
    renter: mockBusinesses[0],
    startDate: new Date("2024-01-20"),
    endDate: new Date("2024-01-25"),
    totalDays: 5,
    rentalFee: 2125,
    serviceFee: 212,
    totalPrice: 2337,
    status: "active",
    createdAt: new Date("2024-01-15"),
    pickupChecklist: defaultPickupChecklist.map((item) => ({
      ...item,
      checked: true,
    })),
    returnChecklist: defaultReturnChecklist,
    extensionRequest: {
      newEndDate: new Date("2024-01-28"),
      additionalDays: 3,
      additionalCost: 1275,
      status: "pending",
    },
  },
  {
    id: "r4",
    equipment: mockEquipment[3],
    renter: mockBusinesses[3],
    startDate: new Date("2024-01-10"),
    endDate: new Date("2024-01-12"),
    totalDays: 2,
    rentalFee: 1300,
    serviceFee: 130,
    totalPrice: 1430,
    status: "completed",
    createdAt: new Date("2024-01-05"),
    pickupChecklist: defaultPickupChecklist.map((item) => ({
      ...item,
      checked: true,
    })),
    returnChecklist: defaultReturnChecklist.map((item) => ({
      ...item,
      checked: true,
    })),
  },
];

export const categoryLabels: Record<EquipmentCategory, string> = {
  construction: "Construction",
  events: "Events & Production",
  manufacturing: "Manufacturing",
  cleaning: "Cleaning & Maintenance",
  logistics: "Logistics & Warehouse",
};

export const conditionLabels: Record<
  EquipmentCondition,
  { label: string; color: string }
> = {
  excellent: { label: "Excellent", color: "text-success" },
  good: { label: "Good", color: "text-primary" },
  fair: { label: "Fair", color: "text-warning" },
};

export const statusColors: Record<
  RentalStatus,
  { bg: string; text: string; label: string }
> = {
  requested: {
    bg: "bg-warning/10",
    text: "text-warning",
    label: "Pending Approval",
  },
  approved: { bg: "bg-primary/10", text: "text-primary", label: "Approved" },
  active: { bg: "bg-success/10", text: "text-success", label: "Active" },
  completed: {
    bg: "bg-muted",
    text: "text-muted-foreground",
    label: "Completed",
  },
  declined: {
    bg: "bg-destructive/10",
    text: "text-destructive",
    label: "Declined",
  },
  extension_requested: {
    bg: "bg-accent/10",
    text: "text-accent",
    label: "Extension Requested",
  },
};

export type SortOption =
  | "most_rented"
  | "highest_rated"
  | "closest"
  | "price_low"
  | "price_high";

export const sortOptions: { value: SortOption; label: string }[] = [
  { value: "most_rented", label: "Most Rented" },
  { value: "highest_rated", label: "Highest Rated" },
  { value: "closest", label: "Closest" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
];
