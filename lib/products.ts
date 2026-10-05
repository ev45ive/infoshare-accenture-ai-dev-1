import { db } from '@/lib/db'
import type { Prisma } from '@prisma/client'

export type ProductFilters = {
  categorySlug?: string
  priceMin?: number   // grosze
  priceMax?: number   // grosze
  inStock?: boolean
  sort?: 'name_asc' | 'price_asc' | 'price_desc' | 'newest'
  query?: string      // full-text search (KAT-03, min 2 znaki)
  page?: number
  perPage?: number
}

export const PRODUCTS_PER_PAGE = 20

export async function getCategories() {
  return db.category.findMany({ orderBy: { name: 'asc' } })
}

export async function getFeaturedProducts(limit = 8) {
  return db.product.findMany({
    where: { stock: { gt: 0 } },
    include: { category: true },
    take: limit,
    orderBy: { id: 'asc' },
  })
}

export async function getProducts(filters: ProductFilters = {}) {
  const {
    categorySlug,
    priceMin,
    priceMax,
    inStock,
    sort = 'newest',
    query,
    page = 1,
    perPage = PRODUCTS_PER_PAGE,
  } = filters

  const where: Prisma.ProductWhereInput = {}

  if (categorySlug) {
    where.category = { slug: categorySlug }
  }
  if (priceMin !== undefined || priceMax !== undefined) {
    where.price = {
      ...(priceMin !== undefined ? { gte: priceMin } : {}),
      ...(priceMax !== undefined ? { lte: priceMax } : {}),
    }
  }
  if (inStock) {
    where.stock = { gt: 0 }
  }
  // KAT-03: wyszukiwanie po nazwie, opisie, kategorii (min. 2 znaki)
  if (query && query.length >= 2) {
    where.OR = [
      { name: { contains: query } },
      { description: { contains: query } },
      { category: { name: { contains: query } } },
    ]
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    sort === 'name_asc' ? { name: 'asc' }
    : sort === 'price_asc' ? { price: 'asc' }
    : sort === 'price_desc' ? { price: 'desc' }
    : { id: 'desc' } // newest

  const [items, total] = await Promise.all([
    db.product.findMany({
      where,
      orderBy,
      include: { category: true },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    db.product.count({ where }),
  ])

  return {
    items,
    total,
    page,
    perPage,
    totalPages: Math.ceil(total / perPage),
    hasNext: page * perPage < total,
    hasPrev: page > 1,
  }
}

export async function getProduct(slug: string) {
  return db.product.findUnique({
    where: { slug },
    include: { category: true, variants: true },
  })
}

// Helpers do cen — re-export from lib/format (safe for client components)
export { formatPrice } from './format'
