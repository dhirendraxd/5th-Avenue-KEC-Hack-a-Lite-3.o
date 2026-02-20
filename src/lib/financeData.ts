// V3 Finance & Analytics Mock Data

export interface Transaction {
  id: string;
  type: 'rental_income' | 'payout' | 'service_fee' | 'deposit_hold' | 'deposit_release';
  amount: number;
  description: string;
  date: Date;
  status: 'completed' | 'pending' | 'processing';
  rentalId?: string;
  equipmentName?: string;
}

export interface MonthlyEarnings {
  month: string;
  revenue: number;
  payouts: number;
  fees: number;
  net: number;
}

export interface EquipmentAnalytics {
  equipmentId: string;
  equipmentName: string;
  locationId: string;
  locationName: string;
  totalRentals: number;
  totalRevenue: number;
  daysRented: number;
  daysIdle: number;
  utilizationRate: number; // percentage
  averageRentalDuration: number;
  lastRented: Date | null;
}

export interface LocationAnalytics {
  locationId: string;
  locationName: string;
  equipmentCount: number;
  totalRentals: number;
  totalRevenue: number;
  averageUtilization: number;
  topEquipment: string;
}

// Mock transaction history
export const mockTransactions: Transaction[] = [
  {
    id: 't1',
    type: 'rental_income',
    amount: 6545,
    description: 'CAT 320 Excavator - 7 day rental',
    date: new Date('2025-12-20'),
    status: 'completed',
    rentalId: 'r1',
    equipmentName: 'CAT 320 Excavator',
  },
  {
    id: 't2',
    type: 'service_fee',
    amount: -595,
    description: 'Platform service fee (10%)',
    date: new Date('2025-12-20'),
    status: 'completed',
    rentalId: 'r1',
  },
  {
    id: 't3',
    type: 'payout',
    amount: 5950,
    description: 'Payout to bank account ****4521',
    date: new Date('2025-12-21'),
    status: 'completed',
  },
  {
    id: 't4',
    type: 'rental_income',
    amount: 1210,
    description: 'Toyota Forklift - 4 day rental',
    date: new Date('2025-12-15'),
    status: 'completed',
    rentalId: 'r2',
    equipmentName: 'Toyota 8FGU25 Forklift',
  },
  {
    id: 't5',
    type: 'deposit_hold',
    amount: 5000,
    description: 'Security deposit held - CAT 320 Excavator',
    date: new Date('2025-12-14'),
    status: 'pending',
    rentalId: 'r1',
  },
  {
    id: 't6',
    type: 'deposit_release',
    amount: 5000,
    description: 'Security deposit released - CAT 320 Excavator',
    date: new Date('2025-12-22'),
    status: 'completed',
    rentalId: 'r1',
  },
  {
    id: 't7',
    type: 'rental_income',
    amount: 2550,
    description: '50kW Generator - 6 day rental',
    date: new Date('2025-12-10'),
    status: 'completed',
    rentalId: 'r3',
    equipmentName: '50kW Diesel Generator',
  },
  {
    id: 't8',
    type: 'payout',
    amount: 2295,
    description: 'Payout to bank account ****4521',
    date: new Date('2025-12-12'),
    status: 'completed',
  },
  {
    id: 't9',
    type: 'rental_income',
    amount: 1850,
    description: 'Pressure Washer - 10 day rental',
    date: new Date('2025-12-05'),
    status: 'completed',
    rentalId: 'r4',
    equipmentName: 'Commercial Pressure Washer',
  },
  {
    id: 't10',
    type: 'payout',
    amount: 8500,
    description: 'Payout to bank account ****4521',
    date: new Date('2025-12-24'),
    status: 'processing',
  },
];

// Monthly earnings data for charts
export const mockMonthlyEarnings: MonthlyEarnings[] = [
  { month: 'Jul', revenue: 8500, payouts: 7650, fees: 850, net: 7650 },
  { month: 'Aug', revenue: 12200, payouts: 10980, fees: 1220, net: 10980 },
  { month: 'Sep', revenue: 9800, payouts: 8820, fees: 980, net: 8820 },
  { month: 'Oct', revenue: 15400, payouts: 13860, fees: 1540, net: 13860 },
  { month: 'Nov', revenue: 11200, payouts: 10080, fees: 1120, net: 10080 },
  { month: 'Dec', revenue: 14850, payouts: 13365, fees: 1485, net: 13365 },
];

