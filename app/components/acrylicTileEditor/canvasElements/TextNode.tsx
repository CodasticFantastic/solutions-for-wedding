import Konva from 'konva'
import {useEffect, useRef} from 'react'
import {Text, Transformer} from 'react-konva'
import {EditorTextElement} from '../acrylicTileEditor.types'

interface NodeProps {
  element: EditorTextElement
  isSelected: boolean
  onSelect: () => void
  onChange: (updates: Partial<EditorTextElement>) => void
}

export function TextNode({element, isSelected, onSelect, onChange}: NodeProps) {
  const shapeRef = useRef<any>(null)
  const transformerRef = useRef<any>(null)

  useEffect(() => {
    if (isSelected && transformerRef.current) {
      transformerRef.current.nodes([shapeRef.current])
      transformerRef.current.getLayer().batchDraw()
    }
  }, [isSelected])

  const onDragEnd = (e: Konva.KonvaEventObject<MouseEvent>) => {
    onChange({x: e.target.x(), y: e.target.y()})
  }

  const onTransform = () => {
    // Allow to preview the transformation on live + update the height of the node if the text is wrapped
    const node = shapeRef.current
    const scaleX = node.scaleX()
    const scaleY = node.scaleY()

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
    const scaleY = node.scaleY()
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
        text={element.properties.text || 'Nowy tekst'}
        fontSize={element.properties.fontSize || 124}
        fontFamily={element.properties.fontFamily || 'Inter'}
        fontStyle={element.properties.fontStyle || 'normal'}
        align={element.properties.align || 'left'}
        fill={element.properties.fill || '#000'}
        onClick={onSelect}
        draggable
        onDragEnd={onDragEnd}
        onTransform={onTransform}
        onTransformEnd={onTransformEnd}
      />
      {isSelected && <Transformer ref={transformerRef} />}
    </>
  )
}
