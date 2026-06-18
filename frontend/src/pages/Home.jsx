import SearchForm from '../components/SearchForm'

export default function Home() {
  return (
    <div className="h-screen overflow-hidden flex flex-col">
      {/* Hero — extends behind the transparent navbar (pt accounts for navbar height) */}
      <div
        className="relative px-6 pt-28 pb-16 flex flex-col items-center text-center"
        style={{ backgroundImage: 'url(/hero.jpg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center 40%' }}
      >
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10">
          <p className="text-orange-500 text-xs font-semibold tracking-[0.2em] uppercase mb-4">
            North Macedonia's Auto Parts Search
          </p>
          <h1 className="text-white text-4xl sm:text-5xl font-black uppercase tracking-tight leading-tight mb-3">
            Find The Right<br />
            <span className="text-orange-500">Car Part</span> Fast
          </h1>
          <p className="text-gray-400 text-sm max-w-sm mt-2">
            Search across multiple Macedonian stores and compare prices in one place.
          </p>
        </div>
      </div>

      {/* Search card */}
      <div className="flex-1 flex items-start justify-center px-4 -mt-6 relative z-30">
        <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-base font-bold text-[#111111] uppercase tracking-wider mb-6">
            Select Your Vehicle & Part
          </h2>
          <SearchForm />
        </div>
      </div>

    </div>
  )
}
