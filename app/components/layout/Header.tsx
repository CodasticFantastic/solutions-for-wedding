import {Suspense} from 'react'
import {Await, NavLink, useAsyncValue} from 'react-router'
import {type CartViewPayload, useAnalytics, useOptimisticCart} from '@shopify/hydrogen'
import type {HeaderQuery, CartApiQueryFragment} from 'storefrontapi.generated'
import {useAside} from '@/components/shopify/Aside'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '../shadCn/ui/navigation-menu'
import {Sheet, SheetClose, SheetContent, SheetTrigger} from '../shadCn/ui/sheet'
import {Button} from '../shadCn/ui/button'
import {ChevronDown, Menu, Search, ShoppingBasket, User, X} from 'lucide-react'
import {Collapsible, CollapsibleContent, CollapsibleTrigger} from '../shadCn/ui/collapsible'
import {SearchAside} from './asides/SearchAside'
import {CartAside} from './asides/CartAside'

interface HeaderProps {
  header: HeaderQuery
  cart: Promise<CartApiQueryFragment | null>
  isLoggedIn: Promise<boolean>
  publicStoreDomain: string
}

export function Header({header, isLoggedIn, cart, publicStoreDomain}: HeaderProps) {
  const {shop, menu} = header

  return (
    <header className="bg-background sticky top-0 z-50 shadow-md">
      <div className="customPageContainer flex h-16 items-center justify-between">
        {/* LOGO */}
        <NavLink to="/" prefetch="intent">
          <span className="text-xl font-bold">{shop.name}</span>
        </NavLink>

        {/* DESKTOP MENU */}
        <nav className="hidden items-center gap-4 md:flex">
          <DesktopHeader header={header} publicStoreDomain={publicStoreDomain} />
        </nav>

        {/* CTA shared */}
        <div className="flex items-center gap-4">
          {/* Search Aside */}
          <SearchAside />

          {/* Cart Aside */}
          <CartAside cart={cart} />

          {/* Go to Account */}
          <NavLink to="/account" prefetch="intent" className="text-foreground hidden md:block">
            <Button variant="ghost" size="icon" aria-label="Search">
              <User size={20} className="size-5" />
            </Button>
          </NavLink>

          {/* Mobile Nav */}
          <div className="md:hidden">
            <MobileHeader header={header} publicStoreDomain={publicStoreDomain} />
          </div>
        </div>
      </div>
    </header>
  )
}

export function DesktopHeader({
  header,
  publicStoreDomain,
}: {
  header: HeaderQuery
  publicStoreDomain: string
}) {
  const navItems = header.menu?.items ?? FALLBACK_HEADER_MENU.items

  return (
    <NavigationMenu viewport={false}>
      <NavigationMenuList>
        {navItems.map((item) => {
          const url = resolveShopifyUrl(
            item.url ?? '',
            publicStoreDomain,
            header.shop.primaryDomain.url,
          )
          const hasChildren = item.items.length > 0

          return (
            <NavigationMenuItem key={item.id} className="relative">
              {hasChildren ? (
                <>
                  <NavigationMenuTrigger className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm font-medium after:hidden hover:bg-transparent">
                    {item.title}
                  </NavigationMenuTrigger>
                  <NavigationMenuContent className="!bg-popover ring-border z-50 !mt-5 rounded-md p-2 shadow-lg ring-1">
                    <p className="font-bold">Wyszukaj swoją kategorię</p>
                    <ul className="flex w-52 list-none flex-col gap-1 py-3 pl-0">
                      {item.items.map((sub) => {
                        const subUrl = resolveShopifyUrl(
                          sub.url ?? '',
                          publicStoreDomain,
                          header.shop.primaryDomain.url,
                        )
                        return (
                          <li key={sub.id}>
                            <NavLink to={subUrl} className="text-muted-foreground">
                              {sub.title}
                            </NavLink>
                          </li>
                        )
                      })}
                    </ul>
                  </NavigationMenuContent>
                </>
              ) : (
                <NavLink
                  to={url}
                  className="text-muted-foreground hover:text-foreground rounded-md px-3 py-2 text-sm font-medium transition-colors"
                >
                  {item.title}
                </NavLink>
              )}
            </NavigationMenuItem>
          )
        })}
      </NavigationMenuList>
    </NavigationMenu>
  )
}

