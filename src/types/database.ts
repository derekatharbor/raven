export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Plan = 'free' | 'pro' | 'team' | 'enterprise'
export type DocumentStatus = 'active' | 'archived'
export type ClaimStatus = 'active' | 'paused' | 'resolved' | 'expired'
export type ClaimCurrentStatus = 'ok' | 'contradiction' | 'uncertain' | 'error' | 'pending'
export type Cadence = 'hourly' | 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'manual'
export type CheckStatus = 'ok' | 'contradiction' | 'uncertain' | 'error'
export type CheckTrigger = 'scheduled' | 'manual' | 'api'
export type ResolutionAction = 'accepted' | 'dismissed' | 'edited'
export type NotificationType = 'contradiction' | 'check_complete' | 'claim_expired' | 'system' | 'billing'

export interface Profile {
  id: string
  email: string
  name: string | null
  plan: Plan
  documents_count: number
  claims_count: number
  stripe_customer_id: string | null
  stripe_subscription_id: string | null
  created_at: string
  updated_at: string
}

export interface Document {
  id: string
  user_id: string
  title: string
  content: Json
  status: DocumentStatus
  word_count: number
  claims_count: number
  active_contradictions: number
  created_at: string
  updated_at: string
}

export interface Claim {
  id: string
  document_id: string | null
  user_id: string
  source_url: string | null
  source_title: string | null
  text: string
  context: string | null
  start_offset: number | null
  end_offset: number | null
  node_id: string | null
  cadence: Cadence
  track_until: string | null
  sources: string[]
  status: ClaimStatus
  last_checked_at: string | null
  next_check_at: string | null
  last_contradiction_at: string | null
  contradiction_count: number
  current_status: ClaimCurrentStatus
  created_at: string
  updated_at: string
}

export interface Prompt {
  id: string
  claim_id: string
  prompt_text: string
  is_active: boolean
  created_at: string
}

export interface DefaultPrompt {
  id: string
  name: string
  prompt_text: string
  category: string | null
  is_active: boolean
  created_at: string
}

export interface Check {
  id: string
  claim_id: string
  status: CheckStatus
  confidence: number | null
  findings: Json | null
  suggested_revision: string | null
  sources_queried: string[] | null
  source_results: Json | null
  llm_model: string | null
  llm_prompt: string | null
  llm_response: Json | null
  triggered_by: CheckTrigger
  started_at: string
  completed_at: string | null
  duration_ms: number | null
  estimated_cost: number | null
  created_at: string
}

export interface Resolution {
  id: string
  check_id: string
  claim_id: string
  user_id: string
  action: ResolutionAction
  original_text: string
  new_text: string | null
  reason: string | null
  created_at: string
}

export interface Source {
  id: string
  user_id: string
  provider: string
  name: string
  config: Json
  is_active: boolean
  last_used_at: string | null
  error_count: number
  last_error: string | null
  created_at: string
  updated_at: string
}

export interface SystemSource {
  id: string
  provider: string
  name: string
  description: string | null
  is_active: boolean
  requires_user_key: boolean
  icon_url: string | null
  category: string | null
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: NotificationType
  claim_id: string | null
  check_id: string | null
  title: string
  body: string | null
  data: Json | null
  is_read: boolean
  read_at: string | null
  email_sent: boolean
  email_sent_at: string | null
  created_at: string
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Partial<Profile> & { id: string; email: string }
        Update: Partial<Profile>
      }
      documents: {
        Row: Document
        Insert: Partial<Document> & { user_id: string }
        Update: Partial<Document>
      }
      claims: {
        Row: Claim
        Insert: Partial<Claim> & { user_id: string; text: string }
        Update: Partial<Claim>
      }
      prompts: {
        Row: Prompt
        Insert: Partial<Prompt> & { claim_id: string; prompt_text: string }
        Update: Partial<Prompt>
      }
      default_prompts: {
        Row: DefaultPrompt
        Insert: never
        Update: never
      }
      checks: {
        Row: Check
        Insert: Partial<Check> & { claim_id: string; status: CheckStatus }
        Update: Partial<Check>
      }
      resolutions: {
        Row: Resolution
        Insert: Partial<Resolution> & { check_id: string; claim_id: string; user_id: string; action: ResolutionAction; original_text: string }
        Update: never
      }
      sources: {
        Row: Source
        Insert: Partial<Source> & { user_id: string; provider: string; name: string }
        Update: Partial<Source>
      }
      system_sources: {
        Row: SystemSource
        Insert: never
        Update: never
      }
      notifications: {
        Row: Notification
        Insert: Partial<Notification> & { user_id: string; type: NotificationType; title: string }
        Update: Partial<Notification>
      }
    }
  }
}
