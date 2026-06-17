import { useEffect, useState, useMemo } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import ListingCard from '../components/ListingCard'
import CompareDrawer from '../components/CompareDrawer'
import { cleanModelName } from '../utils/brandLogos'

export default function Results() {
  const [searchParams, setSearchParams] = useSearchParams()
  const brand = searchParams.get('brand')
  const model = searchParams.get('model')
  const sort = searchParams.get('sort') || 'price_asc'

  const [allListings, setAllListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeCategory, setActiveCategory] = useState('All')
  const [compareId, setCompareId] = useState(null)

  useEffect(() => {
    if (!brand || !model) return
    setLoading(true)
    setError(null)
    fetch(`/api/search?brand=${encodeURIComponent(brand)}&model=${encodeURIComponent(model)}&sort=${sort}`)
      .then(r => r.json())
      .then(data => { setAllListings(data); setLoading(false) })
      .catch(() => { setError('Failed to load results.'); setLoading(false) })
  }, [brand, model, sort])

  // Derive categories from results
  const categories = useMemo(() => {
    const cats = [...new Set(allListings.map(l => l.category?.name).filter(Boolean))].sort()
    return ['All', ...cats]
  }, [allListings])

  // Filter by active category
  const listings = useMemo(() => {
    if (activeCategory === 'All') return allListings
    return allListings.filter(l => l.category?.name === activeCategory)
  }, [allListings, activeCategory])

  const setSort = (value) => {
    setSearchParams(prev => { prev.set('sort', value); return prev })
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      {/* Header */}
      <div className="flex items-start justify-between mb-6 flex-wrap gap-4">
        <div>
          <p className="text-orange-500 text-xs font-bold uppercase tracking-widest mb-1">Parts catalogue</p>
          <h2 className="text-2xl font-black text-[#111111] uppercase tracking-tight">
            {brand} {cleanModelName(brand, model)}
          </h2>
          {!loading && (
            <p className="text-sm text-gray-400 mt-1">
              {listings.length} {listings.length === 1 ? 'result' : 'results'}
              {activeCategory !== 'All' ? ` in ${activeCategory}` : ''}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400 font-medium uppercase tracking-widest mr-1">Sort:</span>
          {['price_asc', 'price_desc'].map((val) => (
            <button
              key={val}
              onClick={() => setSort(val)}
              className={`text-xs px-4 py-2 rounded-lg font-bold uppercase tracking-wider transition-colors ${
                sort === val
                  ? 'bg-[#111111] text-white'
                  : 'bg-[#f5f5f5] text-gray-500 hover:bg-gray-200'
              }`}
            >
              {val === 'price_asc' ? 'Lowest' : 'Highest'}
            </button>
          ))}
        </div>
      </div>

      {/* Category filter chips */}
      {!loading && categories.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`text-xs px-4 py-2 rounded-full font-bold uppercase tracking-wider transition-colors ${
                activeCategory === cat
                  ? 'bg-orange-500 text-white'
                  : 'bg-[#f5f5f5] text-gray-500 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {listings.map(listing => (
            <ListingCard key={listing.id} listing={listing} onCompare={setCompareId} />
          ))}
        </div>
      )}

      {compareId && (
        <CompareDrawer listingId={compareId} onClose={() => setCompareId(null)} />
      )}

      <div className="mt-10">
        <Link to="/" className="text-xs font-bold text-gray-400 uppercase tracking-widest hover:text-orange-500 transition-colors">
          ← New Search
        </Link>
      </div>
    </div>
  )
}
