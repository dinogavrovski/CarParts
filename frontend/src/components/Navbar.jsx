import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const { pathname } = useLocation()

  const link = (to, label) => (
    <Link
      to={to}
      className={`text-sm font-medium transition-colors ${
        pathname === to
          ? 'text-blue-600'
          : 'text-gray-500 hover:text-gray-900'
      }`}
    >
      {label}
    </Link>
  )

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="font-semibold text-gray-900 text-base tracking-tight">
          CarParts <span className="text-blue-600">MK</span>
        </Link>
        <nav className="flex gap-6">
          {link('/', 'Search')}
          {link('/about', 'About')}
        </nav>
      </div>
    </header>
  )
}
