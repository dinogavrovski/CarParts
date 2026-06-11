export default function ListingCard({ listing }) {
  const { title, price, currency, availability, productUrl, store } = listing

  const inStock = availability?.toLowerCase().includes('залиха') ||
                  availability?.toLowerCase().includes('stock') ||
                  availability?.toLowerCase() === 'in stock'

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-medium text-gray-900 leading-snug">{title}</h3>
        <span className={`shrink-0 text-xs font-medium px-2 py-1 rounded-full ${
          inStock ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'
        }`}>
          {inStock ? 'In Stock' : 'On Order'}
        </span>
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xl font-bold text-gray-900">
          {price.toLocaleString()} {currency}
        </span>
        <span className="text-xs text-gray-400">{store?.name}</span>
      </div>

      <a
        href={productUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-auto w-full text-center rounded-lg border border-blue-600 px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
      >
        Visit Store
      </a>
    </div>
  )
}
