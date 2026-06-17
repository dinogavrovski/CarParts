export default function About() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col">
      <div className="bg-[#111111] px-6 py-16 text-center">
        <p className="text-orange-500 text-xs font-semibold tracking-[0.2em] uppercase mb-4">About</p>
        <h1 className="text-white text-4xl font-black uppercase tracking-tight">CarParts MK</h1>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-14">
        <p className="text-[#111111] text-base leading-relaxed mb-5">
          CarParts MK is a search aggregator for automotive parts in North Macedonia.
          Instead of visiting multiple websites, you search once and see results from
          all supported stores in a single view.
        </p>
        <p className="text-gray-500 text-sm leading-relaxed mb-5">
          Select your vehicle brand, model, and the part category you need — we pull
          listings from stores like Delmak and Delovi and let you compare prices and
          availability at a glance.
        </p>
        <p className="text-gray-500 text-sm leading-relaxed">
          No payments are processed here. Clicking <strong className="text-[#111111]">Visit Store</strong> takes
          you directly to the original product page to complete your purchase.
        </p>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-xs text-gray-300 uppercase tracking-widest">
            University portfolio project — React · Node.js · Prisma · SQLite
          </p>
        </div>
      </div>
    </div>
  )
}
