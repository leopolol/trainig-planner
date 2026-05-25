import { TrainingSession, RaceGoal } from '@/types/training'

const SHEETS_URL = process.env.NEXT_PUBLIC_SHEETS_URL ?? ''

// ─── Sync disponible ? ────────────────────────────────────────────────────────

export function isSyncEnabled(): boolean {
  return !!SHEETS_URL
}

// ─── GET all data for user ────────────────────────────────────────────────────

export interface RemoteData {
  sessions:  TrainingSession[] | null
  raceGoal:  RaceGoal | null
  weekNotes: Record<string, string> | null
}

export async function fetchAll(userId: string): Promise<RemoteData> {
  const res = await fetch(`${SHEETS_URL}?action=getAll&userId=${encodeURIComponent(userId)}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return await res.json()
}

// ─── POST helpers ─────────────────────────────────────────────────────────────

async function post(action: string, userId: string, payload: unknown): Promise<void> {
  const res = await fetch(SHEETS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' }, // évite le preflight CORS
    body: JSON.stringify({ action, userId, payload }),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  if (data.error) throw new Error(data.error)
}

// ─── Exports ──────────────────────────────────────────────────────────────────

export async function syncSessions(userId: string, sessions: TrainingSession[]): Promise<void> {
  await post('saveSessions', userId, sessions)
}

export async function syncRaceGoal(userId: string, goal: RaceGoal | null): Promise<void> {
  await post('saveRaceGoal', userId, goal)
}

export async function syncWeekNotes(userId: string, notes: Record<string, string>): Promise<void> {
  await post('saveWeekNotes', userId, notes)
}
