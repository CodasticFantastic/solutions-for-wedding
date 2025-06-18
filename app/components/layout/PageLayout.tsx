import {Await} from 'react-router'
import {Suspense} from 'react'
import type {CartApiQueryFragment, FooterQuery, HeaderQuery} from 'storefrontapi.generated'
import {Aside} from '@/components/shopify/Aside'
import {Footer} from '@/components/shopify/Footer'
import {Header} from '@/components/layout/Header'
import {CartMain} from '@/components/shopify/CartMain'

interface PageLayoutProps {
  cart: Promise<CartApiQueryFragment | null>
  footer: Promise<FooterQuery | null>
  header: HeaderQuery
  isLoggedIn: Promise<boolean>
  publicStoreDomain: string
  children?: React.ReactNode
}

export function PageLayout({
  cart,
  children = null,
  footer,
  header,
  isLoggedIn,
  publicStoreDomain,
}: PageLayoutProps) {
  return (
    <Aside.Provider>
      <CartAside cart={cart} />

      <Header
        header={header}
        cart={cart}
        isLoggedIn={isLoggedIn}
        publicStoreDomain={publicStoreDomain}
      />

      <main>{children}</main>
      <Footer footer={footer} header={header} publicStoreDomain={publicStoreDomain} />
    </Aside.Provider>
  )
}

function CartAside({cart}: {cart: PageLayoutProps['cart']}) {
  return (
    <Aside type="cart" heading="CART">
      <Suspense fallback={<p>Loading cart ...</p>}>
        <Await resolve={cart}>
          {(cart) => {
            return <CartMain cart={cart} layout="aside" />
          }}
        </Await>
      </Suspense>
    </Aside>
  )
}
