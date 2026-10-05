import { getFeaturedProducts } from '@/lib/products'
import { ProductCard } from '@/components/products/ProductCard'
import Link from 'next/link'

export default async function HomePage() {
  const products = await getFeaturedProducts(8)
  return (
    <div>
      {/* Hero section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20 px-4 text-center">
        <h1 className="text-4xl font-bold mb-4">ShopEasy</h1>
        <p className="text-xl mb-8">Twój ulubiony sklep internetowy</p>
        <div className="flex gap-4 justify-center">
          <Link href="/products" className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100">
            Przeglądaj produkty
          </Link>
          <Link href="/register" className="border border-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10">
            Zarejestruj się
          </Link>
        </div>
      </section>
      {/* Featured products */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">Polecane produkty</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <div className="text-center mt-8">
          <Link href="/products" className="text-blue-600 hover:underline font-semibold">
            Zobacz wszystkie produkty →
          </Link>
        </div>
      </section>
    </div>
  )
}
