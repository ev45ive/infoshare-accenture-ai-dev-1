# Mapa kodu źródłowego — Multi-phase Guest Cart Flow

**Data**: 2026-10-06  
**Projekt**: ShopEasy (Next.js 16 + React 19 + Prisma 7 + SQLite)  
**Temat**: Analiza kodu dla scenariusza: Niezalogowany → Dodaj produkty → Zaloguj → Wyloguj → Nowe produkty → Zaloguj

---

## Krok 1: Niezalogowany — Dodaj produkt do koszyka (12 szt.)

### 1.1 UI — Przycisk "Dodaj do koszyka"

| Aspekt | Szczegóły |
|--------|-----------|
| **Plik** | `components/products/AddToCartButton.tsx` |
| **Komponent** | `AddToCartButton` |
| **Props** | `product: { id, name, price, stock, imageUrl }` |
| **Hook** | `useCart()` → `addItem()` |
| **Akcja** | `onClick` → `handleAddToCart()` |
| **Status** | ✅ Wyświetlany dla niezalogowanych |

```tsx
// Pseudo-kod
export function AddToCartButton({ product }) {
  const { addItem, loading, error } = useCart()
  
  const handleAddToCart = async () => {
    await addItem(product, 1)
  }
  
  return <button onClick={handleAddToCart}>Dodaj do koszyka</button>
}
```

### 1.2 Hook — Logika dodawania (Guest path)

| Aspekt | Szczegóły |
|--------|-----------|
| **Plik** | `hooks/useCart.ts` |
| **Hook** | `useCart()` |
| **Funkcja** | `addItem()` |
| **Linia** | ~90-110 |
| **Warunek** | `if (!isLoggedIn)` |
| **Akcja** | `guestAdd()` z Zustand store |
| **Zwrot** | `{ success: true }` |

```tsx
// Z hooks/useCart.ts
async function addItem(
  product: { id: string; name: string; price: number; stock: number; imageUrl: string },
  quantity = 1
): Promise<{ success?: boolean; error?: string }> {
  setError(null)

  if (isLoggedIn) {
    // Path dla zalogowanego
  }

  // Guest path — limitacja BR-01 (max 5 produktów)
  const currentDistinct = new Set(guestItems.map((i) => i.productId))
  if (!currentDistinct.has(product.id) && currentDistinct.size >= 5) {
    const msg = 'Osiągnięto limit pozycji dla konta standardowego (5).'
    setError(msg)
    return { error: msg }
  }

  guestAdd({ productId: product.id, name: product.name, price: product.price, quantity, imageUrl: product.imageUrl })
  return { success: true }
}
```

### 1.3 State Management — localStorage (Guest Cart)

| Aspekt | Szczegóły |
|--------|-----------|
| **Plik** | `store/cart.ts` |
| **Store** | `useCartStore` (Zustand) |
| **Storage** | localStorage (`shopeasy-guest-cart`) |
| **Metoda** | `addItem()` |
| **Logika** | Sumuje ilości jeśli produkt istnieje |
| **Persistence** | ✅ `persist()` middleware |

```tsx
// Z store/cart.ts
addItem: (item) =>
  set((s) => {
    const existing = s.items.find((i) => i.productId === item.productId)
    if (existing) {
      return {
        items: s.items.map((i) =>
          i.productId === item.productId
            ? { ...i, quantity: i.quantity + item.quantity }  // SUMA ✅
            : i
        ),
      }
    }
    return { items: [...s.items, item] }
  }),
```

### 1.4 Wynik

- **localStorage**: `{ "shopeasy-guest-cart": [Donica x4, Ekspres x3, Mysz x5] }`
- **Status**: ✅ Produkty przechowywane lokalnie
- **Sumowanie**: ✅ Prawidłowe (4+3+5 = 12 szt.)

---

## Krok 2: Zalogowanie

### 2.1 Login Form

| Aspekt | Szczegóły |
|--------|-----------|
| **Plik** | `app/(auth)/login/page.tsx` |
| **Komponent** | `LoginForm` |
| **Metoda** | `onSubmit(data: LoginInput)` |
| **API Endpoint** | `POST /api/auth/login` |
| **Dane** | email, password |

### 2.2 Login API Handler

| Aspekt | Szczegóły |
|--------|-----------|
| **Plik** | `app/api/auth/login/route.ts` |
| **Handler** | `POST()` |
| **Kroki** | 1. Parse → 2. DB lookup → 3. Password verify → 4. setSession |
| **Walidacja** | LoginSchema |
| **Security** | bcrypt compare, failedLoginAttempts tracking |

