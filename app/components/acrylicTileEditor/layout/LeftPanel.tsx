import {BackgroundSelector} from '../components/BackgroundSelector'
import {EditorElementsList} from '../components/EditorElementsList'
import {NameInput} from '../components/NameInput'
import {SizeSelector} from '../components/SizeSelector'

export const LeftPanel = () => {
  return (
    <div className="flex h-full flex-col space-y-4 overflow-y-auto p-4">
      {/* Template name */}
      <div className="space-y-2">
        <NameInput />
      </div>

      {/* Template size */}
      <div className="space-y-2">
        <SizeSelector />
      </div>

      {/* Background selector */}
      <div className="space-y-2">
        <BackgroundSelector />
      </div>

      <hr className="my-4" />

      {/* Elements list */}
      <EditorElementsList />
    </div>
  )
}
