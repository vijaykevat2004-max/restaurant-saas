'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: '📊' },
  { name: 'Kitchen', href: '/kitchen', icon: '👨‍🍳' },
  { name: 'Orders', href: '/orders', icon: '📋' },
  { name: 'Menu', href: '/menu', icon: '🍽️' },
  { name: 'Tables', href: '/tables', icon: '🪑' },
  { name: 'Staff', href: '/staff', icon: '👥' },
  { name: 'Settings', href: '/settings', icon: '⚙️' },
]

export default function Navbar() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav style={{
      background: 'linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)',
      padding: '12px 16px',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 2px 10px rgba(0,0,0,0.15)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', maxWidth: 1200, margin: '0 auto' }}>
        <h1 style={{ margin: 0, fontWeight: 'bold', color: 'white', fontSize: 20 }}>🍔 RestaurantOS</h1>
        
        {/* Desktop Menu */}
        <div style={{ display: 'flex', gap: 4, overflowX: 'auto' }} className="desktop-menu">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                padding: '8px 12px',
                borderRadius: 8,
                textDecoration: 'none',
                color: pathname === item.href ? '#ff6b35' : 'white',
                background: pathname === item.href ? 'white' : 'rgba(255,255,255,0.1)',
                fontWeight: 500,
                fontSize: 14,
                whiteSpace: 'nowrap',
                display: 'flex',
                alignItems: 'center',
                gap: 4
              }}
            >
              <span>{item.icon}</span>
              <span className="menu-text">{item.name}</span>
            </Link>
          ))}
        </div>

        {/* Mobile Menu Button */}
        <button 
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: 8,
            padding: '8px 12px',
            color: 'white',
            cursor: 'pointer',
            fontSize: 20
          }}
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Dropdown */}
      {menuOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          background: 'white',
          boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          borderRadius: '0 0 12px 12px',
          overflow: 'hidden'
        }}>
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 20px',
                textDecoration: 'none',
                color: pathname === item.href ? '#ff6b35' : '#333',
                background: pathname === item.href ? '#fff5f0' : 'white',
                borderBottom: '1px solid #f0f0f0',
                fontWeight: pathname === item.href ? 'bold' : 'normal'
              }}
            >
              <span style={{ fontSize: 20 }}>{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-menu { display: none !important; }
        }
        .menu-text { display: inline; }
      `}</style>
    </nav>
  )
}
