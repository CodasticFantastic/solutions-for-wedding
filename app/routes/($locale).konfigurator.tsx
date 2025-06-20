import {Stage, Layer, Rect, Group} from 'react-konva'
import {useEffect, useState, useRef, useMemo} from 'react'
import {Button} from '@/components/shadCn/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shadCn/ui/select'
import {ChevronLeft, ChevronRight} from 'lucide-react'

type CanvasSize = {
  width: number | undefined
  height: number | undefined
}

const panelSizes = {
  '15x21': {width: 15, height: 21},
  '15x15': {width: 15, height: 15},
}

type PanelSizeKey = keyof typeof panelSizes

const MIN_ZOOM = 1
const MAX_ZOOM = 3
const ZOOM_STEP = 0.1

export default function Configurator() {
  const canvasContainerRef = useRef<HTMLDivElement>(null)
  const [canvasSize, setCanvasSize] = useState<CanvasSize>({width: undefined, height: 500})
  const [selectedSizeKey, setSelectedSizeKey] = useState<PanelSizeKey>('15x21')
  const [rotation, setRotation] = useState(0)
  const [zoom, setZoom] = useState(1)
  const [offset, setOffset] = useState({x: 0, y: 0})
  const [isDragging, setIsDragging] = useState(false)
  const lastPointer = useRef<{x: number; y: number} | null>(null)

  useEffect(() => {
    const handleResize = () => {
      const container = canvasContainerRef.current
      if (container) {
        setCanvasSize((prevSize) => ({
          ...prevSize,
          width: container.offsetWidth,
        }))
      }
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  // Obsługa scrolla i pinch zoom
  useEffect(() => {
    const container = canvasContainerRef.current
    if (!container) return

    let lastTouchDist = null as null | number

    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) return // nie koliduj z natywnym zoomem przeglądarki
      e.preventDefault()
      const delta = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP
      setZoom((z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, +(z + delta).toFixed(2))))
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX
        const dy = e.touches[0].clientY - e.touches[1].clientY
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (lastTouchDist !== null) {
          const delta = dist - lastTouchDist
          if (Math.abs(delta) > 2) {
            setZoom((z) => {
              const newZoom = Math.min(
                MAX_ZOOM,
                Math.max(MIN_ZOOM, +(z + (delta > 0 ? ZOOM_STEP : -ZOOM_STEP)).toFixed(2)),
              )
              return newZoom
            })
          }
        }
        lastTouchDist = dist
      }
    }
    const handleTouchEnd = (e: TouchEvent) => {
      lastTouchDist = null
    }

    container.addEventListener('wheel', handleWheel, {passive: false})
    container.addEventListener('touchmove', handleTouchMove, {passive: false})
    container.addEventListener('touchend', handleTouchEnd)
    return () => {
      container.removeEventListener('wheel', handleWheel)
      container.removeEventListener('touchmove', handleTouchMove)
      container.removeEventListener('touchend', handleTouchEnd)
    }
  }, [])

  // Panning (przesuwanie widoku)
  const handleStageMouseDown = (e: any) => {
    if (zoom === 1) return
    setIsDragging(true)
    const pos = e.target.getStage().getPointerPosition()
    if (pos) lastPointer.current = pos
  }
  const handleStageMouseMove = (e: any) => {
    if (!isDragging || zoom === 1) return
    const pos = e.target.getStage().getPointerPosition()
    if (pos && lastPointer.current) {
      setOffset((prev) => ({
        x: prev.x + (pos.x - lastPointer.current!.x),
        y: prev.y + (pos.y - lastPointer.current!.y),
      }))
      lastPointer.current = pos
    }
  }
  const handleStageMouseUp = () => {
    setIsDragging(false)
    lastPointer.current = null
  }

  // Reset offset przy zmianie zoomu na 1
  useEffect(() => {
    if (zoom === 1) setOffset({x: 0, y: 0})
  }, [zoom])

  const panelDimensions = useMemo(() => {
    if (!canvasSize.width || !canvasSize.height) {
      return {width: 0, height: 0, x: 0, y: 0}
    }
    const currentSize = panelSizes[selectedSizeKey]
    const panelAspectRatio = currentSize.width / currentSize.height
    const padding = 0.1 // 10% padding
    const canvasWidth = canvasSize.width
    const canvasHeight = canvasSize.height
    const canvasAspectRatio = canvasWidth / canvasHeight
    let panelWidth, panelHeight
    if (canvasAspectRatio > panelAspectRatio) {
      panelHeight = canvasHeight * (1 - padding)
      panelWidth = panelHeight * panelAspectRatio
    } else {
      panelWidth = canvasWidth * (1 - padding)
      panelHeight = panelWidth / panelAspectRatio
    }
    return {
      width: panelWidth,
      height: panelHeight,
      x: (canvasWidth - panelWidth) / 2,
      y: (canvasHeight - panelHeight) / 2,
    }
  }, [canvasSize, selectedSizeKey])

  // UI do zoomowania
  const handleZoomIn = () => setZoom((z) => Math.min(MAX_ZOOM, +(z + ZOOM_STEP).toFixed(2)))
  const handleZoomOut = () => setZoom((z) => Math.max(MIN_ZOOM, +(z - ZOOM_STEP).toFixed(2)))

  // Render uchwytów do przesuwania
  const renderHandles = () => {
    if (zoom === 1) return null
    return (
      <>
        {/* Prawa krawędź */}
        <div
          className="absolute top-0 right-0 z-10 h-full w-4 cursor-ew-resize"
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
        />
        {/* Dolna krawędź */}
        <div
          className="absolute bottom-0 left-0 z-10 h-4 w-full cursor-ns-resize"
          onMouseDown={() => setIsDragging(true)}
          onMouseUp={() => setIsDragging(false)}
        />
      </>
    )
  }

  return (
    <div className="customPageContainer">
      <h1>Konfigurator</h1>
      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="col-span-1 flex flex-col gap-4">
          <div>
            <label htmlFor="size-select" className="mb-2 block text-sm font-medium">
              Rozmiar
            </label>
            <Select
              onValueChange={(value: PanelSizeKey) => setSelectedSizeKey(value)}
              defaultValue={selectedSizeKey}
            >
              <SelectTrigger id="size-select">
                <SelectValue placeholder="Wybierz rozmiar" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(panelSizes).map((key) => (
                  <SelectItem key={key} value={key}>
                    {key.replace('x', ' x ')} cm
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Obrót</label>
            <div className="flex gap-2">
              <Button onClick={() => setRotation(rotation - 90)} variant="outline" size="icon">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button onClick={() => setRotation(rotation + 90)} variant="outline" size="icon">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Zoom</label>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleZoomOut}
                variant="outline"
                size="icon"
                disabled={zoom <= MIN_ZOOM}
              >
                -
              </Button>
              <input
                type="text"
                value={Math.round(zoom * 100) + '%'}
                readOnly
                className="w-16 rounded border bg-gray-50 px-2 py-1 text-center"
                tabIndex={-1}
              />
              <Button
                onClick={handleZoomIn}
                variant="outline"
                size="icon"
                disabled={zoom >= MAX_ZOOM}
              >
                +
              </Button>
            </div>
          </div>
        </div>
        <div
          className="relative col-span-1 overflow-hidden rounded-lg bg-gray-100 md:col-span-2"
          ref={canvasContainerRef}
        >
          {canvasSize.width && canvasSize.height && (
            <>
              <Stage
                width={canvasSize.width}
                height={canvasSize.height}
                className="w-full"
                scaleX={zoom}
                scaleY={zoom}
                x={offset.x}
                y={offset.y}
                onMouseDown={handleStageMouseDown}
                onTouchStart={handleStageMouseDown}
                onMouseMove={handleStageMouseMove}
                onTouchMove={handleStageMouseMove}
                onMouseUp={handleStageMouseUp}
                onTouchEnd={handleStageMouseUp}
                draggable={false}
                style={{touchAction: 'none'}}
              >
                <Layer>
                  <Group
                    x={canvasSize.width / 2}
                    y={canvasSize.height / 2}
                    width={panelDimensions.width}
                    height={panelDimensions.height}
                    rotation={rotation}
                    offsetX={panelDimensions.width / 2}
                    offsetY={panelDimensions.height / 2}
                  >
                    <Rect
                      width={panelDimensions.width}
                      height={panelDimensions.height}
                      fill="#ffffff"
                      shadowBlur={15}
                      shadowOpacity={0.2}
                      cornerRadius={8}
                    />
                    {/* Tutaj w przyszłości znajdzie się nadruk */}
                  </Group>
                </Layer>
              </Stage>
              {renderHandles()}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
