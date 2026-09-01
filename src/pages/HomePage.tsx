import { motion } from 'framer-motion'
import { fadeUp, staggerContainer } from '../animations/variants'

function HomePage() {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center"
    >
      <motion.h1
        variants={fadeUp}
        className="text-5xl tracking-tight sm:text-7xl"
      >
        THE PANTHEON
      </motion.h1>
      <motion.p variants={fadeUp} className="max-w-md text-lg text-muted italic">
        I don't have a favorite song.
        <br />
        <span className="text-foreground not-italic">I have several.</span>
      </motion.p>
    </motion.div>
  )
}

export default HomePage
