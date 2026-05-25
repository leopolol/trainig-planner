// ─── Type Groups ──────────────────────────────────────────────────────────────

export const RUNNING_TYPES = [
  'footing facile',
  'footing récupération',
  'sortie longue route',
  'sortie longue trail',
  'fractionné court',
  'fractionné long',
  'séance seuil',
  'séance tempo',
  'côtes courtes',
  'côtes longues',
  'trail vallonné',
] as const

export const SWIMMING_TYPES = [
  'natation',
] as const

export const STRENGTH_TYPES = [
  'renfo jambes',
  'renfo haut du corps',
  'gainage',
  'mobilité',
  'prévention blessures',
  'plyométrie',
  'proprioception',
] as const

export const CYCLING_TYPES = [
  'vélo endurance',
  'vélo récupération',
  'vélo fractionné',
  'vélo long',
] as const

export const OTHER_TYPES = [
  'repos complet',
  'repos actif',
  'autre',
] as const

export const SESSION_TYPES: string[] = [
  ...RUNNING_TYPES,
  ...STRENGTH_TYPES,
  ...CYCLING_TYPES,
  ...SWIMMING_TYPES,
  ...OTHER_TYPES,

]


export function isRunningType(type: string): boolean {
  return (RUNNING_TYPES as readonly string[]).includes(type) 
}

export function isStrengthType(type: string): boolean {
  return (STRENGTH_TYPES as readonly string[]).includes(type) 
}

export function isCyclingType(type: string): boolean {
  return (CYCLING_TYPES as readonly string[]).includes(type)
}

export function isSwimmingType(type: string): boolean {
  return (SWIMMING_TYPES as readonly string[]).includes(type)
}

export function isRestType(type: string): boolean {
  return type === 'repos complet' || type === 'repos actif'
}

export const SURFACES: string[] = [
  'route', 'trail', 'forêt', 'piste', 'chemin', 'tapis', 'autre',
]

export const PACES: string[] = [
  'très facile',
  'endurance fondamentale',
  'conversationnelle',
  'active',
  'tempo',
  'seuil',
  'VO2 max',
  'sprint / puissance',
  'libre',
]

export const PRIORITIES: string[] = ['faible', 'normale', 'importante']
export const STATUSES:   string[] = ['prévu', 'déplacé', 'fait', 'annulé']

export const OBJECTIVES: string[] = [
  "construire le volume aérobie",
  "améliorer la récupération",
  "développer le seuil",
  "améliorer la VO2 max",
  "travailler la vitesse",
  "renforcer les jambes",
  "améliorer la résistance en côte",
  "développer la puissance en montée",
  "améliorer l'économie de course",
  "habituer aux descentes",
  "prévenir les blessures",
  "améliorer la mobilité",
  "stabiliser le tronc",
  "entretenir sans impact",
  "préparer la fatigue spécifique trail",
  "autre",
]

export interface PostSession {
  actualDistanceKm?: number
  duration?: string
  averagePace?: string
  elevationGainM?: number
  feeling?: number
  fatigue?: number
  pain?: string
  comment?: string
  weather?: string
  stravaLink?: string
  gpxFileName?: string
}

export interface TrainingSession {
  id: string
  date: string
  title: string
  type: string
  distanceMinKm: number
  distanceMaxKm: number
  estimatedDuration?: string
  surface: string
  pace: string
  objective: string
  description?: string
  specificInstructions?: string
  priority: string
  status: string
  postSession?: PostSession
}

export interface RaceGoal {
  name: string
  date: string
  distanceKm?: number
  elevationGainM?: number
  startTime?: string
  location?: string
  targetTime?: string
  dossard?: string
  notes?: string
}

export type FilterMode = 'all' | 'todo' | 'done' | 'hard'

export interface WeekSummaryData {
  totalMinKm: number
  totalMaxKm: number
  sessionCount: number
  hardSessionCount: number
  surfaces: string[]
  objectives: string[]
  warnings: string[]
  completedCount: number
  runningMinKm: number
  runningMaxKm: number
  cyclingKm: number
  strengthMinutes: number
  hasMultiSport: boolean
  swimmingKm: number
}