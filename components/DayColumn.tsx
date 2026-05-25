'use client'

import { TrainingSession } from '@/types/training'
import { formatDayLabel, isToday } from '@/lib/utils'
import SessionCard from './SessionCard'

interface Props {
  date: string
  sessions: TrainingSession[]
  onSessionClick: (session: TrainingSession) => void
}

export default function DayColumn({ date, sessions, onSessionClick }: Props) {
  const label = formatDayLabel(date)
  const today = isToday(date)

  return (
    <div data-date={date}
      className="flex flex-col rounded-xl border border-zinc-200/80 bg-white/60"
      style={{ minHeight: '140px' }}
    >
      {/* Header */}
      <div data-date={date}
        className={`
          flex flex-col items-center justify-center border-b border-zinc-100 rounded-t-xl shrink-0
          py-2 md:py-2 lg:py-2.5
          ${today ? 'bg-indigo-600' : 'bg-transparent'}
        `}
      >
        <span className={`font-bold uppercase tracking-widest leading-none text-[9px] lg:text-[10px]
          ${today ? 'text-indigo-200' : 'text-zinc-400'}`}>
          {label.day}
        </span>
        <span className={`font-black leading-tight mt-0.5 text-base lg:text-lg
          ${today ? 'text-white' : 'text-zinc-800'}`}>
          {label.num}
        </span>
        <span className={`hidden lg:block text-[9px] mt-0.5
          ${today ? 'text-indigo-300' : 'text-zinc-300'}`}>
          {label.month}
        </span>
      </div>

      {/* Sessions — scrollable quand plein */}
      <div data-date={date}
        className="flex flex-col gap-1.5 p-1.5 lg:p-2 flex-1 overflow-y-auto"
        style={{ maxHeight: '420px' }}
      >
        {sessions.length === 0 ? (
          <div data-date={date}
            className="flex-1 min-h-[48px] rounded-lg border border-dashed border-zinc-200 flex items-center justify-center text-zinc-300"
            style={{ fontSize: '11px' }}
          >—</div>
        ) : (
          sessions.map(s => (
            <SessionCard key={s.id} session={s} onClick={onSessionClick} />
          ))
        )}
      </div>
    </div>
  )
}
