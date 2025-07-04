import {redirect, type LoaderFunctionArgs} from '@shopify/remix-oxygen'
import {useLoaderData, type MetaFunction} from 'react-router'
import {
  getSelectedProductOptions,
  Analytics,
  useOptimisticVariant,
  getProductOptions,
  getAdjacentAndFirstAvailableVariants,
  useSelectedOptionInUrlParam,
} from '@shopify/hydrogen'
import {ProductPrice} from '@/components/shopify/ProductPrice'
import {ProductImage} from '@/components/shopify/ProductImage'
import {ProductForm} from '@/components/shopify/ProductForm'
import {redirectIfHandleIsLocalized} from '@/lib/shopify/redirect'
import {Card, CardContent, CardHeader, CardTitle} from '@/components/shadCn/ui/card'
import {Badge} from '@/components/shadCn/ui/badge'
import {Separator} from '@/components/shadCn/ui/separator'
import {Button} from '@/components/shadCn/ui/button'
import {AspectRatio} from '@/components/shadCn/ui/aspect-ratio'
import {ShoppingCart, Heart, Share2, Star} from 'lucide-react'

export const meta: MetaFunction<typeof loader> = ({data}) => {
  return [
    {title: `Solutions for Wedding | ${data?.product.title ?? ''}`},
    {
      rel: 'canonical',
      href: `/products/${data?.product.handle}`,
    },
  ]
}

export async function loader(args: LoaderFunctionArgs) {
  // Start fetching non-critical data without blocking time to first byte
  const deferredData = loadDeferredData(args)

  // Await the critical data required to render initial state of the page
  const criticalData = await loadCriticalData(args)

  return {...deferredData, ...criticalData}
}

/**
 * Load data necessary for rendering content above the fold. This is the critical data
 * needed to render the page. If it's unavailable, the whole page should 400 or 500 error.
 */
async function loadCriticalData({context, params, request}: LoaderFunctionArgs) {
  const {handle} = params
  const {storefront} = context

  if (!handle) {
    throw new Error('Expected product handle to be defined')
  }

  const [{product}] = await Promise.all([
    storefront.query(PRODUCT_QUERY, {
      variables: {handle, selectedOptions: getSelectedProductOptions(request)},
    }),
    // Add other queries here, so that they are loaded in parallel
  ])

  if (!product?.id) {
    throw new Response(null, {status: 404})
  }

  // The API handle might be localized, so redirect to the localized handle
  redirectIfHandleIsLocalized(request, {handle, data: product})

  return {
    product,
  }
}

/**
 * Load data for rendering content below the fold. This data is deferred and will be
 * fetched after the initial page load. If it's unavailable, the page should still 200.
 * Make sure to not throw any errors here, as it will cause the page to 500.
 */
function loadDeferredData({context, params}: LoaderFunctionArgs) {
  // Put any API calls that is not critical to be available on first page render
  // For example: product reviews, product recommendations, social feeds.

  return {}
}

