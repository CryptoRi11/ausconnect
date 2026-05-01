import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type UserRole = 'player' | 'coach'

export type UserProfile = {
  id: string
  email: string
  role: UserRole
  subscription_status: string | null
  created_at: string
}

export type PlayerProfile = {
  id: string
  user_id: string
  full_name: string | null
  location_city: string | null
  location_state: string | null
  current_team: string | null
  position: string | null
  profile_picture_url: string | null
  height_cm: number | null
  height_ft: number | null
  height_in: number | null
  weight_kg: number | null
  weight_lbs: number | null
  age: number | null
  contact_email: string | null
  contact_phone: string | null
  instagram: string | null
  twitter: string | null
  goals: string | null
  video_link_1: string | null
  video_link_2: string | null
  video_link_3: string | null
  is_visible: boolean
  created_at: string
  updated_at: string
}

export type CoachProfile = {
  id: string
  user_id: string
  full_name: string | null
  university: string | null
  position_title: string | null
  contact_email: string | null
  subscription_status: string | null
  created_at: string
}

export type Evaluation = {
  id: string
  player_id: string
  offensive_ability: number | null
  defensive_skills: number | null
  overall_iq: number | null
  physical_ability: number | null
  culture_rating: number | null
  composite_score: number | null
  notes: string | null
  created_at: string
  updated_at: string
}
