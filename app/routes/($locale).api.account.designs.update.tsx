import {type ActionFunctionArgs, data} from '@shopify/remix-oxygen'

export async function action({request, context}: ActionFunctionArgs) {
  await context.customerAccount.handleAuthStatus()

  if (request.method !== 'POST') {
    return data({error: 'Method not allowed'}, {status: 405})
  }

  const {id, handle} = (await request.json()) as {id: string; handle: string}
  if (!id || !handle) return data({error: 'Missing id or handle'}, {status: 400})

  // 1) current designs metafield
  const QUERY = /* GraphQL */ `
    query CustomerDesignsMeta {
      customer {
        id
        metafield(namespace: "custom", key: "designs") { id value }
      }
    }
  `
  const {data: qData, errors: qErr} = await context.customerAccount.query(QUERY)
  if (qErr?.length) return data({error: qErr[0].message}, {status: 400})

  const customerId = qData?.customer?.id
  const meta = qData?.customer?.metafield
  if (!customerId) return data({error: 'Customer ID not found'}, {status: 400})

  let designs: any[] = []
  if (meta?.value) {
    try {
      designs = JSON.parse(meta.value as string) as any[]
    } catch (err) {
      designs = []
    }
  }

  const now = new Date().toISOString()
  const existing = designs.find((d: any) => d.id === id)
  if (existing) {
    existing.handle = handle
    existing.updatedAt = now
  } else {
    designs.push({id, handle, updatedAt: now})
  }

  // 2) write back via metafieldsSet
  const MUT = /* GraphQL */ `
    mutation SetCustomerDesigns($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields { id }
        userErrors { field message code }
      }
    }
  `
  const metafields = [{
    namespace: 'custom',
    key: 'designs',
    type: 'json',
    value: JSON.stringify(designs),
    ownerId: customerId,
  }]

  const {errors, data: mData} = await context.customerAccount.mutate(MUT, {variables: {metafields}})
  if (mData?.metafieldsSet?.userErrors?.length) return data({error: mData.metafieldsSet.userErrors[0].message}, {status: 400})
  if (errors?.length) return data({error: errors[0].message}, {status: 400})

  return {ok: true}
} 