import {Sheet, SheetTrigger, SheetContent, SheetClose} from '@/components/shadCn/ui/sheet'
import {Button} from '@/components/shadCn/ui/button'
import {Frown, Loader2, MoveRight, Search, SearchIcon, X} from 'lucide-react'
import {useId} from 'react'

import {Link} from 'react-router'
import {SearchFormPredictive} from '@/components/shopify/forms/SearchFormPredictive'
import {SearchResultsPredictive} from '@/components/shopify/forms/SearchResultsPredictive'
import {Input} from '@/components/shadCn/ui/input'

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
        <Search className="size-5" />
      </Button>
    </SheetTrigger>
  )
}

// Panel wyszukiwania (do użycia wewnątrz <Sheet>)
export function SearchAsidePanel() {
  const queriesDatalistId = useId()

  return (
    <SheetContent side="right" className="h-screen max-h-screen w-full px-4 py-2 sm:max-w-sm">
      <div className="flex h-full flex-col">
        {/* Aside Header */}
        <div className="border-border mb-3 flex shrink-0 items-center justify-between border-b-1 pb-1">
          <h2 className="mb-2 text-xl font-semibold">Wyszukaj</h2>
          <SheetClose asChild>
            <Button variant="ghost" size="icon" aria-label="Zamknij wyszukiwanie">
              <X className="size-5" />
            </Button>
          </SheetClose>
        </div>

        {/* Aside Content */}
        <div className="flex min-h-0 flex-1 flex-col">
          <SearchFormPredictive>
            {({fetchResults, inputRef}) => (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                }}
                className="mb-4 flex items-center"
              >
                <Input
                  name="q"
                  onChange={fetchResults}
                  placeholder="Wyszukaj interesującą Cię frazę..."
                  ref={inputRef}
                  type="search"
                  list={queriesDatalistId}
                  className="placeholder:text-muted-foreground no-datalist-arrow flex-1"
                />
              </form>
            )}
          </SearchFormPredictive>

          <div className="flex-1 overflow-y-auto">
            <SearchResultsPredictive>
              {({items, total, term, state, closeSearch}) => {
                const {articles, collections, pages, products, queries} = items

                // If no term is entered, show a message to start typing
                if (!term.current) {
                  return (
                    <div className="flex h-full items-center justify-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <SearchIcon className="text-muted-foreground size-10" />
                        <p className="text-muted-foreground text-center text-sm">
                          Zacznij pisać, aby pokazać wyniki wyszukiwania
                        </p>
                      </div>
                    </div>
                  )
                }

                // If the search is loading, show a loading message
                if (state === 'loading' && term.current) {
                  return (
                    <div className="flex h-full items-center justify-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Loader2 className="text-muted-foreground mr-2 size-10 animate-spin" />
                        <p className="text-muted-foreground text-center text-sm">Wyszukiwanie...</p>
                      </div>
                    </div>
                  )
                }

                // If the search is not loading and no results are found, show a message
                if (!total) {
                  return (
                    <div className="flex h-full items-center justify-center">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Frown className="text-muted-foreground mr-2 size-10" />
                        <p className="text-muted-foreground text-center text-sm">
                          Nie udało się znaleźć wyników dla frazy: <q>{term.current}</q>
                        </p>
                      </div>
                    </div>
                  )
                }

                return (
                  <div className="space-y-4 pb-8">
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
                          className="text-primary inline-block w-full text-sm font-medium hover:underline"
                        >
                          <Button variant="outline-primary" className="w-full">
                            Pokaż wszystkie wyniki dla <q>{term.current}</q> <MoveRight />
                          </Button>
                        </Link>
                      </SheetClose>
                    ) : null}
                  </div>
                )
              }}
            </SearchResultsPredictive>
          </div>
        </div>
      </div>
    </SheetContent>
  )
}
