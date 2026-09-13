/**
 * Hand-written types mirroring the Supabase schema in
 * `supabase/migrations`. If a Supabase project is linked later, this file
 * can be replaced by `supabase gen types typescript` output without
 * changing how the rest of the app consumes `Database`.
 */

export type SeasonStatus = 'upcoming' | 'active' | 'completed'
export type LeaguePlatform = 'sleeper' | 'yahoo' | 'manual'
export type LeagueStatus = 'draft' | 'active' | 'completed' | 'archived'
export type MembershipStatus = 'active' | 'invited' | 'inactive'
export type PaymentStatus = 'pending' | 'paid' | 'partial' | 'waived'
export type MatchupStatus = 'upcoming' | 'in_progress' | 'final'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          display_name: string
          username: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          display_name: string
          username?: string | null
          avatar_url?: string | null
        }
        Update: Partial<{
          display_name: string
          username: string | null
          avatar_url: string | null
        }>
        Relationships: []
      }
      sports: {
        Row: {
          id: string
          name: string
          slug: string
          icon: string | null
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          icon?: string | null
          active?: boolean
        }
        Update: Partial<{ name: string; slug: string; icon: string | null; active: boolean }>
        Relationships: []
      }
      seasons: {
        Row: {
          id: string
          sport_id: string
          name: string
          year: number
          starts_at: string | null
          ends_at: string | null
          status: SeasonStatus
          created_at: string
        }
        Insert: {
          id?: string
          sport_id: string
          name: string
          year: number
          starts_at?: string | null
          ends_at?: string | null
          status?: SeasonStatus
        }
        Update: Partial<{
          name: string
          year: number
          starts_at: string | null
          ends_at: string | null
          status: SeasonStatus
        }>
        Relationships: []
      }
      leagues: {
        Row: {
          id: string
          season_id: string
          commissioner_id: string
          name: string
          slug: string
          description: string | null
          logo_url: string | null
          platform: LeaguePlatform
          external_league_id: string | null
          max_participants: number | null
          entry_fee: number
          prize_pool: number
          currency: string
          status: LeagueStatus
          last_synced_at: string | null
          last_sync_error: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          season_id: string
          commissioner_id: string
          name: string
          slug: string
          description?: string | null
          logo_url?: string | null
          platform?: LeaguePlatform
          external_league_id?: string | null
          max_participants?: number | null
          entry_fee?: number
          prize_pool?: number
          currency?: string
          status?: LeagueStatus
          last_synced_at?: string | null
          last_sync_error?: string | null
        }
        Update: Partial<{
          name: string
          slug: string
          description: string | null
          logo_url: string | null
          platform: LeaguePlatform
          external_league_id: string | null
          max_participants: number | null
          entry_fee: number
          prize_pool: number
          currency: string
          status: LeagueStatus
          last_synced_at: string | null
          last_sync_error: string | null
        }>
        Relationships: []
      }
      league_memberships: {
        Row: {
          id: string
          league_id: string
          user_id: string | null
          external_user_id: string | null
          external_team_id: string | null
          external_display_name: string | null
          team_name: string | null
          status: MembershipStatus
          wins: number
          losses: number
          ties: number
          points_for: number
          points_against: number
          rank: number | null
          joined_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          league_id: string
          user_id?: string | null
          external_user_id?: string | null
          external_team_id?: string | null
          external_display_name?: string | null
          team_name?: string | null
          status?: MembershipStatus
          wins?: number
          losses?: number
          ties?: number
          points_for?: number
          points_against?: number
          rank?: number | null
        }
        Update: Partial<{
          user_id: string | null
          external_user_id: string | null
          external_team_id: string | null
          external_display_name: string | null
          team_name: string | null
          status: MembershipStatus
          wins: number
          losses: number
          ties: number
          points_for: number
          points_against: number
          rank: number | null
        }>
        Relationships: []
      }
      matchups: {
        Row: {
          id: string
          league_id: string
          week: number
          home_membership_id: string | null
          away_membership_id: string | null
          home_score: number | null
          away_score: number | null
          status: MatchupStatus
          external_matchup_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          league_id: string
          week: number
          home_membership_id?: string | null
          away_membership_id?: string | null
          home_score?: number | null
          away_score?: number | null
          status?: MatchupStatus
          external_matchup_id?: string | null
        }
        Update: Partial<{
          home_membership_id: string | null
          away_membership_id: string | null
          home_score: number | null
          away_score: number | null
          status: MatchupStatus
          external_matchup_id: string | null
        }>
        Relationships: []
      }
      payments: {
        Row: {
          id: string
          league_id: string
          membership_id: string
          expected_amount: number
          paid_amount: number
          status: PaymentStatus
          paid_at: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          league_id: string
          membership_id: string
          expected_amount?: number
          paid_amount?: number
          status?: PaymentStatus
          paid_at?: string | null
          notes?: string | null
        }
        Update: Partial<{
          expected_amount: number
          paid_amount: number
          status: PaymentStatus
          paid_at: string | null
          notes: string | null
        }>
        Relationships: []
      }
      prize_structures: {
        Row: {
          id: string
          league_id: string
          position: number
          label: string
          amount: number
          created_at: string
        }
        Insert: {
          id?: string
          league_id: string
          position: number
          label: string
          amount?: number
        }
        Update: Partial<{ position: number; label: string; amount: number }>
        Relationships: []
      }
      achievements: {
        Row: {
          id: string
          slug: string
          name: string
          description: string | null
          icon: string | null
          created_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          description?: string | null
          icon?: string | null
        }
        Update: Partial<{ name: string; description: string | null; icon: string | null }>
        Relationships: []
      }
      user_achievements: {
        Row: {
          id: string
          achievement_id: string
          user_id: string
          league_id: string | null
          season_id: string | null
          awarded_at: string
          notes: string | null
        }
        Insert: {
          id?: string
          achievement_id: string
          user_id: string
          league_id?: string | null
          season_id?: string | null
          notes?: string | null
        }
        Update: Partial<{ notes: string | null }>
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      season_status: SeasonStatus
      league_platform: LeaguePlatform
      league_status: LeagueStatus
      membership_status: MembershipStatus
      payment_status: PaymentStatus
      matchup_status: MatchupStatus
    }
    CompositeTypes: Record<string, never>
  }
}
