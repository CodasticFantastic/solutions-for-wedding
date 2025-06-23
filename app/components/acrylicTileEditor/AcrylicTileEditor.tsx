import { useRef, useState, useEffect, useCallback } from 'react'
import { Stage, Layer, Rect, Text, Image as KonvaImage, Transformer } from 'react-konva'
import { KonvaEventObject } from 'konva/lib/Node'
import { AcrylicTileEditorProvider, useAcrylicTileEditor } from './AcrylicTileEditor.context'
import { AcrylicTileTemplate, EditorState } from './acrylicTileEditor.types'

// ---------------------------------------------------------------------------
// Canvas component (minimal implementation)
// ---------------------------------------------------------------------------
function Canvas() {
  const { state, dispatch } = useAcrylicTileEditor()
  const stageRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [lastCenter, setLastCenter] = useState<{ x: number; y: number } | null>(null)
  const [lastDist, setLastDist] = useState(0)

  // Resize observer
  const updateContainerSize = useCallback(() => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      setContainerSize({ width: rect.width, height: rect.height })
    }
  }, [])

  useEffect(() => {
    updateContainerSize()
    window.addEventListener('resize', updateContainerSize)
    return () => window.removeEventListener('resize', updateContainerSize)
  }, [updateContainerSize])

  // Wheel zoom
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
      dispatch({ type: 'SET_CANVAS_SCALE', payload: clampedScale })
      const newPos = {
        x: pointer.x - mousePointTo.x * clampedScale,
        y: pointer.y - mousePointTo.y * clampedScale,
      }
      dispatch({ type: 'SET_CANVAS_POSITION', payload: newPos })
    },
    [dispatch],
  )

  // Touch handlers (pinch + drag)
  const handleTouchStart = useCallback((e: KonvaEventObject<TouchEvent>) => {
    e.evt.preventDefault()
    if (e.evt.touches.length === 1) {
      setIsDragging(true)
    } else if (e.evt.touches.length === 2) {
      const [t1, t2] = e.evt.touches
      setLastDist(Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY))
      setLastCenter({ x: (t1.clientX + t2.clientX) / 2, y: (t1.clientY + t2.clientY) / 2 })
    }
  }, [])

  const handleTouchMove = useCallback(
    (e: KonvaEventObject<TouchEvent>) => {
      e.evt.preventDefault()
      const touches = e.evt.touches
      if (touches.length === 1 && isDragging) {
        const stage = stageRef.current
        const point = stage.getPointerPosition()
        if (point) dispatch({ type: 'SET_CANVAS_POSITION', payload: { x: point.x, y: point.y } })
      } else if (touches.length === 2 && lastCenter) {
        const [t1, t2] = touches
        const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY)
        const scaleFactor = dist / lastDist
        const newScale = state.canvas.scale * scaleFactor
        const clampedScale = Math.max(0.1, Math.min(5, newScale))
        dispatch({ type: 'SET_CANVAS_SCALE', payload: clampedScale })
        setLastDist(dist)
      }
    },
    [dispatch, isDragging, lastCenter, lastDist, state.canvas.scale],
  )

  const handleTouchEnd = () => {
    setIsDragging(false)
    setLastCenter(null)
    setLastDist(0)
  }

  // Fit to screen once mounted
  useEffect(() => {
    if (!containerSize.width || !containerSize.height) return
    const { width: tW, height: tH } = state.template
    const scale = Math.min(containerSize.width / tW, containerSize.height / tH, 1) * 0.9
    const x = (containerSize.width - tW * scale) / 2
    const y = (containerSize.height - tH * scale) / 2
    dispatch({ type: 'SET_CANVAS_SCALE', payload: scale })
    dispatch({ type: 'SET_CANVAS_POSITION', payload: { x, y } })
  }, [containerSize, dispatch, state.template])

  const resetCanvas = () => dispatch({ type: 'RESET_CANVAS' })

  const handleElementSelect = (id: string) => dispatch({ type: 'SELECT_ELEMENT', payload: id })
  const handleElementChange = (id: string, updates: any) =>
    dispatch({ type: 'UPDATE_ELEMENT', payload: { id, updates } })

  // ------------------ Child nodes ------------------
  interface NodeProps {
    element: any
    isSelected: boolean
    onSelect: () => void
    onChange: (updates: any) => void
  }

  const TextNode = ({ element, isSelected, onSelect, onChange }: NodeProps) => {
    const shapeRef = useRef<any>(null)
    const transformerRef = useRef<any>(null)

    useEffect(() => {
      if (isSelected && transformerRef.current) {
        transformerRef.current.nodes([shapeRef.current])
        transformerRef.current.getLayer().batchDraw()
      }
    }, [isSelected])

    return (
      <>
        <Text
          ref={shapeRef}
          {...element}
          text={element.properties.text || 'Nowy tekst'}
          fontSize={element.properties.fontSize || 16}
          fill={element.properties.fill || '#000'}
          onClick={onSelect}
          draggable
          onDragEnd={(e) => onChange({ x: e.target.x(), y: e.target.y() })}
          onTransformEnd={() => {
            const node = shapeRef.current
            const scaleX = node.scaleX()
            const scaleY = node.scaleY()
            node.scaleX(1)
            node.scaleY(1)
            onChange({
              x: node.x(),
              y: node.y(),
              width: Math.max(5, node.width() * scaleX),
              height: Math.max(5, node.height() * scaleY),
            })
          }}
        />
        {isSelected && <Transformer ref={transformerRef} />}
      </>
    )
  }

  const ImageNode = ({ element, isSelected, onSelect, onChange }: NodeProps) => {
    const shapeRef = useRef<any>(null)
    const transformerRef = useRef<any>(null)
    const [imgObj, setImgObj] = useState<HTMLImageElement | null>(null)

    useEffect(() => {
      if (element.properties.src) {
        const img = new window.Image()
        img.src = element.properties.src
        img.onload = () => setImgObj(img)
      }
    }, [element.properties.src])

    useEffect(() => {
      if (isSelected && transformerRef.current) {
        transformerRef.current.nodes([shapeRef.current])
        transformerRef.current.getLayer().batchDraw()
      }
    }, [isSelected])

    return (
      <>
        <KonvaImage
          ref={shapeRef}
          image={imgObj || undefined}
          {...element}
          onClick={onSelect}
          draggable
          onDragEnd={(e) => onChange({ x: e.target.x(), y: e.target.y() })}
          onTransformEnd={() => {
            const node = shapeRef.current
            const scaleX = node.scaleX()
            const scaleY = node.scaleY()
            node.scaleX(1)
            node.scaleY(1)
            onChange({
              x: node.x(),
              y: node.y(),
              width: Math.max(5, node.width() * scaleX),
              height: Math.max(5, node.height() * scaleY),
            })
          }}
        />
        {isSelected && <Transformer ref={transformerRef} />}
      </>
    )
  }

  return (
    <div ref={containerRef} className="w-full h-full relative bg-gray-100 overflow-hidden">
      {/* simple reset */}
      <button
        onClick={resetCanvas}
        className="absolute top-4 right-4 z-10 rounded bg-white px-3 py-1 text-sm shadow"
      >
        Reset
      </button>

      <div className="absolute bottom-4 left-4 z-10 rounded bg-white px-3 py-1 text-xs shadow">
        {Math.round(state.canvas.scale * 100)}%
      </div>

      <Stage
        ref={stageRef}
        width={containerSize.width}
        height={containerSize.height}
        scaleX={state.canvas.scale}
        scaleY={state.canvas.scale}
        x={state.canvas.x}
        y={state.canvas.y}
        onWheel={handleWheel}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={(e) => e.target === e.target.getStage() && dispatch({ type: 'SELECT_ELEMENT', payload: null })}
      >
        {/* background */}
        <Layer>
          <Rect
            x={0}
            y={0}
            width={state.template.width}
            height={state.template.height}
            fill={state.template.backgroundColor || '#ffffff'}
            stroke="#e5e7eb"
            strokeWidth={1}
          />
        </Layer>

        {/* elements */}
        <Layer>
          {state.elements.map((el) => {
            const isSelected = state.selectedElement === el.id
            if (el.type === 'text') {
              return (
                <TextNode
                  key={el.id}
                  element={el}
                  isSelected={isSelected}
                  onSelect={() => handleElementSelect(el.id)}
                  onChange={(updates) => handleElementChange(el.id, updates)}
                />
              )
            }
            if (el.type === 'image') {
              return (
                <ImageNode
                  key={el.id}
                  element={el}
                  isSelected={isSelected}
                  onSelect={() => handleElementSelect(el.id)}
                  onChange={(updates) => handleElementChange(el.id, updates)}
                />
              )
            }
            return null
          })}
        </Layer>
      </Stage>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Controls – very lightweight (add element & basic props)
// ---------------------------------------------------------------------------
function Controls() {
  const { state, dispatch, onSave } = useAcrylicTileEditor()
  const selected = state.elements.find((el) => el.id === state.selectedElement)
  return (
    <div className="flex h-full flex-col p-4 space-y-4 text-sm">
      {/* Add buttons */}
      <div className="space-y-2">
        <button
          onClick={() =>
            dispatch({
              type: 'ADD_ELEMENT',
              payload: {
                id: `text-${Date.now()}`,
                type: 'text',
                x: 50,
                y: 50,
                width: 200,
                height: 50,
                rotation: 0,
                properties: { text: 'Nowy tekst', fontSize: 24, fill: '#000000' },
              },
            })
          }
          className="w-full rounded bg-blue-600 py-1 text-white"
        >
          + Tekst
        </button>
        <button
          onClick={() => {
            const input = document.createElement('input')
            input.type = 'file'
            input.accept = 'image/*'
            input.onchange = (e) => {
              const file = (e.target as HTMLInputElement).files?.[0]
              if (!file) return
              const reader = new FileReader()
              reader.onload = (evt) => {
                dispatch({
                  type: 'ADD_ELEMENT',
                  payload: {
                    id: `image-${Date.now()}`,
                    type: 'image',
                    x: 50,
                    y: 50,
                    width: 200,
                    height: 200,
                    rotation: 0,
                    properties: { src: evt.target?.result as string, alt: file.name },
                  },
                })
              }
              reader.readAsDataURL(file)
            }
            input.click()
          }}
          className="w-full rounded bg-blue-600 py-1 text-white"
        >
          + Obraz
        </button>
      </div>

      {/* Properties */}
      {selected && (
        <div className="space-y-2">
          <label htmlFor="prop-text" className="block text-xs">Tekst</label>
          {selected.type === 'text' && (
            <input
              id="prop-text"
              type="text"
              value={selected.properties.text || ''}
              onChange={(e) =>
                dispatch({
                  type: 'UPDATE_ELEMENT',
                  payload: {
                    id: selected.id,
                    updates: {
                      properties: { ...selected.properties, text: e.target.value },
                    },
                  },
                })
              }
              className="w-full rounded border px-2 py-1"
            />
          )}
          <label htmlFor="prop-color" className="block text-xs">Kolor</label>
          <input
            id="prop-color"
            type="color"
            value={selected.properties.fill || '#000000'}
            onChange={(e) =>
              dispatch({
                type: 'UPDATE_ELEMENT',
                payload: {
                  id: selected.id,
                  updates: {
                    properties: { ...selected.properties, fill: e.target.value },
                  },
                },
              })
            }
            className="h-8 w-full"
          />
        </div>
      )}

      <button
        onClick={() => onSave?.({ template: state.template, elements: state.elements })}
        className="mt-auto w-full rounded border py-1"
      >
        Zapisz projekt
      </button>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Public component
// ---------------------------------------------------------------------------
interface AcrylicTileEditorProps {
  template: AcrylicTileTemplate
  onSave?: (data: any) => void
  initialState?: Partial<EditorState>
}

export function AcrylicTileEditor({ template, onSave, initialState }: AcrylicTileEditorProps) {
  return (
    <AcrylicTileEditorProvider template={template} onSave={onSave} initialState={initialState}>
      <div className="flex h-screen flex-col bg-gray-50">
        {/* header */}
        <div className="flex items-center justify-between border-b bg-white p-4 text-sm">
          <h1 className="font-semibold">Edytor Płytek</h1>
          <button
            onClick={() => onSave?.({ template, elements: [] })}
            className="rounded bg-blue-600 px-3 py-1 text-white"
          >
            Zamknij
          </button>
        </div>
        {/* main */}
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1">
            <Canvas />
          </div>
          <div className="w-72 border-l bg-white">
            <Controls />
          </div>
        </div>
      </div>
    </AcrylicTileEditorProvider>
  )
}