```tsx
// Z app/api/auth/login/route.ts
export async function POST(req: NextRequest) {
  const { email, password } = parsed.data

  const user = await db.user.findUnique({ where: { email } })
  if (!user) return { error: 'Nieprawidłowy e-mail lub hasło.' }

  const passwordOk = await bcrypt.compare(password, user.passwordHash)
  if (!passwordOk) { /* handle failures */ }

  // ✅ Ustaw sesję
  await setSession({ id: user.id, email: user.email, name: user.name })

  return NextResponse.json({ success: true })
}
```

**Linia**: 71 (`setSession()`)

### 2.3 Session Management

| Aspekt | Szczegóły |
|--------|-----------|
| **Plik** | `lib/session.ts` |
| **Funkcja** | `setSession(data)` |
| **Efekt** | Ustawia sesję (cookie/storage) |
| **Hook** | `useCart()` detektuje zmianę `isLoggedIn = true` |

### 2.4 Guest Cart Merge — Hook Effect

| Aspekt | Szczegóły |
|--------|-----------|
| **Plik** | `hooks/useCart.ts` |
| **Hook Effect** | `useEffect()` z dependency `[isLoggedIn]` |
| **Linie** | 69-82 |
| **Trigger** | `isLoggedIn` zmienia się na `true` |
| **Akcje** | 1. Pobierz items z localStorage 2. Merge do DB 3. Wyczyść localStorage 4. Fetch DB cart |

```tsx
// Z hooks/useCart.ts linijka ~69
useEffect(() => {
  if (!isLoggedIn) return
  let active = true
  async function load() {
    const guest = useCartStore.getState().items
    if (guest.length) {
      const result = await mergeGuestCart(guest.map(({ productId, quantity }) => ({ productId, quantity })))
      if (result.success) useCartStore.getState().clearCart()  // ✅ Wyczyść localStorage
    }
    if (active) await fetchDbCart()  // ✅ Pobierz DB koszyk
  }
  load().catch(...)
  return () => { active = false }
}, [isLoggedIn, fetchDbCart])
```

### 2.5 Server-side Merge — mergeGuestCart()

| Aspekt | Szczegóły |
|--------|-----------|
| **Plik** | `lib/actions/cart.ts` |
| **Funkcja** | `mergeGuestCart(items: CartCookieItem[])` |
| **Typ** | Server Action |
| **Linie** | 96-123 |
| **Logika** | Dla każdego produktu z localStorage: dodaj/update w DB |
| **BR-01** | Max 5 różnych produktów |

```tsx
// Z lib/actions/cart.ts linijka 96
export async function mergeGuestCart(items: CartCookieItem[]) {
  const user = await getSessionUser()
  if (!user || items.length === 0) return { success: true }

  for (const item of items) {
    const existing = await db.cartItem.findUnique({
      where: { userId_productId: { userId: user.id, productId: item.productId } },
    })

    if (existing) {
      await db.cartItem.update({
        where: { id: existing.id },
        data: { quantity: Math.max(existing.quantity, item.quantity) },
      })
    } else {
      const count = await db.cartItem.count({ where: { userId: user.id } })
      if (count >= CART_LIMIT) break

      await db.cartItem.create({
        data: { userId: user.id, productId: item.productId, quantity: item.quantity },
      }).catch(() => null)
    }
  }

  revalidatePath('/cart')
  return { success: true }
}
```

**Uwaga**: Używa `Math.max()` zamiast sumy — to oznacza że jeśli produkt istnieje w obu koszykach (gościa i zalogowanego), przyjmuje większą ilość.

### 2.6 Fetch DB Cart

| Aspekt | Szczegóły |
|--------|-----------|
| **Plik** | `hooks/useCart.ts` |
| **Funkcja** | `fetchDbCart()` |
| **Linie** | ~42-68 |
| **API** | `GET /api/cart` |
| **Dane** | CartItems z relacją Product |
| **Efekt** | Ustawia `dbItems` state |

### 2.7 Wynik

- **Sesja**: ✅ Aktywna (isLoggedIn = true)
- **localStorage**: ✅ Wyczyszczony (clearCart)
- **Baza danych**: ✅ Zawiera Donica x4, Ekspres x3, Mysz x5
- **Koszyk użytkownika**: ✅ 12 szt., 1809,88 zł
- **Opóźnienie**: ⏱️ ~3-5s (async loading)

---

## Krok 3: Wylogowanie + Dodanie nowych produktów

