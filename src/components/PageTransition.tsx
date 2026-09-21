import { AnimatePresence, motion } from 'framer-motion'
import { Route, Routes, useLocation } from 'react-router-dom'
import { fadeIn } from '../animations/variants'
import HomePage from '../pages/HomePage'
import PantheonPage from '../pages/PantheonPage'
import SongDetailPage from '../pages/SongDetailPage'
import StatisticsPage from '../pages/StatisticsPage'

/**
 * Owns the actual page routing (rather than router.tsx) specifically so it
 * can pin `<Routes location={location}>` to the location captured at render
 * time. Framer Motion's exit animation keeps the outgoing page mounted for
 * ~0.6s — with the routing left to react-router-dom's own <Outlet /> (which
 * always resolves against the *live*, already-updated URL), that outgoing
 * page's useSearchParams()/useParams() would flip over to the *new* route's
 * values mid fade-out. On the Pantheon page that showed up as the active
 * category/genre appearing to reset to "everything" for an instant while
 * navigating away. Passing an explicit `location` prop sidesteps this: it's
 * a plain prop on an already-committed element, not a live subscription, so
 * the exiting page keeps resolving against the URL it was actually shown at.
 */
function PageTransition() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        exit="hidden"
        className="flex flex-1 flex-col"
      >
        <Routes location={location}>
          <Route index element={<HomePage />} />
          <Route path="pantheon" element={<PantheonPage />} />
          <Route path="song/:id" element={<SongDetailPage />} />
          <Route path="statistics" element={<StatisticsPage />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  )
}

export default PageTransition
