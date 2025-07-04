import {useEffect, useRef, useState} from 'react'
import {Image as KonvaImage, Transformer} from 'react-konva'
import {EditorImageElement} from '../acrylicTileEditor.types'
import {useAcrylicTileEditor} from '../AcrylicTileEditor.context'

interface NodeProps {
  element: EditorImageElement
  isSelected: boolean
  onSelect: () => void
  onChange: (updates: Partial<EditorImageElement>) => void
}

export function ImageNode({element, isSelected, onSelect, onChange}: NodeProps) {
  const shapeRef = useRef<any>(null)
  const transformerRef = useRef<any>(null)
  const [imgObj, setImgObj] = useState<HTMLImageElement | null>(null)
  const {isReadOnly} = useAcrylicTileEditor()

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
        onClick={isReadOnly ? undefined : onSelect}
        draggable={!isReadOnly}
        onDragEnd={isReadOnly ? undefined : (e) => onChange({x: e.target.x(), y: e.target.y()})}
        onTransformEnd={isReadOnly ? undefined : () => {
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