export default function Product() {
  const {product} = useLoaderData<typeof loader>()

  // Optimistically selects a variant with given available variant information
  const selectedVariant = useOptimisticVariant(product.selectedOrFirstAvailableVariant, getAdjacentAndFirstAvailableVariants(product))

  // Sets the search param to the selected variant without navigation
  // only when no search params are set in the url
  useSelectedOptionInUrlParam(selectedVariant.selectedOptions)

  // Get the product options array
  const productOptions = getProductOptions({
    ...product,
    selectedOrFirstAvailableVariant: selectedVariant,
  })

  const {title, descriptionHtml, vendor} = product

  return (
    <div className="bg-background min-h-screen">
      <div className="customPageContainer py-8">
        {/* Breadcrumb */}
        <nav className="text-muted-foreground mb-6 flex items-center space-x-2 text-sm">
          <a href="/" className="hover:text-foreground">
            Strona główna
          </a>
          <span>/</span>
          <a href="/collections" className="hover:text-foreground">
            Produkty
          </a>
          <span>/</span>
          <span className="text-foreground">{title}</span>
        </nav>

        {/* Main Product Layout */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Product Images */}
          <div className="space-y-4">
            <Card className="overflow-hidden border-0 shadow-none">
              <CardContent className="p-0">
                <AspectRatio ratio={1} className="bg-muted">
                  <ProductImage image={selectedVariant?.image} />
                </AspectRatio>
              </CardContent>
            </Card>

            {/* Thumbnail Gallery - można dodać później */}
            <div className="flex gap-2">
              <div className="border-primary bg-muted h-20 w-20 rounded-md border-2"></div>
              <div className="bg-muted h-20 w-20 rounded-md border"></div>
              <div className="bg-muted h-20 w-20 rounded-md border"></div>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Product Header */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {vendor && (
                  <Badge variant="secondary" className="text-xs">
                    {vendor}
                  </Badge>
                )}
                {selectedVariant?.compareAtPrice && (
                  <Badge variant="destructive" className="text-xs">
                    Promocja
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl font-bold tracking-tight lg:text-4xl">{title}</h1>

              {/* Rating - można dodać później */}
              <div className="flex items-center gap-1">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <span className="text-muted-foreground text-sm">(4.8 - 127 opinii)</span>
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <div className="text-2xl font-bold">
                <ProductPrice price={selectedVariant?.price} compareAtPrice={selectedVariant?.compareAtPrice} />
              </div>
              <p className="text-muted-foreground text-sm">
                Dostępność: {selectedVariant?.availableForSale ? 'W magazynie' : 'Niedostępny'}
              </p>
            </div>

            <Separator />

            {/* Product Form */}
            <div className="space-y-4">
              <ProductForm productOptions={productOptions} selectedVariant={selectedVariant} />

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button size="lg" className="flex-1">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Dodaj do koszyka
                </Button>
                <Button variant="outline" size="lg">
                  <Heart className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="lg">
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator />

            {/* Product Description */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Opis produktu</h3>
              <div className="prose prose-sm text-muted-foreground max-w-none" dangerouslySetInnerHTML={{__html: descriptionHtml}} />
            </div>

            {/* Product Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Szczegóły produktu</h3>
              <div className="grid gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">SKU:</span>
                  <span>{selectedVariant?.sku || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Wariant:</span>
                  <span>{selectedVariant?.title || 'Standardowy'}</span>
                </div>
                {vendor && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Producent:</span>
                    <span>{vendor}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section - można dodać później */}
        <div className="mt-16">
          <h2 className="mb-8 text-2xl font-bold">Podobne produkty</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {/* Placeholder dla podobnych produktów */}
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardContent className="p-0">
                  <AspectRatio ratio={1} className="bg-muted">
                    <div className="text-muted-foreground flex h-full w-full items-center justify-center">Zdjęcie produktu</div>
                  </AspectRatio>
                </CardContent>
                <CardHeader className="p-4">
                  <CardTitle className="text-sm">Produkt {i + 1}</CardTitle>
                  <p className="text-muted-foreground text-sm">Cena produktu</p>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </div>

      <Analytics.ProductView
        data={{
          products: [
            {
              id: product.id,
              title: product.title,
              price: selectedVariant?.price.amount || '0',
              vendor: product.vendor,
              variantId: selectedVariant?.id || '',
              variantTitle: selectedVariant?.title || '',
              quantity: 1,
            },
          ],
        }}
      />
    </div>
  )
}

const PRODUCT_VARIANT_FRAGMENT = `#graphql
  fragment ProductVariant on ProductVariant {
    availableForSale
    compareAtPrice {
      amount
      currencyCode
    }
    id
    image {
      __typename
      id
      url
      altText
      width
      height
    }
    price {
      amount
      currencyCode
    }
    product {
      title
      handle
    }
    selectedOptions {
      name
      value
    }
    sku
    title
    unitPrice {
      amount
      currencyCode
    }
  }
` as const

const PRODUCT_FRAGMENT = `#graphql
  fragment Product on Product {
    id
    title
    vendor
    handle
    descriptionHtml
    description
    encodedVariantExistence
    encodedVariantAvailability
    options {
      name
      optionValues {
        name
        firstSelectableVariant {
          ...ProductVariant
        }
        swatch {
          color
          image {
            previewImage {
              url
            }
          }
        }
      }
    }
    selectedOrFirstAvailableVariant(selectedOptions: $selectedOptions, ignoreUnknownOptions: true, caseInsensitiveMatch: true) {
      ...ProductVariant
    }
    adjacentVariants (selectedOptions: $selectedOptions) {
      ...ProductVariant
    }
    seo {
      description
      title
    }
  }
  ${PRODUCT_VARIANT_FRAGMENT}
` as const

const PRODUCT_QUERY = `#graphql
  query Product(
    $country: CountryCode
    $handle: String!
    $language: LanguageCode
    $selectedOptions: [SelectedOptionInput!]!
  ) @inContext(country: $country, language: $language) {
    product(handle: $handle) {
      ...Product
    }
  }
  ${PRODUCT_FRAGMENT}
` as const