### 3.1 Logout Button

| Aspekt | Szczegóły |
|--------|-----------|
| **Plik** | `components/layout/LogoutButton.tsx` |
| **Komponent** | `LogoutButton` |
| **Akcja** | `onClick` → `handleLogout()` |
| **Kroki** | 1. POST `/api/auth/logout` 2. `router.push('/login')` 3. `router.refresh()` |

```tsx
// Z components/layout/LogoutButton.tsx
export function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return <button onClick={handleLogout}>Wyloguj</button>
}
```

### 3.2 Logout API Handler

| Aspekt | Szczegóły |
|--------|-----------|
| **Plik** | `app/api/auth/logout/route.ts` |
| **Handler** | `POST()` |
| **Akcja** | `clearSession()` |
| **Efekt** | Usuwa sesję |
| **Linia** | 4 |

```tsx
// Z app/api/auth/logout/route.ts
export async function POST() {
  await clearSession()
  return NextResponse.json({ success: true })
}
```

### 3.3 Session Clear Logic

| Aspekt | Szczegóły |
|--------|-----------|
| **Plik** | `lib/session.ts` |
| **Funkcja** | `clearSession()` |
| **Efekt** | Usuwa sesję |
| **Hook Detection** | `useCart()` detektuje `isLoggedIn = false` |
| **Rezultat** | Przełączenie na guest mode |

### 3.4 Druga faza — Dodaj nowe produkty (Guest path)

| Aspekt | Szczegóły |
|--------|-----------|
| **Plik** | `components/products/AddToCartButton.tsx` |
| **Hook** | `useCart()` → `addItem()` (guest path) |
| **Produkty** | Kurtka x2, Słuchawki x3 |
| **Storage** | localStorage (`shopeasy-guest-cart`) |
| **Efekt localStorage** | ⚠️ REPLACED (nie MERGED) |

**Logika localStorage**:
- Po wylogowaniu (Faza 2), `clearCart()` wyczyścił localStorage
- Faza 3b dodaje nowe produkty → localStorage zawiera TYLKO Kurtka x2, Słuchawki x3
- Stare produkty (Donica, Ekspres, Mysz) są w **bazie danych**, a nie w localStorage

### 3.5 Wynik

- **localStorage**: `{ "shopeasy-guest-cart": [Kurtka x2, Słuchawki x3] }`
- **Baza danych**: ✅ Zawiera stare produkty (Donica x4, Ekspres x3, Mysz x5)
- **Koszyk gościa**: 5 szt., 1399,95 zł
- **Status**: ⚠️ Stare produkty NIE widoczne w localStorage (ale są w bazie!)

---

## Krok 4: Zalogowanie (ponownie) — Sumowanie produktów

### 4.1 Login (jak Krok 2)

| Aspekt | Szczegóły |
|--------|-----------|
| **Plik** | `app/api/auth/login/route.ts` |
| **Akcja** | `setSession()` → Trigger merge |
| **Efekt** | `isLoggedIn = true` → Hook effect uruchamia się |

### 4.2 mergeGuestCart() — Druga iteracja

| Aspekt | Szczegóły |
|--------|-----------|
| **Źródło localStorage** | Kurtka x2, Słuchawki x3 (z Fazy 3b) |
| **Działanie** | Dodaj produkty z localStorage do bazy danych |
| **Wynik DB** | Donica x4 + Ekspres x3 + Mysz x5 + Kurtka x2 + Słuchawki x3 |
| **Ilość razem** | 4+3+5+2+3 = **17 szt.** ✅ |

**Logika**:
```
Baza przed merge:  Donica x4, Ekspres x3, Mysz x5
localStorage:      Kurtka x2, Słuchawki x3
                   ↓
mergeGuestCart()
                   ↓
Baza po merge:     Donica x4, Ekspres x3, Mysz x5, Kurtka x2, Słuchawki x3
```

### 4.3 fetchDbCart() — Pobierz pełny koszyk

| Aspekt | Szczegóły |
|--------|-----------|
| **API** | `GET /api/cart` |
| **Zwrot** | Wszystkie CartItems zalogowanego użytkownika |
| **Logika** | `db.cartItem.findMany({ where: { userId: user.id } })` |

### 4.4 Wynik KOŃCOWY

