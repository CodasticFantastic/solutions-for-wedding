import {useState, useRef, useEffect} from 'react'
import {Plugin} from './types'
import {KonvaEventObject} from 'konva/lib/Node'
import {Stage} from 'konva/lib/Stage'

const ZOOM_STEP = 0.1

interface CoreCanvasPluginProps {
  zoom: number
  setZoom: (update: (prev: number) => number) => void
}

export const useCoreCanvasPlugin: Plugin<CoreCanvasPluginProps> = (props) => {
  const {zoom, setZoom} = props

  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const [canvasSize, setCanvasSize] = useState({width: 0, height: 500})
  const [offset, setOffset] = useState({x: 0, y: 0})
  const [isDragging, setIsDragging] = useState(false)
  const lastPointer = useRef<{x: number; y: number} | null>(null)

  // Resize canvas to fit container
  useEffect(() => {
    const handleResize = () => {
      if (canvasContainerRef.current) {
        setCanvasSize((prev) => ({...prev, width: canvasContainerRef.current!.offsetWidth}))
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Handle canvas interactions (wheel zoom, pinch zoom)
  useEffect(() => {
    const container = canvasContainerRef.current
    if (!container || zoom === undefined || !setZoom) return
    let lastTouchDist: number | null = null

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      const delta = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP
      setZoom((z: number) => Math.min(3, Math.max(1, +(z + delta).toFixed(2))))
    }
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX
        const dy = e.touches[0].clientY - e.touches[1].clientY
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (lastTouchDist !== null) {
          const delta = dist > lastTouchDist ? ZOOM_STEP : -ZOOM_STEP
          setZoom((z: number) => Math.min(3, Math.max(1, +(z + delta).toFixed(2))))
        }
        lastTouchDist = dist
      }
    }
    const handleTouchEnd = () => (lastTouchDist = null)

    container.addEventListener('wheel', handleWheel, {passive: false})
    container.addEventListener('touchmove', handleTouchMove, {passive: false})
    container.addEventListener('touchend', handleTouchEnd)

    return () => {
      container.removeEventListener('wheel', handleWheel)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [setZoom, zoom])

  // Reset offset on zoom out
  useEffect(() => {
    if (zoom === 1) setOffset({x: 0, y: 0})
  }, [zoom])

  // --- Współdzielona logika Panningu ---
  const pointerDownLogic = (stage: Stage) => {
    if (zoom === 1 || zoom === undefined) return
    setIsDragging(true)
    lastPointer.current = stage.getPointerPosition()
  }
  const pointerMoveLogic = (stage: Stage) => {
    if (!isDragging || zoom === 1 || !lastPointer.current || zoom === undefined) return
    const pos = stage.getPointerPosition()
    if (!pos) return
    setOffset((prev) => ({
      x: prev.x + pos.x - lastPointer.current!.x,
      y: prev.y + pos.y - lastPointer.current!.y,
    }))
    lastPointer.current = pos
  }
  const pointerUpLogic = () => {
    setIsDragging(false)
    lastPointer.current = null
  }

  // --- Typowane handlery ---
  const handleStageMouseDown = (e: KonvaEventObject<MouseEvent>) =>
    pointerDownLogic(e.target.getStage() as Stage)
  const handleStageMouseMove = (e: KonvaEventObject<MouseEvent>) =>
    pointerMoveLogic(e.target.getStage() as Stage)
  const handleStageMouseUp = () => pointerUpLogic()

  const handleStageTouchStart = (e: KonvaEventObject<TouchEvent>) =>
    pointerDownLogic(e.target.getStage() as Stage)
  const handleStageTouchMove = (e: KonvaEventObject<TouchEvent>) =>
    pointerMoveLogic(e.target.getStage() as Stage)
  const handleStageTouchEnd = () => pointerUpLogic()

  return {
    id: 'core',
    state: {
      canvasContainerRef,
      canvasSize,
      offset,
    },
    methods: {
      handleStageMouseDown,
      handleStageMouseMove,
      handleStageMouseUp,
      handleStageTouchStart,
      handleStageTouchMove,
      handleStageTouchEnd,
    },
  }
}
