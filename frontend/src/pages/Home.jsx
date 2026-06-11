import SearchForm from '../components/SearchForm'

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-3.5rem)] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
            Find Car Parts in Macedonia
          </h1>
          <p className="mt-2 text-gray-500 text-sm">
            Search across multiple stores and compare prices in one place.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <SearchForm />
        </div>
      </div>
    </div>
  )
}
