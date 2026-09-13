import { describe, expect, it } from 'vitest'
import { mapMatchups, mapMemberships } from './mapper'
import type { SleeperMatchup, SleeperRoster, SleeperUser } from './types'

function user(overrides: Partial<SleeperUser> = {}): SleeperUser {
  return { user_id: 'u1', display_name: 'Fulano', avatar: null, metadata: null, ...overrides }
}

function roster(overrides: Partial<SleeperRoster> = {}): SleeperRoster {
  return {
    roster_id: 1,
    owner_id: 'u1',
    settings: { wins: 0, losses: 0, ties: 0, fpts: 0, fpts_against: 0 },
    ...overrides,
  }
}

describe('mapMemberships', () => {
  it('maps team name from roster metadata, falling back to display name', () => {
    const [mapped] = mapMemberships(
      [user({ user_id: 'u1', display_name: 'Beto', metadata: { team_name: 'Trovão' } })],
      [roster({ owner_id: 'u1' })],
    )
    expect(mapped.team_name).toBe('Trovão')
  })

  it('falls back to a generic team name when there is no owner (orphan roster)', () => {
    const [mapped] = mapMemberships([], [roster({ owner_id: null, roster_id: 7 })])
    expect(mapped.external_user_id).toBe('roster-7')
    expect(mapped.team_name).toBe('Time 7')
  })

  it('combines whole and decimal points into a single number', () => {
    const [mapped] = mapMemberships(
      [user()],
      [
        roster({
          settings: {
            wins: 3,
            losses: 1,
            ties: 0,
            fpts: 412,
            fpts_decimal: 55,
            fpts_against: 340,
            fpts_against_decimal: 2,
          },
        }),
      ],
    )
    expect(mapped.points_for).toBe(412.55)
    expect(mapped.points_against).toBe(340.02)
  })

  it('ranks by wins first, then points for as a tiebreaker', () => {
    const users = [user({ user_id: 'u1' }), user({ user_id: 'u2' }), user({ user_id: 'u3' })]
    const rosters = [
      roster({ roster_id: 1, owner_id: 'u1', settings: { wins: 2, losses: 1, ties: 0, fpts: 300, fpts_against: 0 } }),
      roster({ roster_id: 2, owner_id: 'u2', settings: { wins: 3, losses: 0, ties: 0, fpts: 280, fpts_against: 0 } }),
      roster({ roster_id: 3, owner_id: 'u3', settings: { wins: 2, losses: 1, ties: 0, fpts: 350, fpts_against: 0 } }),
    ]
    const mapped = mapMemberships(users, rosters)
    const rankByUser = Object.fromEntries(mapped.map((m) => [m.external_user_id, m.rank]))
    // u2 has the most wins -> 1st. u3 ties u1 on wins but has more points -> 2nd. u1 -> 3rd.
    expect(rankByUser.u2).toBe(1)
    expect(rankByUser.u3).toBe(2)
    expect(rankByUser.u1).toBe(3)
  })
})

describe('mapMatchups', () => {
  const membershipIdByRosterId = new Map([
    [1, 'membership-1'],
    [2, 'membership-2'],
    [3, 'membership-3'],
  ])

  it('pairs two rosters sharing a matchup_id into one row', () => {
    const raw: SleeperMatchup[] = [
      { matchup_id: 10, roster_id: 1, points: 120.5 },
      { matchup_id: 10, roster_id: 2, points: 98.2 },
    ]
    const [row] = mapMatchups(raw, 3, membershipIdByRosterId)
    expect(row.home_membership_id).toBe('membership-1')
    expect(row.away_membership_id).toBe('membership-2')
    expect(row.home_score).toBe(120.5)
    expect(row.away_score).toBe(98.2)
    expect(row.status).toBe('in_progress')
  })

  it('treats a null matchup_id as a bye week with no opponent', () => {
    const raw: SleeperMatchup[] = [{ matchup_id: null, roster_id: 3, points: 0 }]
    const [row] = mapMatchups(raw, 3, membershipIdByRosterId)
    expect(row.away_membership_id).toBeNull()
    expect(row.away_score).toBeNull()
    expect(row.status).toBe('upcoming')
  })

  it('marks a matchup as upcoming when no points have been scored yet', () => {
    const raw: SleeperMatchup[] = [
      { matchup_id: 20, roster_id: 1, points: 0 },
      { matchup_id: 20, roster_id: 2, points: 0 },
    ]
    const [row] = mapMatchups(raw, 1, membershipIdByRosterId)
    expect(row.status).toBe('upcoming')
  })

  it('drops a matchup whose home roster has no known membership', () => {
    const raw: SleeperMatchup[] = [
      { matchup_id: 30, roster_id: 99, points: 10 },
      { matchup_id: 30, roster_id: 2, points: 20 },
    ]
    const rows = mapMatchups(raw, 1, membershipIdByRosterId)
    expect(rows).toHaveLength(0)
  })
})
