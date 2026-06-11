export default function About() {
  return (
    <div className="max-w-xl mx-auto px-4 py-16">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">About CarParts MK</h1>
      <p className="text-gray-600 text-sm leading-relaxed mb-4">
        CarParts MK is a search aggregator for automotive parts in North Macedonia.
        Instead of visiting multiple websites, you search once and see results from
        all supported stores in a single view.
      </p>
      <p className="text-gray-600 text-sm leading-relaxed mb-4">
        Select your vehicle brand, model, and the part category you need — we'll
        pull live listings from stores like Delmak and Delovi and let you compare
        prices and availability at a glance.
      </p>
      <p className="text-gray-600 text-sm leading-relaxed">
        No payments are processed here. Clicking <strong>Visit Store</strong> takes
        you directly to the original product page to complete your purchase.
      </p>

      <div className="mt-10 pt-8 border-t border-gray-200">
        <p className="text-xs text-gray-400">
          University portfolio project — built with React, Node.js, and Prisma.
        </p>
      </div>
    </div>
  )
}
