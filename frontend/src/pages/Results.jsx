import { useEffect, useState, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import ListingCard from '../components/ListingCard'
import CompareDrawer from '../components/CompareDrawer'
import { cleanModelName } from '../utils/brandLogos'

function FilterSection({ title, options, active, onChange }) {
  return (
    <div className="mb-6">
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">{title}</p>
      <div className="flex flex-col gap-1">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`text-left text-sm px-3 py-2 rounded-lg font-semibold transition-colors ${
              active === opt
                ? 'bg-orange-500 text-white'
                : 'text-gray-500 hover:bg-[#f5f5f5]'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  )
}

function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-8 right-8 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-[#111111] text-white shadow-lg hover:bg-orange-500 transition-colors"
      title="Scroll to top"
    >
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
        <path fillRule="evenodd" d="M14.77 12.79a.75.75 0 01-1.06-.02L10 8.832l-3.71 3.938a.75.75 0 11-1.08-1.04l4.25-4.5a.75.75 0 011.08 0l4.25 4.5a.75.75 0 01-.02 1.06z" clipRule="evenodd" />
      </svg>
    </button>
  )
}

export default function Results() {
  const [searchParams, setSearchParams] = useSearchParams()
  const brand = searchParams.get('brand')
  const model = searchParams.get('model')
  const sort = searchParams.get('sort') || 'price_asc'

  const [allListings, setAllListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeCategory, setActiveCategory] = useState('All')
  const [activeStore, setActiveStore] = useState('All')
  const [compareId, setCompareId] = useState(null)

  useEffect(() => {
    if (!brand || !model) return
    setLoading(true)
    setError(null)
    setActiveCategory('All')
    setActiveStore('All')
    fetch(`/api/search?brand=${encodeURIComponent(brand)}&model=${encodeURIComponent(model)}&sort=${sort}`)
      .then(r => r.json())
      .then(data => { setAllListings(data); setLoading(false) })
      .catch(() => { setError('Failed to load results.'); setLoading(false) })
  }, [brand, model, sort])

  const categories = useMemo(() => {
    const cats = [...new Set(allListings.map(l => l.category?.name).filter(Boolean))].sort()
    return ['All', ...cats]
  }, [allListings])

  const stores = useMemo(() => {
    const s = [...new Set(allListings.map(l => l.store?.name).filter(Boolean))].sort()
    return ['All', ...s]
  }, [allListings])

  const listings = useMemo(() => {
    return allListings.filter(l => {
      if (activeCategory !== 'All' && l.category?.name !== activeCategory) return false
      if (activeStore !== 'All' && l.store?.name !== activeStore) return false
      return true
    })
  }, [allListings, activeCategory, activeStore])

  const setSort = (value) => {
    setSearchParams(prev => { prev.set('sort', value); return prev })
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="mb-8">
        <p className="text-orange-500 text-xs font-bold uppercase tracking-widest mb-1">Parts catalogue</p>
        <h2 className="text-2xl font-black text-[#111111] uppercase tracking-tight">
          {brand} {cleanModelName(brand, model)}
        </h2>
        {!loading && (
          <p className="text-sm text-gray-400 mt-1">
            {listings.length} {listings.length === 1 ? 'result' : 'results'}
          </p>
        )}
      </div>

      <div className="flex gap-12">
        {/* Sidebar filters */}
        <aside className="w-56 shrink-0 sticky top-6 self-start border-r border-gray-200 pr-10">
          <div className="mb-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Sort by price</p>
            <div className="flex flex-col gap-1">
              {[{ val: 'price_asc', label: 'Lowest first' }, { val: 'price_desc', label: 'Highest first' }].map(({ val, label }) => (
                <button
                  key={val}
                  onClick={() => setSort(val)}
                  className={`text-left text-sm px-3 py-2 rounded-lg font-semibold transition-colors ${
                    sort === val
                      ? 'bg-[#111111] text-white'
                      : 'text-gray-500 hover:bg-[#f5f5f5]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {!loading && stores.length > 2 && (
            <FilterSection title="Store" options={stores} active={activeStore} onChange={setActiveStore} />
          )}

          {!loading && categories.length > 1 && (
            <FilterSection title="Category" options={categories} active={activeCategory} onChange={setActiveCategory} />
          )}

          <div className="mt-4 pt-4 border-t border-gray-100">
            <Link to="/" className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-orange-500 transition-colors">
              ← New Search
            </Link>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="bg-[#f5f5f5] rounded-xl p-5 h-52 animate-pulse">
                  <div className="h-3 bg-gray-200 rounded w-1/3 mb-4" />
                  <div className="h-4 bg-gray-200 rounded w-full mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-6" />
                  <div className="h-6 bg-gray-200 rounded w-1/2 mb-4" />
                  <div className="h-9 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          )}

          {error && (
            <div className="text-center py-20 text-red-500 text-sm">{error}</div>
          )}

          {!loading && !error && listings.length === 0 && (
            <div className="text-center py-20">
              <p className="text-2xl font-black text-[#111111] uppercase mb-2">No Results</p>
              <p className="text-gray-400 text-sm mb-6">No listings found for this search.</p>
              <Link to="/" className="inline-block bg-orange-500 text-white text-xs font-bold uppercase tracking-widest px-6 py-3 rounded-lg hover:bg-orange-600 transition-colors">
                New Search
              </Link>
            </div>
          )}

          {!loading && listings.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {listings.map(listing => (
                <ListingCard key={listing.id} listing={listing} onCompare={setCompareId} />
              ))}
            </div>
          )}
        </div>
      </div>

      <ScrollToTop />

      {compareId && (
        <CompareDrawer listingId={compareId} onClose={() => setCompareId(null)} />
      )}
    </div>
  )
}
