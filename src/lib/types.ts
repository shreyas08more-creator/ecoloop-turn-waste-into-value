// Shared domain types matching the Supabase schema.

export type ListingStatus = "draft" | "pending" | "accepted" | "completed" | "cancelled";

export type Listing = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  material: string;
  category: string;
  weight_kg: number;
  condition: string;
  images: string[];
  price: number;
  pickup_location: string;
  status: ListingStatus;
  vendor: string;
  source: "manual" | "scan";
  views: number;
  created_at: string;
  updated_at: string;
};

export type AiScan = {
  id: string;
  user_id: string;
  image_url: string;
  detected_material: string;
  confidence: number;
  recyclable: boolean;
  instructions: string;
  category: string;
  estimated_value: number;
  co2_saved_kg: number;
  energy_saved_wh: number;
  created_at: string;
};

export type Profile = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  company: string;
  bio: string;
  avatar_url: string | null;
  tier: string;
  verification_status: string;
  member_since: string;
  created_at: string;
  updated_at: string;
};

export type GreenScore = {
  id: string;
  user_id: string;
  score: number;
  weekly_change: number;
  monthly_change: number;
  tier: string;
  rank: number;
  trees_saved: number;
  created_at: string;
  updated_at: string;
};

export type ScoreEvent = {
  id: string;
  user_id: string;
  event_type: string;
  points: number;
  description: string;
  created_at: string;
};

export type Achievement = {
  id: string;
  user_id: string;
  name: string;
  description: string;
  icon: string;
  unlocked_at: string;
};

export type Conversation = {
  id: string;
  listing_id: string | null;
  last_message_at: string | null;
  created_at: string;
};

export type ConversationParticipant = {
  conversation_id: string;
  user_id: string;
  created_at: string;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  read_at: string | null;
  created_at: string;
};

// Vendor is static reference data (not user-created).
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
