export type ListingStatus = "draft" | "pending" | "accepted" | "completed" | "cancelled";

export type Listing = {
  id: string;
  material: string;
  weightKg: number;
  price: number;
  vendor: string;
  status: ListingStatus;
  createdAt: string;
  pickupAddress: string;
  preferredTime: string;
  condition: string;
  source: "manual" | "scan";
};

export type Vendor = {
  id: string;
  name: string;
  rating: number;
  distanceKm: number;
  pricePerKg: number;
  materials: string[];
  availableToday: boolean;
  verified: boolean;
};

export type ThreadMessage = {
  id: string;
  me: boolean;
  text: string;
  sentAt: string;
};

export type MessageThread = {
  id: string;
  vendor: string;
  online: boolean;
  unread: number;
  messages: ThreadMessage[];
};

export type ProfileStats = {
  name: string;
  memberSince: string;
  location: string;
  tier: string;
  greenScore: number;
  rank: number;
  treesSaved: number;
};

export type ScanResult = {
  material: string;
  category: string;
  confidence: number;
  estimatedValue: number;
  co2SavedKg: number;
  energySavedWh: number;
  suggestedVendors: string[];
};

export type MarketplaceState = {
  profile: ProfileStats;
  listings: Listing[];
  vendors: Vendor[];
  threads: MessageThread[];
  recentActivity: { text: string; when: string; earn?: string }[];
  lastScan: ScanResult;
};

export const MARKETPLACE_STORAGE_KEY = "ecoloop.marketplace.v1";

