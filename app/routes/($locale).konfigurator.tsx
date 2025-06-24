import {
  AcrylicTileEditor,
  AcrylicTileTemplate,
  generateFullTemplate,
} from '@/components/acrylicTileEditor'

export default function ConfiguratorPage() {
  // Przykład płytki 15cm x 21cm z rzeczywistymi wymiarami
  const sampleTemplate: AcrylicTileTemplate = generateFullTemplate({
    id: 'test-15x21',
    name: 'Płytka Testowa 15cm x 21cm',
    realWidth: 14, // cm
    realHeight: 21, // cm
    category: 'rectangular',
    backgroundImage: 'transparent',
    dpi: 300,
  })

  const handleSave = (data: any) => {
    console.log('Zapisano projekt:', data)
    alert('Projekt został zapisany!')
  }

  return (
    <div className="h-full">
      <AcrylicTileEditor template={sampleTemplate} onSave={handleSave} />
    </div>
  )
}
