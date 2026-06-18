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

  const isHome = pathname === '/'

  return (
    <header className={`${isHome ? 'absolute top-0 left-0 right-0 z-20 bg-black/10 backdrop-blur-sm' : 'bg-[#111111]'}`}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/">
          <img src={isHome ? '/logo.png' : '/logoblack.png'} alt="CarParts MK" className="h-16 w-auto object-contain" />
        </Link>
        <nav className="flex gap-8">
          {link('/', 'Search')}
          {link('/about', 'About')}
        </nav>
      </div>
    </header>
  )
}
