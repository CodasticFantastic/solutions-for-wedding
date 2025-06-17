import {Image, Money} from '@shopify/hydrogen'
import {Link} from 'react-router'
import type {ProductItemFragment, CollectionItemFragment} from 'storefrontapi.generated'
import {useVariantUrl} from '@/lib/variants'

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
    <Link
      to={variantUrl}
      prefetch="intent"
      className="group bg-bg-primary decoration-none block w-full overflow-hidden rounded-md border border-[var(--border-color)] shadow-sm transition hover:shadow-md"
    >
      {image && (
        <div className="bg-bg-secondary aspect-[1/1] w-full overflow-hidden">
          <Image
            data={image}
            alt={image.altText || product.title}
            loading={loading}
            sizes="(min-width: 45em) 400px, 100vw"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}
      <div className="px-3 py-2">
        <h4 className="group-hover:text-primary text-foreground text-base font-medium transition">
          {product.title}
        </h4>
        <Money data={product.priceRange.minVariantPrice} className="text-muted] mt-1 text-sm" />
      </div>
    </Link>
  )
}
