import Konva from 'konva'
import {useEffect, useRef} from 'react'
import {Text, Transformer} from 'react-konva'
import {EditorTextElement} from '../acrylicTileEditor.types'
import {useAcrylicTileEditor} from '../AcrylicTileEditor.context'

interface NodeProps {
  element: EditorTextElement
  isSelected: boolean
  onSelect: () => void
  onChange: (updates: Partial<EditorTextElement>) => void
}

export function TextNode({element, isSelected, onSelect, onChange}: NodeProps) {
  const shapeRef = useRef<any>(null)
  const transformerRef = useRef<any>(null)
  const {isReadOnly} = useAcrylicTileEditor()

  // Calculate initial dimensions if not set
  const getInitialDimensions = () => {
    if (element.width && element.height) {
      return {width: element.width, height: element.height}
    }

    // Estimate dimensions based on text content and font size
    const text = element.properties.text || 'Nowy tekst'
    const fontSize = element.properties.fontSize || 124
    const fontFamily = element.properties.fontFamily || 'Inter'

    // Create a temporary canvas to measure text
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.font = `${fontSize}px ${fontFamily}`
      const metrics = ctx.measureText(text)
      const estimatedWidth = Math.max(metrics.width + 20, 100) // Add some padding
      const estimatedHeight = fontSize + 20 // Add some padding
      return {width: estimatedWidth, height: estimatedHeight}
    }

    // Fallback dimensions
    return {width: 200, height: 100}
  }

  const initialDimensions = getInitialDimensions()

  // Function to calculate text height based on current properties
  const calculateTextHeight = () => {
    if (!shapeRef.current) return

    const node = shapeRef.current
    const currentWidth = node.width()
    
    // Only recalculate if we have a valid width
    if (currentWidth > 0) {
      // Temporarily set height to auto to get the actual text height
      node.height('auto')
      const actualHeight = node.height()
      
      // Update the element with the new height while keeping the width
      onChange({
        height: actualHeight,
      })
    }
  }

  // Auto-update height when text content or font properties change
  useEffect(() => {
    if (shapeRef.current) {
      // Use setTimeout to ensure the text has been rendered
      const timeoutId = setTimeout(() => {
        calculateTextHeight()
      }, 0)
      
      return () => clearTimeout(timeoutId)
    }
  }, [
    element.properties.text,
    element.properties.fontSize,
    element.properties.fontFamily,
    element.properties.fontStyle,
    element.width, // Recalculate when width changes
    onChange, // Include onChange in dependencies
  ])

  useEffect(() => {
    if (isSelected && transformerRef.current && shapeRef.current) {
      transformerRef.current.nodes([shapeRef.current])
      transformerRef.current.getLayer().batchDraw()
    }
  }, [isSelected, initialDimensions])

  const onDragEnd = (e: Konva.KonvaEventObject<MouseEvent>) => {
    onChange({x: e.target.x(), y: e.target.y()})
  }

  const onTransform = () => {
    // Allow to preview the transformation on live + update the height of the node if the text is wrapped
    const node = shapeRef.current
    const scaleX = node.scaleX()

    // Reset scale so further transforms are applied on fresh dimensions
    node.scaleX(1)
    node.scaleY(1)

    // Set the width of the node
    const newWidth = Math.max(5, node.width() * scaleX)
    node.width(newWidth)

    // Determine the height of the node
    node.height('auto')
  }

  const onTransformEnd = () => {
    const node = shapeRef.current
    const scaleX = node.scaleX()

    node.scaleX(1)
    node.scaleY(1)

    const finalWidth = Math.max(5, node.width() * scaleX)
    node.width(finalWidth)

    const finalHeight = node.height()

    onChange({
      x: node.x(),
      y: node.y(),
      width: finalWidth,
      height: finalHeight,
    })
  }

  return (
    <>
      <Text
        ref={shapeRef}
        {...element}
        width={initialDimensions.width}
        height={initialDimensions.height}
        text={element.properties.text || 'Nowy tekst'}
        fontSize={element.properties.fontSize || 124}
        fontFamily={element.properties.fontFamily || 'Inter'}
        fontStyle={element.properties.fontStyle || 'normal'}
        align={element.properties.align || 'left'}
        fill={element.properties.fill || '#000'}
        onClick={isReadOnly ? undefined : onSelect}
        draggable={!isReadOnly}
        onDragEnd={isReadOnly ? undefined : onDragEnd}
        onTransform={isReadOnly ? undefined : onTransform}
        onTransformEnd={isReadOnly ? undefined : onTransformEnd}
      />
      {isSelected && (
        <Transformer
          ref={transformerRef}
          anchorStyleFunc={(anchor) => {
            anchor.cornerRadius(1)

            if (
              anchor.hasName('top-left') ||
              anchor.hasName('top-right') ||
              anchor.hasName('top-center') ||
              anchor.hasName('bottom-left') ||
              anchor.hasName('bottom-right') ||
              anchor.hasName('bottom-center')
            ) {
              anchor.scale({x: 0, y: 0})
            }
          }}
        />
      )}
    </>
  )
}
