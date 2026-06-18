export default function ListingCard({ listing, onCompare }) {
  const { title, price, currency, availability, productUrl, store, imageUrl } = listing

  const inStock = availability?.toLowerCase().includes('залиха') ||
                  availability?.toLowerCase().includes('stock') ||
                  availability?.toLowerCase() === 'in stock'

  return (
    <div className="bg-[#f5f5f5] rounded-xl overflow-hidden flex flex-col hover:shadow-lg transition-shadow group">
      {/* Product image — only render block when there's an image URL */}
      {imageUrl && (
        <div className="bg-white flex items-center justify-center h-44 px-4">
          <img
            src={imageUrl}
            alt={title}
            className="h-36 w-full object-contain"
            onError={e => { e.target.style.display = 'none' }}
          />
        </div>
      )}

      {/* Info */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{store?.name}</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
            inStock ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-600'
          }`}>
            {inStock ? 'In Stock' : 'On Order'}
          </span>
        </div>

        <h3 className="text-sm font-bold text-[#111111] leading-snug line-clamp-2 flex-1">{title}</h3>

        <span className="text-xl font-black text-[#111111] mt-auto">
          {price.toLocaleString()} <span className="text-sm font-semibold text-gray-400">{currency}</span>
        </span>

        <div className="flex gap-2 mt-1">
          <a
            href={productUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 text-center rounded-lg bg-orange-500 px-4 py-2.5 text-xs font-bold text-white uppercase tracking-widest hover:bg-orange-600 transition-colors"
          >
            Visit Store
          </a>
          <button
            onClick={() => onCompare(listing.id)}
            className="px-3 py-2.5 rounded-lg border border-gray-200 bg-white text-xs font-bold text-gray-400 hover:border-orange-500 hover:text-orange-500 transition-colors"
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
