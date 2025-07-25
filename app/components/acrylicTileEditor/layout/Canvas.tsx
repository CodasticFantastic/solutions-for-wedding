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
import {RotateCcw, RotateCw} from 'lucide-react'
import {SvgNode} from '../canvasElements/SvgNode'
import type {DynamicVariant} from '../acrylicTileEditor.types'

export const Canvas = () => {
  const [isClient, setIsClient] = useState(false)

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
            if (el.type === 'svg') {
              return (
                <SvgNode
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
