import { useCallback, useEffect, useRef, useState } from 'react'

export function useToast(duration = 3000) {
  const [toast, setToast] = useState(null)
  const timerRef = useRef(null)
  const idRef = useRef(0)

  const dismissToast = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setToast(null)
  }, [])

  const showToast = useCallback(
    (message, tone = 'success') => {
      if (timerRef.current) clearTimeout(timerRef.current)

      idRef.current += 1
      setToast({ id: idRef.current, message, tone })
      timerRef.current = setTimeout(() => {
        setToast(null)
        timerRef.current = null
      }, duration)
    },
    [duration],
  )

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return { toast, showToast, dismissToast }
}
