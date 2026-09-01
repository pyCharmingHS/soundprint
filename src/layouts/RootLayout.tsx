import { NavLink, Outlet } from 'react-router-dom'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  isActive ? 'font-semibold' : 'text-neutral-500 hover:text-neutral-900'

function RootLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <nav className="flex gap-4 p-4">
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
        <Outlet />
      </main>
    </div>
  )
}

export default RootLayout
