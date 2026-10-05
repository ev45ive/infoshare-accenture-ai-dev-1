'use client'

import { useRef, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface FilterBarProps {
  categories: { id: string; name: string; slug: string }[]
  currentCategory?: string
  currentSort?: string
  currentQuery?: string
  currentInStock?: boolean
}

export function FilterBar({
  categories,
  currentCategory,
  currentSort,
  currentQuery,
  currentInStock,
}: FilterBarProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [searchValue, setSearchValue] = useState(currentQuery ?? '')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  function buildUrl(overrides: Record<string, string | undefined>) {
    const params = new URLSearchParams(searchParams.toString())
    // reset page on any filter change
    params.delete('page')
    for (const [key, value] of Object.entries(overrides)) {
      if (value === undefined || value === '') {
        params.delete(key)
      } else {
        params.set(key, value)
      }
    }
    return '/products?' + params.toString()
  }

  function handleCategory(value: string) {
    router.push(buildUrl({ category: value === '__all' ? undefined : value }))
  }

  function handleSort(value: string) {
    router.push(buildUrl({ sort: value }))
  }

  function handleInStock(checked: boolean) {
    router.push(buildUrl({ inStock: checked ? '1' : undefined }))
  }

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      router.push(buildUrl({ q: searchValue || undefined }))
    }, 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue])

  return (
    <div className="flex flex-wrap gap-4 items-end bg-gray-50 border border-gray-200 rounded-xl p-4">
      {/* Category */}
      <div className="flex flex-col gap-1 min-w-[160px]">
        <Label htmlFor="filter-category" className="text-xs font-medium text-gray-600">
          Kategoria
        </Label>
        <select
          id="filter-category"
          value={currentCategory ?? '__all'}
          onChange={(e) => handleCategory(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="__all">Wszystkie kategorie</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.slug}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Sort */}
      <div className="flex flex-col gap-1 min-w-[180px]">
        <Label htmlFor="filter-sort" className="text-xs font-medium text-gray-600">
          Sortowanie
        </Label>
        <select
          id="filter-sort"
          value={currentSort ?? 'newest'}
          onChange={(e) => handleSort(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="newest">Najnowsze</option>
          <option value="price_asc">Cena: rosnąco</option>
          <option value="price_desc">Cena: malejąco</option>
          <option value="name_asc">Nazwa A-Z</option>
        </select>
      </div>

      {/* Search */}
      <div className="flex flex-col gap-1 min-w-[200px] flex-1">
        <Label htmlFor="filter-search" className="text-xs font-medium text-gray-600">
          Szukaj
        </Label>
        <Input
          id="filter-search"
          type="text"
          placeholder="Wpisz nazwę produktu…"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
        />
      </div>

      {/* In stock */}
      <div className="flex items-center gap-2 pb-1">
        <input
          id="filter-instock"
          type="checkbox"
          checked={currentInStock ?? false}
          onChange={(e) => handleInStock(e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 accent-blue-600 cursor-pointer"
        />
        <Label htmlFor="filter-instock" className="text-sm cursor-pointer select-none">
          Tylko dostępne
        </Label>
      </div>
    </div>
  )
}
