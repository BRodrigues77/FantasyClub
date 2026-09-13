/** Minimal relative-time formatter in Portuguese — avoids pulling in a date library for one string. */
export function formatDistanceToNow(isoDate: string): string {
  const diffMs = Date.now() - new Date(isoDate).getTime()
  const minutes = Math.floor(diffMs / 60_000)

  if (minutes < 1) return 'agora'
  if (minutes < 60) return `há ${minutes} min`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `há ${hours}h`

  const days = Math.floor(hours / 24)
  if (days < 30) return `há ${days}d`

  const months = Math.floor(days / 30)
  return `há ${months} ${months === 1 ? 'mês' : 'meses'}`
}

export function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('pt-BR')
}
