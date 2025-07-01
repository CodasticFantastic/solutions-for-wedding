import {type ActionFunctionArgs, data} from '@shopify/remix-oxygen'
import {CUSTOMER_DETAILS_QUERY} from '@/graphql/customer-account/CustomerDetailsQuery'

// Use the newest stable Shopify Admin API version
const API_VERSION = '2025-04'

export async function action({request, context}: ActionFunctionArgs) {
  // Only POST or PUT allowed
  if (request.method !== 'POST' && request.method !== 'PUT') {
    return data({error: 'Method not allowed'}, {status: 405})
  }

  // Check if customer is logged in
  const loggedIn = await context.customerAccount.isLoggedIn()
  if (!loggedIn) {
    return data({error: 'Unauthorized'}, {status: 401})
  }

  // Ensure admin token is set in env
  const env = context.env
  const ADMIN_TOKEN = env.SHOPIFY_ADMIN_API_TOKEN
  if (!ADMIN_TOKEN) {
    return data({error: 'Admin token not configured'}, {status: 500})
  }

  // Parse incoming body
  const body = await request.json()
  const {
    id,
    title,
    design_json: designJson,
  } = body as {
    id?: string
    title: string
    design_json: string | object
  }
  const serializedDesignJson = typeof designJson === 'string' ? designJson : JSON.stringify(designJson)

  // Get customer ID
  const {data: customerData} = await context.customerAccount.query(CUSTOMER_DETAILS_QUERY)
  const customerId = customerData?.customer?.id

  const fields: {key: string; value: string}[] = [
    {key: 'title', value: title},
    {key: 'design_json', value: serializedDesignJson},
    {key: 'customer_id', value: customerId ?? 'unknown'},
  ]

  // Build create variables
  const variablesCreate = {
    metaobject: {
      type: 'tile_design',
      capabilities: {publishable: {status: 'ACTIVE'}},
      fields,
    },
  }

  const variablesUpdate = {
    id,
    metaobject: {
      fields,
      capabilities: {publishable: {status: 'ACTIVE'}},
    },
  }

  const adminEndpoint = `https://${env.PUBLIC_STORE_DOMAIN}/admin/api/${API_VERSION}/graphql.json`

  const adminResponse = await fetch(adminEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': ADMIN_TOKEN,
    },
    body: JSON.stringify({
      query: request.method === 'POST' ? CREATE_MUTATION : UPDATE_MUTATION,
      variables: request.method === 'POST' ? variablesCreate : variablesUpdate,
    }),
  })

  const json = (await adminResponse.json()) as any

  if (json.errors?.length) {
    // Log API errors
    console.error(json.errors)
    return data({error: json.errors[0].message}, {status: 400})
  }

  const userErrors = json.data?.metaobjectCreate?.userErrors || json.data?.metaobjectUpdate?.userErrors
  if (userErrors?.length) {
    return data({error: userErrors[0].message}, {status: 400})
  }

  const meta = json.data?.metaobjectCreate?.metaobject || json.data?.metaobjectUpdate?.metaobject
  return {id: meta?.id, handle: meta?.handle}
}

const CREATE_MUTATION = /* ADMIN_GQL */ `
mutation MetaobjectCreate($metaobject: MetaobjectCreateInput!) {
  metaobjectCreate(metaobject: $metaobject) {
    metaobject {
      id
      handle
    }
    userErrors {
      field
      message
    }
  }
}
`

const UPDATE_MUTATION = /* ADMIN_GQL */ `
mutation MetaobjectUpdate($id: ID!, $metaobject: MetaobjectUpdateInput!) {
  metaobjectUpdate(id: $id, metaobject: $metaobject) {
    metaobject {
      id
      handle
    }
    userErrors {
      field
      message
    }
  }
}
`
