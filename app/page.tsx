'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { TrainingSession, RaceGoal, FilterMode } from '@/types/training'
import { loadSessions, saveSessions, exportJSON, loadRaceGoal, saveRaceGoal, loadWeekNotes, saveWeekNotes } from '@/lib/storage'
import { getMondayOf, toYMD, getWeekDays, formatWeekRange, computeWeekSummary, autoScheduleSuggestions } from '@/lib/utils'
import { downloadAIExport } from '@/lib/exportAI'
import { getUserId, setUrlId } from '@/lib/userId'
import { fetchAll, syncSessions, syncRaceGoal, syncWeekNotes, isSyncEnabled } from '@/lib/api'
import SyncStatus, { SyncState } from '@/components/SyncStatus'
import UserIdPanel from '@/components/UserIdPanel'

import WeekView from '@/components/WeekView'
import WeekSummary from '@/components/WeekSummary'
import EditSessionModal from '@/components/EditSessionModal'
import PostSessionModal from '@/components/PostSessionModal'
import ImportModal from '@/components/ImportModal'
import RaceGoalBanner from '@/components/RaceGoalBanner'
import WeekLoadChart from '@/components/WeekLoadChart'
import MultiWeekView from '@/components/MultiWeekView'

import {
  ChevronLeft, ChevronRight, Upload,
  BrainCircuit, Database, Plus, Calendar,
  LayoutGrid, CalendarDays, BarChart2, UserCircle,
} from 'lucide-react'

const FILTER_OPTIONS: { value: FilterMode; label: string }[] = [
  { value: 'all',  label: 'Tout'      },
  { value: 'todo', label: 'À faire'   },
  { value: 'done', label: 'Réalisé'   },
  { value: 'hard', label: 'Intensif'  },
]

const HARD_TYPES = [
  // nouveaux types
  'fractionné court', 'fractionné long', 'séance seuil', 'séance tempo',
  'côtes courtes', 'côtes longues', 'trail vallonné',
  'sortie longue route', 'sortie longue trail',
  'vélo fractionné',
]

const VIEW_MODES = [
  { mode: 'week'  as const, Icon: CalendarDays, label: 'Semaine'    },
  { mode: 'multi' as const, Icon: LayoutGrid,   label: '4 semaines' },
  { mode: 'chart' as const, Icon: BarChart2,    label: 'Charge'     },
]

