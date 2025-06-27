import {useEffect, useRef, useState} from 'react'
import {Image as KonvaImage, Transformer} from 'react-konva'
import {EditorSvgElement} from '../acrylicTileEditor.types'

interface NodeProps {
  element: EditorSvgElement
  isSelected: boolean
  onSelect: () => void
  onChange: (updates: Partial<EditorSvgElement>) => void
}

// Replace all fill attributes in the SVG string with the given colour
const applyFillToSvg = (raw: string, fill: string) => {
  if (!fill) return raw
  // naive global replace of existing fill attributes
  let svg = raw.replace(/fill=".*?"/g, `fill=\"${fill}\"`)
  // if no fill attribute present, add to the <svg> tag
  if (!/fill=\"/.test(svg)) {
    svg = svg.replace(/<svg(.*?)>/, `<svg$1 fill=\"${fill}\">`)
  }
  return svg
}

export function SvgNode({element, isSelected, onSelect, onChange}: NodeProps) {
  const shapeRef = useRef<any>(null)
  const transformerRef = useRef<any>(null)
  const [imgObj, setImgObj] = useState<HTMLImageElement | null>(null)

  const {raw, fill} = element.properties

  useEffect(() => {
    const svgWithFill = applyFillToSvg(raw, fill)
    const svgBase64 = window.btoa(unescape(encodeURIComponent(svgWithFill)))
    const dataUrl = `data:image/svg+xml;base64,${svgBase64}`
    const img = new window.Image()
    img.src = dataUrl
    img.onload = () => setImgObj(img)
  }, [raw, fill])

  useEffect(() => {
    if (isSelected && transformerRef.current) {
      transformerRef.current.nodes([shapeRef.current])
      transformerRef.current.getLayer().batchDraw()
    }
  }, [isSelected])

  const width = element.width || imgObj?.width || 100
  const height = element.height || imgObj?.height || 100

  return (
    <>
      <KonvaImage
        ref={shapeRef}
        image={imgObj || undefined}
        {...element}
        width={width}
        height={height}
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