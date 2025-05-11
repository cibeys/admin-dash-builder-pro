
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/common/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Send, RefreshCw, User, Bot, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';

// Define types for our chat objects
type ChatConversation = {
  id: string;
  user_id: string;
  last_message: string | null;
  created_at: string;
  updated_at: string;
  profiles?: {
    username: string | null;
    full_name: string | null;
  };
};

type ChatMessage = {
  id: string;
  conversation_id: string;
  content: string;
  role: 'user' | 'admin';
  created_at: string;
  user_id?: string | null;
};

const AdminChatPanel: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load conversations
  const loadConversations = async () => {
    try {
      setLoadingConversations(true);
      
      // Get all conversations as admin
      const { data, error } = await supabase
        .from('ai_chat_conversations')
        .select(`
          id, 
          user_id,
          last_message,
          updated_at,
          profiles(username, full_name)
        `)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error loading conversations:', error);
        toast.error('Failed to load conversations');
        return;
      }

      if (data) {
        setConversations(data as ChatConversation[]);
        
        // Auto-select the first conversation if none is selected
        if (data.length > 0 && !selectedConversation) {
          setSelectedConversation(data[0].id);
          loadMessages(data[0].id);
        }
      }
    } catch (err) {
      console.error('Error loading conversations:', err);
      toast.error('Failed to load conversations');
    } finally {
      setLoadingConversations(false);
    }
  };

  // Load messages for a specific conversation
  const loadMessages = async (conversationId: string) => {
    try {
      setLoadingMessages(true);
      
      const { data, error } = await supabase
        .from('ai_chat_history')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading messages:', error);
        toast.error('Failed to load messages');
        return;
      }

      if (data) {
        setMessages(data as ChatMessage[]);
      }
    } catch (err) {
      console.error('Error loading messages:', err);
      toast.error('Failed to load messages');
    } finally {
      setLoadingMessages(false);
    }
  };

  // Send a message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageInput.trim() || !selectedConversation || !user) return;
    
    const newMessage = {
      conversation_id: selectedConversation,
      content: messageInput.trim(),
      role: 'admin' as const,
      user_id: user.id
    };
    
    try {
      // Add the message to the database
      const { data: messageData, error: messageError } = await supabase
        .from('ai_chat_history')
        .insert(newMessage)
        .select()
        .single();

      if (messageError) {
        console.error('Error sending message:', messageError);
        toast.error('Failed to send message');
        return;
      }
      
      // Update the conversation's last message and timestamp
      const { error: conversationError } = await supabase
        .from('ai_chat_conversations')
        .update({ 
          last_message: messageInput.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedConversation);

      if (conversationError) {
        console.error('Error updating conversation:', conversationError);
        toast.error('Failed to update conversation');
      }

      // Add the new message to the messages array
      if (messageData) {
        setMessages(prev => [...prev, messageData as ChatMessage]);
      }
      
      // Clear the input
      setMessageInput('');
      
      // Scroll to bottom
      scrollToBottom();
      
      // Refresh the conversation list to update the order
      loadConversations();
      
    } catch (err) {
      console.error('Error in chat interaction:', err);
      toast.error('Failed to process chat interaction');
    }
  };
  
  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  // Setup subscription for real-time updates
  useEffect(() => {
    const setupSubscription = async () => {
      // Subscribe to new messages
      const messagesChannel = supabase
        .channel('admin-chat-messages')
        .on('postgres_changes', 
          {
            event: 'INSERT',
            schema: 'public',
            table: 'ai_chat_history'
          }, 
          (payload) => {
            const newMessage = payload.new as ChatMessage;
            if (newMessage.conversation_id === selectedConversation) {
              setMessages(prev => [...prev, newMessage]);
              scrollToBottom();
            }
          }
        )
        .subscribe();
        
      // Subscribe to conversation updates
      const conversationsChannel = supabase
        .channel('admin-chat-conversations')
        .on('postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'ai_chat_conversations'
          },
          () => {
            loadConversations();
          }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(messagesChannel);
        supabase.removeChannel(conversationsChannel);
      };
    };
    
    setupSubscription();
  }, [selectedConversation]);

  // Initial load
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Filter conversations based on search query
  const filteredConversations = conversations.filter(conversation => {
    const username = conversation.profiles?.username || '';
    const fullName = conversation.profiles?.full_name || '';
    const lastMessage = conversation.last_message || '';
    
    return (
      username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Function to refresh conversations
  const handleRefresh = () => {
    loadConversations();
    if (selectedConversation) {
      loadMessages(selectedConversation);
    }
    toast.success('Refreshed conversations');
  };

  // Function to handle conversation selection
  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversation(conversationId);
    loadMessages(conversationId);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Admin Chat</h2>
        <Button variant="outline" size="sm" onClick={handleRefresh}>
          <RefreshCw size={16} className="mr-2" />
          Refresh
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
        {/* Conversations list */}
        <Card className="p-4 h-full">
          <div className="flex items-center gap-2 mb-4">
            <Search className="w-4 h-4 opacity-50" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9"
            />
          </div>
          
          <ScrollArea className="h-[calc(100%-3rem)]">
            {loadingConversations ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center space-x-4 p-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-4 w-[160px]" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredConversations.length > 0 ? (
              <div className="space-y-1">
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation.id}
                    className={`flex items-start space-x-3 p-3 rounded-md cursor-pointer ${
                      selectedConversation === conversation.id
                        ? 'bg-secondary'
                        : 'hover:bg-secondary/50'
                    }`}
                    onClick={() => handleSelectConversation(conversation.id)}
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <User size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline">
                        <p className="font-medium truncate">
                          {conversation.profiles?.full_name || conversation.profiles?.username || 'Anonymous User'}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(conversation.updated_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-1">
                        {conversation.last_message || 'No messages yet'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <MessageSquareText className="h-12 w-12 text-muted-foreground mb-2" />
                <h3 className="font-medium text-lg">No conversations</h3>
                <p className="text-muted-foreground text-sm">
                  {searchQuery ? 'No conversations match your search' : 'Wait for users to start chatting'}
                </p>
              </div>
            )}
          </ScrollArea>
        </Card>
        
        {/* Chat area */}
        <Card className="p-4 lg:col-span-2 flex flex-col h-full">
          {selectedConversation ? (
            <>
              {/* Messages */}
              <ScrollArea className="flex-1 pr-4">
                {loadingMessages ? (
                  <div className="space-y-4 py-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="flex flex-col space-y-2">
                        <Skeleton className="h-10 w-full max-w-md" />
                        <Skeleton className="h-20 w-full max-w-md self-end" />
                      </div>
                    ))}
                  </div>
                ) : messages.length > 0 ? (
                  <div className="space-y-4 py-4">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${
                          message.role === 'admin' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`px-4 py-2 rounded-lg max-w-[80%] ${
                            message.role === 'admin'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1 text-xs opacity-70">
                            {message.role === 'admin' ? (
                              <>
                                <span>Admin</span>
                                <Bot size={12} />
                              </>
                            ) : (
                              <>
                                <User size={12} />
                                <span>User</span>
                              </>
                            )}
                            <span>•</span>
                            <span>{formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}</span>
                          </div>
                          <p className="whitespace-pre-wrap">{message.content}</p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <MessageSquareText className="h-12 w-12 text-muted-foreground mb-2" />
                    <h3 className="font-medium text-lg">No messages yet</h3>
                    <p className="text-muted-foreground text-sm">
                      Send a message to start the conversation
                    </p>
                  </div>
                )}
              </ScrollArea>

              {/* Message input */}
              <form onSubmit={handleSendMessage} className="mt-4 flex items-center space-x-2">
                <Input
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1"
                />
                <Button type="submit" disabled={!messageInput.trim()}>
                  <Send size={18} className="mr-2" />
                  Send
                </Button>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <MessageSquareText className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="font-medium text-xl">Select a conversation</h3>
              <p className="text-muted-foreground mt-2">
                Choose a conversation from the list to start chatting
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default AdminChatPanel;
