import { TrainingSession, WeekSummaryData, isRunningType, isStrengthType, isCyclingType, isSwimmingType } from '@/types/training'

export interface SessionColors {
  bg: string; border: string; text: string; dot: string; badge: string
}

const COLOR_MAP: Record<string, SessionColors> = {
  // ── Course — vert ─────────────────────────────────────────────────────────
  'footing facile':       { bg: 'bg-emerald-100', border: 'border-l-emerald-600', text: 'text-emerald-900', dot: 'bg-emerald-500', badge: 'bg-emerald-200 text-emerald-800' },
  'footing récupération': { bg: 'bg-emerald-100', border: 'border-l-emerald-600', text: 'text-emerald-900', dot: 'bg-emerald-500', badge: 'bg-emerald-200 text-emerald-800' },
  'sortie longue route':  { bg: 'bg-emerald-100', border: 'border-l-emerald-600', text: 'text-emerald-900', dot: 'bg-emerald-500', badge: 'bg-emerald-200 text-emerald-800' },
  'sortie longue trail':  { bg: 'bg-emerald-100', border: 'border-l-emerald-600', text: 'text-emerald-900', dot: 'bg-emerald-500', badge: 'bg-emerald-200 text-emerald-800' },
  'fractionné court':     { bg: 'bg-emerald-100', border: 'border-l-emerald-600', text: 'text-emerald-900', dot: 'bg-emerald-500', badge: 'bg-emerald-200 text-emerald-800' },
  'fractionné long':      { bg: 'bg-emerald-100', border: 'border-l-emerald-600', text: 'text-emerald-900', dot: 'bg-emerald-500', badge: 'bg-emerald-200 text-emerald-800' },
  'séance seuil':         { bg: 'bg-emerald-100', border: 'border-l-emerald-600', text: 'text-emerald-900', dot: 'bg-emerald-500', badge: 'bg-emerald-200 text-emerald-800' },
  'séance tempo':         { bg: 'bg-emerald-100', border: 'border-l-emerald-600', text: 'text-emerald-900', dot: 'bg-emerald-500', badge: 'bg-emerald-200 text-emerald-800' },
  'côtes courtes':        { bg: 'bg-emerald-100', border: 'border-l-emerald-600', text: 'text-emerald-900', dot: 'bg-emerald-500', badge: 'bg-emerald-200 text-emerald-800' },
  'côtes longues':        { bg: 'bg-emerald-100', border: 'border-l-emerald-600', text: 'text-emerald-900', dot: 'bg-emerald-500', badge: 'bg-emerald-200 text-emerald-800' },
  'trail vallonné':       { bg: 'bg-emerald-100', border: 'border-l-emerald-600', text: 'text-emerald-900', dot: 'bg-emerald-500', badge: 'bg-emerald-200 text-emerald-800' },

  // ── Renfo — amber ─────────────────────────────────────────────────────────
  'renfo jambes':         { bg: 'bg-amber-100', border: 'border-l-amber-600', text: 'text-amber-900', dot: 'bg-amber-500', badge: 'bg-amber-200 text-amber-800' },
  'renfo haut du corps':  { bg: 'bg-amber-100', border: 'border-l-amber-600', text: 'text-amber-900', dot: 'bg-amber-500', badge: 'bg-amber-200 text-amber-800' },
  'gainage':              { bg: 'bg-amber-100', border: 'border-l-amber-600', text: 'text-amber-900', dot: 'bg-amber-500', badge: 'bg-amber-200 text-amber-800' },
  'mobilité':             { bg: 'bg-amber-100', border: 'border-l-amber-600', text: 'text-amber-900', dot: 'bg-amber-500', badge: 'bg-amber-200 text-amber-800' },
  'prévention blessures': { bg: 'bg-amber-100', border: 'border-l-amber-600', text: 'text-amber-900', dot: 'bg-amber-500', badge: 'bg-amber-200 text-amber-800' },
  'plyométrie':           { bg: 'bg-amber-100', border: 'border-l-amber-600', text: 'text-amber-900', dot: 'bg-amber-500', badge: 'bg-amber-200 text-amber-800' },
  'proprioception':       { bg: 'bg-amber-100', border: 'border-l-amber-600', text: 'text-amber-900', dot: 'bg-amber-500', badge: 'bg-amber-200 text-amber-800' },

  // ── Vélo — cyan ───────────────────────────────────────────────────────────
  'vélo endurance':       { bg: 'bg-cyan-100', border: 'border-l-cyan-600', text: 'text-cyan-900', dot: 'bg-cyan-500', badge: 'bg-cyan-200 text-cyan-800' },
  'vélo récupération':    { bg: 'bg-cyan-100', border: 'border-l-cyan-600', text: 'text-cyan-900', dot: 'bg-cyan-500', badge: 'bg-cyan-200 text-cyan-800' },
  'vélo fractionné':      { bg: 'bg-cyan-100', border: 'border-l-cyan-600', text: 'text-cyan-900', dot: 'bg-cyan-500', badge: 'bg-cyan-200 text-cyan-800' },
  'vélo long':            { bg: 'bg-cyan-100', border: 'border-l-cyan-600', text: 'text-cyan-900', dot: 'bg-cyan-500', badge: 'bg-cyan-200 text-cyan-800' },

  'natation':    { bg: 'bg-indigo-100', border: 'border-l-indigo-600', text: 'text-indigo-900', dot: 'bg-indigo-500', badge: 'bg-indigo-200 text-indigo-800' },


  // ── Repos ─────────────────────────────────────────────────────────────────
  'repos complet':        { bg: 'bg-slate-100', border: 'border-l-slate-400', text: 'text-slate-600', dot: 'bg-slate-400', badge: 'bg-slate-200 text-slate-600' },
  'repos actif':          { bg: 'bg-slate-100', border: 'border-l-slate-400', text: 'text-slate-600', dot: 'bg-slate-400', badge: 'bg-slate-200 text-slate-600' },

}

