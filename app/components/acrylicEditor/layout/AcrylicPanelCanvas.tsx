import {Stage, Layer, Group, Rect} from 'react-konva'
import React, {useMemo} from 'react'
import {useAcrylicEditorContext} from '../acrylicEditor.context'
import {cn} from '@/lib/shadCn/utils'

export function AcrylicPanelCanvas({children}: {children?: React.ReactNode}) {
  const {state, methods} = useAcrylicEditorContext()
  // prettier-ignore
  const { canvasContainerRef, canvasSize, offset, zoom, rotation, selectedSizeKey, panelSizes, } = state

  const panelDimensions = useMemo(() => {
    if (!canvasSize?.width || !canvasSize?.height || !selectedSizeKey || !panelSizes) {
      return {width: 0, height: 0, x: 0, y: 0}
    }

    const {width: canvasWidth, height: canvasHeight} = canvasSize
    const currentSize = panelSizes[selectedSizeKey]
    const paddingFactor = 0.9

    const scale = Math.min(
      (canvasWidth * paddingFactor) / currentSize.width,
      (canvasHeight * paddingFactor) / currentSize.height,
    )

    const panelWidth = currentSize.width * scale
    const panelHeight = currentSize.height * scale

    return {
      width: panelWidth,
      height: panelHeight,
      x: (canvasWidth - panelWidth) / 2,
      y: (canvasHeight - panelHeight) / 2,
    }
  }, [canvasSize, selectedSizeKey, panelSizes])

  const showStage = !!(canvasSize?.width && canvasSize.height)

  return (
    <div ref={canvasContainerRef} className={cn('h-full w-full', showStage && 'touch-none')}>
      {showStage && (
        <Stage
          width={canvasSize.width}
          height={canvasSize.height}
          scaleX={zoom}
          scaleY={zoom}
          x={offset.x}
          y={offset.y}
          onMouseDown={methods.handleStageMouseDown}
          onMouseMove={methods.handleStageMouseMove}
          onMouseUp={methods.handleStageMouseUp}
          onTouchStart={methods.handleStageTouchStart}
          onTouchMove={methods.handleStageTouchMove}
          onTouchEnd={methods.handleStageTouchEnd}
        >
          <Layer>
            <Group
              x={panelDimensions.x + panelDimensions.width / 2}
              y={panelDimensions.y + panelDimensions.height / 2}
              offsetX={panelDimensions.width / 2}
              offsetY={panelDimensions.height / 2}
              rotation={rotation}
            >
              <Rect
                width={panelDimensions.width}
                height={panelDimensions.height}
                fill="#ffffff"
                shadowBlur={15}
                shadowOpacity={0.2}
                cornerRadius={8}
              />
              {children}
            </Group>
          </Layer>
        </Stage>
      )}
    </div>
  )
}
