'use client'

import { CloudOff, RefreshCw, CheckCircle2 } from 'lucide-react'

export type SyncState = 'idle' | 'syncing' | 'synced' | 'error' | 'disabled'

interface Props {
  state: SyncState
  onRetry?: () => void
}

export default function SyncStatus({ state, onRetry }: Props) {
  if (state === 'disabled') return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-zinc-100 text-zinc-400" title="Sync non configurée">
      <CloudOff size={13} />
      <span className="text-xs hidden sm:inline">Local</span>
    </div>
  )

  if (state === 'syncing') return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-blue-50 text-blue-500">
      <RefreshCw size={13} className="animate-spin" />
      <span className="text-xs hidden sm:inline">Sync…</span>
    </div>
  )

  if (state === 'error') return (
    <button
      onClick={onRetry}
      className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
      title="Erreur de sync — cliquer pour réessayer"
    >
      <CloudOff size={13} />
      <span className="text-xs hidden sm:inline">Erreur</span>
    </button>
  )

  // idle + synced : toujours visible en vert
  return (
    <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600" title="Données synchronisées">
      <CheckCircle2 size={13} />
      <span className="text-xs hidden sm:inline">Sync</span>
    </div>
  )
}
