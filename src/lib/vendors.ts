import type { Vendor } from "@/lib/types";

// Static vendor reference data. Vendors are not user-created entities; they are
// the curated recyclers shown across the marketplace. Listings reference a
// vendor by name.
export const VENDORS: Vendor[] = [
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
];

export function findVendorByName(name: string): Vendor | undefined {
  return VENDORS.find((v) => v.name === name);
}

export function suggestVendorsForMaterial(material: string): Vendor[] {
  const lower = material.toLowerCase();
  const matched = VENDORS.filter((v) =>
    v.materials.some((m) => lower.includes(m.toLowerCase())),
  );
  return (matched.length > 0 ? matched : VENDORS).slice().sort(
    (a, b) => b.pricePerKg - a.pricePerKg,
  );
}
