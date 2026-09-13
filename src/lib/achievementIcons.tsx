import { Flame, Medal, Target, Trophy, Zap, type LucideIcon } from 'lucide-react'

const ICONS: Record<string, LucideIcon> = {
  trophy: Trophy,
  medal: Medal,
  target: Target,
  flame: Flame,
  zap: Zap,
}

export function getAchievementIcon(icon: string | null): LucideIcon {
  return (icon && ICONS[icon]) || Trophy
}
