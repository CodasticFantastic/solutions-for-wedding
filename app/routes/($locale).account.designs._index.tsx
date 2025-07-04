import {type LoaderFunctionArgs} from '@shopify/remix-oxygen'
import {Link, useLoaderData, useFetcher, useRevalidator, useParams} from 'react-router'
import {Button} from '@/components/shadCn/ui/button'
import {Badge} from '@/components/shadCn/ui/badge'
import {METAOBJECTS_BY_IDS_QUERY} from '@/graphql/storefront/queries/metaobjectsByIds.query'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/shadCn/ui/alert-dialog'
import {EditIcon, Trash2, EyeIcon} from 'lucide-react'
import {useState} from 'react'

export async function loader({context}: LoaderFunctionArgs) {
  await context.customerAccount.handleAuthStatus()

  // 1) load designs metafield json
  const metaQuery = /* GraphQL */ `
    query DesignsMeta {
      customer {
        metafield(namespace: "custom", key: "designs") {
          value
        }
      }
    }
  `
  const metaRes = await context.customerAccount.query(metaQuery)
  let list: {id: string; handle: string; updatedAt?: string}[] = []
  try {
    if (metaRes.data?.customer?.metafield?.value) {
      list = JSON.parse(metaRes.data.customer.metafield.value as string) as {id: string; handle: string; updatedAt?: string}[]
    }
  } catch (e) {
    list = []
  }

  if (!list.length) return {designs: []}

  // 2) fetch metaobjects by ids
  const ids = list.map((d) => d.id)
  const res = await context.storefront.query(METAOBJECTS_BY_IDS_QUERY, {
    variables: {ids},
    cache: context.storefront.CacheNone(),
  })

  const nodes = res?.nodes ?? []
  const designs = nodes.map((n: any) => {
    // Parse the design_json to check if it's editable
    let isEditable = true
    try {
      if (n.design_json?.value) {
        const designData = JSON.parse(n.design_json.value) as {template?: {isEditable?: boolean}}
        isEditable = designData.template?.isEditable !== false
      }
    } catch (e) {
      // If parsing fails, assume it's editable
      isEditable = true
    }

    return {
      id: n.id,
      handle: n.handle,
      title: n.title?.value ?? 'Bez nazwy',
      isEditable,
    }
  })

  return {designs}
}

export default function DesignsPage() {
  const {designs} = useLoaderData<typeof loader>()
  const {locale = ''} = useParams<{locale: string}>()
  const fetcher = useFetcher()
  const revalidator = useRevalidator()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = async (id: string) => {
    setDeletingId(id)
    try {
      const endpointBase = locale ? `/${locale}` : ''
      fetcher.submit(
        {id},
        {
          method: 'POST',
          action: `${endpointBase}/api/account/designs/delete`,
        },
      )

      // Refresh the page data after a short delay
      setTimeout(() => {
        revalidator.revalidate()
      }, 500)
    } catch (error) {
      console.error('Error deleting design:', error)
      alert('Nie udało się usunąć projektu. Spróbuj ponownie.')
    } finally {
      setDeletingId(null)
    }
  }

  if (!designs.length) {
    return <p>Nie masz jeszcze zapisanych projektów.</p>
  }

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Moje projekty</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {designs.map((d: any) => (
          <div key={d.id} className="rounded border p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <p className="truncate font-medium" title={d.title}>
                {d.title}
              </p>
              {!d.isEditable && (
                <Badge variant="outline" className="ml-2">
                  <EyeIcon className="mr-1 h-3 w-3" />
                  Nieedytowalny
                </Badge>
              )}
            </div>
            <div className="flex gap-2">
              {d.isEditable ? (
                <Button asChild size="sm" className="flex-1">
                  <Link to={`/konfigurator?design=${d.handle}`}>
                    <EditIcon className="mr-2 h-4 w-4" />
                    Edytuj
                  </Link>
                </Button>
              ) : (
                <Button asChild size="sm" variant="outline" className="flex-1">
                  <Link to={`/konfigurator?design=${d.handle}`}>
                    <EyeIcon className="mr-2 h-4 w-4" />
                    Podgląd
                  </Link>
                </Button>
              )}

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm" className="flex-1" disabled={deletingId === d.id}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    {deletingId === d.id ? 'Usuwanie...' : 'Usuń'}
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Usuń projekt</AlertDialogTitle>
                    <AlertDialogDescription>
                      Czy na pewno chcesz usunąć projekt &quot;{d.title}&quot;? <br />
                      Ta operacja jest nieodwracalna i projekt zostanie usunięty na zawsze.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Anuluj</AlertDialogCancel>
                    <AlertDialogAction onClick={() => handleDelete(d.id)} className="bg-transparent p-0 hover:bg-transparent">
                      <Button variant="destructive" size="sm" className="w-full">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Usuń projekt
                      </Button>
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
