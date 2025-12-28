import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AskTeacherChat from './AskTeacherChat';
import './ChatButton.css';

const ChatButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(true);

  const handleOpen = () => {
    setIsOpen(true);
    setHasNewMessage(false);
  };

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            className="chat-fab"
            onClick={handleOpen}
            aria-label="O'qituvchiga savol berish"
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <span className="chat-fab-icon">💬</span>
            {hasNewMessage && <span className="chat-fab-badge" />}
            
            {/* Tooltip */}
            <span className="chat-fab-tooltip">O'qituvchiga savol</span>
          </motion.button>
        )}
      </AnimatePresence>

      <AskTeacherChat isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default ChatButton;
