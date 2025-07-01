import {type LoaderFunctionArgs} from '@shopify/remix-oxygen'
import {Link, useLoaderData} from 'react-router'
import {Button} from '@/components/shadCn/ui/button'
import {METAOBJECTS_BY_IDS_QUERY} from '@/graphql/storefront/queries/metaobjectsByIds.query'

export async function loader({context}: LoaderFunctionArgs) {
  await context.customerAccount.handleAuthStatus()

  // 1) load designs metafield json
  const metaQuery = /* GraphQL */ `
    query DesignsMeta {
      customer { metafield(namespace:"custom", key:"designs") { value } }
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
  const designs = nodes.map((n: any) => ({
    id: n.id,
    handle: n.handle,
    title: n.title?.value ?? 'Bez nazwy',
  }))

  return {designs}
}

export default function DesignsPage() {
  const {designs} = useLoaderData<typeof loader>()

  if (!designs.length) {
    return <p>Nie masz jeszcze zapisanych projektów.</p>
  }

  return (
    <div>
      <h2 className="mb-4 text-lg font-semibold">Moje projekty</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {designs.map((d: any) => (
          <div key={d.id} className="rounded border p-4 shadow-sm">
            <p className="mb-2 truncate font-medium" title={d.title}>
              {d.title}
            </p>
            <Button asChild size="sm" className="w-full">
              <Link to={`/konfigurator?design=${d.handle}`}>Edytuj</Link>
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
