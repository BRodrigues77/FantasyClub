import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Input } from '@/components/ui/Input'
import { useAssociateMembership } from '@/hooks/useLeagues'
import { searchProfiles } from '@/services/profiles/api'
import type { LeagueMembership } from '@/types/domain'
import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'

export function AssociateMembershipDialog({
  membership,
  leagueId,
  open,
  onOpenChange,
}: {
  membership: LeagueMembership | null
  leagueId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [query, setQuery] = useState('')
  const [debounced, setDebounced] = useState('')
  const associate = useAssociateMembership(leagueId)

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query), 300)
    return () => clearTimeout(t)
  }, [query])

  const { data: results, isFetching } = useQuery({
    queryKey: ['profile-search', debounced],
    queryFn: () => searchProfiles(debounced),
    enabled: debounced.length >= 2,
  })

  useEffect(() => {
    if (!open) setQuery('')
  }, [open])

  if (!membership) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Associar participante</DialogTitle>
          <DialogDescription>
            Vincule {membership.teamName ?? membership.externalDisplayName ?? 'este time'} a um
            usuário cadastrado no FantasyClub.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3">
          {membership.userId && (
            <div className="flex items-center justify-between rounded-[var(--radius-control)] bg-background px-3 py-2">
              <span className="text-sm text-foreground">{membership.profile?.displayName}</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={async () => {
                  await associate.mutateAsync({ membershipId: membership.id, userId: null })
                  onOpenChange(false)
                }}
              >
                Remover
              </Button>
            </div>
          )}

          <Input
            placeholder="Buscar por nome ou usuário…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <div className="flex max-h-56 flex-col gap-1 overflow-y-auto">
            {isFetching && <p className="py-2 text-center text-xs text-muted-foreground">Buscando…</p>}
            {!isFetching && debounced.length >= 2 && (results ?? []).length === 0 && (
              <p className="py-2 text-center text-xs text-muted-foreground">Nenhum usuário encontrado.</p>
            )}
            {(results ?? []).map((p) => (
              <button
                key={p.id}
                onClick={async () => {
                  await associate.mutateAsync({ membershipId: membership.id, userId: p.id })
                  onOpenChange(false)
                }}
                className="flex items-center gap-2 rounded-[var(--radius-control)] px-2 py-1.5 text-left hover:bg-surface-hover"
              >
                <Avatar name={p.displayName} className="h-7 w-7 text-xs" />
                <div>
                  <p className="text-sm text-foreground">{p.displayName}</p>
                  {p.username && <p className="text-xs text-muted-foreground">@{p.username}</p>}
                </div>
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
