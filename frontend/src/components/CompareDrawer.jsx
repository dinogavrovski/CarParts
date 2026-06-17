import { useEffect, useState } from 'react'

function PriceRow({ listing, isSource }) {
  const inStock = listing.availability?.toLowerCase().includes('залиха') ||
                  listing.availability?.toLowerCase().includes('stock')

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl transition-colors ${isSource ? 'bg-orange-50 border border-orange-200' : 'bg-[#f5f5f5]'}`}>
      {/* Image */}
      <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
        {listing.imageUrl
          ? <img src={listing.imageUrl} alt="" className="w-full h-full object-contain" onError={e => e.target.style.display='none'} />
          : <span className="text-gray-300 text-xs">—</span>
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          {listing.store?.logoUrl && (
            <img src={listing.store.logoUrl} alt="" className="h-3.5 object-contain" onError={e => e.target.style.display='none'} />
          )}
          <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">{listing.store?.name}</span>
          {isSource && <span className="text-[10px] bg-orange-500 text-white font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full">Viewing</span>}
        </div>
        <p className="text-xs text-[#111111] font-medium leading-snug line-clamp-2 mb-1.5">{listing.title}</p>
        <div className="flex items-center justify-between">
          <span className="text-base font-black text-[#111111]">
            {listing.price.toLocaleString()} <span className="text-xs font-semibold text-gray-400">{listing.currency}</span>
          </span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${inStock ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
            {inStock ? 'In Stock' : 'On Order'}
          </span>
        </div>
      </div>

      {/* Visit */}
      <a
        href={listing.productUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 mt-1 text-[10px] font-bold uppercase tracking-wider bg-[#111111] text-white px-3 py-2 rounded-lg hover:bg-orange-500 transition-colors"
      >
        Visit
      </a>
    </div>
  )
}

export default function CompareDrawer({ listingId, onClose }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!listingId) return
    setLoading(true)
    fetch(`/api/similar/${listingId}`)
      .then(r => r.json())
      .then(d => { setData(d); setLoading(false) })
      .catch(() => setLoading(false))
  }, [listingId])

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div>
            <h2 className="text-sm font-black text-[#111111] uppercase tracking-tight">Compare Prices</h2>
            {data && !loading && (
              <p className="text-xs text-gray-400 mt-0.5">
                {data.matches.length === 0
                  ? 'No matches in other stores yet'
                  : `${data.matches.length} match${data.matches.length !== 1 ? 'es' : ''} found`}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-[#111111]"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-3">
          {loading && (
            <>
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-[#f5f5f5] rounded-xl animate-pulse" />
              ))}
            </>
          )}

          {!loading && data && (
            <>
              {/* Source listing */}
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Selected item</p>
              <PriceRow listing={data.source} isSource />

              {data.matches.length > 0 && (
                <>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-3 mb-1">
                    Same part — other stores
                  </p>
                  {data.matches.map(m => <PriceRow key={m.id} listing={m} />)}
                </>
              )}

              {data.matches.length === 0 && (
                <div className="mt-6 text-center">
                  <p className="text-sm font-bold text-[#111111] mb-1">Only one store for now</p>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    Once more stores are scraped, matching listings will appear here automatically.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}
