// ─── Training Planner — Google Apps Script Backend ───────────────────────────
// 1. Ouvrir script.google.com → Nouveau projet
// 2. Coller ce code
// 3. Créer 3 feuilles dans le Google Sheet : sessions | race_goals | week_notes
// 4. Remplacer SHEET_ID par l'ID de ton Google Sheet (dans l'URL)
// 5. Déployer → Nouveau déploiement → Application Web
//    → Exécuter en tant que : Moi
//    → Accès : Tout le monde
// 6. Copier l'URL de déploiement → variable NEXT_PUBLIC_SHEETS_URL dans Vercel

const SHEET_ID      = 'REMPLACE_PAR_TON_SHEET_ID'
const SHEET_SESSION = 'sessions'
const SHEET_GOAL    = 'race_goals'
const SHEET_NOTES   = 'week_notes'

// ─── GET ──────────────────────────────────────────────────────────────────────

function doGet(e) {
  try {
    const action = e.parameter.action
    const userId = e.parameter.userId

    if (!userId) return jsonResponse({ error: 'userId manquant' })

    switch (action) {
      case 'getAll':
        return jsonResponse({
          sessions:  getRowData(SHEET_SESSION, userId),
          raceGoal:  getRowData(SHEET_GOAL,    userId),
          weekNotes: getRowData(SHEET_NOTES,   userId),
        })
      default:
        return jsonResponse({ error: 'Action inconnue: ' + action })
    }
  } catch (err) {
    return jsonResponse({ error: err.toString() })
  }
}

// ─── POST ─────────────────────────────────────────────────────────────────────

function doPost(e) {
  try {
    const body   = JSON.parse(e.postData.contents)
    const action  = body.action
    const userId  = body.userId
    const payload = body.payload

    if (!userId) return jsonResponse({ error: 'userId manquant' })

    const lock = LockService.getScriptLock()
    lock.tryLock(10000)

    try {
      switch (action) {
        case 'saveSessions':
          upsertRow(SHEET_SESSION, userId, payload)
          break
        case 'saveRaceGoal':
          upsertRow(SHEET_GOAL, userId, payload)
          break
        case 'saveWeekNotes':
          upsertRow(SHEET_NOTES, userId, payload)
          break
        default:
          return jsonResponse({ error: 'Action inconnue: ' + action })
      }
    } finally {
      lock.releaseLock()
    }

    return jsonResponse({ ok: true, timestamp: new Date().toISOString() })
  } catch (err) {
    return jsonResponse({ error: err.toString() })
  }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getSheet(name) {
  const ss = SpreadsheetApp.openById(SHEET_ID)
  return ss.getSheetByName(name)
}

function getRowData(sheetName, userId) {
  const sheet = getSheet(sheetName)
  const data  = sheet.getDataRange().getValues()
  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === userId) {
      try { return JSON.parse(data[i][1]) } catch { return null }
    }
  }
  return null
}

function upsertRow(sheetName, userId, payload) {
  const sheet = getSheet(sheetName)
  const data  = sheet.getDataRange().getValues()
  const json  = JSON.stringify(payload)

  for (let i = 0; i < data.length; i++) {
    if (data[i][0] === userId) {
      sheet.getRange(i + 1, 2).setValue(json)
      sheet.getRange(i + 1, 3).setValue(new Date().toISOString())
      return
    }
  }
  // Nouvelle ligne
  sheet.appendRow([userId, json, new Date().toISOString()])
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON)
}
