import {AcrylicTileEditor, AcrylicTileTemplate, generateFullTemplate, EditorElement, DynamicVariant} from '@/components/acrylicTileEditor'
import {type LoaderFunctionArgs, data as json} from '@shopify/remix-oxygen'
import {useLoaderData, useParams, useNavigate} from 'react-router'
import {useMemo} from 'react'

const DEFAULT_TEMPLATE: AcrylicTileTemplate = generateFullTemplate({
  id: 'default-15x21',
  name: 'Płytka 15×21',
  realWidth: 14,
  realHeight: 21,
  dpi: 300,
  backgroundImage: 'mirror-gold',
  orientation: 'vertical',
})

type LoaderPayload = {
  isLoggedIn: boolean
  design?: {
    id: string
    handle: string
    title: string
    designJson: string
  }
}

export async function loader({request, context}: LoaderFunctionArgs) {
  const isLogged = await context.customerAccount.isLoggedIn()

  const url = new URL(request.url)
  const handle = url.searchParams.get('design')
  if (!handle) {
    return json<LoaderPayload>({isLoggedIn: isLogged})
  }

  // Get current customer id
  const cusRes = await context.customerAccount.query(/* GraphQL */ `
    query {
      customer {
        id
      }
    }
  `)
  const currentCustomerId: string | undefined = cusRes.data?.customer?.id

  const {metaobject} = await context.storefront.query(
    /* GraphQL */ `
      query TileDesign($handle: MetaobjectHandleInput!) {
        metaobject(handle: $handle) {
          id
          handle
          title: field(key: "title") {
            value
          }
          designJson: field(key: "design_json") {
            value
          }
          customerId: field(key: "customer_id") {
            value
          }
        }
      }
    `,
    {
      variables: {handle: {handle, type: 'tile_design'}},
      cache: context.storefront.CacheNone(),
    },
  )

  if (!metaobject) return json<LoaderPayload>({isLoggedIn: isLogged})

  // Check ownership: allow if no customer field or matches current user
  const ownerId = metaobject.customerId?.value as string | undefined
  if (ownerId && currentCustomerId && ownerId !== currentCustomerId) {
    throw new Response('Forbidden', {status: 403})
  }

  const canvasJsonTemplate = metaobject.designJson?.value ?? ''

  return json<LoaderPayload>({
    isLoggedIn: isLogged,
    design: {
      id: metaobject.id,
      handle: metaobject.handle,
      title: metaobject.title?.value ?? 'Bez nazwy',
      designJson: canvasJsonTemplate,
    },
  })
}

export default function ConfiguratorPage() {
  const {locale = ''} = useParams<{locale: string}>()
  const {design, isLoggedIn} = useLoaderData<LoaderPayload>()
  const navigate = useNavigate()

  const memo = useMemo(() => {
    if (!design) {
      return {template: DEFAULT_TEMPLATE}
    }

    try {
      const parsedTemplate = JSON.parse(design.designJson) as {
        template: AcrylicTileTemplate
        elements: EditorElement[]
        dynamicVariants?: DynamicVariant[]
        activeVariantId?: string
      }

      return {
        template: parsedTemplate.template,
        initialState: {
          elements: parsedTemplate.elements,
          template: parsedTemplate.template,
          dynamicVariants: parsedTemplate.dynamicVariants ?? [],
          activeVariantId: parsedTemplate.activeVariantId,
        },
        designId: design.id,
      }
    } catch (e) {
      console.warn('Nie można sparsować designJson', e)
      return {template: DEFAULT_TEMPLATE}
    }
  }, [design])

  const saveDesign = async ({title, design_json: designJsonInput}: {title: string; design_json: any}) => {
    const {designId} = memo
    const endpointBase = locale ? `/${locale}` : ''
    const method = designId ? 'PUT' : 'POST'

    const resp = await fetch(`${endpointBase}/admin/metaobjects`, {
      method,
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({title, design_json: designJsonInput, ...(designId && {id: designId})}),
    })

    const {id, handle, error} = (await resp.json()) as {
      id?: string
      handle?: string
      error?: string
    }

    if (!resp.ok || error) throw new Error(error ?? 'Błąd zapisu projektu')

    await fetch(`${endpointBase}/api/account/designs/update`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({id: id ?? designId, handle: handle ?? design?.handle}),
    })

    if (handle) {
      const search = new URLSearchParams(window.location.search)
      if (search.get('design') !== handle) {
        search.set('design', handle)
        navigate(
          {
            search: `?${search.toString()}`,
          },
          {replace: true},
        )
      }
    }
  }

  const {template, initialState} = memo

  return (
    <div className="h-full">
      <AcrylicTileEditor isLoggedIn={isLoggedIn} template={template} initialState={initialState} onSave={saveDesign} />
    </div>
  )
}
