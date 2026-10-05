import { notFound } from 'next/navigation'
import { getProduct, formatPrice } from '@/lib/products'
import { AddToCartButton } from '@/components/products/AddToCartButton'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) return { title: 'Produkt nie znaleziony' }
  return {
    title: `${product.name} | ShopEasy`,
    description: product.description,
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProduct(slug)
  if (!product) notFound()

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:underline">Strona główna</Link>
        {' / '}
        <Link href="/products" className="hover:underline">Produkty</Link>
        {' / '}
        <span>{product.name}</span>
      </nav>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden">
          {product.imageUrl ? (
            <Image src={product.imageUrl} alt={product.name} width={600} height={400} unoptimized className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">Brak zdjęcia</div>
          )}
        </div>

        {/* Info */}
        <div>
          <span className="text-sm text-blue-600 font-medium">{product.category.name}</span>
          <h1 className="text-3xl font-bold mt-1 mb-2">{product.name}</h1>
          <p className="text-3xl font-bold text-blue-600 mb-4">{formatPrice(product.price)}</p>
          <p className="text-gray-600 mb-6">{product.description}</p>
          <p className="text-sm text-gray-500 mb-6">
            {product.stock > 0 ? `W magazynie: ${product.stock} szt.` : 'Produkt niedostępny'}
          </p>
          <AddToCartButton product={product} />
        </div>
      </div>
    </div>
  )
}
