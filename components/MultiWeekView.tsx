'use client'

import { TrainingSession } from '@/types/training'
import { getMondayOf, toYMD, getWeekDays, formatWeekRange, getColors } from '@/lib/utils'

interface Props {
  sessions: TrainingSession[]
  currentMondayYMD: string
  onWeekClick: (mondayYMD: string) => void
}

function getWeeksFrom(mondayYMD: string, count: number): string[] {
  return Array.from({ length: count }, (_, i) => {
    const [y, m, d] = mondayYMD.split('-').map(Number)
    const date = new Date(y, m - 1, d + i * 7, 12)
    return toYMD(getMondayOf(date))
  })
}

const DAY_LABELS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

export default function MultiWeekView({ sessions, currentMondayYMD, onWeekClick }: Props) {
  const weeks = getWeeksFrom(currentMondayYMD, 4)
  const todayYMD = toYMD(new Date())

  return (
    <div className="space-y-3">
      {weeks.map(monday => {
        const days = getWeekDays(monday)
        const weekSessions = sessions.filter(s => days.includes(s.date))
        const totalMin = weekSessions.filter(s => s.status !== 'annulé' && s.type !== 'repos').reduce((sum, s) => sum + s.distanceMinKm, 0)
        const totalMax = weekSessions.filter(s => s.status !== 'annulé' && s.type !== 'repos').reduce((sum, s) => sum + s.distanceMaxKm, 0)
        const doneCount = weekSessions.filter(s => s.status === 'fait').length
        const totalCount = weekSessions.filter(s => s.type !== 'repos').length
        const isCurrent = monday === currentMondayYMD
        const hasToday = days.includes(todayYMD)

        return (
          <button
            key={monday}
            onClick={() => onWeekClick(monday)}
            className={`
              w-full text-left rounded-2xl border p-4 transition-all
              ${isCurrent ? 'border-indigo-300 bg-indigo-50/60 shadow-sm' : 'border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-sm'}
            `}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold ${isCurrent ? 'text-indigo-700' : 'text-zinc-700'}`}>
                  {formatWeekRange(monday)}
                </span>
                {hasToday && (
                  <span className="text-[10px] bg-indigo-600 text-white px-1.5 py-0.5 rounded-full font-medium">
                    Cette semaine
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs">
                {totalMin > 0 ? (
                  <span className="font-mono font-semibold text-zinc-600">{totalMin}–{totalMax} km</span>
                ) : (
                  <span className="text-zinc-300 italic text-xs">Vide</span>
                )}
                {doneCount > 0 && (
                  <span className="text-emerald-600 font-medium">{doneCount}/{totalCount} ✓</span>
                )}
              </div>
            </div>

            {/* 7 colonnes alignées — chaque colonne = 1 jour */}
            <div className="grid grid-cols-7 gap-1">
              {days.map((day, i) => {
                const daySessions = weekSessions.filter(s => s.date === day)
                const isToday = day === todayYMD

                return (
                  <div key={day} className="flex flex-col items-center gap-1">
                    {/* Lettre du jour */}
                    <span className={`text-[10px] font-bold ${isToday ? 'text-indigo-600' : 'text-zinc-400'}`}>
                      {DAY_LABELS[i]}
                    </span>

                    {/* Barres colorées */}
                    <div className="flex flex-col gap-0.5 w-full">
                      {daySessions.length === 0 ? (
                        <div className="h-2 rounded-full bg-zinc-100" />
                      ) : (
                        daySessions.map(s => {
                          const colors = getColors(s.type)
                          return (
                            <div key={s.id}
                              className={`h-2 rounded-full ${colors.dot} ${
                                s.status === 'annulé' ? 'opacity-25' :
                                s.status === 'fait' ? 'opacity-100' : 'opacity-65'
                              }`}
                            />
                          )
                        })
                      )}
                    </div>

                    {/* Labels alignés sous chaque colonne */}
                    <div className="flex flex-col items-center gap-0.5 w-full">
                      {daySessions.length === 0 ? (
                        <span className="text-[9px] text-transparent select-none">·</span>
                      ) : (
                        daySessions.map(s => {
                          const short =
                            s.type === 'sortie longue' ? 'long' :
                            s.type === 'récupération' ? 'récup' :
                            s.type === 'renforcement' ? 'renfo' :
                            s.type === 'endurance' ? 'endu' :
                            s.type
                          const colors = getColors(s.type)
                          return (
                            <span key={s.id}
                              className={`text-[9px] font-semibold leading-tight truncate w-full text-center ${
                                s.status === 'annulé' ? 'text-zinc-300 line-through' : colors.text + ' opacity-80'
                              }`}
                            >
                              {short}
                            </span>
                          )
                        })
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </button>
        )
      })}
    </div>
  )
}
