import {type ActionFunctionArgs, data} from '@shopify/remix-oxygen'

export async function action({request, context}: ActionFunctionArgs) {
  await context.customerAccount.handleAuthStatus()

  if (request.method !== 'POST') {
    return data({error: 'Method not allowed'}, {status: 405})
  }

  const formData = await request.formData()
  const id = formData.get('id') as string
  if (!id) return data({error: 'Missing id'}, {status: 400})

  // 1) Get current designs metafield
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

  // 2) Remove the design from the list
  const filteredDesigns = designs.filter((d: any) => d.id !== id)
  
  // 3) Update metafield with filtered list
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
    value: JSON.stringify(filteredDesigns),
    ownerId: customerId,
  }]

  const {errors, data: mData} = await context.customerAccount.mutate(MUT, {variables: {metafields}})
  if (mData?.metafieldsSet?.userErrors?.length) return data({error: mData.metafieldsSet.userErrors[0].message}, {status: 400})
  if (errors?.length) return data({error: errors[0].message}, {status: 400})

  // 4) Delete the metaobject from Shopify using Admin API
  const env = context.env
  const ADMIN_TOKEN = env.SHOPIFY_ADMIN_API_TOKEN
  if (!ADMIN_TOKEN) {
    return data({error: 'Admin token not configured'}, {status: 500})
  }

  const API_VERSION = '2025-04'
  const adminEndpoint = `https://${env.PUBLIC_STORE_DOMAIN}/admin/api/${API_VERSION}/graphql.json`

  const DELETE_MUTATION = /* ADMIN_GQL */ `
    mutation MetaobjectDelete($id: ID!) {
      metaobjectDelete(id: $id) {
        deletedId
        userErrors {
          field
          message
        }
      }
    }
  `

  console.log('Deleting metaobject with ID:', id)
  console.log('Admin endpoint:', adminEndpoint)
  
  const adminResponse = await fetch(adminEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': ADMIN_TOKEN,
    },
    body: JSON.stringify({
      query: DELETE_MUTATION,
      variables: {id},
    }),
  })

  console.log('Admin response status:', adminResponse.status)
  
  const json = (await adminResponse.json()) as any
  console.log('Admin response JSON:', JSON.stringify(json, null, 2))

  if (json.errors?.length) {
    console.error('GraphQL errors:', json.errors)
    return data({error: json.errors[0].message}, {status: 400})
  }

  const userErrors = json.data?.metaobjectDelete?.userErrors
  if (userErrors?.length) {
    console.error('User errors:', userErrors)
    return data({error: userErrors[0].message}, {status: 400})
  }

  const deletedId = json.data?.metaobjectDelete?.deletedId
  console.log('Successfully deleted metaobject:', deletedId)

  return data({ok: true})
} 