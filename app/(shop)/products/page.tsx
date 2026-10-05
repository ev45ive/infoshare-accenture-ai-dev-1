import { Suspense } from 'react'
import { getCategories, getProducts, type ProductFilters } from '@/lib/products'
import { ProductCard } from '@/components/products/ProductCard'
import { FilterBar } from '@/components/products/FilterBar'
import Link from 'next/link'

interface SearchParams {
  category?: string
  sort?: string
  q?: string
  page?: string
  inStock?: string
}

export default async function ProductsPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const [categories, result] = await Promise.all([
    getCategories(),
    getProducts({
      categorySlug: params.category,
      sort: (params.sort as ProductFilters['sort']) || 'newest',
      query: params.q,
      page: params.page ? parseInt(params.page) : 1,
      inStock: params.inStock === '1' ? true : undefined,
    })
  ])

  // Build prev/next page URLs
  const buildPageUrl = (p: number) => {
    const sp = new URLSearchParams()
    if (params.category) sp.set('category', params.category)
    if (params.sort) sp.set('sort', params.sort)
    if (params.q) sp.set('q', params.q)
    if (params.inStock) sp.set('inStock', params.inStock)
    sp.set('page', String(p))
    return '/products?' + sp.toString()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Produkty</h1>
      <Suspense fallback={<div>Ładowanie filtrów...</div>}>
        <FilterBar
          categories={categories}
          currentCategory={params.category}
          currentSort={params.sort}
          currentQuery={params.q}
          currentInStock={params.inStock === '1'}
        />
      </Suspense>
      <p className="text-gray-500 mt-4 mb-6">Znaleziono {result.total} produktów</p>
      {result.items.length === 0 ? (
        <p className="text-center py-12 text-gray-500">Brak produktów spełniających kryteria wyszukiwania.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {result.items.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
      {/* Pagination */}
      {result.totalPages > 1 && (
        <div className="flex justify-center gap-4 mt-8">
          {result.hasPrev && (
            <Link href={buildPageUrl(result.page - 1)} className="px-4 py-2 border rounded hover:bg-gray-100">
              ← Poprzednia
            </Link>
          )}
          <span className="px-4 py-2">Strona {result.page} z {result.totalPages}</span>
          {result.hasNext && (
            <Link href={buildPageUrl(result.page + 1)} className="px-4 py-2 border rounded hover:bg-gray-100">
              Następna →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
