import {Sheet, SheetTrigger, SheetContent, SheetClose} from '@/components/shadCn/ui/sheet'
import {Button} from '@/components/shadCn/ui/button'
import {Search, X} from 'lucide-react'
import {useId} from 'react'

import {Link} from 'react-router'
import {SearchFormPredictive} from '@/components/shopify/forms/SearchFormPredictive'
import {SearchResultsPredictive} from '@/components/shopify/forms/SearchResultsPredictive'

export const SEARCH_ENDPOINT = '/search'

// Komponent łączący przycisk i panel w jeden Sheet (do użycia w layoucie/headerze)
export function SearchAside() {
  return (
    <Sheet>
      <SearchAsideButton />
      <SearchAsidePanel />
    </Sheet>
  )
}

// Przycisk otwierający panel wyszukiwania
export function SearchAsideButton() {
  return (
    <SheetTrigger asChild>
      <Button variant="ghost" size="icon" aria-label="Search">
        <Search />
      </Button>
    </SheetTrigger>
  )
}

// Panel wyszukiwania (do użycia wewnątrz <Sheet>)
export function SearchAsidePanel() {
  const queriesDatalistId = useId()

  return (
    <SheetContent side="right" className="w-full sm:max-w-md">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Search</h2>
        <SheetClose asChild>
          <Button variant="ghost" size="icon" aria-label="Close search">
            <X />
          </Button>
        </SheetClose>
      </div>

      <div className="predictive-search space-y-4">
        <SearchFormPredictive>
          {({fetchResults, goToSearch, inputRef}) => (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                goToSearch()
              }}
              className="flex items-center gap-2"
            >
              <input
                name="q"
                onChange={fetchResults}
                onFocus={fetchResults}
                placeholder="Search"
                ref={inputRef}
                type="search"
                list={queriesDatalistId}
                className="flex-1 rounded-md border px-3 py-2 text-sm"
              />
              <Button type="submit" size="sm">
                Search
              </Button>
            </form>
          )}
        </SearchFormPredictive>

        <SearchResultsPredictive>
          {({items, total, term, state, closeSearch}) => {
            const {articles, collections, pages, products, queries} = items

            if (state === 'loading' && term.current) {
              return <p className="text-muted-foreground text-sm">Loading...</p>
            }

            if (!total) {
              return <SearchResultsPredictive.Empty term={term} />
            }

            return (
              <div className="space-y-4">
                <SearchResultsPredictive.Queries
                  queries={queries}
                  queriesDatalistId={queriesDatalistId}
                />
                <SearchResultsPredictive.Products
                  products={products}
                  closeSearch={closeSearch}
                  term={term}
                />
                <SearchResultsPredictive.Collections
                  collections={collections}
                  closeSearch={closeSearch}
                  term={term}
                />
                <SearchResultsPredictive.Pages
                  pages={pages}
                  closeSearch={closeSearch}
                  term={term}
                />
                <SearchResultsPredictive.Articles
                  articles={articles}
                  closeSearch={closeSearch}
                  term={term}
                />

                {term.current && total ? (
                  <SheetClose asChild>
                    <Link
                      to={`${SEARCH_ENDPOINT}?q=${term.current}`}
                      className="text-primary inline-block text-sm font-medium hover:underline"
                    >
                      View all results for <q>{term.current}</q> →
                    </Link>
                  </SheetClose>
                ) : null}
              </div>
            )
          }}
        </SearchResultsPredictive>
      </div>
    </SheetContent>
  )
}
