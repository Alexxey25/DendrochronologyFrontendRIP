import { useEffect, type RefObject } from 'react'

/** За сколько секунд до конца перематывать (WebKit GTK плохо обрабатывает `ended` + `loop`). */
const LOOP_LEAD_SEC = 0.35

/**
 * Плавный цикл в Tauri/WebKit: перемотка до `ended`, без повторного `play()` и без poster.
 */
export function useSeamlessVideoLoop(
  videoRef: RefObject<HTMLVideoElement | null>,
  src: string,
): void {
  useEffect(() => {
    const el = videoRef.current
    if (!el || !src) return

    el.muted = true
    el.loop = false
    el.playsInline = true

    let rewinding = false

    const rewindToStart = () => {
      if (rewinding) return
      rewinding = true
      try {
        el.currentTime = 0.001
      } catch {
        /* ignore */
      }
      rewinding = false
    }

    const onTimeUpdate = () => {
      const duration = el.duration
      if (!Number.isFinite(duration) || duration <= LOOP_LEAD_SEC) return
      if (el.currentTime >= duration - LOOP_LEAD_SEC) {
        rewindToStart()
      }
    }

    const onEnded = () => {
      rewindToStart()
      if (el.paused) {
        void el.play().catch(() => {})
      }
    }

    const startPlayback = () => {
      void el.play().catch(() => {})
    }

    el.addEventListener('timeupdate', onTimeUpdate)
    el.addEventListener('ended', onEnded)

    if (el.readyState >= HTMLMediaElement.HAVE_FUTURE_DATA) {
      startPlayback()
    } else {
      el.addEventListener('canplay', startPlayback, { once: true })
    }

    return () => {
      el.removeEventListener('timeupdate', onTimeUpdate)
      el.removeEventListener('ended', onEnded)
      el.removeEventListener('canplay', startPlayback)
    }
  }, [videoRef, src])
}
