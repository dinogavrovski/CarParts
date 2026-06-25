import { useEffect, useState } from 'react'

function PriceChart({ listingId }) {
  const [history, setHistory] = useState([])

  useEffect(() => {
    fetch(`/api/price-history/${listingId}`)
      .then(r => r.json())
      .then(setHistory)
      .catch(() => {})
  }, [listingId])

  if (history.length < 2) return null

  const prices = history.map(h => h.price)
  const min = Math.min(...prices)
  const max = Math.max(...prices)
  const range = max - min || 1
  const W = 300, H = 60, PAD = 4

  const points = history.map((h, i) => {
    const x = PAD + (i / (history.length - 1)) * (W - PAD * 2)
    const y = PAD + ((max - h.price) / range) * (H - PAD * 2)
    return `${x},${y}`
  }).join(' ')

  const latest = prices[prices.length - 1]
  const first = prices[0]
  const pctChange = (((latest - first) / first) * 100).toFixed(1)
  const isDown = latest <= first

  return (
    <div className="mt-3 p-3 bg-[#f5f5f5] rounded-xl">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Price History</span>
        <span className={`text-[10px] font-bold ${isDown ? 'text-green-600' : 'text-red-500'}`}>
          {isDown ? '▼' : '▲'} {Math.abs(pctChange)}% since first record
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-14">
        <polyline
          points={points}
          fill="none"
          stroke={isDown ? '#16a34a' : '#f97316'}
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {history.map((h, i) => {
          const x = PAD + (i / (history.length - 1)) * (W - PAD * 2)
          const y = PAD + ((max - h.price) / range) * (H - PAD * 2)
          return <circle key={i} cx={x} cy={y} r="2.5" fill={isDown ? '#16a34a' : '#f97316'} />
        })}
      </svg>
      <div className="flex justify-between text-[10px] text-gray-400 mt-1">
        <span>{new Date(history[0].recordedAt).toLocaleDateString()}</span>
        <span>{new Date(history[history.length - 1].recordedAt).toLocaleDateString()}</span>
      </div>
    </div>
  )
}

function AlertForm({ listingId, currentPrice }) {
  const [email, setEmail] = useState('')
  const [targetPrice, setTargetPrice] = useState('')
  const [status, setStatus] = useState(null) // 'success' | 'error' | null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus(null)
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, listingId, targetPrice: parseFloat(targetPrice) }),
      })
      if (res.ok) setStatus('success')
      else setStatus('error')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="mt-3 p-3 bg-green-50 rounded-xl border border-green-200">
        <p className="text-xs font-bold text-green-700">
          ✓ Alert set! We'll email you when the price drops below {parseFloat(targetPrice).toLocaleString()} MKD.
        </p>
      </div>
    )
  }

  return (
    <div className="mt-3 p-3 bg-[#f5f5f5] rounded-xl">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
        🔔 Price Alert — current: {currentPrice.toLocaleString()} MKD
      </p>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2">
        <input
          type="email"
          required
          placeholder="your@email.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full text-xs rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
        />
        <div className="flex gap-2">
          <input
            type="number"
            required
            placeholder={`Target price (MKD)`}
            value={targetPrice}
            onChange={e => setTargetPrice(e.target.value)}
            min="1"
            max={currentPrice - 1}
            className="flex-1 text-xs rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            type="submit"
            className="bg-orange-500 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
          >
            Set
          </button>
        </div>
        {status === 'error' && <p className="text-[10px] text-red-500">Something went wrong. Try again.</p>}
      </form>
    </div>
  )
}

function PriceRow({ listing, isSource }) {
  const inStock = listing.availability?.toLowerCase().includes('залиха') ||
                  listing.availability?.toLowerCase().includes('stock')

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl transition-colors ${isSource ? 'bg-orange-50 border border-orange-200' : 'bg-[#f5f5f5]'}`}>
      <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
        {listing.imageUrl
          ? <img src={listing.imageUrl} alt="" className="w-full h-full object-contain" onError={e => e.target.style.display='none'} />
          : <span className="text-gray-300 text-xs">—</span>
        }
      </div>
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
      <div className="fixed inset-0 bg-black/30 z-40 transition-opacity" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col">
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
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Selected item</p>
              <PriceRow listing={data.source} isSource />
              <PriceChart listingId={data.source.id} />
              <AlertForm listingId={data.source.id} currentPrice={data.source.price} />

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
