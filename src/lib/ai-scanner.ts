import { suggestVendorsForMaterial } from "@/lib/vendors";

export type ScanPrediction = {
  material: string;
  category: string;
  confidence: number;
  recyclable: boolean;
  estimatedValue: number;
  co2SavedKg: number;
  energySavedWh: number;
  instructions: string;
  suggestedVendors: string[];
};

const MATERIAL_LIBRARY: {
  material: string;
  category: string;
  co2: number;
  energy: number;
  baseValue: number;
  instructions: string;
}[] = [
  {
    material: "Plastic (PET)",
    category: "Type-1 plastic",
    co2: 1.5,
    energy: 5.8,
    baseValue: 30,
    instructions: "Rinse and remove caps. Place in designated plastic recycling bin.",
  },
  {
    material: "Glass",
    category: "Container glass",
    co2: 0.9,
    energy: 2.7,
    baseValue: 12,
    instructions: "Sort by color if possible. Remove metal lids. Do not break.",
  },
  {
    material: "Metal / Aluminium",
    category: "Non-ferrous metal",
    co2: 9.0,
    energy: 14.0,
    baseValue: 42,
    instructions: "Rinse cans. Crush to save space. Separate aluminium from steel.",
  },
  {
    material: "Cardboard",
    category: "Corrugated paper",
    co2: 1.1,
    energy: 3.2,
    baseValue: 22,
    instructions: "Flatten boxes. Remove tape and staples. Keep dry.",
  },
  {
    material: "Paper",
    category: "Mixed paper",
    co2: 1.2,
    energy: 4.1,
    baseValue: 18,
    instructions: "Remove glossy coatings. Bundle and keep dry.",
  },
  {
    material: "Electronics (E-Waste)",
    category: "Electronic waste",
    co2: 12.0,
    energy: 40.0,
    baseValue: 120,
    instructions: "Remove batteries. Drop at certified e-waste collection point.",
  },
  {
    material: "Organic Waste",
    category: "Compostable",
    co2: 0.6,
    energy: 1.0,
    baseValue: 5,
    instructions: "Compost at home or drop at organic waste collection.",
  },
];

// Placeholder AI service: picks a deterministic material based on file name hash.
// When a real AI endpoint + API key are available, replace the body of
// `predictMaterial` with a fetch to that endpoint.
export function predictMaterial(file: File): ScanPrediction {
  let hash = 0;
  const seed = file.name + file.size.toString();
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  const entry = MATERIAL_LIBRARY[hash % MATERIAL_LIBRARY.length];
  const confidence = 82 + (hash % 16); // 82–97%
  const vendors = suggestVendorsForMaterial(entry.material).map((v) => v.name);

  return {
    material: entry.material,
    category: entry.category,
    confidence,
    recyclable: true,
    estimatedValue: entry.baseValue,
    co2SavedKg: entry.co2,
    energySavedWh: entry.energy,
    instructions: entry.instructions,
    suggestedVendors: vendors,
  };
}
