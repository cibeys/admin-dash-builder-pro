
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/common/context/AuthContext';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { SendIcon, RefreshCw } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/components/ui/use-toast';

interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'admin';
  created_at: string;
  user_id: string;
  conversation_id: string;
}

interface Conversation {
  id: string;
  user_id: string;
  last_message?: string;
  updated_at: string;
  user?: {
    username?: string;
    avatar_url?: string;
  };
}

const AdminChatPanel: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Fetch conversations
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const { data, error } = await supabase
          .from('ai_chat_conversations')
          .select(`
            id, 
            user_id, 
            last_message,
            updated_at,
            profiles:user_id (username, avatar_url)
          `)
          .order('updated_at', { ascending: false });
          
        if (error) throw error;
        
        if (data) {
          // Format the conversations data
          const formattedData = data.map(conv => ({
            id: conv.id,
            user_id: conv.user_id,
            last_message: conv.last_message,
            updated_at: conv.updated_at,
            user: conv.profiles
          }));
          
          setConversations(formattedData);
          
          // Automatically select the first conversation if none is selected
          if (formattedData.length > 0 && !activeConversation) {
            setActiveConversation(formattedData[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching conversations:', error);
        toast({
          title: "Error",
          description: "Failed to load conversations",
          variant: "destructive"
        });
      }
    };
    
    fetchConversations();
    
    // Set up a subscription for new conversations
    const conversationsSubscription = supabase
      .channel('ai_chat_conversations_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public', 
        table: 'ai_chat_conversations'
      }, () => {
        fetchConversations();
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(conversationsSubscription);
    };
  }, [toast]);
  
  // Fetch messages for active conversation
  useEffect(() => {
    if (!activeConversation) return;
    
    const fetchMessages = async () => {
      setLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('ai_chat_history')
          .select('*')
          .eq('conversation_id', activeConversation)
          .order('created_at', { ascending: true });
          
        if (error) throw error;
        if (data) setMessages(data as ChatMessage[]);
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast({
          title: "Error",
          description: "Failed to load chat messages",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchMessages();
    
    // Set up a subscription for messages in this conversation
    const messagesSubscription = supabase
      .channel(`ai_chat_history_${activeConversation}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'ai_chat_history',
        filter: `conversation_id=eq.${activeConversation}`
      }, (payload) => {
        setMessages(prev => [...prev, payload.new as ChatMessage]);
      })
      .subscribe();
      
    return () => {
      supabase.removeChannel(messagesSubscription);
    };
  }, [activeConversation, toast]);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !activeConversation || !user) return;
    
    try {
      const messageData = {
        content: newMessage,
        conversation_id: activeConversation,
        user_id: user.id,
        role: 'admin'
      };
      
      // Add to database
      const { error } = await supabase
        .from('ai_chat_history')
        .insert(messageData);
        
      if (error) throw error;
      
      // Update last_message in the conversation
      await supabase
        .from('ai_chat_conversations')
        .update({ 
          last_message: newMessage,
          updated_at: new Date().toISOString()
        })
        .eq('id', activeConversation);
      
      // Clear input
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    }
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: 'short',
    }).format(date);
  };
  
  const getConversationUserName = (conversation: Conversation) => {
    return conversation.user?.username || `User ${conversation.user_id.slice(0, 5)}...`;
  };
  
  return (
    <Card className="h-[calc(100vh-200px)] flex flex-col">
      <CardHeader className="p-4 border-b">
        <CardTitle className="text-lg">Admin Chat</CardTitle>
      </CardHeader>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Conversations Sidebar */}
        <div className="w-1/3 border-r">
          <div className="flex justify-between items-center p-3 border-b">
            <h3 className="font-medium">Conversations</h3>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                // Refresh conversations list
                const fetchConversations = async () => {
                  try {
                    const { data, error } = await supabase
                      .from('ai_chat_conversations')
                      .select(`
                        id, 
                        user_id, 
                        last_message,
                        updated_at,
                        profiles:user_id (username, avatar_url)
                      `)
                      .order('updated_at', { ascending: false });
                      
                    if (error) throw error;
                    
                    if (data) {
                      setConversations(data.map(conv => ({
                        id: conv.id,
                        user_id: conv.user_id,
                        last_message: conv.last_message,
                        updated_at: conv.updated_at,
                        user: conv.profiles
                      })));
                    }
                  } catch (error) {
                    console.error('Error refreshing conversations:', error);
                    toast({
                      title: "Error",
                      description: "Failed to refresh conversations",
                      variant: "destructive"
                    });
                  }
                };
                
                fetchConversations();
              }}
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          
          <ScrollArea className="h-[calc(100vh-280px)]">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No conversations yet
              </div>
            ) : (
              <div className="divide-y">
                {conversations.map(conversation => (
                  <div
                    key={conversation.id}
                    className={`p-3 hover:bg-muted/50 cursor-pointer ${
                      activeConversation === conversation.id ? 'bg-muted' : ''
                    }`}
                    onClick={() => setActiveConversation(conversation.id)}
                  >
                    <div className="flex items-center space-x-2">
                      <Avatar>
                        {conversation.user?.avatar_url ? (
                          <AvatarImage src={conversation.user.avatar_url} />
                        ) : (
                          <AvatarFallback>
                            {getConversationUserName(conversation).charAt(0).toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">
                          {getConversationUserName(conversation)}
                        </p>
                        <p className="text-sm text-muted-foreground truncate">
                          {conversation.last_message || 'No messages'}
                        </p>
                      </div>
                      <div className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(conversation.updated_at)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
        
        {/* Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {activeConversation ? (
            <>
              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                {loading ? (
                  <div className="flex justify-center items-center h-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                    <p>No messages in this conversation yet.</p>
                    <p className="text-sm mt-1">Send a message to start chatting!</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message) => (
                      <div 
                        key={message.id}
                        className={`flex ${message.role === 'admin' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div 
                          className={`max-w-[70%] rounded-lg p-3 ${
                            message.role === 'admin' 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted'
                          }`}
                        >
                          <div className="text-sm mb-1">
                            <Badge variant={message.role === 'admin' ? "outline" : "secondary"} className="text-xs">
                              {message.role === 'admin' ? 'Admin' : 'User'}
                            </Badge>
                            <span className="text-xs ml-2 opacity-70">{formatDate(message.created_at)}</span>
                          </div>
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </ScrollArea>
              
              {/* Message Input */}
              <CardFooter className="p-3 border-t">
                <form onSubmit={handleSendMessage} className="flex w-full space-x-2">
                  <Input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type your message here..."
                    className="flex-1"
                  />
                  <Button type="submit" disabled={!newMessage.trim()}>
                    <SendIcon className="h-4 w-4 mr-2" />
                    Send
                  </Button>
                </form>
              </CardFooter>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
              <p className="text-lg font-medium">Select a conversation</p>
              <p className="mt-1">Choose a conversation from the list to view messages.</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default AdminChatPanel;
