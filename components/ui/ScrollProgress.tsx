'use client'

import { motion, useScroll, useSpring } from 'framer-motion'

export default function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  // useSpring smooths the raw scroll fraction so the bar doesn't feel
  // jittery on fast/trackpad scrolling.
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 200,
    damping: 30,
    restDelta: 0.001,
  })

  return (
    <motion.div
      style={{
        scaleX,
        backgroundImage:
          'linear-gradient(to right, var(--gradient-from), var(--gradient-via), var(--gradient-to))',
      }}
      className="fixed top-0 left-0 right-0 h-[2px] origin-left z-[60]"
      aria-hidden="true"
    />
  )
}
