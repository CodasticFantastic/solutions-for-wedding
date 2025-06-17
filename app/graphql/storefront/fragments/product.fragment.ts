import {IMAGE_FRAGMENT} from './image.fragment';
import {MONEY_FRAGMENT} from './money.fragment';

export const PRODUCT_FRAGMENT = `
  ${MONEY_FRAGMENT}
  ${IMAGE_FRAGMENT}

  fragment ProductFragment on Product {
    id
    title
    handle
    featuredImage {
      ...ImageFragment
    }
    priceRange {
      minVariantPrice {
        ...MoneyFragment
      }
    }
  }
` as const;
