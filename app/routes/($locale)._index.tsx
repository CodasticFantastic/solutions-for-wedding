import {type LoaderFunctionArgs} from '@shopify/remix-oxygen'
import {Link, useLoaderData, type MetaFunction} from 'react-router'
import {getPaginationVariables, Image} from '@shopify/hydrogen'

import {ProductList} from '@/components/custom/ProductList'
import {ALL_PRODUCTS_QUERY} from '@/graphql/storefront/queries/allProducts.query'
import {MoveRight} from 'lucide-react'

export const meta: MetaFunction = () => {
  return [{title: 'Home | Solutions for wedding'}]
}

export async function loader(args: LoaderFunctionArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args)

  // Await the critical data required to render initial state of the page
  // const criticalData = await loadCriticalData(args);

  return {...deferredData}
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
// async function loadCriticalData({context}: LoaderFunctionArgs) {
//   const [{collections}] = await Promise.all([
//     context.storefront.query(FEATURED_COLLECTION_QUERY),
//     // Add other queries here, so that they are loaded in parallel
//   ]);

//   return {
//     featuredCollection: collections.nodes[0],
//   };
// }

function loadDeferredData({context, request}: LoaderFunctionArgs) {
  const paginationVariables = getPaginationVariables(request, {
    pageBy: 6,
  })

  const recommendedProducts = context.storefront
    .query(ALL_PRODUCTS_QUERY, {variables: paginationVariables})
    .catch((error) => {
      console.error('[ALL_PRODUCTS_QUERY]', error)
      return null
    })

  return {
    recommendedProducts,
  }
}

export default function Homepage() {
  const data = useLoaderData<typeof loader>()
  return (
    <main className="bg-bg-primary min-h-screen">
      <div className="mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <h1 className="text-center">Witaj w sklepie z panelami akrylowymi</h1>
        <p className="mx-auto mt-4 text-center text-gray-600">
          Zaprojektuj swój własny panel lub wybierz gotowy szablon.
        </p>
      </div>

      <section className="customPageContainer">
        <div className="items-center justify-between sm:flex">
          <h2 className="mb-3 text-center sm:text-left">Najpopularniejsze produkty</h2>
          <Link
            to="/collections"
            className="mb-6 flex items-center justify-center gap-2 font-semibold sm:mb-0 sm:justify-end"
          >
            Wszystkie produkty <MoveRight />
          </Link>
        </div>
        <ProductList products={data.recommendedProducts} />
      </section>
    </main>
  )
}
