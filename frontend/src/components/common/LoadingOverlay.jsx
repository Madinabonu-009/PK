/**
 * Loading Overlay Component
 * Issue #31: Loading states for pages
 */

import { memo } from 'react'
import PropTypes from 'prop-types'
import './LoadingOverlay.css'

function LoadingOverlay({ 
  isLoading = false, 
  message = '', 
  fullScreen = false,
  transparent = false,
  children 
}) {
  if (!isLoading) return children || null

  return (
    <div className={`loading-overlay ${fullScreen ? 'fullscreen' : ''} ${transparent ? 'transparent' : ''}`}>
      <div className="loading-content">
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <span className="spinner-emoji">🐼</span>
        </div>
        {message && <p className="loading-message">{message}</p>}
      </div>
    </div>
  )
}

LoadingOverlay.propTypes = {
  isLoading: PropTypes.bool,
  message: PropTypes.string,
  fullScreen: PropTypes.bool,
  transparent: PropTypes.bool,
  children: PropTypes.node
}

export default memo(LoadingOverlay)
