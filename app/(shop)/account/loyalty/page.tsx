export default function LoyaltyPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Program lojalnościowy</h1>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
        <p className="font-semibold text-amber-800 mb-2">⚠️ Funkcja w przygotowaniu</p>
        <p className="text-amber-700 text-sm">
          Program lojalnościowy ShopEasy jest aktualnie w fazie projektowania.
          Szczegółowe informacje zostaną opublikowane wkrótce.
        </p>
      </div>

      <div className="bg-white border rounded-xl p-6 space-y-4">
        <h2 className="font-semibold">Twoje punkty</h2>
        <div className="text-4xl font-bold text-gray-300">—</div>
        <p className="text-sm text-gray-500">Saldo punktów niedostępne</p>
      </div>
    </div>
  )
}