// Equipment-level analytics
export const mockEquipmentAnalytics: EquipmentAnalytics[] = [
  {
    equipmentId: 'e1',
    equipmentName: 'CAT 320 Excavator',
    locationId: 'loc1',
    locationName: 'Main Warehouse',
    totalRentals: 24,
    totalRevenue: 42500,
    daysRented: 156,
    daysIdle: 54,
    utilizationRate: 74.3,
    averageRentalDuration: 6.5,
    lastRented: new Date('2025-12-22'),
  },
  {
    equipmentId: 'e2',
    equipmentName: 'Toyota 8FGU25 Forklift',
    locationId: 'loc1',
    locationName: 'Main Warehouse',
    totalRentals: 67,
    totalRevenue: 18425,
    daysRented: 201,
    daysIdle: 9,
    utilizationRate: 95.7,
    averageRentalDuration: 3,
    lastRented: new Date('2025-12-23'),
  },
  {
    equipmentId: 'e3',
    equipmentName: '50kW Diesel Generator',
    locationId: 'loc2',
    locationName: 'East Bay Depot',
    totalRentals: 89,
    totalRevenue: 37825,
    daysRented: 178,
    daysIdle: 32,
    utilizationRate: 84.8,
    averageRentalDuration: 2,
    lastRented: new Date('2025-12-20'),
  },
  {
    equipmentId: 'e4',
    equipmentName: 'Event Lighting & Audio Package',
    locationId: 'loc2',
    locationName: 'East Bay Depot',
    totalRentals: 45,
    totalRevenue: 29250,
    daysRented: 135,
    daysIdle: 75,
    utilizationRate: 64.3,
    averageRentalDuration: 3,
    lastRented: new Date('2025-12-18'),
  },
  {
    equipmentId: 'e5',
    equipmentName: 'Haas VF-2 CNC Milling Machine',
    locationId: 'loc3',
    locationName: 'South Bay Storage',
    totalRentals: 12,
    totalRevenue: 72000,
    daysRented: 60,
    daysIdle: 150,
    utilizationRate: 28.6,
    averageRentalDuration: 5,
    lastRented: new Date('2025-12-10'),
  },
  {
    equipmentId: 'e6',
    equipmentName: 'Commercial Pressure Washer',
    locationId: 'loc1',
    locationName: 'Main Warehouse',
    totalRentals: 156,
    totalRevenue: 28860,
    daysRented: 195,
    daysIdle: 15,
    utilizationRate: 92.9,
    averageRentalDuration: 1.25,
    lastRented: new Date('2025-12-24'),
  },
];

// Location-level analytics
export const mockLocationAnalytics: LocationAnalytics[] = [
  {
    locationId: 'loc1',
    locationName: 'Main Warehouse',
    equipmentCount: 4,
    totalRentals: 247,
    totalRevenue: 89785,
    averageUtilization: 87.6,
    topEquipment: 'Toyota 8FGU25 Forklift',
  },
  {
    locationId: 'loc2',
    locationName: 'East Bay Depot',
    equipmentCount: 2,
    totalRentals: 134,
    totalRevenue: 67075,
    averageUtilization: 74.6,
    topEquipment: '50kW Diesel Generator',
  },
  {
    locationId: 'loc3',
    locationName: 'South Bay Storage',
    equipmentCount: 1,
    totalRentals: 12,
    totalRevenue: 72000,
    averageUtilization: 28.6,
    topEquipment: 'Haas VF-2 CNC Milling Machine',
  },
];

// Summary stats
export const financeSummary = {
  totalEarnings: 228860,
  thisMonthEarnings: 14850,
  pendingPayouts: 8500,
  totalRentals: 393,
  averageRentalValue: 582,
  platformFeeRate: 0.10,
};
