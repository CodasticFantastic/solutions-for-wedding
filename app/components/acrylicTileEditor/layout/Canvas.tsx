import {useEffect, useRef, useState} from 'react'
import {useAcrylicTileEditor} from '../AcrylicTileEditor.context'
import {CORNER_RADIUS} from '../acrylicTileEditor.config'
import {Stage, Layer, Rect, Image as KonvaImage} from 'react-konva'
import {useContainerSize} from '../hooks/useContainerSize'
import {useBackgroundImage} from '../hooks/useBackgroundImage'
import {useInitialFit} from '../hooks/useInitialFit'
import {useCanvasGestures} from '../hooks/useCanvasGestures'
import {TextNode} from '../canvasElements/TextNode'
import {ImageNode} from '../canvasElements/ImageNode'
import {SvgNode} from '../canvasElements/SvgNode'
import {DeleteButton} from '../components/DeleteButton'
import type {DynamicVariant} from '../acrylicTileEditor.types'

export const Canvas = () => {
  const [isClient, setIsClient] = useState(false)
  const [transformingElement, setTransformingElement] = useState<{id: string; x: number; y: number; width: number; height: number; rotation: number} | null>(null)
  const [draggingElement, setDraggingElement] = useState<{id: string; x: number; y: number} | null>(null)

  // Prevent server side rendering for Konva
  useEffect(() => {
    setIsClient(true)
  }, [])

  const {state, dispatch, stageRef, isReadOnly} = useAcrylicTileEditor()
  const containerRef = useRef<HTMLDivElement>(null)
  const containerSize = useContainerSize(containerRef)

  // Gestures handled via custom hook
  const stageGestures = useCanvasGestures(stageRef, state.canvas, dispatch)

  // Background image resolved via custom hook
  const bgImage = useBackgroundImage(state.template.backgroundImage)

  // One-time initial fitting handled via custom hook
  useInitialFit({containerSize, template: state.template, dispatch})

  const handleElementSelect = (id: string) => {
    if (!isReadOnly) {
      dispatch({type: 'SELECT_ELEMENT', payload: id})
    }
  }
  const handleElementChange = (id: string, updates: any) => {
    if (!isReadOnly) {
      dispatch({type: 'UPDATE_ELEMENT', payload: {id, updates}})
    }
  }

  // Handle real-time transformation updates
  const handleTransformStart = (elementId: string) => {
    const element = state.elements.find(el => el.id === elementId)
    if (element) {
      setTransformingElement({
        id: elementId,
        x: element.x || 0,
        y: element.y || 0,
        width: element.width || 100,
        height: element.height || 100,
        rotation: element.rotation || 0
      })
    }
  }

  const handleTransformUpdate = (elementId: string, transformData: any) => {
    setTransformingElement(prev => {
      if (prev && prev.id === elementId) {
        return {
          ...prev,
          ...transformData
        }
      }
      return prev
    })
  }

  const handleTransformEnd = (elementId: string) => {
    setTransformingElement(null)
  }

  // Handle drag operations
  const handleDragStart = (elementId: string) => {
    const element = state.elements.find(el => el.id === elementId)
    if (element) {
      setDraggingElement({
        id: elementId,
        x: element.x || 0,
        y: element.y || 0
      })
    }
  }

  const handleDragUpdate = (elementId: string, x: number, y: number) => {
    setDraggingElement(prev => {
      if (prev && prev.id === elementId) {
        return {
          ...prev,
          x,
          y
        }
      }
      return prev
    })
  }

  const handleDragEnd = (elementId: string) => {
    setDraggingElement(null)
  }

  if (!isClient) {
    return <div ref={containerRef} className="relative h-full w-full bg-gray-100" />
  }

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden bg-gray-100">
      <div className="absolute bottom-4 left-4 z-10 rounded bg-white px-3 py-1 text-xs shadow">{Math.round(state.canvas.scale * 100)}%</div>

      <Stage
        ref={stageRef}
        width={containerSize.width}
        height={containerSize.height}
        scaleX={state.canvas.scale}
        scaleY={state.canvas.scale}
        x={state.canvas.x}
        y={state.canvas.y}
        {...stageGestures}
        onClick={(e: any) => {
          // Only deselect if clicking directly on the stage (not on any shape)
          if (e.target === e.target.getStage()) {
            if (!isReadOnly) {
              dispatch({type: 'SELECT_ELEMENT', payload: null})
            }
          }
        }}
      >
        <Layer>
          {/* Base background color */}
          <Rect
            x={0}
            y={0}
            width={state.template.width}
            height={state.template.height}
            fill="transparent"
            stroke="#e5e7eb"
            strokeWidth={5}
            cornerRadius={CORNER_RADIUS}
            onClick={isReadOnly ? undefined : () => dispatch({type: 'SELECT_ELEMENT', payload: null})}
          />

          {/* Optional background image */}
          {state.template.backgroundImage && bgImage && (
            <KonvaImage
              image={bgImage}
              name="template-bg"
              x={0}
              y={0}
              width={state.template.width}
              height={state.template.height}
              listening={false}
              cornerRadius={CORNER_RADIUS}
            />
          )}
        </Layer>

        {/* elements (also clipped) */}
        <Layer>
          {state.elements.map((originalEl) => {
            let el = originalEl
            const isSelected = state.selectedElementId === el.id

            // Apply dynamic text substitution if needed
            if (el.type === 'text' && el.properties.isDynamic && el.properties.fieldKey) {
              const activeVar: DynamicVariant | undefined = (state.dynamicVariants || []).find((v) => v.id === state.activeVariantId)
              if (activeVar) {
                const newText = activeVar.values[el.properties.fieldKey] ?? el.properties.text
                el = {
                  ...el,
                  properties: {
                    ...el.properties,
                    text: newText,
                  },
                } as typeof el
              }
            }

            // Merge positional overrides for active variant
            if (state.activeVariantId) {
              const variant = (state.dynamicVariants || []).find((v) => v.id === state.activeVariantId)
              const ov = variant?.overrides?.[el.id]
              if (ov) {
                el = {
                  ...el,
                  ...ov,
                } as typeof el
              }
            }

            if (el.type === 'text') {
              return (
                <TextNode
                  key={el.id}
                  element={el}
                  isSelected={isSelected}
                  onSelect={() => handleElementSelect(el.id)}
                  onChange={(updates) => handleElementChange(el.id, updates)}
                  onTransformStart={() => handleTransformStart(el.id)}
                  onTransformUpdate={(transformData) => handleTransformUpdate(el.id, transformData)}
                  onTransformEnd={() => handleTransformEnd(el.id)}
                  onDragStart={() => handleDragStart(el.id)}
                  onDragUpdate={(x, y) => handleDragUpdate(el.id, x, y)}
                  onDragEnd={() => handleDragEnd(el.id)}
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
                  onTransformStart={() => handleTransformStart(el.id)}
                  onTransformUpdate={(transformData) => handleTransformUpdate(el.id, transformData)}
                  onTransformEnd={() => handleTransformEnd(el.id)}
                  onDragStart={() => handleDragStart(el.id)}
                  onDragUpdate={(x, y) => handleDragUpdate(el.id, x, y)}
                  onDragEnd={() => handleDragEnd(el.id)}
                />
              )
            }
            if (el.type === 'svg') {
              return (
                <SvgNode
                  key={el.id}
                  element={el}
                  isSelected={isSelected}
                  onSelect={() => handleElementSelect(el.id)}
                  onChange={(updates) => handleElementChange(el.id, updates)}
                  onTransformStart={() => handleTransformStart(el.id)}
                  onTransformUpdate={(transformData) => handleTransformUpdate(el.id, transformData)}
                  onTransformEnd={() => handleTransformEnd(el.id)}
                  onDragStart={() => handleDragStart(el.id)}
                  onDragUpdate={(x, y) => handleDragUpdate(el.id, x, y)}
                  onDragEnd={() => handleDragEnd(el.id)}
                />
              )
            }
            return null
          })}
        </Layer>
      </Stage>

      {/* Delete buttons for selected elements */}
      {state.selectedElementId && !isReadOnly && (() => {
        const selectedElement = state.elements.find(el => el.id === state.selectedElementId)
        if (!selectedElement) return null

        // Apply variant overrides if needed
        let element = selectedElement
        if (state.activeVariantId) {
          const variant = (state.dynamicVariants || []).find((v) => v.id === state.activeVariantId)
          const ov = variant?.overrides?.[selectedElement.id]
          if (ov) {
            element = {
              ...selectedElement,
              ...ov,
            } as typeof selectedElement
          }
        }

        // Use transforming element data if available for real-time updates
        const currentTransform = transformingElement && transformingElement.id === selectedElement.id ? transformingElement : null
        // Use dragging element data if available for real-time updates
        const currentDrag = draggingElement && draggingElement.id === selectedElement.id ? draggingElement : null

        // Get element dimensions based on type
        const width = currentTransform?.width || element.width || 100
        let height = currentTransform?.height || element.height || 100
        const rotation = currentTransform?.rotation || element.rotation || 0
        const x = currentDrag?.x || currentTransform?.x || element.x || 0
        const y = currentDrag?.y || currentTransform?.y || element.y || 0

        // For text elements, use calculated dimensions if available
        if (element.type === 'text') {
          const textElement = element as any
          if (textElement.properties?.fontSize) {
            // Estimate height based on font size
            height = (textElement.properties.fontSize || 124) + 20
          }
        }

        return (
          <DeleteButton
            key={element.id}
            elementId={element.id}
            x={x}
            y={y}
            width={width}
            height={height}
            rotation={rotation}
            canvasScale={state.canvas.scale}
            canvasX={state.canvas.x}
            canvasY={state.canvas.y}
          />
        )
      })()}
    </div>
  )
}
