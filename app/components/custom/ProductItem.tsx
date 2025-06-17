import {Image, Money} from '@shopify/hydrogen';
import {Link} from 'react-router';
import type {
  ProductItemFragment,
  CollectionItemFragment,
  RecommendedProductFragment,
} from 'storefrontapi.generated';
import {useVariantUrl} from '~/lib/variants';

export function ProductItem({
  product,
  loading = 'lazy',
}: {
  product:
    | CollectionItemFragment
    | ProductItemFragment
    | RecommendedProductFragment;
  loading?: 'eager' | 'lazy';
}) {
  const variantUrl = useVariantUrl(product.handle);
  const image = product.featuredImage;

  return (
    <Link
      to={variantUrl}
      prefetch="intent"
      className="group block w-full overflow-hidden rounded-[var(--border-radius-base)] border border-[var(--border-color)] bg-bg-secondary shadow-sm transition hover:shadow-md decoration-none"
    >
      {image && (
        <div className="aspect-[1/1] w-full overflow-hidden bg-bg-secondary">
          <Image
            data={image}
            alt={image.altText || product.title}
            loading={loading}
            sizes="(min-width: 45em) 400px, 100vw"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}
      <div className="px-[var(--spacing-md)] py-[var(--spacing-sm)]">
        <h4 className="text-base font-medium text-[var(--color-foreground)] group-hover:text-[var(--color-primary)] transition">
          {product.title}
        </h4>
        <Money
          data={product.priceRange.minVariantPrice}
          className="mt-1 text-sm text-[var(--color-muted)]"
        />
      </div>
    </Link>
  );
}
