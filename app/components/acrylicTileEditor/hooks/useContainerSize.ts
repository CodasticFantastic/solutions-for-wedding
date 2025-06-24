import {useCallback, useEffect, useState} from 'react'

/**
 * useContainerSize – returns {width, height} of a referenced element.
 * Falls back to window resize listener – good enough for editor purposes.
 */
export function useContainerSize(containerRef: React.RefObject<HTMLElement | null>) {
  const [size, setSize] = useState({width: 0, height: 0})

  const updateSize = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setSize({width: rect.width, height: rect.height})
    }
  }, [containerRef])

  useEffect(() => {
    updateSize()
    window.addEventListener('resize', updateSize)
    return () => window.removeEventListener('resize', updateSize)
  }, [updateSize])

  return size
} 