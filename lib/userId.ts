const KEY = 'tp_user_id_v1'

function generateId(): string {
  const rand = Math.random().toString(36).substring(2, 8)
  const ts   = Date.now().toString(36).slice(-4)
  return `tp-${rand}-${ts}`
}

// Lit l'ID depuis l'URL (?id=xxx), le localStorage, ou en génère un nouveau
export function getUserId(): string {
  if (typeof window === 'undefined') return ''

  // 1. Regarder dans l'URL
  const params = new URLSearchParams(window.location.search)
  const urlId  = params.get('id')

  if (urlId) {
    // Sauvegarder l'ID de l'URL dans localStorage et nettoyer l'URL
    localStorage.setItem(KEY, urlId)
    return urlId
  }

  // 2. Regarder dans localStorage
  let id = localStorage.getItem(KEY)
  if (!id) {
    id = generateId()
    localStorage.setItem(KEY, id)
  }
  return id
}

// Met à jour l'URL avec l'ID sans recharger la page
export function setUrlId(id: string): void {
  if (typeof window === 'undefined') return
  const url = new URL(window.location.href)
  url.searchParams.set('id', id)
  window.history.replaceState({}, '', url.toString())
}

// Retourne le lien complet à partager
export function getShareUrl(id: string): string {
  if (typeof window === 'undefined') return ''
  const url = new URL(window.location.href)
  url.searchParams.set('id', id)
  return url.toString()
}

// Change d'utilisateur (coller un ID existant)
export function switchUserId(newId: string): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(KEY, newId)
  const url = new URL(window.location.href)
  url.searchParams.set('id', newId)
  window.location.href = url.toString() // rechargement pour tout réinitialiser
}
