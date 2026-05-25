'use client'

import { useState, useEffect } from 'react'
import { WeekSummaryData } from '@/types/training'
import { AlertTriangle, CheckCircle2, FileText, ChevronDown, Bike, Dumbbell, Route, Waves } from 'lucide-react'

interface Props {
  summary: WeekSummaryData
  weekNote: string
  onNoteChange: (note: string) => void
  suggestions: string[]
}

function formatStrengthTime(minutes: number): string {
  if (minutes <= 0) return '—'
  if (minutes < 60) return `${minutes} min`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`
}

export default function WeekSummary({ summary, weekNote, onNoteChange, suggestions }: Props) {
  const [editingNote, setEditingNote] = useState(false)
  const [draft, setDraft] = useState(weekNote)
  const [showSuggestions, setShowSuggestions] = useState(false)

  useEffect(() => { setDraft(weekNote) }, [weekNote])

  const completionPct = summary.sessionCount > 0
    ? Math.round((summary.completedCount / summary.sessionCount) * 100)
    : 0

  const hasCycling  = summary.cyclingKm > 0
  const hasStrength = summary.strengthMinutes > 0
  const hasRunning  = summary.runningMinKm > 0 || summary.runningMaxKm > 0
  const hasSuggestions = suggestions.length > 0 || summary.warnings.length > 0

  return (
    <div className="space-y-3">

      {/* Volume scindé */}
      <div className="grid gap-2" style={{
        gridTemplateColumns: [hasRunning, hasStrength, hasCycling].filter(Boolean).length === 1
          ? '1fr 1fr'
          : `repeat(${[hasRunning, hasStrength, hasCycling].filter(Boolean).length + 1}, 1fr)`
      }}>
        {/* Course */}
        {hasRunning && (
          <VolumeCard
            icon={<Route size={13} className="text-emerald-600" />}
            label="Course"
            value={summary.runningMinKm === summary.runningMaxKm
              ? `${summary.runningMinKm} km`
              : `${summary.runningMinKm}–${summary.runningMaxKm} km`
            }
            accent="text-emerald-600"
          />
        )}

        {/* Renfo */}
        {hasStrength && (
          <VolumeCard
            icon={<Dumbbell size={13} className="text-yellow-600" />}
            label="Renfo"
            value={formatStrengthTime(summary.strengthMinutes)}
            accent="text-yellow-600"
          />
        )}

        {/* Vélo */}
        {hasCycling && (
          <VolumeCard
            icon={<Bike size={13} className="text-cyan-600" />}
            label="Vélo"
            value={`${summary.cyclingKm} km`}
            accent="text-cyan-600"
          />
        )}

        {summary.swimmingKm > 0 && (
          <VolumeCard
            icon={<Waves size={13} className="text-indigo-600" />}
            label="Natation"
            value={`${summary.swimmingKm} km`}
            accent="text-indigo-600"
          />
        )}

        {/* Réalisées */}
        <VolumeCard
          icon={<CheckCircle2 size={13} className="text-indigo-600" />}
          label="Réalisées"
          value={`${summary.completedCount}/${summary.sessionCount}`}
          accent="text-indigo-600"
          extra={
            <div className="mt-1.5 h-1 bg-zinc-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full transition-all duration-500"
                style={{ width: `${completionPct}%` }} />
            </div>
          }
        />
      </div>

      {/* Note de semaine */}
      <div className="bg-white rounded-xl border border-zinc-200 px-4 py-3">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
            <FileText size={11} />
            Note de semaine
          </div>
          {!editingNote && (
            <button onClick={() => setEditingNote(true)}
              className="text-[10px] text-zinc-400 hover:text-zinc-600 transition-colors">
              {weekNote ? 'Modifier' : '+ Ajouter'}
            </button>
          )}
        </div>
        {editingNote ? (
          <div className="space-y-2">
            <textarea autoFocus rows={2} value={draft}
              onChange={e => setDraft(e.target.value)}
              placeholder="Semaine chargée au boulot, rhume, pic de forme..."
              className="w-full text-sm bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 focus:outline-none focus:border-zinc-400 resize-none" />
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setEditingNote(false); setDraft(weekNote) }}
                className="text-xs text-zinc-400 hover:text-zinc-600 px-2 py-1 rounded transition-colors">
                Annuler
              </button>
              <button onClick={() => { onNoteChange(draft); setEditingNote(false) }}
                className="text-xs font-semibold bg-zinc-900 text-white px-3 py-1 rounded-lg hover:bg-zinc-700 transition-colors">
                Sauvegarder
              </button>
            </div>
          </div>
        ) : (
          <p className={`text-sm cursor-text ${weekNote ? 'text-zinc-700' : 'text-zinc-300 italic'}`}
            onClick={() => setEditingNote(true)}>
            {weekNote || 'Aucune note pour cette semaine'}
          </p>
        )}
      </div>

      {/* Alertes collapsibles */}
      {hasSuggestions && (
        <div className="rounded-xl border border-zinc-200 bg-white overflow-hidden">
          <button onClick={() => setShowSuggestions(v => !v)}
            className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-zinc-50 transition-colors">
            <div className="flex items-center gap-2">
              <AlertTriangle size={13} className={summary.warnings.length > 0 ? 'text-amber-500' : 'text-blue-400'} />
              <span className="text-xs font-semibold text-zinc-600">
                {summary.warnings.length > 0
                  ? `${summary.warnings.length} alerte${summary.warnings.length > 1 ? 's' : ''}`
                  : `${suggestions.length} suggestion${suggestions.length > 1 ? 's' : ''}`
                }
              </span>
            </div>
            <ChevronDown size={14} className={`text-zinc-400 transition-transform ${showSuggestions ? 'rotate-180' : ''}`} />
          </button>
          {showSuggestions && (
            <div className="px-4 pb-3 space-y-1.5 border-t border-zinc-100">
              {summary.warnings.map((w, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-amber-700 bg-amber-50 rounded-lg px-3 py-2">
                  <AlertTriangle size={11} className="text-amber-500 shrink-0 mt-0.5" />{w}
                </div>
              ))}
              {suggestions.map((s, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-blue-700 bg-blue-50 rounded-lg px-3 py-2">
                  <span className="shrink-0">💡</span>{s}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function VolumeCard({ icon, label, value, accent, extra }: {
  icon: React.ReactNode; label: string; value: string; accent?: string; extra?: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-xl border border-zinc-200 p-3">
      <div className={`flex items-center gap-1.5 mb-1 ${accent ?? 'text-zinc-500'}`}>
        {icon}
        <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wide">{label}</span>
      </div>
      <p className="text-sm font-bold text-zinc-800 leading-tight tabular-nums">{value}</p>
      {extra}
    </div>
  )
}