const FALLBACK_COLORS: SessionColors = {
  bg: 'bg-gray-100',
  border: 'border-l-gray-400',
  text: 'text-gray-700',
  dot: 'bg-gray-400',
  badge: 'bg-gray-200 text-gray-600',
}

export function getColors(type: string): SessionColors {
  return COLOR_MAP[type] ?? FALLBACK_COLORS
}

export function toYMD(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function getMondayOf(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() + (day === 0 ? -6 : 1 - day))
  d.setHours(12, 0, 0, 0)
  return d
}

export function getWeekDays(mondayYMD: string): string[] {
  const [y, m, day] = mondayYMD.split('-').map(Number)
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(y, m - 1, day + i, 12, 0, 0)
    return toYMD(d)
  })
}

export function formatDayLabel(ymd: string): { day: string; num: string; month: string } {
  const [y, m, d] = ymd.split('-').map(Number)
  const date = new Date(y, m - 1, d, 12, 0, 0)
  const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam']
  const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc']
  return { day: days[date.getDay()], num: String(date.getDate()), month: months[date.getMonth()] }
}

export function formatWeekRange(mondayYMD: string): string {
  const days = getWeekDays(mondayYMD)
  const [y0, m0, d0] = days[0].split('-').map(Number)
  const [y1, m1, d1] = days[6].split('-').map(Number)
  const start = new Date(y0, m0 - 1, d0, 12)
  const end   = new Date(y1, m1 - 1, d1, 12)
  const months = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.']
  return `${start.getDate()} ${months[start.getMonth()]} – ${end.getDate()} ${months[end.getMonth()]} ${end.getFullYear()}`
}

export function isToday(ymd: string): boolean {
  return ymd === toYMD(new Date())
}

const HARD_TYPES = [
  'fractionné court', 'fractionné long', 'séance seuil', 'séance tempo',
  'côtes courtes', 'côtes longues', 'trail vallonné',
  'sortie longue route', 'sortie longue trail',
  'vélo fractionné',
  'fractionné', 'seuil', 'piste', 'côte', 'trail', 'sortie longue',
]

export function isHard(type: string): boolean {
  return HARD_TYPES.includes(type)
}

export function formatDistance(min: number, max: number): string | null {
  if (min === 0 && max === 0) return null
  if (min === max) return `${min} km`
  return `${min}–${max} km`
}

