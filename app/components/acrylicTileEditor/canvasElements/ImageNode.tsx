import {useEffect, useRef, useState} from 'react'
import {Image as KonvaImage, Transformer} from 'react-konva'
import {EditorImageElement} from '../acrylicTileEditor.types'
import {useAcrylicTileEditor} from '../AcrylicTileEditor.context'

interface NodeProps {
  element: EditorImageElement
  isSelected: boolean
  onSelect: () => void
  onChange: (updates: Partial<EditorImageElement>) => void
  onTransformStart?: () => void
  onTransformUpdate?: (transformData: {x: number; y: number; width: number; height: number; rotation: number}) => void
  onTransformEnd?: () => void
  onDragStart?: () => void
  onDragUpdate?: (x: number, y: number) => void
  onDragEnd?: () => void
}

export function ImageNode({
  element,
  isSelected,
  onSelect,
  onChange,
  onTransformStart,
  onTransformUpdate,
  onTransformEnd,
  onDragStart,
  onDragUpdate,
  onDragEnd,
}: NodeProps) {
  const shapeRef = useRef<any>(null)
  const transformerRef = useRef<any>(null)
  const [imgObj, setImgObj] = useState<HTMLImageElement | null>(null)
  const {isReadOnly, dispatch} = useAcrylicTileEditor()

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

  const handleTransformStart = () => {
    if (onTransformStart) {
      onTransformStart()
    }
  }

  const handleTransformUpdate = () => {
    if (onTransformUpdate && shapeRef.current) {
      const node = shapeRef.current
      onTransformUpdate({
        x: node.x(),
        y: node.y(),
        width: node.width(),
        height: node.height(),
        rotation: node.rotation(),
      })
    }
  }

  const handleTransformEnd = () => {
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
      rotation: node.rotation(),
    })

    if (onTransformEnd) {
      onTransformEnd()
    }
  }

  const handleDragStart = () => {
    if (onDragStart) {
      onDragStart()
    }
  }

  const handleDragMove = (e: any) => {
    if (onDragUpdate) {
      onDragUpdate(e.target.x(), e.target.y())
    }
  }

  const handleDragEnd = (e: any) => {
    onChange({x: e.target.x(), y: e.target.y(), rotation: e.target.rotation()})
    if (onDragEnd) {
      onDragEnd()
    }
  }

  return (
    <>
      <KonvaImage
        ref={shapeRef}
        image={imgObj || undefined}
        {...element}
        onClick={isReadOnly ? undefined : onSelect}
        draggable={!isReadOnly}
        onDragStart={isReadOnly ? undefined : handleDragStart}
        onDragMove={isReadOnly ? undefined : handleDragMove}
        onDragEnd={isReadOnly ? undefined : handleDragEnd}
        onTransform={isReadOnly ? undefined : handleTransformUpdate}
        onTransformEnd={isReadOnly ? undefined : handleTransformEnd}
      />
      {isSelected && <Transformer ref={transformerRef} onTransformStart={isReadOnly ? undefined : handleTransformStart} />}
    </>
  )
}
