import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const { pathname } = useLocation()

  const link = (to, label) => (
    <Link
      to={to}
      className={`text-sm font-medium transition-colors ${
        pathname === to
          ? 'text-orange-500'
          : 'text-gray-400 hover:text-white'
      }`}
    >
      {label}
    </Link>
  )

  return (
    <header className="bg-[#111111]">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="text-white font-bold text-lg tracking-widest uppercase">
          Car<span className="text-orange-500">Parts</span> MK
        </Link>
        <nav className="flex gap-8">
          {link('/', 'Search')}
          {link('/about', 'About')}
        </nav>
      </div>
    </header>
  )
}
