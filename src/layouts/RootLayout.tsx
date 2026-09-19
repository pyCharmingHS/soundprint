import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import LanguagePicker from '../components/LanguagePicker'
import PageTransition from '../components/PageTransition'
import WorkInProgressBadge from '../components/WorkInProgressBadge'
import { useLocale } from '../i18n/LocaleContext'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm tracking-wide transition-colors ${
    isActive ? 'text-gold' : 'text-muted hover:text-foreground'
  }`

function RootLayout() {
  const { t } = useLocale()

  useEffect(() => {
    document.title = t('pantheon.title')
  }, [t])

  return (
    <div className="flex min-h-svh flex-col">
      <nav className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
        <div className="flex items-center gap-6">
          <NavLink to="/" end className={navLinkClass}>
            {t('nav.home')}
          </NavLink>
          <NavLink to="/pantheon" className={navLinkClass}>
            {t('nav.pantheon')}
          </NavLink>
          <span className="flex items-center gap-1.5">
            <NavLink to="/statistics" className={navLinkClass}>
              {t('nav.statistics')}
            </NavLink>
            <WorkInProgressBadge className="hidden sm:inline-flex" />
          </span>
        </div>
        <LanguagePicker />
      </nav>
      <main className="flex flex-1 flex-col">
        <PageTransition />
      </main>
    </div>
  )
}

export default RootLayout
