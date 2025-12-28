import { memo } from 'react'
import PropTypes from 'prop-types'
import { motion } from 'framer-motion'
import './PageLoader.css'

const PageLoader = memo(function PageLoader({ text = 'Yuklanmoqda...' }) {
  return (
    <div className="page-loader" role="status" aria-label={text} aria-live="polite">
      <motion.div 
        className="loader-content"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div 
          className="loader-spinner"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        />
        <motion.div 
          className="loader-dots"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {[0, 0.2, 0.4].map((delay, i) => (
            <motion.span
              key={i}
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay }}
            >●</motion.span>
          ))}
        </motion.div>
        <p className="loader-text">{text}</p>
      </motion.div>
    </div>
  )
})

PageLoader.propTypes = {
  text: PropTypes.string
}

export default PageLoader
