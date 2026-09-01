import { NavLink } from 'react-router-dom'
import PageTransition from '../components/PageTransition'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm tracking-wide transition-colors ${
    isActive ? 'text-gold' : 'text-muted hover:text-foreground'
  }`

function RootLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <nav className="flex items-center gap-6 border-b border-border px-6 py-4">
        <NavLink to="/" end className={navLinkClass}>
          Home
        </NavLink>
        <NavLink to="/pantheon" className={navLinkClass}>
          Pantheon
        </NavLink>
        <NavLink to="/statistics" className={navLinkClass}>
          Statistics
        </NavLink>
      </nav>
      <main className="flex flex-1 flex-col">
        <PageTransition />
      </main>
    </div>
  )
}

export default RootLayout
