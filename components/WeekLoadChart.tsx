'use client'

import { useState } from 'react'
import { TrainingSession, isRunningType, isStrengthType, isCyclingType, isSwimmingType } from '@/types/training'
import { getMondayOf, toYMD, getWeekDays, parseDurationToMinutes } from '@/lib/utils'

interface Props {
  sessions: TrainingSession[]
  currentMondayYMD: string
}

type Metric = 'running' | 'strength' | 'cycling' | 'swimming'

interface WeekData {
  monday: string
  label: string
  runningPlanned: number
  runningActual: number
  strengthPlanned: number
  cyclingPlanned: number
  swimmingPlanned: number
  sessionCount: number
  doneCount: number
  isCurrent: boolean
  isPast: boolean
}

function getWeeksAround(mondayYMD: string, before: number, after: number): string[] {
  const [y, m, d] = mondayYMD.split('-').map(Number)
  return Array.from({ length: before + 1 + after }, (_, i) => {
    const date = new Date(y, m - 1, d + (i - before) * 7, 12)
    return toYMD(getMondayOf(date))
  })
}

function shortLabel(mondayYMD: string): string {
  const [y, m, d] = mondayYMD.split('-').map(Number)
  const date = new Date(y, m - 1, d, 12)
  const months = ['jan', 'fév', 'mar', 'avr', 'mai', 'jun', 'jul', 'aoû', 'sep', 'oct', 'nov', 'déc']
  return `${date.getDate()} ${months[date.getMonth()]}`
}

function computeWeekData(sessions: TrainingSession[], mondayYMD: string, currentMondayYMD: string): WeekData {
  const days = getWeekDays(mondayYMD)
  const week = sessions.filter(s => days.includes(s.date) && s.status !== 'annulé')
  const todayMonday = toYMD(getMondayOf(new Date()))

  const runningSessions = week.filter(s => isRunningType(s.type))
  const runningPlanned = Math.round(runningSessions.reduce((sum, s) => sum + (s.distanceMinKm + s.distanceMaxKm) / 2, 0))
  const runningActual = Math.round(
    runningSessions.filter(s => s.status === 'fait' && s.postSession?.actualDistanceKm)
      .reduce((sum, s) => sum + (s.postSession?.actualDistanceKm || 0), 0)
  )
  const strengthPlanned = week.filter(s => isStrengthType(s.type))
    .reduce((sum, s) => sum + parseDurationToMinutes(s.estimatedDuration), 0)
  const cyclingPlanned = Math.round(
    week.filter(s => isCyclingType(s.type))
      .reduce((sum, s) => sum + (s.distanceMinKm + s.distanceMaxKm) / 2, 0)
  )
  const swimmingPlanned = Math.round(
    week.filter(s => isSwimmingType(s.type))
      .reduce((sum, s) => sum + (s.distanceMinKm + s.distanceMaxKm) / 2, 0)
  )

  return {
    monday: mondayYMD, label: shortLabel(mondayYMD),
    runningPlanned, runningActual, strengthPlanned, cyclingPlanned, swimmingPlanned,
    sessionCount: week.length,
    doneCount: week.filter(s => s.status === 'fait').length,
    isCurrent: mondayYMD === currentMondayYMD,
    isPast: mondayYMD < todayMonday,
  }
}

const METRIC_CONFIG = {
  running:  { label: 'Course',   unit: 'km',  color: 'bg-emerald-500', actualColor: 'bg-emerald-700', soft: 'bg-emerald-100', text: 'text-emerald-700' },
  strength: { label: 'Renfo',    unit: 'min', color: 'bg-amber-500',   actualColor: 'bg-amber-700',   soft: 'bg-amber-100',   text: 'text-amber-700'  },
  cycling:  { label: 'Vélo',     unit: 'km',  color: 'bg-cyan-500',    actualColor: 'bg-cyan-700',    soft: 'bg-cyan-100',    text: 'text-cyan-700'   },
  swimming: { label: 'Natation', unit: 'km',  color: 'bg-indigo-500',  actualColor: 'bg-indigo-700',  soft: 'bg-indigo-100',  text: 'text-indigo-700' },
}

