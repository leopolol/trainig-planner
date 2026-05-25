'use client'

import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { TrainingSession, isStrengthType } from '@/types/training'
import { getColors, formatDistance } from '@/lib/utils'
import { MapPin, Flame, CheckCircle2, XCircle, Circle, Clock } from 'lucide-react'

interface Props {
  session: TrainingSession
  onClick: (session: TrainingSession) => void
}

const STATUS_ICONS: Record<string, React.ReactNode> = {
  prévu:   <Circle size={10} className="text-slate-400" />,
  fait:    <CheckCircle2 size={10} className="text-emerald-500" />,
  annulé:  <XCircle size={10} className="text-red-400" />,
}

const PRIORITY_DOTS: Record<string, string> = {
  faible:     'bg-slate-300',
  normale:    'bg-blue-400',
  importante: 'bg-red-500',
}

export default function SessionCard({ session, onClick }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: session.id,
    data: { session },
  })

  const colors = getColors(session.type)
  const isCancelled = session.status === 'annulé'
  const isDone = session.status === 'fait'
  const isStrength = isStrengthType(session.type)

  // Distance display: null for strength, "10 km" if min=max, "8-12 km" otherwise
  const kmDisplay = isStrength ? null : formatDistance(session.distanceMinKm, session.distanceMaxKm)

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform), touchAction: 'none' }}
      {...attributes}
      {...listeners}
      onClick={() => { if (!isDragging) onClick(session) }}
      className={`
        relative rounded-xl border-l-4 select-none
        p-2 md:p-2 lg:p-3
        ${colors.bg} ${colors.border}
        ${isDragging ? 'opacity-30 scale-95 shadow-2xl' : 'shadow-sm hover:shadow-md'}
        ${isCancelled ? 'opacity-40 grayscale' : ''}
        ${isDone ? 'ring-1 ring-emerald-200' : ''}
        cursor-grab active:cursor-grabbing transition-all duration-100
      `}
    >
      {isDone && (
        <div className="absolute top-1.5 right-1.5 opacity-15 hidden lg:block">
          <CheckCircle2 size={28} className="text-emerald-600" />
        </div>
      )}

      {/* Title */}
      <div className="flex items-start justify-between gap-1 mb-1">
        <span className={`
          font-semibold leading-tight ${colors.text}
          text-xs md:text-[11px] lg:text-sm
          ${isCancelled ? 'line-through' : ''}
        `}>
          {session.title}
        </span>
        <div className="flex items-center gap-0.5 shrink-0">
          <span className={`w-1.5 h-1.5 rounded-full ${PRIORITY_DOTS[session.priority] ?? 'bg-slate-300'}`} />
          {STATUS_ICONS[session.status] ?? STATUS_ICONS.prévu}
        </div>
      </div>

      {/* Type badge */}
      <div className="mb-1.5">
        <span className={`inline-block font-medium px-1.5 py-0.5 rounded-md text-[10px] ${colors.badge}`}>
          {session.type}
        </span>
      </div>

      {/* Meta row — km OR duration depending on type */}
      <div className="flex items-center gap-2 flex-wrap" style={{ fontSize: '10px' }}>
        {kmDisplay && (
          <span className="flex items-center gap-1 text-zinc-500 font-mono">
            <MapPin size={9} />
            {kmDisplay}
          </span>
        )}
        {isStrength && session.estimatedDuration && (
          <span className="flex items-center gap-1 text-zinc-500">
            <Clock size={9} />
            {session.estimatedDuration}
          </span>
        )}
        {!isStrength && session.estimatedDuration && (
          <span className="hidden lg:flex items-center gap-1 text-zinc-400">
            <Clock size={9} />
            {session.estimatedDuration}
          </span>
        )}
      </div>

      {/* Post-session data */}
      {isDone && session.postSession && (
        <div className="mt-1.5 pt-1.5 border-t border-black/5 flex items-center gap-2 flex-wrap" style={{ fontSize: '10px' }}>
          {session.postSession.actualDistanceKm && (
            <span className="text-emerald-600 font-semibold font-mono">
              {session.postSession.actualDistanceKm} km
            </span>
          )}
          {session.postSession.duration && isStrength && (
            <span className="text-emerald-600 font-medium">{session.postSession.duration}</span>
          )}
          {session.postSession.feeling && (
            <span className="flex items-center gap-0.5 text-zinc-400">
              <Flame size={9} className="text-orange-400" />
              {session.postSession.feeling}/10
            </span>
          )}
        </div>
      )}
    </div>
  )
}