| Produkt | Ilość | Cena/szt. | Razem | Źródło |
|---------|-------|-----------|-------|--------|
| Donica ceramiczna | 4 | 59,99 zł | 239,96 zł | Faza 1 (DB) |
| Ekspres do kawy | 3 | 189,99 zł | 569,97 zł | Faza 1 (DB) |
| Mysz gamingowa | 5 | 199,99 zł | 999,95 zł | Faza 1 (DB) |
| Kurtka softshell | 2 | 249,99 zł | 499,98 zł | Faza 3b (localStorage) |
| Słuchawki bezprzewodowe | 3 | 299,99 zł | 899,97 zł | Faza 3b (localStorage) |
| **RAZEM** | **17 szt.** | | **3209,83 zł** | ✅ SCALANE |

---

## Podsumowanie — Mapa symboli

### By Krok

| Krok | Komponent/Funkcja | Plik | Typ | Linia | Akcja |
|------|-------------------|------|-----|-------|-------|
| 1 | `AddToCartButton` | `components/products/AddToCartButton.tsx` | Komponent | - | Przycisk dodaj |
| 1 | `useCart()` | `hooks/useCart.ts` | Hook | ~90-110 | Guest addItem |
| 1 | `useCartStore` | `store/cart.ts` | Zustand | ~23 | localStorage + sumowanie |
| 2 | `LoginForm` | `app/(auth)/login/page.tsx` | Komponent | - | Formularz login |
| 2 | `POST()` | `app/api/auth/login/route.ts` | API | - | Logowanie + setSession |
| 2 | `setSession()` | `lib/session.ts` | Funkcja | - | Ustaw sesję |
| 2 | `useEffect()` | `hooks/useCart.ts` | Hook Effect | ~69-82 | Trigger merge |
| 2 | `mergeGuestCart()` | `lib/actions/cart.ts` | Server Action | ~96-123 | Scalaj localStorage → DB |
| 2 | `fetchDbCart()` | `hooks/useCart.ts` | Hook | ~42-68 | Pobierz DB koszyk |
| 3 | `LogoutButton` | `components/layout/LogoutButton.tsx` | Komponent | - | Przycisk logout |
| 3 | `POST()` | `app/api/auth/logout/route.ts` | API | 4 | Wyloguj + clearSession |
| 3 | `clearSession()` | `lib/session.ts` | Funkcja | - | Usuń sesję |
| 3 | `AddToCartButton` | `components/products/AddToCartButton.tsx` | Komponent | - | Nowe produkty (guest) |
| 4 | (jak Krok 2) | | | | Merge produktów |

### By Typ

#### Komponenty React
- `AddToCartButton` [components/products/AddToCartButton.tsx]
- `LoginForm` [app/(auth)/login/page.tsx]
- `LogoutButton` [components/layout/LogoutButton.tsx]

#### Hooki
- `useCart()` [hooks/useCart.ts] — główny hook do abstrakcji logiki
- `useCartStore` [store/cart.ts] — Zustand store

#### API Endpoints
- `POST /api/auth/login` [app/api/auth/login/route.ts] — logowanie
- `POST /api/auth/logout` [app/api/auth/logout/route.ts] — wylogowanie
- `GET /api/cart` [app/api/cart/route.ts] — pobierz koszyk

#### Server Actions
- `mergeGuestCart()` [lib/actions/cart.ts] — scalaj gościa → zalogowany
- `addToDbCart()` [lib/actions/cart.ts] — dodaj do DB
- `removeFromDbCart()` [lib/actions/cart.ts] — usuń z DB
- `updateDbCartQuantity()` [lib/actions/cart.ts] — update ilości
- `getDbCart()` [lib/actions/cart.ts] — pobierz z DB
- `clearDbCart()` [lib/actions/cart.ts] — wyczyść DB

#### Session Management
- `setSession()` [lib/session.ts] — ustaw sesję (login)
- `clearSession()` [lib/session.ts] — usuń sesję (logout)
- `getSessionUser()` [lib/session.ts] — pobierz zalogowanego użytkownika

---

