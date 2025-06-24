import {useEffect, useRef, useState} from 'react'
import {useAcrylicTileEditor} from '../AcrylicTileEditor.context'
import {CORNER_RADIUS} from '../acrylicTileEditor.config'
import {Stage, Layer, Rect, Image as KonvaImage} from 'react-konva'
import {useContainerSize} from '../hooks/useContainerSize'
import {useBackgroundImage} from '../hooks/useBackgroundImage'
import {useInitialFit} from '../hooks/useInitialFit'
import {useCanvasGestures} from '../hooks/useCanvasGestures'
import {TextNode} from '../elements/TextNode'
import {ImageNode} from '../elements/ImageNode'
import {RotateCcw, RotateCw} from 'lucide-react'

export const Canvas = () => {
  const [isClient, setIsClient] = useState(false)

  // Prevent server side rendering for Konva
  useEffect(() => {
    setIsClient(true)
  }, [])

  const {state, dispatch, stageRef} = useAcrylicTileEditor()
  const containerRef = useRef<HTMLDivElement>(null)
  const containerSize = useContainerSize(containerRef)

  // Gestures handled via custom hook
  const stageGestures = useCanvasGestures(stageRef, state.canvas, dispatch)

  // Background image resolved via custom hook
  const bgImage = useBackgroundImage(state.template.backgroundImage)

  // One-time initial fitting handled via custom hook
  useInitialFit({containerSize, template: state.template, dispatch})

  const rotateTile = (dir: 'left' | 'right') => {
    // swap width/height
    dispatch({
      type: 'UPDATE_TEMPLATE',
      payload: {
        width: state.template.height,
        height: state.template.width,
        orientation: state.template.orientation === 'vertical' ? 'horizontal' : 'vertical',
      } as any,
    })
    // After dimensions change, fitting hook will adjust on next render
  }

  const handleElementSelect = (id: string) => dispatch({type: 'SELECT_ELEMENT', payload: id})
  const handleElementChange = (id: string, updates: any) =>
    dispatch({type: 'UPDATE_ELEMENT', payload: {id, updates}})

  if (!isClient) {
    return <div ref={containerRef} className="relative h-full w-full bg-gray-100" />
  }

  return (
    <div ref={containerRef} className="relative h-full w-full overflow-hidden bg-gray-100">
      {/* rotate buttons */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          aria-label="Obróć w lewo"
          onClick={() => rotateTile('left')}
          className="rounded bg-white p-1 shadow"
        >
          <RotateCcw className="size-5" />
        </button>
        <button
          aria-label="Obróć w prawo"
          onClick={() => rotateTile('right')}
          className="rounded bg-white p-1 shadow"
        >
          <RotateCw className="size-5" />
        </button>
      </div>

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
        {...stageGestures}
        onClick={(e: any) =>
          e.target === e.target.getStage() && dispatch({type: 'SELECT_ELEMENT', payload: null})
        }
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
          {state.elements.map((el) => {
            const isSelected = state.selectedElementId === el.id
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
