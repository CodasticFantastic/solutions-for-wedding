import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetClose,
  SheetTitle,
} from '@/components/shadCn/ui/sheet'
import {Button} from '@/components/shadCn/ui/button'
import {ShoppingBasket, X} from 'lucide-react'
import {Suspense} from 'react'
import {Await} from 'react-router'
import {CartMain} from '@/components/shopify/cart/CartMain'
import type {CartApiQueryFragment} from 'storefrontapi.generated'
import {useAnalytics} from '@shopify/hydrogen'

// Main component (Open aside panel Button + Panel)
export function CartAside({cart}: {cart: Promise<CartApiQueryFragment | null>}) {
  return (
    <Sheet>
      <CartAsideTrigger cart={cart} />
      <CartAsidePanel cart={cart} />
    </Sheet>
  )
}

// Przycisk otwierający panel koszyka (do użycia wewnątrz <Sheet>)
function CartAsideTrigger({cart}: {cart: Promise<CartApiQueryFragment | null>}) {
  return (
    <Suspense fallback={<CartBadge count={null} cart={null} />}>
      <Await resolve={cart}>
        {(cart) => <CartBadge count={cart?.totalQuantity ?? 0} cart={cart} />}
      </Await>
    </Suspense>
  )
}

function CartBadge({count, cart}: {count: number | null; cart: CartApiQueryFragment | null}) {
  const {publish, shop, prevCart} = useAnalytics()

  return (
    <SheetTrigger asChild>
      <Button
        className="relative"
        variant="ghost"
        size="icon"
        aria-label="Cart"
        onClick={() => {
          publish('custom_cart_viewed', {
            cart,
            prevCart,
            shop,
            url: window.location.href || '',
          })
        }}
      >
        <ShoppingBasket className="text-foreground size-5" />
        <span className="bg-foreground text-background absolute top-[-1px] right-[-1px] flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold">
          {count === null ? '\u00A0' : count}
        </span>
      </Button>
    </SheetTrigger>
  )
}

// Panel koszyka (do użycia wewnątrz <Sheet>)
function CartAsidePanel({cart}: {cart: Promise<CartApiQueryFragment | null>}) {
  return (
    <SheetContent side="right" className="sheet-content" aria-describedby="cart-aside-desc">
      <div className="sheet-content-container">
        {/* Aside Header */}
        <div className="sheet-content-header">
          <SheetTitle className="sheet-content-header-title">Twój koszyk</SheetTitle>
          <SheetClose asChild>
            <Button variant="ghost" size="icon" aria-label="Zamknij koszyk">
              <X className="sheet-content-header-close" />
            </Button>
          </SheetClose>
        </div>
        {/* Aside Content */}
        <div className="sheet-content-content">
          <p id="cart-aside-desc" className="sr-only">
            Tutaj znajdziesz produkty dodane do koszyka. Możesz je edytować lub przejść do
            finalizacji zamówienia.
          </p>
          <div className="sheet-content-content-scrollable">
            <Suspense fallback={<p>Ładowanie koszyka...</p>}>
              <Await resolve={cart}>{(cart) => <CartMain cart={cart} layout="aside" />}</Await>
            </Suspense>
          </div>
        </div>
      </div>
    </SheetContent>
  )
}
