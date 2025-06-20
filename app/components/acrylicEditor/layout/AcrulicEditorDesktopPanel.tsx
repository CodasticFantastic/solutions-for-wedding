import {useAcrylicEditorContext} from '../acrylicEditor.context'

export function AcrylicEditorDesktopPanel() {
  const {controls} = useAcrylicEditorContext()
  return (
    <div className="flex flex-col gap-4">
      {controls.desktop.map((control, index) => (
        <div key={index}>{control}</div>
      ))}
    </div>
  )
}
