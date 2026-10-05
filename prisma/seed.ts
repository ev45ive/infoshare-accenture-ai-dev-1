import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3'
import bcrypt from 'bcryptjs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const workspaceRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const configuredUrl = process.env.DATABASE_URL ?? ''
const targetFile = resolve(configuredUrl.replace(/^file:/, ''))
if (process.env.WORKSHOP_MODE !== 'true' || !configuredUrl.startsWith('file:') || ![resolve(workspaceRoot, 'workshop.db'), resolve(workspaceRoot, '.workshop/integration.db')].includes(targetFile)) {
  throw new Error('Seed obsługuje wyłącznie bazy w tym lokalnym workspace warsztatu.')
}

const adapter = new PrismaBetterSqlite3({
  url: `file:${targetFile.replaceAll('\\', '/')}`,
})
const db = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Seeding database...')

  // Cleanup (order matters due to FK constraints)
  await db.orderStatusHistory.deleteMany()
  await db.orderItem.deleteMany()
  await db.order.deleteMany()
  await db.cartItem.deleteMany()
  await db.address.deleteMany()
  await db.loyaltyAccount.deleteMany()
  await db.passwordResetToken.deleteMany()
  await db.productVariant.deleteMany()
  await db.product.deleteMany()
  await db.category.deleteMany()
  await db.user.deleteMany()

  // ─── Kategorie ─────────────────────────────────────
  const electronics = await db.category.create({
    data: { id: 'category-electronics', name: 'Elektronika', slug: 'elektronika' },
  })
  const clothing = await db.category.create({
    data: { id: 'category-clothing', name: 'Odzież', slug: 'odziez' },
  })
  const home = await db.category.create({
    data: { id: 'category-home', name: 'Dom i ogród', slug: 'dom-i-ogrod' },
  })

  // ─── Produkty ──────────────────────────────────────
  const products = [
    // Elektronika
    {
      name: 'Słuchawki bezprzewodowe SoundMax X3',
      slug: 'sluchawki-soundmax-x3',
      description:
        'Słuchawki z aktywną redukcją szumów (ANC), 30h baterii, szybkie ładowanie USB-C. Waga 250g.',
      price: 29999,
      stock: 15,
      categoryId: electronics.id,
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
    },
    {
      name: 'Powerbank UltraCharge 20000',
      slug: 'powerbank-ultracharge-20000',
      description:
        'Powerbank 20 000 mAh z ładowaniem PD 45W. Ładuje laptopa, tablet i telefon jednocześnie.',
      price: 14999,
      stock: 30,
      categoryId: electronics.id,
      imageUrl: 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&q=80',
    },
    {
      name: 'Klawiatura mechaniczna TypePro RGB',
      slug: 'klawiatura-typepro-rgb',
      description:
        'Klawiatura mechaniczna TKL z podświetleniem RGB per-key, przełączniki Cherry MX Red.',
      price: 34999,
      stock: 8,
      categoryId: electronics.id,
      imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80',
    },
    {
      name: 'Mysz gamingowa SwiftClick 8K',
      slug: 'mysz-swiftclick-8k',
      description:
        'Mysz optyczna 8000 DPI, 6 programowalnych przycisków, RGB, przewód w oplocie.',
      price: 19999,
      stock: 20,
      categoryId: electronics.id,
      imageUrl: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=80',
    },
    // Odzież
    {
      name: 'Kurtka softshell TrailMaster Pro',
      slug: 'kurtka-trailmaster-pro',
      description:
        'Lekka kurtka softshell 3L odporna na wiatr i lekki deszcz. Oddychająca, idealna na trekking.',
      price: 24999,
      stock: 12,
      categoryId: clothing.id,
      imageUrl: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&q=80',
    },
    {
      name: 'T-shirt bawełniany BasicTee',
      slug: 'tshirt-basictee',
      description:
        '100% bawełna organiczna GOTS. Klasyczny okrągły kołnierz, dostępny w 5 kolorach.',
      price: 4999,
      stock: 50,
      categoryId: clothing.id,
      imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80',
    },
    {
      name: 'Spodnie dresowe ComfortFit',
      slug: 'spodnie-comfortfit',
      description:
        'Spodnie z mieszanki bawełny i elastanu (95/5). Kieszenie z zamkiem, ściągacz w pasie.',
      price: 8999,
      stock: 25,
      categoryId: clothing.id,
      imageUrl: 'https://images.unsplash.com/photo-1552902865-b72c031ac5ea?w=600&q=80',
    },
    {
      name: 'Sneakersy UrbanRun Pro',
      slug: 'sneakersy-urbanrun-pro',
      description:
        'Lekkie sneakersy do codziennego noszenia i lekkiego biegania. Podeszwa EVA, cholewka mesh.',
      price: 27999,
      stock: 0, // celowo niedostępny – testowanie KAT-05
      categoryId: clothing.id,
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80',
    },
    // Dom i ogród
    {
      name: 'Świeca sojowa ZenLight Lawendowa',
      slug: 'swieca-zenlight-lawendowa',
      description:
        'Ręcznie robiona świeca z wosku sojowego. Czas palenia ok. 45h. Zapach lawendy prowansalskiej.',
      price: 3999,
      stock: 40,
      categoryId: home.id,
      imageUrl: 'https://images.unsplash.com/photo-1588683158398-1a57a440db1d?w=600&q=80',
    },
    {
      name: 'Ekspres do kawy BrewMaster 500',
      slug: 'ekspres-brewmaster-500',
      description:
        'Ekspres przelewowy z funkcją keep-warm 40 min, programator 24h, pojemność 1,5L, 900W.',
      price: 18999,
      stock: 7,
      categoryId: home.id,
      imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80',
    },
    {
      name: 'Zestaw noży kuchennych ChefSet 5',
      slug: 'noze-chefset-5',
      description:
        'Zestaw 5 noży ze stali nierdzewnej 420J2 z drewnianym blokiem akacjowym. Ostrzone ręcznie.',
      price: 22999,
      stock: 18,
      categoryId: home.id,
      imageUrl: 'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=600&q=80',
    },
    {
      name: 'Donica ceramiczna TerraForm L',
      slug: 'donica-terraform-l',
      description:
        'Donica ceramiczna ⌀30cm z podstawką i otworem drenażowym. Mrozoodporna, kolor terakota.',
      price: 5999,
      stock: 35,
      categoryId: home.id,
      imageUrl: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=600&q=80',
    },
  ]

  for (const product of products) {
    await db.product.create({ data: { ...product, id: `product-${product.slug}`, imageUrl: '/images/product.svg' } })
  }

  // Warianty rozmiaru dla t-shirta
  const tshirt = await db.product.findUniqueOrThrow({ where: { slug: 'tshirt-basictee' } })
  for (const size of ['XS', 'S', 'M', 'L', 'XL']) {
    await db.productVariant.create({
      data: { id: `variant-tshirt-${size}`, productId: tshirt.id, label: 'Rozmiar', value: size, stock: 10 },
    })
  }

  // Warianty rozmiarów butów (niedostępnych)
  const sneakers = await db.product.findUniqueOrThrow({ where: { slug: 'sneakersy-urbanrun-pro' } })
  for (const size of ['38', '39', '40', '41', '42', '43', '44']) {
    await db.productVariant.create({
      data: { id: `variant-sneakers-${size}`, productId: sneakers.id, label: 'Rozmiar EU', value: size, stock: 0 },
    })
  }

  // ─── Testowy użytkownik ────────────────────────────
  const passwordHash = await bcrypt.hash('Test1234!', 12)
  await db.user.create({
    data: {
      id: 'user-workshop',
      email: 'test@shopeasy.pl',
      name: 'Jan Testowy',
      passwordHash,
      emailVerified: true, // od razu aktywne — do testów
      createdAt: new Date('2026-01-01T09:00:00Z'),
    },
  })

  console.log('✅ Seed zakończony:')
  console.log('   • 3 kategorie')
  console.log('   • 12 produktów (1 niedostępny: sneakers)')
  console.log('   • 1 użytkownik testowy: test@shopeasy.pl / Test1234!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(() => db.$disconnect())
