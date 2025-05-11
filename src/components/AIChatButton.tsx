
import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquareText } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

const AIChatButton: React.FC = () => {
  return (
    <Link to="/tools/ai-chat" className="fixed bottom-6 right-6 z-50">
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button size="lg" className="rounded-full h-14 w-14 shadow-lg bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700">
          <MessageSquareText size={24} />
          <span className="sr-only">Chat dengan AI</span>
        </Button>
      </motion.div>
    </Link>
  );
};

export default AIChatButton;
