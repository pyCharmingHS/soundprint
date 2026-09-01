import { AnimatePresence, motion } from 'framer-motion'
import { useLocation, useOutlet } from 'react-router-dom'
import { fadeIn } from '../animations/variants'

function PageTransition() {
  const location = useLocation()
  const outlet = useOutlet()

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
        {outlet}
      </motion.div>
    </AnimatePresence>
  )
}

export default PageTransition
