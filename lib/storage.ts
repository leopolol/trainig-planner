import { TrainingSession } from '@/types/training'

const KEY = 'tp_sessions_v1'

export function loadSessions(): TrainingSession[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveSessions(sessions: TrainingSession[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY, JSON.stringify(sessions))
}

export function clearSessions(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(KEY)
}

export function exportJSON(sessions: TrainingSession[]): void {
  const blob = new Blob([JSON.stringify(sessions, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `training-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function importJSON(file: File): Promise<TrainingSession[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string)
        if (!Array.isArray(parsed)) throw new Error('Format invalide : attendu un tableau JSON')
        resolve(parsed as TrainingSession[])
      } catch (err) {
        reject(err)
      }
    }
    reader.onerror = () => reject(new Error('Erreur lecture fichier'))
    reader.readAsText(file)
  })
}

// ─── Race Goal ────────────────────────────────────────────────────────────────

import { RaceGoal } from '@/types/training'

const RACE_KEY = 'tp_race_goal_v1'
const NOTES_KEY = 'tp_week_notes_v1'

export function loadRaceGoal(): RaceGoal | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(RACE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

export function saveRaceGoal(goal: RaceGoal | null): void {
  if (typeof window === 'undefined') return
  if (!goal) { localStorage.removeItem(RACE_KEY); return }
  localStorage.setItem(RACE_KEY, JSON.stringify(goal))
}

export function loadWeekNotes(): Record<string, string> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = localStorage.getItem(NOTES_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

export function saveWeekNotes(notes: Record<string, string>): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes))
}
