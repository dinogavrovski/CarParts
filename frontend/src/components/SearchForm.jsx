import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { getLogoUrl, splitModelYear } from '../utils/brandLogos'

function BrandSelect({ brands, value, onChange }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const logo = value ? getLogoUrl(value) : null

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-2 rounded-lg border border-gray-200 bg-[#f5f5f5] px-4 py-3 text-sm text-left focus:outline-none focus:ring-2 focus:ring-orange-500"
      >
        {logo && <img src={logo} alt="" className="w-7 h-7 object-contain shrink-0" />}
        <span className={value ? 'text-[#111111]' : 'text-gray-400'}>{value || 'Select brand'}</span>
        <svg className="ml-auto w-4 h-4 text-gray-400 shrink-0" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
        </svg>
      </button>
      {open && (
        <ul className="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {brands.map(b => {
            const bLogo = getLogoUrl(b)
            return (
              <li key={b}>
                <button
                  type="button"
                  onClick={() => { onChange(b); setOpen(false) }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-orange-50 text-left transition-colors ${value === b ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-[#111111]'}`}
                >
                  {bLogo
                    ? <img src={bLogo} alt="" className="w-10 h-10 object-contain shrink-0" onError={e => e.target.style.display='none'} />
                    : <span className="w-10 h-10 shrink-0" />}
                  {b}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

export default function SearchForm() {
  const navigate = useNavigate()

  const [brands, setBrands] = useState([])
  const [rawModels, setRawModels] = useState([])   // full model names from API

  const [brand, setBrand] = useState('')
  const [baseModel, setBaseModel] = useState('')   // e.g. "FOCUS"
  const [year, setYear] = useState('')             // e.g. "98-04"

  // Derived: unique base model names
  const baseModels = [...new Set(
    rawModels.map(m => splitModelYear(brand, m).base)
  )].sort()

  // Derived: unique year variants for selected base model (deduplicated across stores)
  const yearVariants = [...new Map(
    rawModels
      .map(m => splitModelYear(brand, m))
      .filter(m => m.base === baseModel && m.year !== null)
      .map(m => [m.year, m])
  ).values()].sort((a, b) => a.year.localeCompare(b.year))

  // Normalized model string to send to the API — backend does fuzzy matching
  const selectedFullModel = year ? `${baseModel} ${year}` : baseModel

  useEffect(() => {
    fetch('/api/brands').then(r => r.json()).then(setBrands)
  }, [])

  useEffect(() => {
    if (!brand) { setRawModels([]); setBaseModel(''); setYear(''); return }
    fetch(`/api/models/${encodeURIComponent(brand)}`)
      .then(r => r.json())
      .then(setRawModels)
    setBaseModel('')
    setYear('')
  }, [brand])

  useEffect(() => {
    setYear('')
  }, [baseModel])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!brand || !selectedFullModel) return
    navigate(`/results?brand=${encodeURIComponent(brand)}&model=${encodeURIComponent(selectedFullModel)}`)
  }

  const selectClass = "w-full rounded-lg border border-gray-200 bg-[#f5f5f5] px-4 py-3 pr-10 text-sm text-[#111111] focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-40 disabled:cursor-not-allowed appearance-none"

  const SelectArrow = () => (
    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
      <svg className="w-4 h-4 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
      </svg>
    </div>
  )

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Brand */}
      <div>
        <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Brand</label>
        <BrandSelect brands={brands} value={brand} onChange={setBrand} />
      </div>

      {/* Model */}
      <div>
        <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Model</label>
        <div className="relative">
          <select className={selectClass} value={baseModel} onChange={e => setBaseModel(e.target.value)} disabled={!brand}>
            <option value="">{brand ? 'Select model' : 'Select a brand first'}</option>
            {baseModels.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <SelectArrow />
        </div>
      </div>

      {/* Year */}
      <div>
        <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-widest">Year</label>
        <div className="relative">
          <select className={selectClass} value={year} onChange={e => setYear(e.target.value)} disabled={!baseModel}>
            <option value="">{!baseModel ? 'Select a model first' : yearVariants.length === 0 ? 'All years' : 'Select year range'}</option>
            {yearVariants.map(v => <option key={v.year} value={v.year}>{v.year}</option>)}
          </select>
          <SelectArrow />
        </div>
      </div>

      <button
        type="submit"
        disabled={!brand || !baseModel}
        className="mt-2 w-full rounded-lg bg-orange-500 px-4 py-3.5 text-sm font-bold text-white uppercase tracking-widest hover:bg-orange-600 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Find Parts
      </button>
    </form>
  )
}
