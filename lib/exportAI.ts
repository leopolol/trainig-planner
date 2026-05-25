import { TrainingSession } from '@/types/training'
import { getWeekDays, formatWeekRange } from './utils'

function getWeekSessions(sessions: TrainingSession[], mondayYMD: string): TrainingSession[] {
  const days = getWeekDays(mondayYMD)
  return sessions
    .filter(s => days.includes(s.date))
    .sort((a, b) => a.date.localeCompare(b.date))
}

function ratingBar(n?: number): string {
  if (!n) return 'N/R'
  return '●'.repeat(n) + '○'.repeat(10 - n) + ` ${n}/10`
}

export function generateAIExport(sessions: TrainingSession[], mondayYMD: string): string {
  const week = getWeekSessions(sessions, mondayYMD)
  const range = formatWeekRange(mondayYMD)

  const planned = week.filter(s => s.status === 'prévu' || s.status === 'déplacé')
  const done = week.filter(s => s.status === 'fait')
  const cancelled = week.filter(s => s.status === 'annulé')
  const moved = week.filter(s => s.status === 'déplacé')

  const totalPlannedMin = week.filter(s => s.status !== 'annulé')
    .reduce((sum, s) => sum + (s.distanceMinKm || 0), 0)
  const totalPlannedMax = week.filter(s => s.status !== 'annulé')
    .reduce((sum, s) => sum + (s.distanceMaxKm || 0), 0)
  const totalActual = done
    .reduce((sum, s) => sum + (s.postSession?.actualDistanceKm || 0), 0)

  const avgFeeling = done.length
    ? done.reduce((sum, s) => sum + (s.postSession?.feeling || 0), 0) / done.length
    : null
  const avgFatigue = done.length
    ? done.reduce((sum, s) => sum + (s.postSession?.fatigue || 0), 0) / done.length
    : null

  const pains = done
    .filter(s => s.postSession?.pain)
    .map(s => `- ${s.title} : ${s.postSession!.pain}`)

  const gaps = done.map(s => {
    const ps = s.postSession
    if (!ps?.actualDistanceKm) return null
    const midPlanned = (s.distanceMinKm + s.distanceMaxKm) / 2
    const diff = ps.actualDistanceKm - midPlanned
    const sign = diff >= 0 ? '+' : ''
    return `- **${s.title}** (${s.date}) : prévu ${s.distanceMinKm}–${s.distanceMaxKm} km → réalisé ${ps.actualDistanceKm} km (${sign}${diff.toFixed(1)} km)`
  }).filter(Boolean)

  const lines: string[] = [
    `# 📊 Bilan entraînement — ${range}`,
    '',
    '---',
    '',
    `## 📋 Résumé`,
    '',
    `| | Valeur |`,
    `|---|---|`,
    `| Séances prévues | ${week.length} |`,
    `| Séances réalisées | ${done.length} |`,
    `| Séances annulées | ${cancelled.length} |`,
    `| Séances déplacées | ${moved.length} |`,
    `| Volume prévu | ${totalPlannedMin}–${totalPlannedMax} km |`,
    `| Volume réalisé | ${totalActual > 0 ? totalActual.toFixed(1) + ' km' : 'N/R'} |`,
    `| Ressenti moyen | ${avgFeeling ? avgFeeling.toFixed(1) + '/10' : 'N/R'} |`,
    `| Fatigue moyenne | ${avgFatigue ? avgFatigue.toFixed(1) + '/10' : 'N/R'} |`,
    '',
    '---',
    '',
    `## ✅ Séances réalisées`,
    '',
  ]

  if (done.length === 0) {
    lines.push('Aucune séance marquée comme réalisée cette semaine.', '')
  } else {
    for (const s of done) {
      const ps = s.postSession
      lines.push(`### ${s.title} — ${s.date}`)
      lines.push(`**Type :** ${s.type} | **Surface :** ${s.surface} | **Objectif :** ${s.objective}`)
      lines.push('')
      if (ps) {
        lines.push(`| Données | Prévu | Réalisé |`)
        lines.push(`|---|---|---|`)
        lines.push(`| Distance | ${s.distanceMinKm}–${s.distanceMaxKm} km | ${ps.actualDistanceKm ? ps.actualDistanceKm + ' km' : 'N/R'} |`)
        lines.push(`| Durée | ${s.estimatedDuration || 'N/R'} | ${ps.duration || 'N/R'} |`)
        lines.push(`| Allure moy. | — | ${ps.averagePace || 'N/R'} |`)
        lines.push(`| D+ | — | ${ps.elevationGainM ? ps.elevationGainM + ' m' : 'N/R'} |`)
        lines.push('')
        lines.push(`**Ressenti :** ${ratingBar(ps.feeling)}  `)
        lines.push(`**Fatigue :** ${ratingBar(ps.fatigue)}  `)
        if (ps.pain) lines.push(`**Douleur :** ${ps.pain}  `)
        if (ps.weather) lines.push(`**Météo :** ${ps.weather}  `)
        if (ps.comment) lines.push(`**Commentaire :** ${ps.comment}  `)
        if (ps.stravaLink) lines.push(`**Strava :** ${ps.stravaLink}  `)
        if (ps.gpxFileName) lines.push(`**GPX :** ${ps.gpxFileName}  `)
      }
      lines.push('')
    }
  }

  lines.push('---', '')
  lines.push('## 📅 Séances prévues (non réalisées)', '')

  if (planned.length === 0) {
    lines.push('Toutes les séances ont été réalisées ou annulées.', '')
  } else {
    for (const s of planned) {
      lines.push(`- **${s.title}** (${s.date}) — ${s.distanceMinKm}–${s.distanceMaxKm} km, ${s.type}, statut : ${s.status}`)
    }
    lines.push('')
  }

  if (cancelled.length > 0) {
    lines.push('## ❌ Séances annulées', '')
    for (const s of cancelled) {
      lines.push(`- **${s.title}** (${s.date}) — ${s.type}`)
    }
    lines.push('')
  }

  lines.push('---', '')
  lines.push('## ↔️ Écarts prévu / réalisé', '')

  if (gaps.length === 0) {
    lines.push('Pas de données suffisantes pour calculer les écarts.', '')
  } else {
    lines.push(...(gaps as string[]), '')
  }

  lines.push('---', '')
  lines.push('## 😌 Ressenti général', '')

  if (done.length === 0) {
    lines.push('Pas de données de ressenti disponibles.', '')
  } else {
    lines.push(
      `Ressenti moyen sur ${done.length} séances : **${avgFeeling ? avgFeeling.toFixed(1) : 'N/R'}/10**`,
      `Fatigue moyenne : **${avgFatigue ? avgFatigue.toFixed(1) : 'N/R'}/10**`,
      ''
    )
    const comments = done.filter(s => s.postSession?.comment)
    if (comments.length > 0) {
      lines.push('### Commentaires séances')
      for (const s of comments) {
        lines.push(`- **${s.title}** : ${s.postSession!.comment}`)
      }
      lines.push('')
    }
  }

  lines.push('---', '')
  lines.push('## ⚠️ Points d\'attention', '')

  const allPoints: string[] = []

  if (pains.length > 0) {
    allPoints.push('**Douleurs signalées :**')
    allPoints.push(...pains)
  }

  if (avgFatigue !== null && avgFatigue >= 7) {
    allPoints.push(`⚠️ Fatigue moyenne élevée (${avgFatigue.toFixed(1)}/10) — envisager une semaine de récupération`)
  }

  if (cancelled.length >= 2) {
    allPoints.push(`${cancelled.length} séances annulées — vérifier la charge et la récupération`)
  }

  if (allPoints.length === 0) {
    lines.push('Aucun point d\'attention particulier.', '')
  } else {
    lines.push(...allPoints, '')
  }

  lines.push('---', '')
  lines.push('## 🗂️ Données brutes JSON', '')
  lines.push('```json')
  lines.push(JSON.stringify(week, null, 2))
  lines.push('```', '')

  return lines.join('\n')
}

export function downloadAIExport(sessions: TrainingSession[], mondayYMD: string): void {
  const content = generateAIExport(sessions, mondayYMD)
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `bilan-training-${mondayYMD}.md`
  a.click()
  URL.revokeObjectURL(url)
}
