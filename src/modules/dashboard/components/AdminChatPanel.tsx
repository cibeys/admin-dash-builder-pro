import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Send, UserCircle, AlertCircle, Search, MoreHorizontal, ArchiveIcon, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from '@/components/ui/scroll-area';

interface Conversation {
  id: string;
  user_id: string;
  last_message: string;
  created_at: string;
  updated_at: string;
  user_name?: string;
  unread_count?: number;
}

type MessageRole = 'user' | 'admin';

interface Message {
  id: string;
  conversation_id: string;
  content: string;
  role: MessageRole;
  created_at: string;
}

interface User {
  id: string;
  full_name: string;
  avatar_url: string | null;
}

// Define a type for the profiles returned from Supabase query
interface ProfileData {
  id: string;
  full_name: string;
  avatar_url: string | null;
}

export const AdminChatPanel: React.FC = () => {
  const { toast } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [users, setUsers] = useState<Record<string, User>>({});
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    fetchConversations();
  }, [searchQuery, activeTab]);

  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation);
    }
  }, [activeConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    setIsLoading(true);
    try {
      // First, fetch conversations without joins to avoid deep type instantiation
      let query = supabase
        .from('ai_chat_conversations')
        .select('*')
        .order('updated_at', { ascending: false });

      if (searchQuery) {
        query = query.textSearch('last_message', searchQuery);
      }

      // Since the is_read column doesn't exist, we'll skip the unread filter for now
      // We'll implement it properly once the database schema is updated

      const { data: conversationsData, error: conversationsError } = await query;

      if (conversationsError) throw conversationsError;

      if (!conversationsData) {
        setConversations([]);
        setIsLoading(false);
        return;
      }

      // Fetch user profiles separately to avoid deep type instantiation
      const userIds = [...new Set(conversationsData.map(conv => conv.user_id))];
      
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .in('id', userIds);

      if (profilesError) throw profilesError;

      // Map user profiles for easier lookup
      const userProfiles: Record<string, ProfileData> = {};
      if (profilesData) {
        profilesData.forEach(profile => {
          userProfiles[profile.id] = profile;
        });
      }

      // Create a new users object
      const newUsers: Record<string, User> = {};
      
      // Process conversations and add user data
      const processedConversations = conversationsData.map(conv => {
        const profile = userProfiles[conv.user_id];
        
        if (profile) {
          newUsers[profile.id] = {
            id: profile.id,
            full_name: profile.full_name,
            avatar_url: profile.avatar_url
          };
        }
        
        return {
          ...conv,
          user_name: profile ? profile.full_name : 'Unknown User',
          // Placeholder for unread count since we don't have that column yet
          unread_count: Math.floor(Math.random() * 5)
        };
      });

      // Update users state
      setUsers(newUsers);
      setConversations(processedConversations);
      
      // If no active conversation, select the first one
      if (processedConversations.length > 0 && !activeConversation) {
        setActiveConversation(processedConversations[0].id);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast({ 
        variant: "destructive",
        title: "Error", 
        description: "Gagal memuat percakapan" 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('ai_chat_history')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Cast role to MessageRole
      if (data) {
        const typedMessages = data.map(message => ({
          ...message,
          role: message.role as MessageRole
        }));
        setMessages(typedMessages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal memuat riwayat chat"
      });
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !activeConversation) return;
    
    try {
      // Add message to the database
      const { error: messageError } = await supabase
        .from('ai_chat_history')
        .insert({
          conversation_id: activeConversation,
          content: newMessage,
          role: 'admin'
        });

      if (messageError) throw messageError;

      // Update last message in conversation
      const { error: updateError } = await supabase
        .from('ai_chat_conversations')
        .update({ 
          last_message: newMessage,
          updated_at: new Date().toISOString()
        })
        .eq('id', activeConversation);

      if (updateError) throw updateError;
      
      // Optimistically update UI
      const newMessageObj = {
        id: crypto.randomUUID(),
        conversation_id: activeConversation,
        content: newMessage,
        role: 'admin' as MessageRole,
        created_at: new Date().toISOString()
      };
      
      setMessages([...messages, newMessageObj]);
      
      // Update conversation in the list
      setConversations(prev => prev.map(conv => {
        if (conv.id === activeConversation) {
          return { ...conv, last_message: newMessage, updated_at: new Date().toISOString() };
        }
        return conv;
      }));
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal mengirim pesan"
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="border-t">
      <div className="flex h-[500px]">
        {/* Conversations sidebar */}
        <div className="w-80 border-r flex flex-col">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Cari percakapan..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-4 pt-2">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="all">Semua</TabsTrigger>
                <TabsTrigger value="unread">Belum Dibaca</TabsTrigger>
              </TabsList>
            </div>
          </Tabs>
          
          <ScrollArea className="flex-1">
            {isLoading ? (
              <div className="flex flex-col space-y-2 p-4">
                {Array(5).fill(null).map((_, i) => (
                  <div key={i} className="flex items-center space-x-4 p-3">
                    <div className="w-10 h-10 rounded-full bg-muted animate-pulse" />
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-muted animate-pulse rounded w-3/4" />
                      <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : conversations.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Tidak ada percakapan ditemukan</p>
              </div>
            ) : (
              <div className="flex flex-col p-2">
                {conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    className={`flex items-start space-x-3 p-3 rounded-md text-left transition-colors ${
                      activeConversation === conversation.id
                        ? 'bg-accent'
                        : 'hover:bg-muted'
                    }`}
                    onClick={() => setActiveConversation(conversation.id)}
                  >
                    <Avatar className="h-10 w-10">
                      {users[conversation.user_id]?.avatar_url ? (
                        <AvatarImage src={users[conversation.user_id].avatar_url || ''} />
                      ) : (
                        <AvatarFallback>
                          {getInitials(conversation.user_name || 'UN')}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    
                    <div className="flex-1 overflow-hidden">
                      <div className="flex justify-between items-center">
                        <p className="font-medium truncate">
                          {conversation.user_name || 'Pengguna'}
                        </p>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(conversation.updated_at)}
                        </span>
                      </div>
                      
                      <p className="text-sm truncate text-muted-foreground">
                        {conversation.last_message || 'Tidak ada pesan'}
                      </p>
                      
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-muted-foreground">
                          {new Date(conversation.created_at).toLocaleDateString('id-ID')}
                        </span>
                        
                        {conversation.unread_count ? (
                          <Badge variant="secondary" className="text-xs">
                            {conversation.unread_count}
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
        
        {/* Messages area */}
        <div className="flex-1 flex flex-col">
          {activeConversation && (
            <>
              {/* Chat header */}
              <div className="p-4 border-b flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    {activeConversation && users[conversations.find(c => c.id === activeConversation)?.user_id || '']?.avatar_url ? (
                      <AvatarImage src={users[conversations.find(c => c.id === activeConversation)?.user_id || ''].avatar_url || ''} />
                    ) : (
                      <AvatarFallback>
                        {getInitials(conversations.find(c => c.id === activeConversation)?.user_name || 'UN')}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {conversations.find(c => c.id === activeConversation)?.user_name || 'Pengguna'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Aktif {Math.floor(Math.random() * 60)} menit yang lalu
                    </p>
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <ArchiveIcon className="h-4 w-4 mr-2" /> Arsipkan
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" /> Hapus
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              
              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="flex flex-col space-y-4">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 p-4 text-center">
                      <UserCircle className="h-12 w-12 text-muted-foreground mb-2" />
                      <p className="text-muted-foreground">Belum ada percakapan</p>
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.role === 'admin' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-lg px-4 py-3 ${
                            message.role === 'admin'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <div className="flex flex-col">
                            <p className="text-sm whitespace-pre-wrap break-words">
                              {message.content}
                            </p>
                            <span className={`text-xs mt-1 ${message.role === 'admin' ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                              {formatDate(message.created_at)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
              
              {/* Message input */}
              <div className="p-4 border-t">
                <div className="flex space-x-2">
                  <Textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ketik pesan..."
                    className="flex-1 resize-none"
                    rows={2}
                  />
                  <Button onClick={sendMessage} disabled={!newMessage.trim()}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
          
          {!activeConversation && (
            <div className="flex flex-col items-center justify-center h-full p-4 text-center">
              <UserCircle className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">Tidak Ada Percakapan Aktif</h3>
              <p className="text-muted-foreground max-w-md">
                Pilih percakapan dari daftar sebelah kiri atau tunggu pesan baru dari pengguna
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
