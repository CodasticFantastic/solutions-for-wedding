import {Image, Money} from '@shopify/hydrogen'
import {Link} from 'react-router'
import type {ProductItemFragment, CollectionItemFragment} from 'storefrontapi.generated'
import {useVariantUrl} from '@/lib/variants'
import {Card, CardContent} from '../tailwind/ui/card'
import {AspectRatio} from '../tailwind/ui/aspect-ratio'

export function ProductItem({
  product,
  loading = 'lazy',
}: {
  product: CollectionItemFragment | ProductItemFragment
  loading?: 'eager' | 'lazy'
}) {
  const variantUrl = useVariantUrl(product.handle)
  const image = product.featuredImage

  return (
    <Link to={variantUrl} prefetch="intent" className="group decoration-none block">
      <Card className="gap-0 overflow-hidden py-0 transition-shadow hover:shadow-md">
        {image && (
          <AspectRatio ratio={1 / 1}>
            <Image
              data={image}
              alt={image.altText || product.title}
              loading={loading}
              sizes="(min-width: 45em) 400px, 100vw"
              className="h-full w-full object-cover transition-transform duration-300 hover:scale-103"
            />
          </AspectRatio>
        )}
        <CardContent className="px-3 py-2">
          <p className="group-hover:text-primary text-base font-medium transition-colors">
            {product.title}
          </p>
          <Money
            data={product.priceRange.minVariantPrice}
            className="text-muted-foreground mt-1 text-sm"
          />
        </CardContent>
      </Card>
    </Link>
  )
}
