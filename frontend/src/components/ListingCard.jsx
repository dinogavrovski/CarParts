export default function ListingCard({ listing, onCompare }) {
  const { title, price, currency, availability, productUrl, store, imageUrl } = listing

  const inStock = availability?.toLowerCase().includes('залиха') ||
                  availability?.toLowerCase().includes('stock') ||
                  availability?.toLowerCase() === 'in stock'

  return (
    <div className="bg-[#f5f5f5] rounded-xl overflow-hidden flex flex-col hover:shadow-lg transition-shadow group">
      {/* Product image */}
      <div className="bg-white flex items-center justify-center h-44 px-4">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="h-36 w-full object-contain"
            onError={e => { e.target.parentElement.innerHTML = '<span class="text-gray-300 text-xs">No image</span>' }}
          />
        ) : (
          <span className="text-gray-300 text-xs">No image</span>
        )}
      </div>

      {/* Info */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <span className="text-xs text-gray-400 font-medium uppercase tracking-wider">{store?.name}</span>

        <h3 className="text-sm font-bold text-[#111111] leading-snug line-clamp-2">{title}</h3>

        <div className="flex items-center justify-between mt-auto pt-1">
          <span className="text-lg font-black text-[#111111]">
            {price.toLocaleString()} <span className="text-sm font-semibold text-gray-400">{currency}</span>
          </span>
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            inStock ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-600'
          }`}>
            {inStock ? 'In Stock' : 'On Order'}
          </span>
        </div>

        <div className="flex gap-2 mt-1">
          <a
            href={productUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center rounded-lg bg-[#111111] px-4 py-2.5 text-xs font-bold text-white uppercase tracking-widest hover:bg-orange-500 transition-colors"
          >
            Visit Store
          </a>
          <button
            onClick={() => onCompare(listing.id)}
            className="px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-xs font-bold text-gray-500 uppercase tracking-widest hover:border-orange-500 hover:text-orange-500 transition-colors"
            title="Compare prices"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