## Przepływ danych — Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│ FAZA 1: Niezalogowany — Dodaj produkty                          │
├─────────────────────────────────────────────────────────────────┤
│ AddToCartButton → useCart() → useCartStore.addItem()             │
│                              ↓                                    │
│                        localStorage ("shopeasy-guest-cart")      │
│                   [Donica x4, Ekspres x3, Mysz x5]              │
└─────────────────────────────────────────────────────────────────┘
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ FAZA 2: Zalogowanie                                              │
├─────────────────────────────────────────────────────────────────┤
│ POST /api/auth/login → setSession()                             │
│                        ↓                                         │
│ useCart() detektuje isLoggedIn = true                           │
│ → mergeGuestCart() [server action]                              │
│   - localStorage → DB (Prisma)                                  │
│   - clearCart() → wyczyszcz localStorage                        │
│ → fetchDbCart() → React state dbItems                           │
└─────────────────────────────────────────────────────────────────┘
            Wynik: DB = [Donica x4, Ekspres x3, Mysz x5]
                   localStorage = [] (wyczyszczone)
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ FAZA 3: Wylogowanie + Nowe produkty                             │
├─────────────────────────────────────────────────────────────────┤
│ POST /api/auth/logout → clearSession()                          │
│ isLoggedIn = false → Guest mode                                 │
│                                                                  │
│ AddToCartButton → useCart() → useCartStore.addItem()            │
│                              ↓                                    │
│                        localStorage (REPLACED)                  │
│                   [Kurtka x2, Słuchawki x3]                     │
│                   (stare produkty zniknęły!)                    │
└─────────────────────────────────────────────────────────────────┘
           DB = [Donica x4, Ekspres x3, Mysz x5] ← zachowane!
           localStorage = [Kurtka x2, Słuchawki x3]
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│ FAZA 4: Zalogowanie ponownie                                    │
├─────────────────────────────────────────────────────────────────┤
│ POST /api/auth/login → setSession()                             │
│ → mergeGuestCart(localStorage)                                  │
│   [Kurtka x2, Słuchawki x3] + [Donica x4, Ekspres x3, Mysz x5] │
│                              ↓                                   │
│                        DB (MERGED)                              │
│            [Donica x4, Ekspres x3, Mysz x5,                     │
│             Kurtka x2, Słuchawki x3]                            │
│            = 17 szt., 3209,83 zł ✅                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## Kluczowe Insights

### ✅ Co działa
1. **Guest Cart Persistence** — produkty z localStorage są scalane do DB przy logowaniu
2. **Sumowanie ilości** — gdy produkt dodawany wielokrotnie, ilości się dodają
3. **Merge wielofazowy** — produkty z różnych faz (przed i po logout) są łączone w DB
4. **Storage splitting** — localStorage przechowuje gościa, DB przechowuje zalogowanych

### ⚠️ Uwagi techniczne
1. **Math.max zamiast sumy** — w `mergeGuestCart()` używa `Math.max()` dla istniejących pozycji
   - Jeśli Donica x4 jest w DB i x2 w localStorage → zostaje x4 (max)
   - W naszym teście to nie wpłynęło (produkty były różne)
   
2. **localStorage REPLACE, nie MERGE** — po wylogowaniu localStorage jest wyczyszczany
   - clearCart() jest wywoływany po mergeGuestCart()
   - Następnie nowe produkty są dodawane do nowego localStorage
   
3. **Asynchroniczny merge** — ~3-5s opóźnienie
   - Dane ładują się z DB asynchronicznie
   - UX: ekran może wyglądać pusty zaraz po logowaniu

4. **BR-01 limit** — max 5 różnych produktów na konto (standard)
   - Guest: limit wdrażany po stronie klienta (currentDistinct.size >= 5)
   - DB: limit wdrażany po stronie serwera (count >= CART_LIMIT)

### 📊 Storage Strategy
- **localStorage** — ephemeral, przechowuje ostatnią sesję gościa
- **Baza danych** — permanent, przechowuje wszystkie produkty zalogowanego użytkownika
- **Merge** — localStorage → DB (kierunek: gość → zalogowany)

---

## Test Validacji

Aby zweryfikować tę mapę, uruchom:

```bash
# 1. Wyloguj
POST /api/auth/logout

# 2. Gość dodaje produkty
addItem(product1)
addItem(product2)

# 3. Zaloguj
POST /api/auth/login

# 4. Sprawdź DB
GET /api/cart  → powinno zwrócić oba produkty

# 5. Wyloguj + nowe produkty
POST /api/auth/logout
addItem(product3)

# 6. Zaloguj
POST /api/auth/login

# 7. Sprawdź
GET /api/cart  → powinno zwrócić: product1, product2, product3
```

---

## Powiązane pliki (nie przeanalizowane, ale istotne)

- `lib/db.ts` — Prisma client
- `lib/validations/auth.ts` — schema walidacji
- `app/api/cart/route.ts` — GET /api/cart endpoint
- `types/index.ts` — definicje CartCookieItem, CartLineItem
- `app/(shop)/cart/page.tsx` — strona koszyka

---

**Wersja**: 1.0  
**Data**: 2026-10-06  
**Status**: ✅ Gotowe do analizy