function formatValue(value: number, unit: string): string {
  if (value <= 0) return '—'
  if (unit === 'min') {
    if (value < 60) return `${value}min`
    const h = Math.floor(value / 60), m = value % 60
    return m > 0 ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`
  }
  return `${value} km`
}

function formatBarLabel(value: number, unit: string): string {
  if (value <= 0) return ''
  if (unit === 'min') {
    if (value < 60) return `${value}m`
    const h = Math.floor(value / 60), m = value % 60
    return m > 0 ? `${h}h${m}` : `${h}h`
  }
  return `${value}`
}

function getMetricValue(week: WeekData, metric: Metric): number {
  if (metric === 'running')  return week.runningPlanned
  if (metric === 'strength') return week.strengthPlanned
  if (metric === 'cycling')  return week.cyclingPlanned
  if (metric === 'swimming') return week.swimmingPlanned
  return 0
}

const GRID_LINES = [0.25, 0.5, 0.75, 1]

export default function WeekLoadChart({ sessions, currentMondayYMD }: Props) {
  const [activeMetrics, setActiveMetrics] = useState<Set<Metric>>(new Set<Metric>(['running', 'strength', 'cycling', 'swimming'] as Metric[]))
  const [showActual, setShowActual] = useState(true)

  const weeks = getWeeksAround(currentMondayYMD, 3, 4)
  const data = weeks.map(w => computeWeekData(sessions, w, currentMondayYMD))

  const hasRunning  = data.some(d => d.runningPlanned > 0 || d.runningActual > 0)
  const hasStrength = data.some(d => d.strengthPlanned > 0)
  const hasCycling  = data.some(d => d.cyclingPlanned > 0)
  const hasSwimming = data.some(d => d.swimmingPlanned > 0)

  const availableMetrics = (['running', 'strength', 'cycling', 'swimming'] as Metric[]).filter(m => {
    if (m === 'running')  return hasRunning
    if (m === 'strength') return hasStrength
    if (m === 'cycling')  return hasCycling
    if (m === 'swimming') return hasSwimming
    return false
  })

  const visibleMetrics = availableMetrics.filter(m => activeMetrics.has(m))
  const currentWeek = data.find(d => d.isCurrent)

  const maxByMetric: Record<Metric, number> = {
    running:  Math.max(...data.map(d => Math.max(d.runningPlanned, d.runningActual)), 1),
    strength: Math.max(...data.map(d => d.strengthPlanned), 1),
    cycling:  Math.max(...data.map(d => d.cyclingPlanned), 1),
    swimming: Math.max(...data.map(d => d.swimmingPlanned), 1),
  }

  function toggleMetric(metric: Metric) {
    setActiveMetrics(prev => {
      const next = new Set(prev)
      if (next.has(metric) && next.size > 1) next.delete(metric)
      else next.add(metric)
      return next as Set<Metric>
    })
  }

  const BAR_AREA_H = 160

  return (
    <div className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-4">

      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h3 className="text-sm font-bold text-zinc-900">Charge hebdomadaire</h3>
          {currentWeek && (
            <p className="text-xs text-zinc-500 mt-0.5">
              Cette semaine · {currentWeek.doneCount}/{currentWeek.sessionCount} séances
              {currentWeek.runningPlanned > 0 && ` · ${formatValue(currentWeek.runningActual > 0 && showActual ? currentWeek.runningActual : currentWeek.runningPlanned, 'km')} course`}
              {currentWeek.strengthPlanned > 0 && ` · ${formatValue(currentWeek.strengthPlanned, 'min')} renfo`}
              {currentWeek.swimmingPlanned > 0 && ` · ${formatValue(currentWeek.swimmingPlanned, 'km')} natation`}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {availableMetrics.map(metric => {
            const cfg = METRIC_CONFIG[metric]
            const active = activeMetrics.has(metric)
            return (
              <button key={metric} type="button" onClick={() => toggleMetric(metric)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                  active ? `${cfg.soft} ${cfg.text} border-transparent` : 'bg-white text-zinc-400 border-zinc-200 hover:bg-zinc-50'
                }`}>
                <span className={`w-2 h-2 rounded-full ${active ? cfg.color : 'bg-zinc-300'}`} />
                {cfg.label}
              </button>
            )
          })}
          {hasRunning && (
            <button type="button" onClick={() => setShowActual(v => !v)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition ${
                showActual ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-400 border-zinc-200 hover:bg-zinc-50'
              }`}>
              Réalisé
            </button>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <div style={{ minWidth: '640px' }}>
          <div className="relative" style={{ height: `${BAR_AREA_H + 48}px` }}>

            <div className="absolute inset-x-0 top-0" style={{ height: `${BAR_AREA_H}px` }}>
              {GRID_LINES.map(ratio => (
                <div key={ratio} className="absolute inset-x-0 border-t border-zinc-100"
                  style={{ bottom: `${ratio * 100}%` }} />
              ))}
            </div>

            <div className="absolute inset-x-0 bottom-0 flex gap-2 px-1" style={{ height: `${BAR_AREA_H + 48}px` }}>
              {data.map(week => {
                const pct = week.sessionCount > 0 ? Math.round((week.doneCount / week.sessionCount) * 100) : 0
                return (
                  <div key={week.monday} className="flex-1 flex flex-col" style={{ minWidth: '68px' }}>
                    <div
                      className={`flex-1 flex items-end justify-center gap-1.5 rounded-xl px-1 pt-5 pb-2 transition ${
                        week.isCurrent ? 'bg-indigo-50/60' : 'hover:bg-zinc-50'
                      }`}
                      style={{ height: `${BAR_AREA_H}px` }}
                    >
                      {visibleMetrics.map(metric => {
                        const cfg = METRIC_CONFIG[metric]
                        const planned = getMetricValue(week, metric)
                        const displayVal = metric === 'running' && showActual && week.runningActual > 0
                          ? week.runningActual : planned
                        const heightPct = displayVal > 0 ? Math.max(6, (displayVal / maxByMetric[metric]) * 100) : 0
                        const barLabel = formatBarLabel(displayVal, cfg.unit)
                        const barW = visibleMetrics.length === 1 ? 36 : visibleMetrics.length === 2 ? 28 : visibleMetrics.length === 3 ? 20 : 16

                        return (
                          <div key={metric} className="flex flex-col items-center justify-end gap-1"
                            style={{ width: barW, height: '100%' }}>
                            <span className={`text-[9px] font-bold leading-none ${displayVal > 0 ? cfg.text : 'invisible'}`}>
                              {barLabel || '·'}
                            </span>
                            <div
                              className={`w-full rounded-t-md transition-all ${
                                displayVal > 0
                                  ? (metric === 'running' && showActual && week.runningActual > 0 ? cfg.actualColor : cfg.color)
                                  : 'bg-zinc-100'
                              } ${week.isPast && !week.isCurrent ? 'opacity-60' : ''}`}
                              style={{ height: displayVal > 0 ? `${heightPct}%` : '3px' }}
                              title={`${cfg.label} : ${formatValue(displayVal, cfg.unit)}`}
                            />
                          </div>
                        )
                      })}
                    </div>

                    <div className="flex flex-col items-center pt-2 gap-0.5" style={{ height: '48px' }}>
                      <span className={`text-[11px] text-center leading-tight ${
                        week.isCurrent ? 'font-black text-zinc-900' : 'font-medium text-zinc-400'
                      }`}>
                        {week.label}
                      </span>
                      {week.sessionCount > 0 && (
                        <span className={`text-[10px] ${
                          week.isPast && !week.isCurrent
                            ? pct >= 100 ? 'text-emerald-500 font-semibold' : pct >= 60 ? 'text-zinc-500' : 'text-red-400'
                            : 'text-zinc-300'
                        }`}>
                          {week.isPast || week.isCurrent ? `${week.doneCount}/${week.sessionCount}` : `${week.sessionCount} séances`}
                        </span>
                      )}
                      {week.isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-0.5" />}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="flex items-center justify-center gap-4 pt-2 text-[11px] text-zinc-500 flex-wrap">
            {visibleMetrics.map(metric => {
              const cfg = METRIC_CONFIG[metric]
              return (
                <span key={metric} className="flex items-center gap-1.5">
                  <span className={`w-3 h-2.5 rounded ${cfg.color}`} />
                  {cfg.label} ({cfg.unit})
                </span>
              )
            })}
            {showActual && hasRunning && activeMetrics.has('running') && (
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-2.5 rounded bg-emerald-700" />
                Course réalisée (km)
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 border-t border-zinc-100">
        {hasRunning && activeMetrics.has('running') && (
          <div className="text-center">
            <p className="text-[10px] text-zinc-400 uppercase tracking-wide mb-1">Course · 8 sem</p>
            <p className="text-sm font-bold text-emerald-700">{data.reduce((s, d) => s + d.runningPlanned, 0)} km</p>
            {data.some(d => d.runningActual > 0) && showActual && (
              <p className="text-xs text-emerald-600">{data.reduce((s, d) => s + d.runningActual, 0)} réalisés</p>
            )}
          </div>
        )}
        {hasStrength && activeMetrics.has('strength') && (
          <div className="text-center">
            <p className="text-[10px] text-zinc-400 uppercase tracking-wide mb-1">Renfo · 8 sem</p>
            <p className="text-sm font-bold text-amber-700">
              {formatValue(data.reduce((s, d) => s + d.strengthPlanned, 0), 'min')}
            </p>
          </div>
        )}
        {hasCycling && activeMetrics.has('cycling') && (
          <div className="text-center">
            <p className="text-[10px] text-zinc-400 uppercase tracking-wide mb-1">Vélo · 8 sem</p>
            <p className="text-sm font-bold text-cyan-700">{data.reduce((s, d) => s + d.cyclingPlanned, 0)} km</p>
          </div>
        )}
        {hasSwimming && activeMetrics.has('swimming') && (
          <div className="text-center">
            <p className="text-[10px] text-zinc-400 uppercase tracking-wide mb-1">Natation · 8 sem</p>
            <p className="text-sm font-bold text-indigo-700">{data.reduce((s, d) => s + d.swimmingPlanned, 0)} km</p>
          </div>
        )}
      </div>
    </div>
  )
}