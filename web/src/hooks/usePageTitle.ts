import { useEffect } from 'react'

const APP_NAME = 'Turbo Learning'

/**
 * Sets the document title to `${title} · Turbo Learning` while the component
 * is mounted and resets to just `Turbo Learning` on unmount.
 *
 * Usage:
 *   usePageTitle('Dashboard')  →  tab shows "Dashboard · Turbo Learning"
 */
export function usePageTitle(title: string): void {
  useEffect(() => {
    const previous = document.title
    document.title = `${title} · ${APP_NAME}`
    return () => {
      document.title = previous
    }
  }, [title])
}
