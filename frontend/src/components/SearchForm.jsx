import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function SearchForm() {
  const navigate = useNavigate()

  const [brands, setBrands] = useState([])
  const [models, setModels] = useState([])
  const [categories, setCategories] = useState([])

  const [brand, setBrand] = useState('')
  const [model, setModel] = useState('')
  const [category, setCategory] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/brands').then(r => r.json()).then(setBrands)
    fetch('/api/categories').then(r => r.json()).then(setCategories)
  }, [])

  useEffect(() => {
    if (!brand) { setModels([]); setModel(''); return }
    fetch(`/api/models/${encodeURIComponent(brand)}`)
      .then(r => r.json())
      .then(data => { setModels(data); setModel('') })
  }, [brand])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!brand || !model || !category) return
    setLoading(true)
    navigate(`/results?brand=${encodeURIComponent(brand)}&model=${encodeURIComponent(model)}&category=${encodeURIComponent(category)}`)
  }

  const selectClass = "w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Brand</label>
        <select className={selectClass} value={brand} onChange={e => setBrand(e.target.value)}>
          <option value="">Select brand</option>
          {brands.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Model</label>
        <select className={selectClass} value={model} onChange={e => setModel(e.target.value)} disabled={!brand}>
          <option value="">Select model</option>
          {models.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Part Category</label>
        <select className={selectClass} value={category} onChange={e => setCategory(e.target.value)}>
          <option value="">Select category</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <button
        type="submit"
        disabled={!brand || !model || !category || loading}
        className="mt-2 w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {loading ? 'Searching...' : 'Search Parts'}
      </button>
    </form>
  )
}
