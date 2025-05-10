
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Bot, User, Trash, Plus, Loader } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/common/context/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: Date;
}

const AIChatPage: React.FC = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Auto-scroll ketika pesan baru masuk
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentConversation?.messages]);
  
  // Demo messages untuk UI
  useEffect(() => {
    if (!conversations.length) {
      const demoConversation: Conversation = {
        id: '1',
        title: 'Chat baru',
        messages: [
          {
            id: '1',
            role: 'assistant',
            content: 'Halo! Saya adalah AI Assistant. Ada yang bisa saya bantu tentang web development?',
            timestamp: new Date()
          }
        ],
        createdAt: new Date()
      };
      
      setConversations([demoConversation]);
      setCurrentConversation(demoConversation);
    }
  }, []);
  
  // Membuat conversation baru
  const handleNewConversation = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: 'Chat baru',
      messages: [
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Halo! Saya adalah AI Assistant. Ada yang bisa saya bantu tentang web development?',
          timestamp: new Date()
        }
      ],
      createdAt: new Date()
    };
    
    setConversations([newConversation, ...conversations]);
    setCurrentConversation(newConversation);
    setInput('');
  };
  
  // Mengirim pesan
  const handleSendMessage = async () => {
    if (!input.trim() || !currentConversation) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };
    
    // Update conversation dengan pesan user
    const updatedConversation = {
      ...currentConversation,
      messages: [...currentConversation.messages, userMessage]
    };
    
    setCurrentConversation(updatedConversation);
    setInput('');
    setIsLoading(true);
    
    // Simulasi respon AI dengan delay
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Terima kasih atas pertanyaannya. Untuk "${input}", saya sarankan melihat dokumentasi resmi atau artikel terkait di blog kami.`,
        timestamp: new Date()
      };
      
      const conversationWithResponse = {
        ...updatedConversation,
        messages: [...updatedConversation.messages, aiResponse]
      };
      
      setCurrentConversation(conversationWithResponse);
      
      // Update conversations list
      setConversations(conversations.map(conv => 
        conv.id === conversationWithResponse.id ? conversationWithResponse : conv
      ));
      
      setIsLoading(false);
    }, 1500);
  };
  
  // Handle hapus conversation
  const handleDeleteConversation = (id: string) => {
    setConversations(conversations.filter(conv => conv.id !== id));
    
    if (currentConversation?.id === id) {
      const firstConversation = conversations.find(conv => conv.id !== id);
      setCurrentConversation(firstConversation || null);
    }
    
    toast({
      title: "Percakapan dihapus",
      description: "Percakapan telah berhasil dihapus."
    });
  };

  return (
    <div className="relative h-[calc(100vh-12rem)]">
      <h1 className="text-3xl font-bold mb-6">AI Chat Assistant</h1>
      
      <div className="grid grid-cols-12 gap-4 h-full">
        {/* Sidebar conversations */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="col-span-12 md:col-span-4 lg:col-span-3"
        >
          <Card className="h-[calc(100vh-18rem)]">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle>Percakapan</CardTitle>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleNewConversation}
                  title="Percakapan baru"
                >
                  <Plus size={16} />
                </Button>
              </div>
              <CardDescription>Riwayat chat Anda</CardDescription>
            </CardHeader>
            <CardContent className="p-2">
              <ScrollArea className="h-[calc(100vh-25rem)]">
                <div className="space-y-2">
                  {conversations.map(conversation => (
                    <div
                      key={conversation.id}
                      className={`flex justify-between items-center p-2 rounded-lg cursor-pointer hover:bg-accent ${currentConversation?.id === conversation.id ? 'bg-accent' : ''}`}
                      onClick={() => setCurrentConversation(conversation)}
                    >
                      <div className="truncate">
                        <p className="font-medium">{conversation.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(conversation.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-50 hover:opacity-100"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteConversation(conversation.id);
                        }}
                      >
                        <Trash size={14} />
                      </Button>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Main chat area */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="col-span-12 md:col-span-8 lg:col-span-9"
        >
          <Card className="h-[calc(100vh-18rem)] flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle>{currentConversation?.title || 'Chat baru'}</CardTitle>
              <CardDescription>
                Tanyakan apa saja tentang web development, design, atau teknologi lainnya
              </CardDescription>
            </CardHeader>
            
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4 px-1">
                {currentConversation?.messages.map(message => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`flex items-start gap-3 ${
                      message.role === 'assistant' ? '' : 'flex-row-reverse'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                      message.role === 'assistant' ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                    }`}>
                      {message.role === 'assistant' ? <Bot size={18} /> : <User size={18} />}
                    </div>
                    
                    <div className={`px-4 py-2 rounded-lg max-w-[80%] ${
                      message.role === 'assistant' 
                        ? 'bg-card border border-border' 
                        : 'bg-primary text-primary-foreground'
                    }`}>
                      <p className="text-sm">{message.content}</p>
                      <div className="mt-1 text-xs opacity-70 text-right">
                        {new Date(message.timestamp).toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                    </div>
                  </motion.div>
                ))}
                
                {isLoading && (
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 bg-primary text-primary-foreground">
                      <Bot size={18} />
                    </div>
                    <div className="bg-card border border-border px-4 py-2 rounded-lg">
                      <div className="flex items-center gap-2">
                        <Loader size={16} className="animate-spin" />
                        <p className="text-sm">AI sedang mengetik...</p>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
            
            <CardFooter className="border-t mt-auto p-4">
              <form 
                className="flex items-end w-full gap-2" 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
              >
                <Textarea
                  placeholder="Tulis pesan Anda di sini..."
                  className="flex-1 min-h-[60px] resize-none"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  disabled={isLoading || !input.trim()}
                  className="h-[60px] w-[60px]"
                >
                  <Send className={isLoading ? 'opacity-50' : ''} />
                </Button>
              </form>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default AIChatPage;
