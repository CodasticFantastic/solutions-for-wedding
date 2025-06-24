import {useCallback, useRef, useState} from 'react'
import {KonvaEventObject} from 'konva/lib/Node'

/**
 * useCanvasGestures – returns handlers for Stage gestures: wheel-zoom, mouse pan,
 * pinch-zoom, drag.
 */
export function useCanvasGestures(
  stageRef: React.RefObject<any>,
  canvasState: {x: number; y: number; scale: number},
  dispatch: React.Dispatch<any>,
) {
  // ---------------------------------------------------------------------------
  // Mouse-based panning
  // ---------------------------------------------------------------------------
  const [isPanning, setIsPanning] = useState(false)
  const panStart = useRef<{x: number; y: number} | null>(null)
  const canvasStart = useRef<{x: number; y: number} | null>(null)

  const handleMouseDown = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      const target = e.target
      const isStageClick = target === target.getStage()
      const isTileRectClick = target.getClassName && target.getClassName() === 'Rect'
      if (!isStageClick && !isTileRectClick) return

      e.evt.preventDefault()
      const stage = stageRef.current
      const pointer = stage.getPointerPosition()
      if (!pointer) return

      setIsPanning(true)
      panStart.current = {x: pointer.x, y: pointer.y}
      canvasStart.current = {x: canvasState.x, y: canvasState.y}
    },
    [canvasState.x, canvasState.y, stageRef],
  )

  const handleMouseMove = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      if (!isPanning || !panStart.current || !canvasStart.current) return

      e.evt.preventDefault()
      const stage = stageRef.current
      const pointer = stage.getPointerPosition()
      if (!pointer) return

      const dx = pointer.x - panStart.current.x
      const dy = pointer.y - panStart.current.y
      dispatch({
        type: 'SET_CANVAS_POSITION',
        payload: {x: canvasStart.current.x + dx, y: canvasStart.current.y + dy},
      })
    },
    [dispatch, isPanning, stageRef],
  )

  const endPan = useCallback(() => {
    setIsPanning(false)
    panStart.current = null
    canvasStart.current = null
  }, [])

  // ---------------------------------------------------------------------------
  // Wheel zoom
  // ---------------------------------------------------------------------------
  const handleWheel = useCallback(
    (e: KonvaEventObject<WheelEvent>) => {
      e.evt.preventDefault()
      const stage = stageRef.current
      const oldScale = stage.scaleX()
      const pointer = stage.getPointerPosition()
      if (!pointer) return

      const mousePointTo = {
        x: (pointer.x - stage.x()) / oldScale,
        y: (pointer.y - stage.y()) / oldScale,
      }
      const direction = e.evt.deltaY > 0 ? -1 : 1
      const scaleBy = 1.1
      const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy
      const clampedScale = Math.max(0.1, Math.min(5, newScale))
      dispatch({type: 'SET_CANVAS_SCALE', payload: clampedScale})

      const newPos = {
        x: pointer.x - mousePointTo.x * clampedScale,
        y: pointer.y - mousePointTo.y * clampedScale,
      }
      dispatch({type: 'SET_CANVAS_POSITION', payload: newPos})
    },
    [dispatch, stageRef],
  )

  // ---------------------------------------------------------------------------
  // Touch (pinch + drag)
  // ---------------------------------------------------------------------------
  const [isDragging, setIsDragging] = useState(false)
  const [lastCenter, setLastCenter] = useState<{x: number; y: number} | null>(null)
  const [lastDist, setLastDist] = useState(0)

  const handleTouchStart = useCallback((e: KonvaEventObject<TouchEvent>) => {
    e.evt.preventDefault()
    if (e.evt.touches.length === 1) {
      setIsDragging(true)
    } else if (e.evt.touches.length === 2) {
      const [t1, t2] = e.evt.touches
      setLastDist(Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY))
      setLastCenter({x: (t1.clientX + t2.clientX) / 2, y: (t1.clientY + t2.clientY) / 2})
    }
  }, [])

  const handleTouchMove = useCallback(
    (e: KonvaEventObject<TouchEvent>) => {
      e.evt.preventDefault()
      const touches = e.evt.touches
      const stage = stageRef.current

      if (touches.length === 1 && isDragging) {
        const point = stage.getPointerPosition()
        if (point) dispatch({type: 'SET_CANVAS_POSITION', payload: {x: point.x, y: point.y}})
      } else if (touches.length === 2 && lastCenter) {
        const [t1, t2] = touches
        const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY)
        const scaleFactor = dist / lastDist
        const newScale = canvasState.scale * scaleFactor
        const clampedScale = Math.max(0.1, Math.min(5, newScale))
        dispatch({type: 'SET_CANVAS_SCALE', payload: clampedScale})
        setLastDist(dist)
      }
    },
    [dispatch, isDragging, lastCenter, lastDist, canvasState.scale, stageRef],
  )

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
    setLastCenter(null)
    setLastDist(0)
  }, [])

  return {
    onWheel: handleWheel,
    onMouseDown: handleMouseDown,
    onMouseMove: handleMouseMove,
    onMouseUp: endPan,
    onMouseLeave: endPan,
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  }
} 