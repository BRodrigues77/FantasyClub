import type {
  LeaguePlatform,
  LeagueStatus,
  MatchupStatus,
  MembershipStatus,
  PaymentStatus,
} from '@/types/database'

export interface Profile {
  id: string
  displayName: string
  username: string | null
  avatarUrl: string | null
}

export interface League {
  id: string
  seasonId: string
  commissionerId: string
  name: string
  slug: string
  description: string | null
  logoUrl: string | null
  platform: LeaguePlatform
  externalLeagueId: string | null
  maxParticipants: number | null
  entryFee: number
  prizePool: number
  currency: string
  status: LeagueStatus
  lastSyncedAt: string | null
  lastSyncError: string | null
  sportName: string
  sportSlug: string
  seasonName: string
  seasonYear: number
}

export interface LeagueMembership {
  id: string
  leagueId: string
  userId: string | null
  externalUserId: string | null
  externalTeamId: string | null
  externalDisplayName: string | null
  teamName: string | null
  status: MembershipStatus
  wins: number
  losses: number
  ties: number
  pointsFor: number
  pointsAgainst: number
  rank: number | null
  profile: Profile | null
}

export interface Matchup {
  id: string
  leagueId: string
  week: number
  status: MatchupStatus
  home: MatchupSide | null
  away: MatchupSide | null
}

export interface MatchupSide {
  membershipId: string
  teamName: string
  score: number | null
}

export interface Payment {
  id: string
  leagueId: string
  membershipId: string
  expectedAmount: number
  paidAmount: number
  status: PaymentStatus
  paidAt: string | null
  notes: string | null
}

export interface PrizeStructure {
  id: string
  leagueId: string
  position: number
  label: string
  amount: number
}

export interface Achievement {
  id: string
  slug: string
  name: string
  description: string | null
  icon: string | null
}

export interface UserAchievement {
  id: string
  achievementId: string
  userId: string
  leagueId: string | null
  seasonId: string | null
  awardedAt: string
  notes: string | null
  achievement: Achievement
  leagueName: string | null
  seasonName: string | null
}
