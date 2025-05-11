
import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Search, User, Clock, ArrowRight } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '@/common/context/AuthContext';

// Type definition for chat conversation
interface ChatConversation {
  id: string;
  user_id: string;
  last_message: string | null;
  updated_at: string;
  created_at?: string;
  profiles: {
    username: string | null;
    full_name: string | null;
  }[];
}

// Type definition for chat message
interface ChatMessage {
  id: string;
  content: string;
  created_at: string;
  role: 'admin' | 'user';
  user_id: string | null;
}

const AdminChatPanel: React.FC = () => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<ChatConversation[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedConversation, setSelectedConversation] = useState<ChatConversation | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<string>('all');
  
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
            profiles:user_id(username, full_name)
          `)
          .order('updated_at', { ascending: false });

        if (error) {
          throw error;
        }

        // Convert the data to the appropriate type
        const conversationsData = data as unknown as ChatConversation[];
        setConversations(conversationsData);
        setFilteredConversations(conversationsData);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching conversations:', error);
        toast({
          title: "Error",
          description: "Failed to load conversations. Please try again later.",
          variant: "destructive",
        });
        setIsLoading(false);
      }
    };

    fetchConversations();

    // Set up real-time subscription for new conversations
    const channel = supabase
      .channel('admin-conversations')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'ai_chat_conversations',
        },
        (payload) => {
          // Reload conversations when changes occur
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  // Filter conversations based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredConversations(conversations);
    } else {
      const filtered = conversations.filter(conv => {
        const username = conv.profiles[0]?.username?.toLowerCase() || '';
        const fullName = conv.profiles[0]?.full_name?.toLowerCase() || '';
        const term = searchTerm.toLowerCase();
        return username.includes(term) || fullName.includes(term);
      });
      setFilteredConversations(filtered);
    }
  }, [searchTerm, conversations]);

  // Filter conversations based on active tab
  useEffect(() => {
    if (activeTab === 'all') {
      setFilteredConversations(conversations);
    } else {
      // Implement other filters based on tab
      // For example, 'unread', 'recent', etc.
      setFilteredConversations(conversations);
    }
  }, [activeTab, conversations]);

  // Fetch chat messages when selecting a conversation
  useEffect(() => {
    if (selectedConversation) {
      const fetchMessages = async () => {
        try {
          const { data, error } = await supabase
            .from('ai_chat_history')
            .select('*')
            .eq('conversation_id', selectedConversation.id)
            .order('created_at', { ascending: true });

          if (error) {
            throw error;
          }

          setChatMessages(data as ChatMessage[]);
        } catch (error) {
          console.error('Error fetching messages:', error);
          toast({
            title: "Error",
            description: "Failed to load messages. Please try again later.",
            variant: "destructive",
          });
        }
      };

      fetchMessages();

      // Set up real-time subscription for messages
      const channel = supabase
        .channel(`conversation-${selectedConversation.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'ai_chat_history',
            filter: `conversation_id=eq.${selectedConversation.id}`,
          },
          (payload) => {
            const newMessage = payload.new as ChatMessage;
            setChatMessages(prevMessages => [...prevMessages, newMessage]);
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [selectedConversation, toast]);

  // Auto-scroll to the latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSendMessage = async () => {
    if (!selectedConversation || !newMessage.trim() || !user) {
      return;
    }

    setIsSending(true);

    try {
      // Insert message
      const { error: messageError } = await supabase
        .from('ai_chat_history')
        .insert({
          conversation_id: selectedConversation.id,
          content: newMessage.trim(),
          role: 'admin',
          user_id: user.id,
        });

      if (messageError) {
        throw messageError;
      }

      // Update last_message in conversation
      const { error: conversationError } = await supabase
        .from('ai_chat_conversations')
        .update({ 
          last_message: newMessage.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedConversation.id);

      if (conversationError) {
        throw conversationError;
      }

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSendMessage();
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U';
    return name.charAt(0).toUpperCase();
  };

  const formatTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch (error) {
      return 'unknown time';
    }
  };

  return (
    <Card className="flex flex-col h-[calc(100vh-16rem)]">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle>Admin Chat Panel</CardTitle>
          <Badge variant="outline" className="flex items-center">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            Online
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-grow overflow-hidden pb-0 space-x-2">
        {/* Conversations List */}
        <div className="w-1/3 border-r pr-2 flex flex-col">
          <div className="pb-3">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search conversations..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          
          <Tabs 
            value={activeTab} 
            onValueChange={setActiveTab}
            className="mb-2"
          >
            <TabsList className="w-full">
              <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
              <TabsTrigger value="unread" className="flex-1">Unread</TabsTrigger>
              <TabsTrigger value="recent" className="flex-1">Recent</TabsTrigger>
            </TabsList>
          </Tabs>

          <ScrollArea className="flex-grow pr-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="mx-auto h-8 w-8 mb-2" />
                <p>No conversations found</p>
              </div>
            ) : (
              filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`p-3 mb-2 rounded-lg cursor-pointer ${
                    selectedConversation?.id === conv.id
                      ? 'bg-primary/10 border border-primary/50'
                      : 'hover:bg-secondary'
                  }`}
                  onClick={() => setSelectedConversation(conv)}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar>
                      <AvatarFallback>
                        {getInitials(conv.profiles[0]?.username || conv.profiles[0]?.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-grow min-w-0">
                      <div className="flex justify-between">
                        <span className="font-medium truncate">
                          {conv.profiles[0]?.full_name || conv.profiles[0]?.username || 'Unknown User'}
                        </span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatTime(conv.updated_at)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {conv.last_message || 'No messages yet'}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className="w-2/3 flex flex-col">
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="pb-3 border-b mb-3 flex justify-between items-center">
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-2">
                    <AvatarFallback>
                      {getInitials(
                        selectedConversation.profiles[0]?.username || 
                        selectedConversation.profiles[0]?.full_name
                      )}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">
                      {selectedConversation.profiles[0]?.full_name || 
                       selectedConversation.profiles[0]?.username || 
                       'Unknown User'}
                    </h3>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>Last active {formatTime(selectedConversation.updated_at)}</span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="sm">
                  <User className="h-4 w-4 mr-1" />
                  Profile
                </Button>
              </div>

              {/* Chat Messages */}
              <ScrollArea className="flex-grow pr-4 mb-3">
                <div className="space-y-4 pb-4">
                  {chatMessages.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <MessageSquare className="mx-auto h-8 w-8 mb-2" />
                      <p>No messages yet</p>
                      <p className="text-sm">Start the conversation by sending a message.</p>
                    </div>
                  ) : (
                    chatMessages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === 'admin' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-3/4 rounded-lg p-3 ${
                            message.role === 'admin'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary'
                          }`}
                        >
                          <p>{message.content}</p>
                          <div className="text-xs mt-1 opacity-70 text-right">
                            {formatTime(message.created_at)}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="border-t pt-3">
                <div className="flex items-center space-x-2">
                  <Input
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyPress}
                    disabled={isSending}
                    className="flex-grow"
                  />
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={!newMessage.trim() || isSending}
                    className={isSending ? 'opacity-70' : ''}
                  >
                    {isSending ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent border-white mr-2"></div>
                    ) : (
                      <Send className="h-4 w-4 mr-2" />
                    )}
                    Send
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <MessageSquare className="h-16 w-16 mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">Welcome to Admin Chat</h3>
              <p className="text-muted-foreground mb-4 max-w-sm">
                Select a conversation from the list to view messages and respond to users.
              </p>
              <Button variant="outline" className="flex items-center">
                <ArrowRight className="h-4 w-4 mr-2" />
                Select a conversation
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminChatPanel;
