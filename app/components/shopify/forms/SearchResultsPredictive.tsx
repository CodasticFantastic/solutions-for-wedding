import {Link, useFetcher, type Fetcher} from 'react-router'
import {Image, Money} from '@shopify/hydrogen'
import React, {useRef, useEffect} from 'react'
import {
  getEmptyPredictiveSearchResult,
  urlWithTrackingParams,
  type PredictiveSearchReturn,
} from '@/lib/shopify/search'

type PredictiveSearchItems = PredictiveSearchReturn['result']['items']

type UsePredictiveSearchReturn = {
  term: React.MutableRefObject<string>
  total: number
  inputRef: React.MutableRefObject<HTMLInputElement | null>
  items: PredictiveSearchItems
  fetcher: Fetcher<PredictiveSearchReturn>
}

type SearchResultsPredictiveArgs = Pick<
  UsePredictiveSearchReturn,
  'term' | 'total' | 'inputRef' | 'items'
> & {
  state: Fetcher['state']
  closeSearch: () => void
}

type PartialPredictiveSearchResult<
  ItemType extends keyof PredictiveSearchItems,
  ExtraProps extends keyof SearchResultsPredictiveArgs = 'term' | 'closeSearch',
> = Pick<PredictiveSearchItems, ItemType> & Pick<SearchResultsPredictiveArgs, ExtraProps>

type SearchResultsPredictiveProps = {
  children: (args: SearchResultsPredictiveArgs) => React.ReactNode
}

/**
 * Component that renders predictive search results
 */
export function SearchResultsPredictive({children}: SearchResultsPredictiveProps) {
  const {term, inputRef, fetcher, total, items} = usePredictiveSearch()

  /*
   * Utility that resets the search input
   */
  function resetInput() {
    if (inputRef.current) {
      inputRef.current.blur()
      inputRef.current.value = ''
    }
  }

  /**
   * Utility that resets the search input and closes the search aside
   */
  function closeSearch() {
    resetInput()
  }

  return children({
    items,
    closeSearch,
    inputRef,
    state: fetcher.state,
    term,
    total,
  })
}

SearchResultsPredictive.Articles = SearchResultsPredictiveArticles
SearchResultsPredictive.Collections = SearchResultsPredictiveCollections
SearchResultsPredictive.Pages = SearchResultsPredictivePages
SearchResultsPredictive.Products = SearchResultsPredictiveProducts
SearchResultsPredictive.Queries = SearchResultsPredictiveQueries

function SearchResultsPredictiveArticles({
  term,
  articles,
  closeSearch,
}: PartialPredictiveSearchResult<'articles'>) {
  if (!articles.length) return null

  return (
    <div className="predictive-search-result" key="articles">
      <h5 className="predictive-result-header">Artykuły</h5>
      <ul>
        {articles.map((article) => {
          const articleUrl = urlWithTrackingParams({
            baseUrl: `/blogs/${article.blog.handle}/${article.handle}`,
            trackingParams: article.trackingParameters,
            term: term.current ?? '',
          })

          return (
            <li className="predictive-search-result-item" key={article.id}>
              <Link onClick={closeSearch} to={articleUrl}>
                {article.image?.url && (
                  <Image
                    alt={article.image.altText ?? ''}
                    src={article.image.url}
                    width={50}
                    height={50}
                  />
                )}
                <div>
                  <span>{article.title}</span>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function SearchResultsPredictiveCollections({
  term,
  collections,
  closeSearch,
}: PartialPredictiveSearchResult<'collections'>) {
  if (!collections.length) return null

  return (
    <div className="predictive-search-result" key="collections">
      <h5 className="predictive-result-header">Kategorie</h5>
      <ul>
        {collections.map((collection) => {
          const collectionUrl = urlWithTrackingParams({
            baseUrl: `/collections/${collection.handle}`,
            trackingParams: collection.trackingParameters,
            term: term.current,
          })

          return (
            <li className="predictive-search-result-item" key={collection.id}>
              <Link onClick={closeSearch} to={collectionUrl}>
                {collection.image?.url && (
                  <Image
                    alt={collection.image.altText ?? ''}
                    src={collection.image.url}
                    width={50}
                    height={50}
                  />
                )}
                <div>
                  <span>{collection.title}</span>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function SearchResultsPredictivePages({
  term,
  pages,
  closeSearch,
}: PartialPredictiveSearchResult<'pages'>) {
  if (!pages.length) return null

  return (
    <div className="predictive-search-result" key="pages">
      <h5 className="predictive-result-header">Podstrony</h5>
      <ul>
        {pages.map((page) => {
          const pageUrl = urlWithTrackingParams({
            baseUrl: `/pages/${page.handle}`,
            trackingParams: page.trackingParameters,
            term: term.current,
          })

          return (
            <li className="predictive-search-result-item" key={page.id}>
              <Link onClick={closeSearch} to={pageUrl}>
                <div>
                  <span>{page.title}</span>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function SearchResultsPredictiveProducts({
  term,
  products,
  closeSearch,
}: PartialPredictiveSearchResult<'products'>) {
  if (!products.length) return null

  return (
    <div className="predictive-search-result" key="products">
      <p className="predictive-result-header">Produkty</p>
      <ul>
        {products.map((product) => {
          const productUrl = urlWithTrackingParams({
            baseUrl: `/products/${product.handle}`,
            trackingParams: product.trackingParameters,
            term: term.current,
          })

          const price = product?.selectedOrFirstAvailableVariant?.price
          const image = product?.selectedOrFirstAvailableVariant?.image
          return (
            <li className="predictive-search-result-item" key={product.id}>
              <Link to={productUrl} onClick={closeSearch}>
                {image && (
                  <Image alt={image.altText ?? ''} src={image.url} width={50} height={50} />
                )}
                <div>
                  <p>{product.title}</p>
                  <small>{price && <Money data={price} />}</small>
                </div>
              </Link>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function SearchResultsPredictiveQueries({
  queries,
  queriesDatalistId,
}: PartialPredictiveSearchResult<'queries', never> & {
  queriesDatalistId: string
}) {
  if (!queries.length) return null

  return (
    <datalist id={queriesDatalistId}>
      {queries.map((suggestion) => {
        if (!suggestion) return null

        return <option key={suggestion.text} value={suggestion.text} />
      })}
    </datalist>
  )
}

/**
 * Hook that returns the predictive search results and fetcher and input ref.
 * @example
 * '''ts
 * const { items, total, inputRef, term, fetcher } = usePredictiveSearch();
 * '''
 **/
function usePredictiveSearch(): UsePredictiveSearchReturn {
  const fetcher = useFetcher<PredictiveSearchReturn>({key: 'search'})
  const term = useRef<string>('')
  const inputRef = useRef<HTMLInputElement | null>(null)

  if (fetcher?.state === 'loading') {
    term.current = String(fetcher.formData?.get('q') || '')
  }

  // capture the search input element as a ref
  useEffect(() => {
    if (!inputRef.current) {
      inputRef.current = document.querySelector('input[type="search"]')
    }
  }, [])

  const {items, total} = fetcher?.data?.result ?? getEmptyPredictiveSearchResult()

  return {items, total, inputRef, term, fetcher}
}