export const INITIAL_MARKETPLACE_STATE: MarketplaceState = {
  profile: {
    name: "Shreyas Kulkarni",
    memberSince: "March 2024",
    location: "Mumbai, India",
    tier: "Gold Recycler",
    greenScore: 842,
    rank: 124,
    treesSaved: 9.4,
  },
  vendors: [
    {
      id: "vendor-greencycle",
      name: "GreenCycle Co.",
      rating: 4.9,
      distanceKm: 1.2,
      pricePerKg: 30,
      materials: ["Plastic", "Paper"],
      availableToday: true,
      verified: true,
    },
    {
      id: "vendor-ecoharbor",
      name: "EcoHarbor Recyclers",
      rating: 4.8,
      distanceKm: 2.4,
      pricePerKg: 34,
      materials: ["E-Waste", "Metal"],
      availableToday: true,
      verified: true,
    },
    {
      id: "vendor-renova",
      name: "ReNova Waste Hub",
      rating: 4.7,
      distanceKm: 3.1,
      pricePerKg: 22,
      materials: ["Mixed"],
      availableToday: false,
      verified: true,
    },
    {
      id: "vendor-metalworks",
      name: "MetalWorks Recycle",
      rating: 4.9,
      distanceKm: 1.4,
      pricePerKg: 42,
      materials: ["Metal", "Aluminium"],
      availableToday: true,
      verified: true,
    },
  ],
  listings: [
    {
      id: "listing-1",
      material: "PET Plastic Bottles",
      weightKg: 3.2,
      price: 96,
      vendor: "GreenCycle Co.",
      status: "accepted",
      createdAt: "2026-07-26T10:30:00.000Z",
      pickupAddress: "12 Marine Drive, Mumbai 400020",
      preferredTime: "Tomorrow · 10–12 AM",
      condition: "Clean · sorted",
      source: "manual",
    },
    {
      id: "listing-2",
      material: "Cardboard Boxes",
      weightKg: 8.5,
      price: 128,
      vendor: "ReNova Waste Hub",
      status: "pending",
      createdAt: "2026-07-25T08:15:00.000Z",
      pickupAddress: "12 Marine Drive, Mumbai 400020",
      preferredTime: "Today · 4–6 PM",
      condition: "Flattened",
      source: "manual",
    },
    {
      id: "listing-3",
      material: "Aluminium Cans",
      weightKg: 1.1,
      price: 154,
      vendor: "MetalWorks Recycle",
      status: "completed",
      createdAt: "2026-07-18T12:00:00.000Z",
      pickupAddress: "12 Marine Drive, Mumbai 400020",
      preferredTime: "Completed",
      condition: "Rinsed",
      source: "scan",
    },
    {
      id: "listing-4",
      material: "E-Waste (Laptop)",
      weightKg: 2.4,
      price: 1240,
      vendor: "EcoHarbor Recyclers",
      status: "completed",
      createdAt: "2026-07-10T12:00:00.000Z",
      pickupAddress: "12 Marine Drive, Mumbai 400020",
      preferredTime: "Completed",
      condition: "Working condition",
      source: "manual",
    },
    {
      id: "listing-5",
      material: "Mixed Paper",
      weightKg: 5,
      price: 60,
      vendor: "—",
      status: "cancelled",
      createdAt: "2026-07-05T12:00:00.000Z",
      pickupAddress: "12 Marine Drive, Mumbai 400020",
      preferredTime: "Cancelled",
      condition: "Bundled",
      source: "manual",
    },
    {
      id: "listing-6",
      material: "Glass Bottles",
      weightKg: 6.3,
      price: 88,
      vendor: "GreenCycle Co.",
      status: "pending",
      createdAt: "2026-07-21T12:00:00.000Z",
      pickupAddress: "12 Marine Drive, Mumbai 400020",
      preferredTime: "Friday · 2–4 PM",
      condition: "Sorted by color",
      source: "manual",
    },
  ],
  threads: [
    {
      id: "thread-greencycle",
      vendor: "GreenCycle Co.",
      online: true,
      unread: 2,
      messages: [
        {
          id: "m1",
          me: false,
          text: "Hey Shreyas — saw your PET listing. We're 1.2 km away.",
          sentAt: "2m ago",
        },
        {
          id: "m2",
          me: false,
          text: "Can offer ₹30/kg, pickup today 4–6 PM. Works?",
          sentAt: "2m ago",
        },
        { id: "m3", me: true, text: "Sounds great. Any chance of 4:30?", sentAt: "1m ago" },
        {
          id: "m4",
          me: false,
          text: "Confirmed 4:30 PM. Sharing route.",
          sentAt: "1m ago",
        },
      ],
    },
    {
      id: "thread-ecoharbor",
      vendor: "EcoHarbor Recyclers",
      online: true,
      unread: 0,
      messages: [
        { id: "m5", me: false, text: "We can offer ₹34/kg for sorted metal.", sentAt: "18m ago" },
      ],
    },
    {
      id: "thread-metalworks",
      vendor: "MetalWorks Recycle", online: false, unread: 0,
      messages: [
        { id: "m6", me: false, text: "Send a photo of the cans?", sentAt: "1h ago" },
      ],
    },
    {
      id: "thread-renova",
      vendor: "ReNova Waste Hub", online: false, unread: 0,
      messages: [
        { id: "m7", me: false, text: "Great — see you tomorrow.", sentAt: "3h ago" },
      ],
    },
  ],
  recentActivity: [
    { text: "Sold 3.2 kg of PET plastic to GreenCycle Co.", when: "2h ago", earn: "+₹96" },
    { text: "Scanned Aluminium can — 97% match", when: "5h ago" },
    { text: "Pickup scheduled with EcoHarbor", when: "Yesterday" },
    { text: "Achievement unlocked: Green Guardian", when: "2d ago" },
  ],
  lastScan: {
    material: "Aluminium Can",
    category: "Non-ferrous metal",
    confidence: 97,
    estimatedValue: 12,
    co2SavedKg: 0.9,
    energySavedWh: 14,
    suggestedVendors: ["MetalWorks Recycle", "GreenCycle Co.", "EcoHarbor Recyclers"],
  },
};

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatWeight(weightKg: number) {
  return `${weightKg.toFixed(1)} kg`;
}
