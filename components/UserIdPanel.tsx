'use client'

import { useState } from 'react'
import { Link2, Copy, Check, UserCircle, LogIn, X } from 'lucide-react'
import { getShareUrl, switchUserId } from '@/lib/userId'

interface Props {
  userId: string
  onClose: () => void
}

export default function UserIdPanel({ userId, onClose }: Props) {
  const [copied, setCopied]     = useState(false)
  const [inputId, setInputId]   = useState('')
  const [showSwitch, setShowSwitch] = useState(false)
  const [error, setError]       = useState('')

  const shareUrl = getShareUrl(userId)

  function copyLink() {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleSwitch() {
    const clean = inputId.trim()
    if (!clean.startsWith('tp-')) {
      setError('ID invalide — format attendu : tp-xxxxxx-xxxx')
      return
    }
    switchUserId(clean) // rechargement automatique
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm animate-slide-up p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <UserCircle size={18} className="text-zinc-600" />
            <h2 className="text-base font-bold text-zinc-900">Mon accès</h2>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-zinc-100 rounded-lg transition-colors">
            <X size={16} className="text-zinc-400" />
          </button>
        </div>

        {/* Mon ID */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-1.5">
            Ton identifiant
          </p>
          <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2">
            <span className="flex-1 text-sm font-mono text-zinc-700 select-all">{userId}</span>
          </div>
        </div>

        {/* Lien à partager / bookmarker */}
        <div className="mb-5">
          <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-1.5">
            Ton lien personnel
          </p>
          <div className="flex gap-2">
            <div className="flex-1 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 overflow-hidden">
              <p className="text-xs text-zinc-500 truncate font-mono">{shareUrl}</p>
            </div>
            <button
              onClick={copyLink}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                copied
                  ? 'bg-emerald-500 text-white'
                  : 'bg-zinc-900 text-white hover:bg-zinc-700'
              }`}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copié !' : 'Copier'}
            </button>
          </div>
          <p className="text-xs text-zinc-400 mt-2">
            📌 Bookmarque ce lien pour accéder à tes données depuis n'importe quel appareil.
          </p>
        </div>

        <div className="border-t border-zinc-100 pt-4">
          {!showSwitch ? (
            <button
              onClick={() => setShowSwitch(true)}
              className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-800 transition-colors"
            >
              <LogIn size={15} />
              Utiliser un autre identifiant
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">
                Colle un identifiant existant
              </p>
              <input
                type="text"
                value={inputId}
                onChange={e => { setInputId(e.target.value); setError('') }}
                placeholder="tp-xxxxxx-xxxx"
                className="w-full px-3 py-2 text-sm font-mono bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-zinc-400"
              />
              {error && <p className="text-xs text-red-500">{error}</p>}
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowSwitch(false); setError('') }}
                  className="flex-1 px-3 py-2 text-sm text-zinc-500 hover:bg-zinc-100 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSwitch}
                  disabled={!inputId.trim()}
                  className="flex-1 px-3 py-2 text-sm font-semibold bg-zinc-900 text-white rounded-xl hover:bg-zinc-700 disabled:opacity-40 transition-colors"
                >
                  Changer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