export function parseDurationToMinutes(duration?: string): number {
  if (!duration) return 0
  const hMatch = duration.match(/(\d+)h/i)
  const mMatch = duration.match(/(\d+)\s*min/i)
  const h = hMatch ? parseInt(hMatch[1]) : 0
  const m = mMatch ? parseInt(mMatch[1]) : 0
  if (h === 0 && m === 0) {
    const num = parseInt(duration)
    return isNaN(num) ? 0 : num
  }
  return h * 60 + m
}

export function computeWeekSummary(sessions: TrainingSession[], weekDays: string[]): WeekSummaryData {
  const week = sessions.filter(s => weekDays.includes(s.date))
  const active = week.filter(s =>
    s.status !== 'annulé' &&
    s.type !== 'repos complet' && s.type !== 'repos actif' && s.type !== 'repos'
  )

  const runSessions      = active.filter(s => isRunningType(s.type))
  const cycleSessions    = active.filter(s => isCyclingType(s.type))
  const strengthSessions = active.filter(s => isStrengthType(s.type))

  const runningMinKm    = Math.round(runSessions.reduce((sum, s) => sum + (s.distanceMinKm || 0), 0))
  const runningMaxKm    = Math.round(runSessions.reduce((sum, s) => sum + (s.distanceMaxKm || 0), 0))
  const cyclingKm       = Math.round(cycleSessions.reduce((sum, s) => sum + ((s.distanceMinKm + s.distanceMaxKm) / 2 || 0), 0))
  const swimSessions = active.filter(s => isSwimmingType(s.type))
  const swimmingKm = Math.round(swimSessions.reduce((sum, s) => sum + ((s.distanceMinKm + s.distanceMaxKm) / 2 || 0), 0))

  const strengthMinutes = strengthSessions.reduce((sum, s) => sum + parseDurationToMinutes(s.estimatedDuration), 0)
  const totalMinKm      = runningMinKm + Math.round(cycleSessions.reduce((sum, s) => sum + (s.distanceMinKm || 0), 0))
  const totalMaxKm      = runningMaxKm + Math.round(cycleSessions.reduce((sum, s) => sum + (s.distanceMaxKm || 0), 0))

  const hardSessions   = active.filter(s => isHard(s.type))
  const surfaces       = Array.from(new Set(runSessions.map(s => s.surface).filter(Boolean)))
  const objectives     = Array.from(new Set(active.map(s => s.objective).filter(Boolean)))
  const completedCount = week.filter(s => s.status === 'fait').length

  const warnings: string[] = []
  const sorted = [...week].filter(s => s.status !== 'annulé').sort((a, b) => a.date.localeCompare(b.date))
  for (let i = 0; i < sorted.length - 1; i++) {
    if (isHard(sorted[i].type) && isHard(sorted[i + 1].type)) {
      const [y1, m1, d1] = sorted[i].date.split('-').map(Number)
      const [y2, m2, d2] = sorted[i + 1].date.split('-').map(Number)
      if ((new Date(y2, m2 - 1, d2).getTime() - new Date(y1, m1 - 1, d1).getTime()) <= 86400000) {
        warnings.push(`Séances dures consécutives : "${sorted[i].title}" → "${sorted[i + 1].title}"`)
      }
    }
  }
  if (hardSessions.length >= 4) warnings.push(`Semaine chargée : ${hardSessions.length} séances intenses`)

  return {
    totalMinKm, totalMaxKm,
    sessionCount: week.length,
    hardSessionCount: hardSessions.length,
    surfaces, objectives, warnings, completedCount,
    runningMinKm, runningMaxKm, cyclingKm, strengthMinutes,
    hasMultiSport: cyclingKm > 0 || strengthMinutes > 0,
    swimmingKm
  }
}

export function autoScheduleSuggestions(sessions: TrainingSession[], weekDays: string[]): string[] {
  const tips: string[] = []
  const longRuns = sessions.filter(s =>
    s.type === 'sortie longue route' || s.type === 'sortie longue trail' || s.type === 'sortie longue'
  )
  for (const s of longRuns) {
    const [y, m, d] = s.date.split('-').map(Number)
    const dow = new Date(y, m - 1, d, 12).getDay()
    if (dow !== 0 && dow !== 6) tips.push(`"${s.title}" (sortie longue) serait mieux placée le weekend`)
  }
  return tips
}