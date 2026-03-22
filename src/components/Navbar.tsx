'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const navItems = [
  { name: 'Dashboard', href: '/admin' },
  { name: 'Kitchen', href: '/kitchen' },
  { name: 'Orders', href: '/orders' },
  { name: 'Menu', href: '/menu' },
  { name: 'Staff', href: '/staff' },
  { name: 'Settings', href: '/settings' },
]

export default function Navbar() {
  const pathname = usePathname()

  return (
    <nav style={{ display: 'flex', gap: 8, padding: '12px 24px', background: 'white', borderBottom: '1px solid #e5e7eb' }}>
      <h1 style={{ marginRight: 24, fontWeight: 'bold', color: '#f97316', fontSize: 20 }}>RestaurantOS</h1>
      {navItems.map(item => (
        <Link
          key={item.href}
          href={item.href}
          style={{
            padding: '8px 16px',
            borderRadius: 8,
            textDecoration: 'none',
            color: pathname === item.href ? 'white' : '#374151',
            background: pathname === item.href ? '#f97316' : 'transparent',
            fontWeight: 500,
          }}
        >
          {item.name}
        </Link>
      ))}
    </nav>
  )
}
