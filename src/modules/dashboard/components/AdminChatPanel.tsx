
import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/common/context/AuthContext';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription,
  CardFooter 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, User, Send, Clock, RefreshCw, Search } from "lucide-react";

// Define types for Chat functionality
interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'admin';
  created_at: string;
  conversation_id: string;
  user_id?: string;
}

interface ChatConversation {
  id: string;
  user_id: string;
  last_message: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    username: string;
    full_name: string;
  }[];
}

interface ChatPanelProps {}

export const AdminChatPanel: React.FC<ChatPanelProps> = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageSubscription = useRef<any>(null);

  // Subscribe to new messages when a conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      // Clean up previous subscription if exists
      if (messageSubscription.current) {
        supabase.removeChannel(messageSubscription.current);
      }

      // Set up new subscription for real-time messages
      messageSubscription.current = supabase
        .channel(`chat-${selectedConversation}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'ai_chat_history',
            filter: `conversation_id=eq.${selectedConversation}`
          },
          (payload) => {
            const newMsg = payload.new as ChatMessage;
            setMessages(prev => [...prev, newMsg]);
          }
        )
        .subscribe();

      // Load existing messages for this conversation
      loadMessages(selectedConversation);
    }

    // Cleanup subscription on unmount or when conversation changes
    return () => {
      if (messageSubscription.current) {
        supabase.removeChannel(messageSubscription.current);
      }
    };
  }, [selectedConversation]);

  // Fetch conversations from Supabase
  useEffect(() => {
    fetchConversations();
    
    // Set up subscription for new conversations or updates to existing ones
    const conversationsChannel = supabase
      .channel('public:ai_chat_conversations')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ai_chat_conversations' },
        () => {
          fetchConversations();
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(conversationsChannel);
    };
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
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

      // Cast the data to match our type
      const typedData = data as unknown as ChatConversation[];
      setConversations(typedData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive"
      });
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ai_chat_history')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        throw error;
      }

      setMessages(data as ChatMessage[]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load chat messages",
        variant: "destructive"
      });
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation || !user) return;

    try {
      const messageContent = newMessage.trim();
      setNewMessage('');

      // Add message to the database
      const { error } = await supabase
        .from('ai_chat_history')
        .insert({
          content: messageContent,
          role: 'admin',
          conversation_id: selectedConversation,
          user_id: user.id
        });

      if (error) throw error;

      // Update last message in conversation
      await supabase
        .from('ai_chat_conversations')
        .update({
          last_message: messageContent,
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedConversation);

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
      console.error('Error sending message:', error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchConversations();
    if (selectedConversation) {
      await loadMessages(selectedConversation);
    }
    setRefreshing(false);
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery) return true;
    
    const username = conv.profiles?.[0]?.username || '';
    const fullName = conv.profiles?.[0]?.full_name || '';
    
    return (
      username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.last_message.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <Card className="w-full h-[calc(100vh-13rem)] overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center">
            <MessageSquare className="mr-2 h-5 w-5" />
            <span>Admin Chat</span>
          </div>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="sr-only">Refresh</span>
          </Button>
        </CardTitle>
        <CardDescription>
          Kelola percakapan dengan pengguna
        </CardDescription>
      </CardHeader>
      
      <Tabs defaultValue="all" className="h-[calc(100%-5rem)]">
        <div className="px-4 pb-2">
          <TabsList className="w-full">
            <TabsTrigger value="all" className="flex-1">
              Semua Chat
            </TabsTrigger>
            <TabsTrigger value="recent" className="flex-1">
              Terbaru
            </TabsTrigger>
            <TabsTrigger value="unread" className="flex-1">
              Belum Dijawab
            </TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="all" className="h-full p-0 mt-0">
          <div className="flex h-full">
            {/* Conversations List */}
            <div className="w-1/3 border-r border-border h-full flex flex-col">
              <div className="p-3 border-b border-border">
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Cari percakapan..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <ScrollArea className="flex-1">
                {loading && !filteredConversations.length ? (
                  <div className="p-6 text-center text-muted-foreground">
                    <p>Loading conversations...</p>
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="p-6 text-center text-muted-foreground">
                    <MessageSquare className="h-10 w-10 mx-auto mb-2 opacity-20" />
                    <p>Tidak ada percakapan yang ditemukan</p>
                  </div>
                ) : (
                  filteredConversations.map((conv) => (
                    <div
                      key={conv.id}
                      className={`p-3 cursor-pointer hover:bg-secondary/50 border-b border-border ${
                        selectedConversation === conv.id ? 'bg-secondary' : ''
                      }`}
                      onClick={() => setSelectedConversation(conv.id)}
                    >
                      <div className="flex items-center">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src="" />
                          <AvatarFallback>
                            {(conv.profiles?.[0]?.username || 'U')[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-3 flex-1 overflow-hidden">
                          <p className="font-medium">
                            {conv.profiles?.[0]?.full_name || conv.profiles?.[0]?.username || 'User'}
                          </p>
                          <p className="text-sm text-muted-foreground truncate">
                            {conv.last_message || 'No messages yet'}
                          </p>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {format(new Date(conv.updated_at), 'HH:mm')}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </ScrollArea>
            </div>
            
            {/* Chat Messages */}
            <div className="w-2/3 flex flex-col h-full">
              {selectedConversation ? (
                <>
                  {/* Chat header */}
                  <div className="p-3 border-b border-border bg-card">
                    {conversations.find(c => c.id === selectedConversation)?.profiles && (
                      <div className="flex items-center">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {(conversations.find(c => c.id === selectedConversation)?.profiles?.[0]?.username || 'U')[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="ml-3">
                          <p className="font-medium">
                            {conversations.find(c => c.id === selectedConversation)?.profiles?.[0]?.full_name || 
                             conversations.find(c => c.id === selectedConversation)?.profiles?.[0]?.username || 'User'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    {messages.length === 0 ? (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                          <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-20" />
                          <p>Belum ada pesan dalam percakapan ini</p>
                        </div>
                      </div>
                    ) : (
                      messages.map((message) => (
                        <div
                          key={message.id}
                          className={`mb-4 flex ${
                            message.role === 'admin' ? 'justify-end' : 'justify-start'
                          }`}
                        >
                          <div
                            className={`max-w-[80%] rounded-lg px-4 py-2 ${
                              message.role === 'admin'
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-secondary'
                            }`}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              {message.role === 'user' ? (
                                <User className="h-4 w-4" />
                              ) : (
                                <MessageSquare className="h-4 w-4" />
                              )}
                              <span className="text-xs font-medium">
                                {message.role === 'admin' ? 'Admin' : 'User'}
                              </span>
                            </div>
                            <p>{message.content}</p>
                            <div className="text-right mt-1">
                              <span className="text-xs opacity-70">
                                {format(new Date(message.created_at), 'HH:mm')}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                    <div ref={messagesEndRef} />
                  </ScrollArea>
                  
                  {/* Message input */}
                  <div className="p-3 border-t border-border">
                    <form onSubmit={handleSendMessage} className="flex gap-2">
                      <Input
                        placeholder="Ketik pesan..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        className="flex-1"
                      />
                      <Button type="submit" disabled={!newMessage.trim()}>
                        <Send className="h-4 w-4 mr-2" />
                        Kirim
                      </Button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  <div className="text-center">
                    <MessageSquare className="h-16 w-16 mx-auto mb-4 opacity-20" />
                    <h3 className="text-lg font-medium mb-1">Belum ada percakapan yang dipilih</h3>
                    <p>Pilih percakapan dari daftar di sebelah kiri untuk mulai mengobrol</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="recent" className="h-full p-0 mt-0">
          <div className="p-6 h-full flex items-center justify-center text-muted-foreground">
            <p>Percakapan terbaru akan ditampilkan di sini</p>
          </div>
        </TabsContent>
        
        <TabsContent value="unread" className="h-full p-0 mt-0">
          <div className="p-6 h-full flex items-center justify-center text-muted-foreground">
            <p>Percakapan yang belum dijawab akan ditampilkan di sini</p>
          </div>
        </TabsContent>
      </Tabs>
      
      <CardFooter className="border-t border-border p-3">
        <p className="text-xs text-muted-foreground">
          Admin dapat mengelola semua percakapan dengan pengguna di sini
        </p>
      </CardFooter>
    </Card>
  );
};
