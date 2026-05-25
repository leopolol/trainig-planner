'use client'

import { useState, useRef, useEffect } from 'react'
import {
  DndContext, DragEndEvent, DragOverlay, DragStartEvent,
  MouseSensor, useSensor, useSensors,
} from '@dnd-kit/core'
import { TrainingSession } from '@/types/training'
import { getWeekDays, formatDayLabel, isToday } from '@/lib/utils'
import DayColumn from './DayColumn'
import SessionCard from './SessionCard'

interface Props {
  sessions: TrainingSession[]
  mondayYMD: string
  onSessionClick: (session: TrainingSession) => void
  onSessionMove: (sessionId: string, newDate: string) => void
}

export default function WeekView({ sessions, mondayYMD, onSessionClick, onSessionMove }: Props) {
  const [activeSession, setActiveSession] = useState<TrainingSession | null>(null)
  const mousePos = useRef({ x: 0, y: 0 })
  const weekDays = getWeekDays(mondayYMD)

  useEffect(() => {
    const handler = (e: MouseEvent) => { mousePos.current = { x: e.clientX, y: e.clientY } }
    window.addEventListener('mousemove', handler)
    return () => window.removeEventListener('mousemove', handler)
  }, [])

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } })
  )

  function handleDragStart(event: DragStartEvent) {
    setActiveSession(event.active.data.current?.session ?? null)
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveSession(null)
    const { active } = event
    const elements = document.elementsFromPoint(mousePos.current.x, mousePos.current.y)
    const target = elements.find(el => el.hasAttribute('data-date'))
    if (!target) return
    const newDate = target.getAttribute('data-date')
    if (newDate && weekDays.includes(newDate)) {
      onSessionMove(active.id as string, newDate)
    }
  }

  return (
    <>
      {/* Desktop + tablette : grille 7 colonnes avec DnD */}
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="hidden md:grid md:grid-cols-7 gap-2">
          {weekDays.map(day => (
            <DayColumn key={day} date={day}
              sessions={sessions.filter(s => s.date === day)}
              onSessionClick={onSessionClick}
            />
          ))}
        </div>
        <DragOverlay dropAnimation={null}>
          {activeSession && (
            <div className="rotate-1 scale-105 opacity-90 pointer-events-none">
              <SessionCard session={activeSession} onClick={() => {}} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Mobile : vue agenda */}
      <div className="md:hidden divide-y divide-zinc-100 rounded-2xl border border-zinc-200 bg-white overflow-hidden">
        {weekDays.map(day => {
          const daySessions = sessions.filter(s => s.date === day)
          const label = formatDayLabel(day)
          const today = isToday(day)
          const isWeekend = label.day === 'Sam' || label.day === 'Dim'
          const isEmpty = daySessions.length === 0

          return (
            <div key={day} className={`flex gap-0 ${isEmpty ? 'opacity-60' : ''}`}>
              {/* Colonne jour */}
              <div className={`
                w-16 shrink-0 flex flex-col items-center justify-start pt-4 pb-3 border-r border-zinc-100
                ${today ? 'bg-indigo-600' : isWeekend ? 'bg-zinc-50' : 'bg-white'}
              `}>
                <span className={`text-[10px] font-bold uppercase tracking-wider ${today ? 'text-indigo-200' : 'text-zinc-400'}`}>
                  {label.day}
                </span>
                <span className={`text-2xl font-black leading-tight ${today ? 'text-white' : 'text-zinc-800'}`}>
                  {label.num}
                </span>
                <span className={`text-[9px] mt-0.5 ${today ? 'text-indigo-300' : 'text-zinc-300'}`}>
                  {label.month}
                </span>
              </div>

              {/* Séances */}
              <div className="flex-1 p-3 flex flex-col gap-2 min-h-[72px]">
                {isEmpty ? (
                  <div className="flex items-center h-full">
                    <span className="text-xs text-zinc-300 italic">—</span>
                  </div>
                ) : (
                  daySessions.map(s => (
                    <SessionCard key={s.id} session={s} onClick={onSessionClick} />
                  ))
                )}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
