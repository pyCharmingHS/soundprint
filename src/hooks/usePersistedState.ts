import { useEffect, useState } from 'react'

/** useState, but backed by localStorage (best-effort — falls back silently
 * in private-browsing/storage-blocked contexts, same as the locale
 * persistence in LocaleContext). `isValid` guards against a stale or
 * tampered-with stored value that no longer matches the expected type. */
export function usePersistedState<T extends string>(
  key: string,
  defaultValue: T,
  isValid: (value: string) => value is T,
): [T, (value: T) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const stored = window.localStorage.getItem(key)
      if (stored && isValid(stored)) return stored
    } catch {
      // ignore
    }
    return defaultValue
  })

  useEffect(() => {
    try {
      window.localStorage.setItem(key, state)
    } catch {
      // persistence is a nicety, not a requirement
    }
  }, [key, state])

  return [state, setState]
}
