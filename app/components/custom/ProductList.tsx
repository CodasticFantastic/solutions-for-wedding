import {Suspense} from 'react'
import {ProductItem} from './ProductItem'
import type {ProductItemFragment} from 'storefrontapi.generated'
import {Await} from 'react-router'
import {PaginatedResourceSection} from '../core/PaginatedResourceSection'

interface ProductListProps {
  products: Promise<{
    products: {
      nodes: ProductItemFragment[]
      pageInfo: {
        hasNextPage: boolean
        hasPreviousPage: boolean
        startCursor: string | null
        endCursor: string | null
      }
    }
  } | null>
}

export function ProductList({products}: ProductListProps) {
  return (
    <Suspense fallback={<p className="text-muted">Wczytywanie produktów...</p>}>
      <Await resolve={products}>
        {(response) =>
          response?.products?.nodes?.length ? (
            <PaginatedResourceSection
              connection={response.products}
              resourcesClassName="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            >
              {({node}) => <ProductItem product={node} key={node.id} />}
            </PaginatedResourceSection>
          ) : (
            <p className="text-muted">Brak produktów do wyświetlenia.</p>
          )
        }
      </Await>
    </Suspense>
  )
}
