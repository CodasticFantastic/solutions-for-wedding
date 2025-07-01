import {data as remixData, type LoaderFunctionArgs} from '@shopify/remix-oxygen'
import {Form, NavLink, Outlet, useLoaderData} from 'react-router'
import {CUSTOMER_DETAILS_QUERY} from '@/graphql/customer-account/CustomerDetailsQuery'
import {Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger} from '@/components/shadCn/ui/sheet'
import {Button} from '@/components/shadCn/ui/button'
import {ImageIcon, LogOutIcon, MapPinIcon, MenuIcon, PackageIcon, UserIcon} from 'lucide-react'
import {cn} from '@/lib/shadCn/utils'

export function shouldRevalidate() {
  return true
}

export async function loader({context}: LoaderFunctionArgs) {
  const {data, errors} = await context.customerAccount.query(CUSTOMER_DETAILS_QUERY)

  if (errors?.length || !data?.customer) {
    throw new Error('Nie znaleziono klienta')
  }

  return remixData(
    {customer: data.customer},
    {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    },
  )
}

export default function AccountLayout() {
  const {customer} = useLoaderData<typeof loader>()

  return (
    <div className="bg-background min-h-screen">
      {/* ───── Header Mobile (<= md) ───── */}
      <header className="bg-background flex items-center justify-between p-4 shadow-md md:hidden">
        <h1 className="text-base font-semibold">Konto klienta</h1>

        {/* hamburger → otwiera Sheet z nawigacją */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <MenuIcon className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="border-b">
              <SheetTitle className="px-6 py-4 text-lg">Moje konto</SheetTitle>
            </SheetHeader>
            <AccountNav className="p-4" onItemClick={() => {}} />
          </SheetContent>
        </Sheet>
      </header>

      <div className="mx-auto flex">
        {/* ───── Sidebar (>= md) ───── */}
        <aside className="border-border bg-sidebar sticky top-0 hidden h-screen shrink-0 grow-0 basis-64 border-r p-6 md:block">
          <p className="mb-6 text-lg font-semibold">Konto</p>
          <AccountNav />
        </aside>

        {/* ───── Główna sekcja ───── */}
        <main className="flex-1 p-6">
          <Outlet context={{customer}} />
        </main>
      </div>
    </div>
  )
}

const NAV_ITEMS = [
  {
    to: '/account/orders',
    label: 'Zamówienia',
    icon: PackageIcon,
  },
  {
    to: '/account/profile',
    label: 'Profil',
    icon: UserIcon,
  },
  {
    to: '/account/addresses',
    label: 'Adresy',
    icon: MapPinIcon,
  },
  {
    to: '/account/designs',
    label: 'Moje projekty',
    icon: ImageIcon,
  },
]

function AccountNav({className, onItemClick}: {className?: string; onItemClick?: () => void}) {
  return (
    <nav className={cn('flex flex-col gap-1', className)}>
      {NAV_ITEMS.map(({to, label, icon: Icon}) => (
        <NavLink
          key={to}
          to={to}
          className={({isActive}) =>
            cn(
              'text-muted-foreground hover:text-foreground flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors',
              isActive && 'bg-accent text-accent-foreground font-medium',
            )
          }
          onClick={onItemClick}
        >
          <Icon className="size-4 shrink-0" />
          {label}
        </NavLink>
      ))}

      {/* Wyloguj */}
      <Form method="POST" action="/account/logout" className="pt-4">
        <Button type="submit" variant="ghost" className="text-destructive w-full justify-start gap-3">
          <LogOutIcon className="size-4" />
          Wyloguj
        </Button>
      </Form>
    </nav>
  )
}
