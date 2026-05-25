'use client'

import { useRef, useState } from 'react'
import { TrainingSession } from '@/types/training'
import { importJSON } from '@/lib/storage'
import { Upload, FileJson, AlertCircle } from 'lucide-react'

interface Props {
  onImport: (sessions: TrainingSession[]) => void
  mode: 'replace' | 'merge'
}

export default function ImportZone({ onImport, mode }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function processFile(file: File) {
    setError(null)
    setLoading(true)
    try {
      if (!file.name.endsWith('.json') && file.type !== 'application/json') {
        throw new Error('Seuls les fichiers .json sont acceptés')
      }
      const sessions = await importJSON(file)
      onImport(sessions)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur inconnue'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return
    processFile(files[0])
  }

  return (
    <div className="space-y-3">
      {/* Drop zone */}
      <div
        onDragOver={e => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={e => {
          e.preventDefault()
          setDragging(false)
          handleFiles(e.dataTransfer.files)
        }}
        onClick={() => fileRef.current?.click()}
        className={`
          border-2 border-dashed rounded-2xl p-8 cursor-pointer text-center
          transition-all duration-200
          ${dragging
            ? 'border-indigo-400 bg-indigo-50 scale-[1.01]'
            : 'border-zinc-300 bg-zinc-50 hover:border-zinc-400 hover:bg-white'
          }
        `}
      >
        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          onChange={e => handleFiles(e.target.files)}
          className="hidden"
        />

        <div className="flex flex-col items-center gap-3">
          <div className={`p-4 rounded-2xl ${dragging ? 'bg-indigo-100' : 'bg-white border border-zinc-200'}`}>
            {loading
              ? <div className="w-6 h-6 border-2 border-zinc-300 border-t-zinc-600 rounded-full animate-spin" />
              : <FileJson size={24} className={dragging ? 'text-indigo-500' : 'text-zinc-400'} />
            }
          </div>
          <div>
            <p className="text-sm font-semibold text-zinc-700">
              {dragging ? 'Relâchez pour importer' : 'Glissez votre fichier JSON ici'}
            </p>
            <p className="text-xs text-zinc-400 mt-0.5">
              ou cliquez pour parcourir · {mode === 'replace' ? 'Remplace le planning' : 'Fusionne avec l\'existant'}
            </p>
          </div>
          {!loading && (
            <button className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-100 transition-colors">
              <Upload size={14} />
              Choisir un fichier
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <AlertCircle size={14} className="shrink-0" />
          {error}
        </div>
      )}
    </div>
  )
}
