
import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const AdminChatButton: React.FC = () => {
  return (
    <TooltipProvider>
      <Tooltip>
        <motion.div
          className="fixed bottom-6 right-6 z-50"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            type: "spring",
            stiffness: 260,
            damping: 20,
            delay: 1 
          }}
        >
          <TooltipTrigger asChild>
            <Link to="/tools/ai-chat">
              <Button 
                size="lg" 
                className="rounded-full h-14 w-14 shadow-lg bg-gradient-to-r from-indigo-500 to-blue-600 hover:from-indigo-600 hover:to-blue-700"
                aria-label="Chat dengan Admin"
              >
                <MessageSquare 
                  className="text-white" 
                  size={24} 
                />
                <span className="sr-only">Chat dengan Admin</span>
              </Button>
            </Link>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Chat dengan Admin</p>
          </TooltipContent>
        </motion.div>
      </Tooltip>
    </TooltipProvider>
  );
};

export default AdminChatButton;
