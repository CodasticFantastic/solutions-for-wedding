import {AcrylicEditor} from '@/components/acrylicEditor/AcrylicEditor'

export default function ConfiguratorPage() {
  // W przyszłości można tu pobrać dane szablonu i przekazać do edytora
  // const template = useLoaderData();

  return (
    <div className="customPageContainer">
      <AcrylicEditor /* template={template} */ />
    </div>
  )
}
