import { useRegisterSW } from 'virtual:pwa-register/react'
import { Button } from '@/components/ui/button'

export function PWAUpdateBanner() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError(err) {
      console.error('[SW] registration failed', err)
    },
  })

  if (!needRefresh) return null

  return (
    <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-xl border border-green-800 bg-green-950 px-4 py-3 shadow-2xl shadow-black/40">
      <span className="text-sm text-green-200">
        🌿 A new version of Soko is available.
      </span>
      <Button
        size="sm"
        className="bg-green-500 text-green-950 hover:bg-green-400"
        onClick={() => updateServiceWorker(true)}
      >
        Update
      </Button>
      <button
        onClick={() => setNeedRefresh(false)}
        className="text-green-500 hover:text-green-300"
        aria-label="Dismiss"
      >
        ✕
      </button>
    </div>
  )
}