export function MobileHeader({
  header,
  publicStoreDomain,
}: {
  header: HeaderQuery
  publicStoreDomain: string
}) {
  const navItems = header.menu?.items ?? FALLBACK_HEADER_MENU.items

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="sheet-content max-w-[75vw]">
        <div className="sheet-content-container">
          {/* Menu Aside Header */}
          <div className="sheet-content-header">
            <p className="sheet-content-header-title">Menu</p>
            <SheetClose asChild>
              <Button variant="ghost" size="icon" aria-label="Zamknij menu">
                <X className="sheet-content-header-close" />
              </Button>
            </SheetClose>
          </div>
          {/* Menu Aside Content */}

          <div className="sheet-content-content">
            <div className="sheet-content-content-scrollable flex flex-col gap-3">
              {/* Menu Links */}
              {navItems.map((item) => {
                const url = resolveShopifyUrl(
                  item.url ?? '',
                  publicStoreDomain,
                  header.shop.primaryDomain.url,
                )
                const hasChildren = item.items.length > 0
                return hasChildren ? (
                  <Collapsible key={item.id}>
                    <CollapsibleTrigger className="flex w-full items-center justify-between text-left text-base font-medium">
                      {item.title} <ChevronDown className="h-4 w-4" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="mt-2 ml-2 flex flex-col gap-2">
                      {item.items.map((sub) => (
                        <SheetClose asChild key={sub.id}>
                          <NavLink
                            to={resolveShopifyUrl(
                              sub.url ?? '',
                              publicStoreDomain,
                              header.shop.primaryDomain.url,
                            )}
                            className="text-muted-foreground hover:text-foreground text-sm"
                          >
                            {sub.title}
                          </NavLink>
                        </SheetClose>
                      ))}
                    </CollapsibleContent>
                  </Collapsible>
                ) : (
                  <SheetClose asChild key={item.id}>
                    <NavLink to={url} className="text-foreground inline text-base font-medium">
                      {item.title}
                    </NavLink>
                  </SheetClose>
                )
              })}
            </div>
          </div>
          <div className="mt-auto mb-0">
            <NavLink to="/account" prefetch="intent" className="text-foreground w-full">
              <Button variant="outline-primary" size="sm" aria-label="Search" className="w-full">
                <User size={20} className="size-5" /> Konto użytkownika
              </Button>
            </NavLink>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

function resolveShopifyUrl(
  rawUrl: string,
  publicStoreDomain: string,
  primaryDomain: string,
): string {
  return rawUrl.includes('myshopify.com') ||
    rawUrl.includes(publicStoreDomain) ||
    rawUrl.includes(primaryDomain)
    ? new URL(rawUrl).pathname
    : rawUrl
}

const FALLBACK_HEADER_MENU = {
  id: 'gid://shopify/Menu/199655587896',
  items: [
    {
      id: 'gid://shopify/MenuItem/461609500728',
      resourceId: null,
      tags: [],
      title: 'Collections',
      type: 'HTTP',
      url: '/collections',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609533496',
      resourceId: null,
      tags: [],
      title: 'Blog',
      type: 'HTTP',
      url: '/blogs/journal',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609566264',
      resourceId: null,
      tags: [],
      title: 'Policies',
      type: 'HTTP',
      url: '/policies',
      items: [],
    },
    {
      id: 'gid://shopify/MenuItem/461609599032',
      resourceId: 'gid://shopify/Page/92591030328',
      tags: [],
      title: 'About',
      type: 'PAGE',
      url: '/pages/about',
      items: [],
    },
  ],
}
