'use client'

import { Plus } from 'lucide-react'
import { useCart } from '@/hooks/useCart'

interface MenuItem {
  id: string
  name: string
  description: string | null
  price: number
  image?: string | null
}

interface Category {
  id: string
  name: string
  menuItems: MenuItem[]
}

interface Restaurant {
  id: string
  name: string
  slug: string
}

interface MenuGridProps {
  restaurant: Restaurant
  categories: Category[]
}

export function MenuGrid({ restaurant, categories }: MenuGridProps) {
  const { addItem } = useCart()

  const handleAddToCart = (item: MenuItem) => {
    addItem({
      menuItemId: item.id,
      name: item.name,
      price: item.price,
      quantity: 1,
    })
  }

  return (
    <div className="space-y-8">
      {categories.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No menu items available</p>
        </div>
      ) : (
        categories.map((category) => (
          <div key={category.id}>
            <h2 className="text-xl font-bold text-gray-900 mb-4">{category.name}</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {category.menuItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="aspect-square bg-gray-100 relative">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-4xl">🍔</span>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                      {item.description || 'Delicious item'}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="font-bold text-lg text-orange-500">
                        ${item.price.toFixed(2)}
                      </span>
                      <button
                        onClick={() => handleAddToCart(item)}
                        className="h-10 w-10 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 transition-colors"
                      >
                        <Plus className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
