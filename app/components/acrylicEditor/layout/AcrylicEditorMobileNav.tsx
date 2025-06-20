import {useState} from 'react'
import {useAcrylicEditorContext} from '../acrylicEditor.context'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/shadCn/ui/drawer'
import {Button} from '@/components/shadCn/ui/button'

export function AcrylicEditorMobileNav() {
  const {controls} = useAcrylicEditorContext()
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="fixed right-0 bottom-0 left-0 border-t bg-white p-2 md:hidden">
      <div className="flex justify-around">
        {controls.mobile.map((control, index) => (
          <Drawer
            key={index}
            open={openIndex === index}
            onOpenChange={(open) => setOpenIndex(open ? index : null)}
          >
            <DrawerTrigger asChild>
              <Button
                variant="ghost"
                className="flex h-auto flex-col"
                onClick={() => setOpenIndex(index)}
              >
                {control.icon}
                <span className="mt-1 text-xs">{control.label}</span>
              </Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>{control.label}</DrawerTitle>
              </DrawerHeader>
              <div>{control.content}</div>
            </DrawerContent>
          </Drawer>
        ))}
      </div>
    </div>
  )
}
