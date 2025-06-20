import {Stage, Layer, Rect} from 'react-konva'
import {useEffect, useState} from 'react'

export default function Configurator() {
  const [isClient, setIsClient] = useState(false)
  useEffect(() => { setIsClient(true) }, [])

  return (
    <div className="customPageContainer">
      <h1>Konfigurator</h1>
      <div className="mt-8 flex justify-center">
        {isClient && (
          <Stage width={500} height={400} className="bg-gray-100 rounded-lg">
            <Layer>
              <Rect
                x={150}
                y={100}
                width={200}
                height={150}
                fill="#4f46e5"
                shadowBlur={10}
                cornerRadius={16}
                draggable
              />
            </Layer>
          </Stage>
        )}
      </div>
    </div>
  )
}
