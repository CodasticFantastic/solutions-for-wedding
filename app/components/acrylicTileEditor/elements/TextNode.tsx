import {useEffect, useRef} from 'react'
import {Text, Transformer} from 'react-konva'

interface NodeProps {
  element: any
  isSelected: boolean
  onSelect: () => void
  onChange: (updates: any) => void
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
        onDragEnd={(e) => onChange({x: e.target.x(), y: e.target.y()})}
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