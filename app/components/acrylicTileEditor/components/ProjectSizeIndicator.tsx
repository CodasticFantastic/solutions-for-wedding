import {useMemo} from 'react'
import {useAcrylicTileEditor} from '../AcrylicTileEditor.context'
import {Progress} from '@/components/shadCn/ui/progress'
import {Alert, AlertDescription} from '@/components/shadCn/ui/alert'
import {AlertTriangleIcon, InfoIcon} from 'lucide-react'

const SHOPIFY_LIMIT = 1999990 // Limit znaków w JSON (Shopify max JSON limit length)

export const ProjectSizeIndicator = () => {
  const {state} = useAcrylicTileEditor()

  const projectStats = useMemo(() => {
    const projectData = {
      template: state.template,
      elements: state.elements,
      dynamicVariants: state.dynamicVariants,
      activeVariantId: state.activeVariantId,
    }

    const jsonString = JSON.stringify(projectData)
    const sizeInChars = jsonString.length
    const sizeInMB = (sizeInChars / 1024 / 1024).toFixed(2)
    const usagePercentage = (sizeInChars / SHOPIFY_LIMIT) * 100

    // Analiza obrazów
    const imageElements = state.elements.filter((el) => el.type === 'image')
    const imageSizes = imageElements.map((img) => ({
      name: img.properties.alt,
      size: img.properties.src.length,
      sizeKB: (img.properties.src.length / 1024).toFixed(0),
    }))

    return {
      sizeInChars,
      sizeInMB,
      usagePercentage,
      imageCount: imageElements.length,
      imageSizes,
      isOverLimit: sizeInChars > SHOPIFY_LIMIT,
    }
  }, [state])

  const getStatusText = (percentage: number) => {
    if (percentage >= 100) return 'Krytyczny'
    if (percentage >= 80) return 'Wysoki'
    if (percentage >= 60) return 'Średni'
    return 'Niski'
  }

  const getStatusColor = (percentage: number) => {
    if (percentage >= 100) return 'text-red-600'
    if (percentage >= 80) return 'text-yellow-600'
    if (percentage >= 60) return 'text-orange-600'
    return 'text-green-600'
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Rozmiar projektu</span>
          <span className={`font-semibold ${getStatusColor(projectStats.usagePercentage)}`}>
            {getStatusText(projectStats.usagePercentage)}
          </span>
        </div>

        <Progress value={Math.min(projectStats.usagePercentage, 100)} className="h-2" />

        <div className="text-muted-foreground flex items-center justify-between text-xs">
          <span>{projectStats.sizeInMB} MB</span>
          <span>{projectStats.usagePercentage.toFixed(1)}% limitu</span>
        </div>
      </div>

      {/* Szczegóły obrazów */}
      {projectStats.imageCount > 0 && (
        <div className="space-y-2">
          <div className="text-muted-foreground flex items-center gap-1 text-xs">
            <InfoIcon className="h-3 w-3" />
            <span>Obrazy ({projectStats.imageCount})</span>
          </div>

          <div className="max-h-20 space-y-1 overflow-y-auto">
            {projectStats.imageSizes.map((img, index) => (
              <div key={index} className="flex items-center justify-between text-xs">
                <span className="max-w-32 truncate" title={img.name}>
                  {img.name}
                </span>
                <span className="text-muted-foreground">{img.sizeKB} KB</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ostrzeżenie o przekroczeniu limitu */}
      {projectStats.isOverLimit && (
        <Alert variant="destructive" className="border-red-200 bg-red-50">
          <AlertTriangleIcon className="h-4 w-4" />
          <AlertDescription className="text-red-800">
            <strong>Projekt nie zostanie zapisany!</strong>
            <br />
            Przekroczono limit rozmiaru. Usuń niektóre obrazy lub zmniejsz ich rozmiar.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
