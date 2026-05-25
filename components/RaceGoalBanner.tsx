'use client'

import { useState } from 'react'
import { RaceGoal } from '@/types/training'
import { Trophy, X, Edit2, Save, MapPin, Clock, Mountain, Hash, FileText } from 'lucide-react'

interface Props {
  goal: RaceGoal | null
  onSave: (goal: RaceGoal | null) => void
}

const EMPTY: RaceGoal = {
  name: '', date: '', distanceKm: undefined, elevationGainM: undefined,
  startTime: '', location: '', targetTime: '', dossard: '', notes: '',
}

export default function RaceGoalBanner({ goal, onSave }: Props) {
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState<RaceGoal>(goal ?? EMPTY)

  function f(field: keyof RaceGoal, value: string | number | undefined) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function getDaysLeft(): number | null {
    if (!goal?.date) return null
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const [y, m, d] = goal.date.split('-').map(Number)
    const race = new Date(y, m - 1, d)
    return Math.ceil((race.getTime() - today.getTime()) / 86400000)
  }

  function getCountdown(days: number): { text: string; color: string } {
    if (days < 0)   return { text: 'Passée',        color: 'text-zinc-400' }
    if (days === 0) return { text: "Aujourd'hui !",  color: 'text-emerald-600' }
    if (days <= 7)  return { text: `J-${days}`,      color: 'text-red-500' }
    if (days <= 30) return { text: `J-${days}`,      color: 'text-orange-500' }
    if (days <= 90) return { text: `${Math.ceil(days / 7)} sem`, color: 'text-amber-600' }
    return { text: `${Math.ceil(days / 30)} mois`, color: 'text-indigo-600' }
  }

  function handleSave() {
    if (!form.name || !form.date) return
    onSave(form)
    setEditing(false)
  }

  const daysLeft = getDaysLeft()
  const countdown = daysLeft !== null ? getCountdown(daysLeft) : null

  if (editing) {
    return (
      <div className="bg-white border border-zinc-200 rounded-2xl p-5 animate-slide-up">
        <div className="flex items-center gap-2 mb-4">
          <Trophy size={16} className="text-amber-500" />
          <span className="text-sm font-bold text-zinc-800">Objectif de course</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <Field label="Nom de la course *">
            <input type="text" placeholder="Ultra Trail des Montagnes" value={form.name}
              onChange={e => f('name', e.target.value)} className={iCls} />
          </Field>
          <Field label="Date *">
            <input type="date" value={form.date} onChange={e => f('date', e.target.value)} className={iCls} />
          </Field>
          <Field label="Distance (km)">
            <input type="number" placeholder="50" value={form.distanceKm ?? ''}
              onChange={e => f('distanceKm', e.target.value ? parseFloat(e.target.value) : undefined)} className={iCls} />
          </Field>
          <Field label="D+ (m)">
            <input type="number" placeholder="2500" value={form.elevationGainM ?? ''}
              onChange={e => f('elevationGainM', e.target.value ? parseInt(e.target.value) : undefined)} className={iCls} />
          </Field>
          <Field label="Heure de départ">
            <input type="time" value={form.startTime ?? ''} onChange={e => f('startTime', e.target.value)} className={iCls} />
          </Field>
          <Field label="Temps objectif">
            <input type="text" placeholder="6h30" value={form.targetTime ?? ''}
              onChange={e => f('targetTime', e.target.value)} className={iCls} />
          </Field>
          <Field label="Lieu">
            <input type="text" placeholder="Chamonix" value={form.location ?? ''}
              onChange={e => f('location', e.target.value)} className={iCls} />
          </Field>
          <Field label="Numéro de dossard">
            <input type="text" placeholder="1234" value={form.dossard ?? ''}
              onChange={e => f('dossard', e.target.value)} className={iCls} />
          </Field>
        </div>
        <Field label="Notes / Objectifs">
          <textarea rows={2} placeholder="Stratégie, ravitaillements, objectifs intermédiaires..."
            value={form.notes ?? ''} onChange={e => f('notes', e.target.value)}
            className={iCls + ' resize-none'} />
        </Field>
        <div className="flex gap-2 justify-between mt-4">
          <button onClick={() => { onSave(null); setEditing(false) }}
            className="text-xs text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors">
            Supprimer l'objectif
          </button>
          <div className="flex gap-2">
            <button onClick={() => setEditing(false)}
              className="text-xs text-zinc-400 hover:bg-zinc-100 px-3 py-1.5 rounded-lg transition-colors">
              Annuler
            </button>
            <button onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold bg-zinc-900 text-white rounded-lg hover:bg-zinc-700 transition-colors">
              <Save size={12} />Enregistrer
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!goal) {
    return (
      <button onClick={() => { setForm(EMPTY); setEditing(true) }}
        className="w-full flex items-center gap-2 px-4 py-3 bg-white border border-dashed border-zinc-300 rounded-2xl text-sm text-zinc-400 hover:border-zinc-400 hover:text-zinc-600 transition-colors">
        <Trophy size={15} />
        Définir un objectif de course
      </button>
    )
  }

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl px-5 py-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <Trophy size={20} className="text-amber-500 shrink-0 mt-0.5" />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base font-bold text-zinc-900">{goal.name}</span>
              {goal.dossard && (
                <span className="text-xs bg-zinc-800 text-white px-2 py-0.5 rounded-full font-mono">#{goal.dossard}</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-1.5">
              {goal.distanceKm && <Chip icon={<MapPin size={10} />} label={`${goal.distanceKm} km`} />}
              {goal.elevationGainM && <Chip icon={<Mountain size={10} />} label={`D+ ${goal.elevationGainM} m`} />}
              {goal.startTime && <Chip icon={<Clock size={10} />} label={`Départ ${goal.startTime}`} />}
              {goal.targetTime && <Chip icon={<Clock size={10} />} label={`Objectif ${goal.targetTime}`} />}
              {goal.location && <Chip icon={<MapPin size={10} />} label={goal.location} />}
            </div>
            {goal.notes && (
              <p className="text-xs text-zinc-500 mt-1.5 flex items-start gap-1">
                <FileText size={10} className="shrink-0 mt-0.5" />{goal.notes}
              </p>
            )}
            <p className="text-xs text-zinc-400 mt-1">
              {new Date(goal.date + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {countdown && daysLeft !== null && (
            <div className="text-right">
              <div className={`text-3xl font-black font-mono leading-none ${countdown.color}`}>{countdown.text}</div>
              {daysLeft > 0 && <p className="text-[10px] text-zinc-400 text-right">restants</p>}
            </div>
          )}
          <div className="flex flex-col gap-1">
            <button onClick={() => { setForm({ ...goal }); setEditing(true) }}
              className="p-1.5 rounded-lg hover:bg-amber-100 text-amber-600 transition-colors">
              <Edit2 size={13} />
            </button>
            <button onClick={() => onSave(null)}
              className="p-1.5 rounded-lg hover:bg-red-100 text-red-400 transition-colors">
              <X size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Chip({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="inline-flex items-center gap-1 text-[11px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium">
      {icon}{label}
    </span>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[10px] font-semibold text-zinc-500 uppercase tracking-wide mb-1">{label}</label>
      {children}
    </div>
  )
}

const iCls = 'w-full px-3 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:border-zinc-400 transition-colors'
