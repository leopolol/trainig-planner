'use client'

import { useState } from 'react'
import { TrainingSession, PostSession } from '@/types/training'
import { X, Save, ExternalLink } from 'lucide-react'

interface Props {
  session: TrainingSession
  onSave: (updated: TrainingSession) => void
  onClose: () => void
}

export default function PostSessionModal({ session, onSave, onClose }: Props) {
  const [ps, setPs] = useState<PostSession>(session.postSession ?? {})

  function setField<K extends keyof PostSession>(key: K, value: PostSession[K]) {
    setPs(prev => ({ ...prev, [key]: value }))
  }

  function handleSave() {
    onSave({
      ...session,
      status: 'fait',
      postSession: ps,
    })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <div>
            <h2 className="text-lg font-bold text-zinc-900">Ressenti post-séance</h2>
            <p className="text-sm text-zinc-500 mt-0.5">{session.title} · {session.date}</p>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-zinc-100 rounded-lg transition-colors">
            <X size={18} className="text-zinc-500" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">

          {/* Distance + Duration */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Distance réelle (km)">
              <input
                type="number"
                step="0.1"
                min="0"
                value={ps.actualDistanceKm ?? ''}
                onChange={e => setField('actualDistanceKm', e.target.value ? parseFloat(e.target.value) : undefined)}
                placeholder={`${session.distanceMinKm}–${session.distanceMaxKm}`}
                className={inputCls}
              />
            </Field>
            <Field label="Durée (ex: 1h25)">
              <input
                type="text"
                value={ps.duration ?? ''}
                onChange={e => setField('duration', e.target.value)}
                placeholder="1h25"
                className={inputCls}
              />
            </Field>
          </div>

          {/* Pace + D+ */}
          <div className="grid grid-cols-2 gap-4">
            <Field label="Allure moyenne (min/km)">
              <input
                type="text"
                value={ps.averagePace ?? ''}
                onChange={e => setField('averagePace', e.target.value)}
                placeholder="5:30"
                className={inputCls}
              />
            </Field>
            <Field label="Dénivelé + (m)">
              <input
                type="number"
                min="0"
                value={ps.elevationGainM ?? ''}
                onChange={e => setField('elevationGainM', e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="250"
                className={inputCls}
              />
            </Field>
          </div>

          {/* Feeling + Fatigue */}
          <div className="space-y-4">
            <RatingField
              label="Ressenti général"
              value={ps.feeling}
              onChange={v => setField('feeling', v)}
              leftLabel="Difficile"
              rightLabel="Excellent"
              color="text-emerald-600"
            />
            <RatingField
              label="Fatigue ressentie"
              value={ps.fatigue}
              onChange={v => setField('fatigue', v)}
              leftLabel="Fraîche"
              rightLabel="Épuisé·e"
              color="text-orange-600"
            />
          </div>

          {/* Pain */}
          <Field label="Douleur éventuelle">
            <input
              type="text"
              value={ps.pain ?? ''}
              onChange={e => setField('pain', e.target.value)}
              placeholder="Genou gauche, mollet... ou laisser vide"
              className={inputCls}
            />
          </Field>

          {/* Weather */}
          <Field label="Météo">
            <input
              type="text"
              value={ps.weather ?? ''}
              onChange={e => setField('weather', e.target.value)}
              placeholder="Ensoleillé 18°C, vent faible"
              className={inputCls}
            />
          </Field>

          {/* Comment */}
          <Field label="Commentaire libre">
            <textarea
              rows={3}
              value={ps.comment ?? ''}
              onChange={e => setField('comment', e.target.value)}
              placeholder="Comment s'est passée cette séance ?"
              className={inputCls + ' resize-none'}
            />
          </Field>

          {/* Strava */}
          <Field label="Lien Strava">
            <div className="flex gap-2">
              <input
                type="url"
                value={ps.stravaLink ?? ''}
                onChange={e => setField('stravaLink', e.target.value)}
                placeholder="https://www.strava.com/activities/..."
                className={inputCls + ' flex-1'}
              />
              {ps.stravaLink && (
                <a
                  href={ps.stravaLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-orange-50 text-orange-600 border border-orange-200 rounded-lg hover:bg-orange-100 transition-colors"
                >
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          </Field>

          {/* GPX */}
          <Field label="Fichier GPX (nom)">
            <input
              type="text"
              value={ps.gpxFileName ?? ''}
              onChange={e => setField('gpxFileName', e.target.value)}
              placeholder="sortie-2026-05-25.gpx"
              className={inputCls}
            />
          </Field>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-2 px-6 py-4 border-t border-zinc-100">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium text-zinc-600 hover:bg-zinc-100 transition-colors"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors"
          >
            <Save size={14} />
            Marquer comme réalisée
          </button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">
        {label}
      </label>
      {children}
    </div>
  )
}

function RatingField({
  label, value, onChange, leftLabel, rightLabel, color,
}: {
  label: string
  value?: number
  onChange: (v: number) => void
  leftLabel: string
  rightLabel: string
  color: string
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
          {label}
        </label>
        <span className={`text-sm font-bold font-mono ${color}`}>
          {value ? `${value}/10` : '—'}
        </span>
      </div>
      <input
        type="range"
        min="1"
        max="10"
        step="1"
        value={value ?? 5}
        onChange={e => onChange(parseInt(e.target.value))}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-zinc-400 mt-1">
        <span>{leftLabel}</span>
        <span>{rightLabel}</span>
      </div>
    </div>
  )
}

const inputCls = 'w-full px-3 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 transition-colors'
