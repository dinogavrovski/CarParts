import { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import ListingCard from '../components/ListingCard'

export default function Results() {
  const [searchParams, setSearchParams] = useSearchParams()
  const brand = searchParams.get('brand')
  const model = searchParams.get('model')
  const category = searchParams.get('category')
  const sort = searchParams.get('sort') || 'price_asc'

  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!brand || !model || !category) return
    setLoading(true)
    setError(null)
    fetch(`/api/search?brand=${encodeURIComponent(brand)}&model=${encodeURIComponent(model)}&category=${encodeURIComponent(category)}&sort=${sort}`)
      .then(r => r.json())
      .then(data => { setListings(data); setLoading(false) })
      .catch(() => { setError('Failed to load results.'); setLoading(false) })
  }, [brand, model, category, sort])

  const setSort = (value) => {
    setSearchParams(prev => { prev.set('sort', value); return prev })
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900">
            {category} — {brand} {model}
          </h2>
          {!loading && (
            <p className="text-sm text-gray-500 mt-0.5">
              {listings.length} {listings.length === 1 ? 'result' : 'results'} found
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Sort:</span>
          <button
            onClick={() => setSort('price_asc')}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
              sort === 'price_asc'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
            }`}
          >
            Lowest Price
          </button>
          <button
            onClick={() => setSort('price_desc')}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
              sort === 'price_desc'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
            }`}
          >
            Highest Price
          </button>
        </div>
      </div>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-5 h-44 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-3/4 mb-3" />
              <div className="h-4 bg-gray-100 rounded w-1/2 mb-6" />
              <div className="h-7 bg-gray-100 rounded w-1/3 mb-4" />
              <div className="h-9 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="text-center py-16 text-red-500 text-sm">{error}</div>
      )}

      {!loading && !error && listings.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500 text-sm">No listings found for this search.</p>
          <Link to="/" className="mt-4 inline-block text-blue-600 text-sm hover:underline">
            Try a different search
          </Link>
        </div>
      )}

      {!loading && listings.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {listings.map(listing => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}

      <div className="mt-8">
        <Link to="/" className="text-sm text-blue-600 hover:underline">
          ← New search
        </Link>
      </div>
    </div>
  )
}
