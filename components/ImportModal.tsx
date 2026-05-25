'use client'

import { useState } from 'react'
import { TrainingSession } from '@/types/training'
import { X, RefreshCw, GitMerge } from 'lucide-react'
import ImportZone from './ImportZone'

interface Props {
  onImport: (sessions: TrainingSession[], mode: 'replace' | 'merge') => void
  onClose: () => void
}

export default function ImportModal({ onImport, onClose }: Props) {
  const [mode, setMode] = useState<'replace' | 'merge'>('replace')

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-up">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <h2 className="text-lg font-bold text-zinc-900">Importer un planning</h2>
          <button onClick={onClose} className="p-1.5 hover:bg-zinc-100 rounded-lg transition-colors">
            <X size={18} className="text-zinc-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Mode selector */}
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">Mode d'import</p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: 'replace' as const, label: 'Remplacer', desc: 'Écrase toutes les séances', Icon: RefreshCw },
                { value: 'merge' as const, label: 'Fusionner', desc: 'Ajoute aux séances existantes', Icon: GitMerge },
              ].map(({ value, label, desc, Icon }) => (
                <button
                  key={value}
                  onClick={() => setMode(value)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    mode === value
                      ? 'border-zinc-900 bg-zinc-900 text-white'
                      : 'border-zinc-200 hover:border-zinc-300 text-zinc-700'
                  }`}
                >
                  <Icon size={16} className="mb-1.5" />
                  <p className="text-sm font-semibold">{label}</p>
                  <p className={`text-xs mt-0.5 ${mode === value ? 'text-zinc-400' : 'text-zinc-400'}`}>{desc}</p>
                </button>
              ))}
            </div>
          </div>

          <ImportZone
            mode={mode}
            onImport={(sessions) => {
              onImport(sessions, mode)
              onClose()
            }}
          />

          {/* Format hint */}
          <details className="group">
            <summary className="text-xs text-zinc-400 cursor-pointer hover:text-zinc-600 transition-colors">
              Voir le format JSON attendu ▾
            </summary>
            <pre className="mt-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl p-3 overflow-x-auto text-zinc-600 leading-relaxed">
{`[
  {
    "id": "seance-001",
    "date": "2026-05-25",
    "title": "Endurance fondamentale",
    "type": "endurance",
    "distanceMinKm": 10,
    "distanceMaxKm": 12,
    "surface": "route",
    "pace": "conversationnelle",
    "objective": "développer l'aérobie",
    "description": "Sortie facile.",
    "priority": "normale",
    "status": "prévu"
  }
]`}
            </pre>
          </details>
        </div>
      </div>
    </div>
  )
}
