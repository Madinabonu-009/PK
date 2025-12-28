import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import pushService from '../../services/pushNotificationService';
import './PushNotificationToggle.css';

const PushNotificationToggle = () => {
  const [status, setStatus] = useState({
    supported: false,
    permission: 'default',
    subscribed: false
  });
  const [loading, setLoading] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    const currentStatus = await pushService.getSubscriptionStatus();
    setStatus(currentStatus);
  };

  const handleToggle = async () => {
    if (!status.supported) {
      alert('Brauzeringiz push xabarlarni qo\'llab-quvvatlamaydi');
      return;
    }

    setLoading(true);

    try {
      if (status.subscribed) {
        // Unsubscribe
        await pushService.unsubscribe();
        setStatus(prev => ({ ...prev, subscribed: false }));
      } else {
        // Subscribe
        const permission = await pushService.requestPermission();
        
        if (permission === 'granted') {
          await pushService.subscribeToPush();
          setStatus(prev => ({ ...prev, permission: 'granted', subscribed: true }));
          
          // Test notification
          pushService.showLocalNotification('🎉 Xabarlar yoqildi!', {
            body: 'Endi muhim xabarlarni olasiz',
            tag: 'welcome'
          });
        } else if (permission === 'denied') {
          alert('Xabarlar bloklangan. Brauzer sozlamalaridan ruxsat bering.');
          setStatus(prev => ({ ...prev, permission: 'denied' }));
        }
      }
    } catch (error) {
      console.error('Toggle error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!status.supported) return null;

  return (
    <div 
      className="push-toggle-container"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <motion.button
        className={`push-toggle-btn ${status.subscribed ? 'active' : ''} ${status.permission === 'denied' ? 'denied' : ''}`}
        onClick={handleToggle}
        disabled={loading || status.permission === 'denied'}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {loading ? (
          <span className="loading-spinner">⏳</span>
        ) : status.subscribed ? (
          <span className="bell-icon active">🔔</span>
        ) : status.permission === 'denied' ? (
          <span className="bell-icon denied">🔕</span>
        ) : (
          <span className="bell-icon">🔕</span>
        )}
      </motion.button>

      <AnimatePresence>
        {showTooltip && (
          <motion.div
            className="push-tooltip"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            {status.permission === 'denied' 
              ? 'Xabarlar bloklangan'
              : status.subscribed 
                ? 'Xabarlar yoqilgan'
                : 'Xabarlarni yoqish'
            }
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PushNotificationToggle;
