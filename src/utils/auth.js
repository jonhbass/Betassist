// tiny helper to keep auth session per-tab (sessionStorage)
export function getAuthUser() {
  return sessionStorage.getItem('authUser') || ''
}

export function setAuthUser(name) {
  return sessionStorage.setItem('authUser', name)
}

export function removeAuthUser() {
  return sessionStorage.removeItem('authUser')
}