export default function Home() {
  const [sessions,    setSessions]    = useState<TrainingSession[]>([])
  const [mondayYMD,   setMondayYMD]   = useState<string>('')
  const [mounted,     setMounted]     = useState(false)
  const [editingSession,  setEditingSession]  = useState<TrainingSession | null>(null)
  const [draftSession,    setDraftSession]    = useState<TrainingSession | null>(null)
  const [postSession,     setPostSession]     = useState<TrainingSession | null>(null)
  const [showImport,  setShowImport]  = useState(false)
  const [notification, setNotification] = useState<string | null>(null)
  const [raceGoal,    setRaceGoal]    = useState<RaceGoal | null>(null)
  const [weekNotes,   setWeekNotes]   = useState<Record<string, string>>({})
  const [filter,      setFilter]      = useState<FilterMode>('all')
  const [viewMode,    setViewMode]    = useState<'week' | 'multi' | 'chart'>('week')
  const [syncState,   setSyncState]   = useState<SyncState>('idle')
  const [showUserPanel, setShowUserPanel] = useState(false)

  const userId      = useRef<string>('')
  const touchStartX = useRef<number | null>(null)
  const syncTimer   = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ─── Mount : charger localStorage puis Sheets ──────────────────────────────
  useEffect(() => {
    userId.current = getUserId()
    setUrlId(userId.current) // met à jour l'URL avec l'ID

    // 1. Charger localStorage immédiatement (instantané)
    setSessions(loadSessions())
    setRaceGoal(loadRaceGoal())
    setWeekNotes(loadWeekNotes())
    setMondayYMD(toYMD(getMondayOf(new Date())))
    setMounted(true)

    // 2. Charger depuis Sheets en arrière-plan
    if (isSyncEnabled()) {
      setSyncState('syncing')
      fetchAll(userId.current)
        .then(remote => {
          if (remote.sessions !== null) {
            setSessions(remote.sessions)
            saveSessions(remote.sessions)
          }
          if (remote.raceGoal !== undefined) {
            setRaceGoal(remote.raceGoal)
            saveRaceGoal(remote.raceGoal)
          }
          if (remote.weekNotes !== null) {
            setWeekNotes(remote.weekNotes)
            saveWeekNotes(remote.weekNotes)
          }
          setSyncState('synced')
          setTimeout(() => setSyncState('idle'), 3000)
        })
        .catch(() => setSyncState('error'))
    } else {
      setSyncState('disabled')
    }
  }, [])

  // ─── Debounced sync vers Sheets ────────────────────────────────────────────
  const scheduleSyncSessions = useCallback((data: TrainingSession[]) => {
    if (!isSyncEnabled()) return
    if (syncTimer.current) clearTimeout(syncTimer.current)
    setSyncState('syncing')
    syncTimer.current = setTimeout(() => {
      syncSessions(userId.current, data)
        .then(() => { setSyncState('synced'); setTimeout(() => setSyncState('idle'), 2000) })
        .catch(() => setSyncState('error'))
    }, 1500) // debounce 1.5s pour grouper les mutations rapides
  }, [])

  const retrySync = useCallback(() => {
    if (!isSyncEnabled()) return
    setSyncState('syncing')
    Promise.all([
      syncSessions(userId.current, sessions),
      syncRaceGoal(userId.current, raceGoal),
      syncWeekNotes(userId.current, weekNotes),
    ])
      .then(() => { setSyncState('synced'); setTimeout(() => setSyncState('idle'), 2000) })
      .catch(() => setSyncState('error'))
  }, [sessions, raceGoal, weekNotes])

  // ─── Dérivés ───────────────────────────────────────────────────────────────
  const weekDays    = mondayYMD ? getWeekDays(mondayYMD) : []
  const summary     = mondayYMD ? computeWeekSummary(sessions, weekDays) : null
  const suggestions = mondayYMD ? autoScheduleSuggestions(sessions.filter(s => weekDays.includes(s.date)), weekDays) : []
  const isCurrentWeek = mondayYMD === toYMD(getMondayOf(new Date()))

  const filteredSessions = sessions.filter(s => {
    if (filter === 'todo') return s.status === 'prévu' || s.status === 'déplacé'
    if (filter === 'done') return s.status === 'fait'
    if (filter === 'hard') return HARD_TYPES.includes(s.type)
    return true
  })

  // ─── Label mobile ──────────────────────────────────────────────────────────
  function mobileWeekLabel(): string {
    if (!mondayYMD) return ''
    const [y, m, d] = mondayYMD.split('-').map(Number)
    const date = new Date(y, m - 1, d, 12)
    const months = ['jan','fév','mar','avr','mai','jun','jul','aoû','sep','oct','nov','déc']
    return `${date.getDate()} ${months[date.getMonth()]}`
  }

  // ─── Navigation ────────────────────────────────────────────────────────────
  function changeWeek(delta: number) {
    const [y, m, d] = mondayYMD.split('-').map(Number)
    const date = new Date(y, m - 1, d + delta * 7, 12)
    setMondayYMD(toYMD(getMondayOf(date)))
  }

  function goToday() { setMondayYMD(toYMD(getMondayOf(new Date()))) }

  function handleTouchStart(e: React.TouchEvent) { touchStartX.current = e.touches[0].clientX }
  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return
    const delta = touchStartX.current - e.changedTouches[0].clientX
    if (Math.abs(delta) > 60) changeWeek(delta > 0 ? 1 : -1)
    touchStartX.current = null
  }

  // ─── CRUD ──────────────────────────────────────────────────────────────────
  const updateSession = useCallback((updated: TrainingSession) => {
    setSessions(prev => {
      const next = prev.map(s => s.id === updated.id ? updated : s)
      saveSessions(next)
      scheduleSyncSessions(next)
      return next
    })
  }, [scheduleSyncSessions])

  const deleteSession = useCallback((id: string) => {
    setSessions(prev => {
      const next = prev.filter(s => s.id !== id)
      saveSessions(next)
      scheduleSyncSessions(next)
      return next
    })
  }, [scheduleSyncSessions])

  const moveSession = useCallback((sessionId: string, newDate: string) => {
    setSessions(prev => {
      const next = prev.map(s =>
        s.id === sessionId
          ? { ...s, date: newDate, status: s.status === 'prévu' ? 'déplacé' : s.status }
          : s
      )
      saveSessions(next)
      scheduleSyncSessions(next)
      return next
    })
    showNotif('Séance déplacée')
  }, [scheduleSyncSessions])

  const duplicateSession = useCallback((session: TrainingSession, date: string) => {
    setSessions(prev => {
      const next = [...prev, { ...session, id: `session-${Date.now()}`, date, status: 'prévu' as const, postSession: undefined }]
      saveSessions(next)
      scheduleSyncSessions(next)
      return next
    })
    showNotif('Séance dupliquée ✓')
  }, [scheduleSyncSessions])

  // ─── Import ────────────────────────────────────────────────────────────────
  function handleImport(imported: TrainingSession[], mode: 'replace' | 'merge') {
    setSessions(prev => {
      const next = mode === 'replace'
        ? imported
        : [...prev, ...imported.filter(s => !new Set(prev.map(p => p.id)).has(s.id))]
      saveSessions(next)
      scheduleSyncSessions(next)
      return next
    })
    if (imported.length > 0) {
      const sorted = [...imported].sort((a, b) => a.date.localeCompare(b.date))
      const [y, m, d] = sorted[0].date.split('-').map(Number)
      setMondayYMD(toYMD(getMondayOf(new Date(y, m - 1, d, 12))))
    }
    showNotif(`${imported.length} séance(s) importée(s)`)
  }

  // ─── Add ───────────────────────────────────────────────────────────────────
  function addSession() {
    setDraftSession({
      id: `session-${Date.now()}`,
      date: weekDays[0] ?? toYMD(new Date()),
      title: 'Nouvelle séance',
      type: 'endurance',
      distanceMinKm: 8,
      distanceMaxKm: 10,
      surface: 'route',
      pace: 'conversationnelle',
      objective: "développer l'aérobie",
      priority: 'normale',
      status: 'prévu',
    })
  }

  // ─── Race goal ─────────────────────────────────────────────────────────────
  function handleRaceGoalSave(goal: RaceGoal | null) {
    setRaceGoal(goal)
    saveRaceGoal(goal)
    if (isSyncEnabled()) {
      syncRaceGoal(userId.current, goal).catch(() => setSyncState('error'))
    }
    showNotif(goal ? 'Objectif enregistré ✓' : 'Objectif supprimé')
  }

  // ─── Week notes ────────────────────────────────────────────────────────────
  function handleNoteChange(note: string) {
    const updated = { ...weekNotes, [mondayYMD]: note }
    setWeekNotes(updated)
    saveWeekNotes(updated)
    if (isSyncEnabled()) {
      syncWeekNotes(userId.current, updated).catch(() => setSyncState('error'))
    }
  }

  // ─── Notif ─────────────────────────────────────────────────────────────────
  function showNotif(msg: string) {
    setNotification(msg)
    setTimeout(() => setNotification(null), 2500)
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-zinc-300 border-t-zinc-800 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen" onTouchStart={handleTouchStart} onTouchEnd={handleTouchEnd}>

      {/* ── Navbar ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-canvas/95 backdrop-blur-sm border-b border-zinc-200/80">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 gap-2">

            {/* Logo */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-7 h-7 bg-zinc-900 rounded-lg flex items-center justify-center">
                <Calendar size={14} className="text-white" />
              </div>
              <span className="font-bold text-zinc-900 text-sm hidden sm:block">TrainingPlanner</span>
            </div>

            {/* Week nav */}
            <div className="flex items-center gap-1 flex-1 justify-center">
              <button onClick={() => changeWeek(-1)} className="p-1.5 rounded-lg hover:bg-zinc-200/80 text-zinc-500 transition-colors">
                <ChevronLeft size={18} />
              </button>
              <button onClick={goToday}
                className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  isCurrentWeek ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100'
                }`}>
                <span className="hidden lg:inline">{formatWeekRange(mondayYMD)}</span>
                <span className="hidden md:inline lg:hidden">{mobileWeekLabel()}</span>
                <span className="md:hidden">{mobileWeekLabel()}</span>
              </button>
              <button onClick={() => changeWeek(1)} className="p-1.5 rounded-lg hover:bg-zinc-200/80 text-zinc-500 transition-colors">
                <ChevronRight size={18} />
              </button>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0">

              {/* Sync status */}
              <SyncStatus state={syncState} onRetry={retrySync} />

              {/* Bouton Mon ID — ajoute ces lignes */}
              <button
                onClick={() => setShowUserPanel(true)}
                className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-500 transition-colors"
                title="Mon accès"
              >
                <UserCircle size={15} />
              </button>

              {/* Toggle vue — tablette + desktop */}
              <div className="hidden md:flex items-center bg-zinc-100 rounded-lg p-0.5 mx-1">
                {VIEW_MODES.map(({ mode, Icon, label }) => (
                  <button key={mode} onClick={() => setViewMode(mode)} title={label}
                    className={`p-1.5 rounded-md transition-colors ${
                      viewMode === mode ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-400 hover:text-zinc-600'
                    }`}>
                    <Icon size={15} />
                  </button>
                ))}
              </div>

              <button onClick={addSession}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-sm font-medium bg-zinc-900 text-white hover:bg-zinc-700 transition-colors">
                <Plus size={14} />
                <span className="hidden sm:inline">Ajouter</span>
              </button>
              <button onClick={() => setShowImport(true)}
                className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-500 transition-colors" title="Importer">
                <Upload size={15} />
              </button>
              <button onClick={() => { downloadAIExport(sessions, mondayYMD); showNotif('Export IA téléchargé') }}
                className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-500 transition-colors" title="Export IA">
                <BrainCircuit size={15} />
              </button>
              <button onClick={() => { exportJSON(sessions); showNotif('Sauvegarde téléchargée') }}
                className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-500 transition-colors" title="Sauvegarder JSON">
                <Database size={15} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main ────────────────────────────────────────────────────────────── */}
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4 space-y-4">

        {/* Race goal */}
        <RaceGoalBanner goal={raceGoal} onSave={handleRaceGoalSave} />

        {/* Toggle vue — mobile uniquement */}
        <div className="flex md:hidden items-center gap-1 p-1 bg-zinc-100 rounded-xl w-fit">
          {VIEW_MODES.map(({ mode, Icon, label }) => (
            <button key={mode} onClick={() => setViewMode(mode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === mode ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500'
              }`}>
              <Icon size={12} />
              {label}
            </button>
          ))}
        </div>

        {/* ── Vue semaine ──────────────────────────────────────────────────── */}
        {viewMode === 'week' && (
          <>
            <div className="flex items-center gap-1.5 flex-wrap">
              {FILTER_OPTIONS.map(({ value, label }) => (
                <button key={value} onClick={() => setFilter(value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    filter === value
                      ? 'bg-zinc-900 text-white border-zinc-900'
                      : 'bg-white text-zinc-500 border-zinc-200 hover:border-zinc-400'
                  }`}>
                  {label}
                </button>
              ))}
              {filter !== 'all' && (
                <span className="text-xs text-zinc-400">
                  {filteredSessions.filter(s => weekDays.includes(s.date)).length} séance(s)
                </span>
              )}
            </div>

            {weekDays.length > 0 && (
              <>
                {sessions.filter(s => weekDays.includes(s.date)).length === 0 && (
                  <div className="flex flex-col items-center justify-center py-14 text-center">
                    <div className="w-14 h-14 bg-white border-2 border-dashed border-zinc-300 rounded-2xl flex items-center justify-center mb-3">
                      <Calendar size={22} className="text-zinc-300" />
                    </div>
                    <h3 className="text-sm font-semibold text-zinc-700 mb-1">Aucune séance cette semaine</h3>
                    <p className="text-xs text-zinc-400 max-w-xs mb-4">Importez un planning ou ajoutez une séance</p>
                    <div className="flex gap-2">
                      <button onClick={() => setShowImport(true)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-zinc-900 text-white">
                        <Upload size={14} />Importer
                      </button>
                      <button onClick={addSession}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border border-zinc-300 text-zinc-700">
                        <Plus size={14} />Ajouter
                      </button>
                    </div>
                  </div>
                )}
                <WeekView
                  sessions={filteredSessions}
                  mondayYMD={mondayYMD}
                  onSessionClick={setEditingSession}
                  onSessionMove={moveSession}
                />
              </>
            )}

            {summary && (
              <WeekSummary
                summary={summary}
                weekNote={weekNotes[mondayYMD] ?? ''}
                onNoteChange={handleNoteChange}
                suggestions={suggestions}
              />
            )}
          </>
        )}

        {viewMode === 'multi' && (
          <MultiWeekView
            sessions={sessions}
            currentMondayYMD={mondayYMD}
            onWeekClick={(w) => { setMondayYMD(w); setViewMode('week') }}
          />
        )}

        {viewMode === 'chart' && (
          <WeekLoadChart sessions={sessions} currentMondayYMD={mondayYMD} />
        )}

        {/* Légende compacte */}
        {[
          { label: 'Course',  color: 'bg-emerald-500' },
          { label: 'Renfo',   color: 'bg-amber-500'   },
          { label: 'Vélo',    color: 'bg-cyan-500'    },
          { label: 'Repos',   color: 'bg-slate-300'   },
          { label: 'Natation', color: 'bg-indigo-500' },
        ].map(({ label, color }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className={`w-2 h-2 rounded-full ${color}`} />
            <span className="text-xs text-zinc-400">{label}</span>
          </div>
        ))}
      </main>

      {/* ── Modals ──────────────────────────────────────────────────────────── */}

      {showImport && (
        <ImportModal onImport={handleImport} onClose={() => setShowImport(false)} />
      )}

      {editingSession && (
        <EditSessionModal
          session={editingSession}
          onSave={(updated) => { updateSession(updated); setEditingSession(updated) }}
          onDelete={(id) => { deleteSession(id); setEditingSession(null) }}
          onClose={() => setEditingSession(null)}
          onOpenPostSession={() => {
            const current = sessions.find(s => s.id === editingSession.id) ?? editingSession
            setEditingSession(null)
            setPostSession(current)
          }}
          onDuplicate={duplicateSession}
        />
      )}

      {draftSession && (
        <EditSessionModal
          session={draftSession}
          onSave={(newSession) => {
            setSessions(prev => {
              const next = [...prev, newSession]
              saveSessions(next)
              scheduleSyncSessions(next)
              return next
            })
            setDraftSession(null)
            showNotif('Séance créée ✓')
          }}
          onDelete={() => setDraftSession(null)}
          onClose={() => setDraftSession(null)}
          onOpenPostSession={() => setDraftSession(null)}
          onDuplicate={duplicateSession}
        />
      )}

      {postSession && (
        <PostSessionModal
          session={postSession}
          onSave={(updated) => { updateSession(updated); showNotif('Séance enregistrée ✓') }}
          onClose={() => setPostSession(null)}
        />
      )}

      {showUserPanel && (
        <UserIdPanel
          userId={userId.current}
          onClose={() => setShowUserPanel(false)}
        />
      )}

      {notification && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] animate-slide-up pointer-events-none">
          <div className="bg-zinc-900 text-white text-sm font-medium px-5 py-3 rounded-2xl shadow-2xl">
            {notification}
          </div>
        </div>
      )}
    </div>
  )
}
