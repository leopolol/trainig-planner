'use client'

import { useState } from 'react'
import { TrainingSession, SESSION_TYPES, SURFACES, PACES, PRIORITIES, STATUSES, OBJECTIVES } from '@/types/training'
import { X, Save, Trash2, Copy } from 'lucide-react'
import ConfirmModal from './ConfirmModal'

interface Props {
  session: TrainingSession
  onSave: (updated: TrainingSession) => void
  onDelete: (id: string) => void
  onClose: () => void
  onOpenPostSession: () => void
  onDuplicate: (session: TrainingSession, date: string) => void
}

export default function EditSessionModal({ session, onSave, onDelete, onClose, onOpenPostSession, onDuplicate }: Props) {
  const [form, setForm] = useState<TrainingSession>({ ...session })
  const [showDuplicate, setShowDuplicate] = useState(false)
  const [duplicateDate, setDuplicateDate] = useState<string>(session.date)
  const [showConfirmDelete, setShowConfirmDelete] = useState(false)

  function set<K extends keyof TrainingSession>(key: K, value: TrainingSession[K]) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  function handleSave() {
    onSave(form)
    onClose()
  }

  function handleDuplicate() {
    if (duplicateDate) {
      onDuplicate(form, duplicateDate)
      setShowDuplicate(false)
      onClose()
    }
  }

  return (
    <>
      <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl animate-slide-up">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
            <h2 className="text-lg font-bold text-zinc-900">Modifier la séance</h2>
            <button onClick={onClose} className="p-1.5 hover:bg-zinc-100 rounded-lg transition-colors">
              <X size={18} className="text-zinc-500" />
            </button>
          </div>

          {/* Form */}
          <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Titre">
                <input type="text" value={form.title} onChange={e => set('title', e.target.value)} className={inputCls} />
              </Field>
              <Field label="Date">
                <input type="date" value={form.date} onChange={e => set('date', e.target.value)} className={inputCls} />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Type de séance">
                <select value={form.type} onChange={e => set('type', e.target.value)} className={inputCls}>
                  {SESSION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Priorité">
                <select value={form.priority} onChange={e => set('priority', e.target.value)} className={inputCls}>
                  {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Distance min (km)">
                <input type="number" step="0.5" min="0" value={form.distanceMinKm}
                  onChange={e => set('distanceMinKm', parseFloat(e.target.value) || 0)} className={inputCls} />
              </Field>
              <Field label="Distance max (km)">
                <input type="number" step="0.5" min="0" value={form.distanceMaxKm}
                  onChange={e => set('distanceMaxKm', parseFloat(e.target.value) || 0)} className={inputCls} />
              </Field>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Field label="Durée estimée (ex: 1h30)">
                <input type="text" value={form.estimatedDuration ?? ''} placeholder="1h30"
                  onChange={e => set('estimatedDuration', e.target.value)} className={inputCls} />
              </Field>
              <Field label="Surface">
                <select value={form.surface} onChange={e => set('surface', e.target.value)} className={inputCls}>
                  {SURFACES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Allure recommandée">
                <select value={form.pace} onChange={e => set('pace', e.target.value)} className={inputCls}>
                  {PACES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </Field>
              <Field label="Objectif physiologique">
                <select value={form.objective} onChange={e => set('objective', e.target.value)} className={inputCls}>
                  {OBJECTIVES.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
              </Field>
            </div>

            <Field label="Statut">
              <div className="flex flex-wrap gap-2">
                {STATUSES.map(s => (
                  <button key={s} onClick={() => set('status', s)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                      form.status === s ? 'bg-zinc-900 text-white border-zinc-900' : 'bg-white text-zinc-600 border-zinc-200 hover:border-zinc-400'
                    }`}>
                    {s}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Description">
              <textarea rows={2} value={form.description ?? ''} onChange={e => set('description', e.target.value)}
                className={inputCls + ' resize-none'} />
            </Field>

            <Field label="Consignes spécifiques">
              <textarea rows={2} value={form.specificInstructions ?? ''} onChange={e => set('specificInstructions', e.target.value)}
                className={inputCls + ' resize-none'} />
            </Field>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-100 gap-3 flex-wrap">
            <button
              onClick={() => setShowConfirmDelete(true)}
              className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
            >
              <Trash2 size={14} />
              Supprimer
            </button>

            <div className="flex items-center gap-2 flex-wrap justify-end">
              {!showDuplicate ? (
                <button
                  onClick={() => { setShowDuplicate(true); setDuplicateDate(form.date) }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-zinc-100 text-zinc-600 hover:bg-zinc-200 border border-zinc-200 transition-colors"
                >
                  <Copy size={13} />
                  Dupliquer
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={duplicateDate}
                    onChange={e => setDuplicateDate(e.target.value)}
                    className="px-2 py-1.5 text-sm bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:border-zinc-500"
                  />
                  <button onClick={handleDuplicate}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold bg-zinc-900 text-white hover:bg-zinc-700 transition-colors">
                    <Copy size={13} />
                    Confirmer
                  </button>
                  <button onClick={() => setShowDuplicate(false)}
                    className="px-3 py-2 text-sm text-zinc-500 hover:bg-zinc-100 rounded-xl transition-colors">
                    ✕
                  </button>
                </div>
              )}

              {form.status !== 'annulé' && (
                <button
                  onClick={() => { onSave(form); onOpenPostSession() }}
                  className="px-4 py-2 rounded-xl text-sm font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                >
                  + Ressenti
                </button>
              )}

              <button onClick={handleSave}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold bg-zinc-900 text-white hover:bg-zinc-700 transition-colors">
                <Save size={14} />
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirm delete modal */}
      {showConfirmDelete && (
        <ConfirmModal
          title="Supprimer la séance ?"
          message={`"${session.title}" sera définitivement supprimée.`}
          confirmLabel="Supprimer"
          onConfirm={() => { onDelete(session.id); onClose() }}
          onCancel={() => setShowConfirmDelete(false)}
        />
      )}
    </>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5">{label}</label>
      {children}
    </div>
  )
}

const inputCls = 'w-full px-3 py-2 text-sm bg-zinc-50 border border-zinc-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 transition-colors'
