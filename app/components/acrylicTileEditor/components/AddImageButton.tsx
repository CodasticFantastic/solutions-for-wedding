import {Button} from '@/components/shadCn/ui/button'
import {useAcrylicTileEditor} from '../AcrylicTileEditor.context'
import {Badge} from '@/components/shadCn/ui/badge'
import {ImageIcon} from 'lucide-react'
import Pica from 'pica'

// Obsługiwane formaty wejściowe
const SUPPORTED_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']

// Funkcja do sprawdzenia czy format jest obsługiwany
const isFormatSupported = (fileType: string): boolean => {
  return SUPPORTED_FORMATS.includes(fileType.toLowerCase())
}

// Funkcja do kompresji obrazu z pica
const compressImageWithPica = async (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image()
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!

    // Ustawienia kompresji
    const maxSize = 2000
    const quality = 0.85

    img.onload = async () => {
      try {
        // Oblicz nowe wymiary zachowując proporcje
        let {width, height} = img
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width
            width = maxSize
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height
            height = maxSize
          }
        }

        // Ustaw wymiary canvas
        canvas.width = width
        canvas.height = height

        const pica = Pica({
          features: ['js', 'wasm'], // bez Web Workers
        })

        // Stwórz tymczasowy canvas z oryginalnym obrazem
        const sourceCanvas = document.createElement('canvas')
        sourceCanvas.width = img.width
        sourceCanvas.height = img.height
        const sourceCtx = sourceCanvas.getContext('2d')!
        sourceCtx.drawImage(img, 0, 0)

        // Resample z pica
        await pica.resize(sourceCanvas, canvas)

        // Konwertuj do WebP z określoną jakością
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('Nie udało się utworzyć blob'))
            }
          },
          'image/webp',
          quality,
        )
      } catch (error) {
        reject(error)
      }
    }

    img.onerror = () => reject(new Error('Nie udało się załadować obrazu'))
    img.src = URL.createObjectURL(file)
  })
}

export const AddImageButton = () => {
  const {dispatch, isReadOnly} = useAcrylicTileEditor()

  const handleAddImage = async () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = SUPPORTED_FORMATS.join(',')
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return

      // Sprawdź rozmiar pliku - limit 5MB
      if (file.size > 5 * 1024 * 1024) {
        alert('Plik jest za duży. Maksymalny rozmiar to 5MB.')
        return
      }

      // Sprawdź format pliku
      if (!isFormatSupported(file.type)) {
        alert(`Nieobsługiwany format pliku: ${file.type}. Obsługiwane formaty: JPEG, PNG, WebP.`)
        return
      }

      try {
        // Kompresuj obraz z pica
        const compressedBlob = await compressImageWithPica(file)

        // Konwertuj blob na data URL
        const reader = new FileReader()
        reader.onload = (evt) => {
          const dataUrl = evt.target?.result as string
          const base64Size = dataUrl.length
          const shopifyLimit = 2000000

          if (base64Size > shopifyLimit) {
            const usagePercentage = ((base64Size / shopifyLimit) * 100).toFixed(1)
            alert(`Obraz jest za duży po kompresji (${usagePercentage}% limitu Shopify). Spróbuj mniejszy plik.`)
            return
          }

          dispatch({
            type: 'ADD_ELEMENT',
            payload: {
              id: `image-${Date.now()}`,
              type: 'image',
              x: 50,
              y: 50,
              rotation: 0,
              properties: {src: dataUrl, alt: file.name},
            },
          })
        }
        reader.readAsDataURL(compressedBlob)
      } catch (error) {
        alert(`Nie udało się przetworzyć obrazu: ${file.name}. Spróbuj ponownie.`)
      }
    }
    input.click()
  }

  return (
    <Button variant="outline" onClick={handleAddImage} className="h-auto flex-col" disabled={isReadOnly}>
      <Badge variant="outline">
        <ImageIcon />
      </Badge>
      Dodaj Obraz
    </Button>
  )
}
