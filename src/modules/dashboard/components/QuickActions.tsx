
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Plus, 
  Edit, 
  Upload, 
  Settings, 
  FileText, 
  LayoutTemplate, 
  Users, 
  Download, 
  MessageSquareText
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/common/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface ActionItem {
  icon: React.ReactNode;
  label: string;
  to: string;
  color: string;
  description?: string;
}

interface TemplateType {
  id: string;
  name: string;
}

interface DownloadType {
  id: string;
  url: string;
  templates: TemplateType | null;
}

export const QuickActions: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [recentItems, setRecentItems] = useState<{ id: string, type: string, title: string, url: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecentActivities = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      
      try {
        // Get recent blog posts by the user
        const { data: posts, error: postsError } = await supabase
          .from('posts')
          .select('id, title, slug')
          .eq('author_id', user.id)
          .order('updated_at', { ascending: false })
          .limit(2);
          
        if (postsError) {
          console.error('Error fetching posts:', postsError);
        }
          
        // Get recent template downloads or views
        // Handling the case where templates relation might not exist
        const { data: downloads, error: downloadsError } = await supabase
          .from('download_history')
          .select('id, url')
          .eq('user_id', user.id)
          .order('download_time', { ascending: false })
          .limit(2);
        
        if (downloadsError) {
          console.error('Error fetching downloads:', downloadsError);
        }
        
        // Combine and format the results
        const recentPosts = posts?.map(post => ({
          id: post.id,
          type: 'blog',
          title: post.title,
          url: `/blog/${post.slug}`
        })) || [];
        
        const recentDownloads = downloads?.map(download => ({
          id: download.id,
          type: 'download',
          title: 'Downloaded Template',
          url: download.url || '#'
        })) || [];
        
        setRecentItems([...recentPosts, ...recentDownloads].slice(0, 3));
      } catch (error) {
        console.error('Error fetching recent activities:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRecentActivities();
  }, [user]);

  const actions: ActionItem[] = [
    {
      icon: <Plus size={20} />,
      label: 'New Post',
      to: '/blog/editor',
      color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      description: 'Create a new blog post'
    },
    {
      icon: <Edit size={20} />,
      label: 'Edit Template',
      to: '/dashboard/templates',
      color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
      description: 'Manage your templates'
    },
    {
      icon: <Upload size={20} />,
      label: 'Upload File',
      to: '/dashboard/templates/upload',
      color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
      description: 'Upload a new template'
    },
    {
      icon: <Settings size={20} />,
      label: 'Settings',
      to: '/dashboard/settings',
      color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
      description: 'Manage your account'
    },
    {
      icon: <FileText size={20} />,
      label: 'All Blog Posts',
      to: '/dashboard/blog',
      color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
      description: 'View and manage all posts'
    },
    {
      icon: <LayoutTemplate size={20} />,
      label: 'Templates',
      to: '/templates',
      color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
      description: 'Browse all templates'
    },
    {
      icon: <Users size={20} />,
      label: 'User Management',
      to: '/dashboard/users',
      color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
      description: 'Manage user accounts'
    },
    {
      icon: <Download size={20} />,
      label: 'Downloads',
      to: '/dashboard/downloads',
      color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
      description: 'View download history'
    },
    {
      icon: <MessageSquareText size={20} />,
      label: 'AI Chat',
      to: '/tools/ai-chat',
      color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300',
      description: 'Chat with AI assistant'
    }
  ];

  const handleActionClick = (action: ActionItem) => {
    // Log the user activity
    if (user?.id) {
      try {
        // Fix the Promise chain
        void supabase
          .from('user_activities')
          .insert({
            user_id: user.id,
            activity_type: `click_quick_action_${action.label.toLowerCase().replace(/\s+/g, '_')}`,
            metadata: { action_name: action.label, action_url: action.to }
          })
          .then(() => {
            console.log('Activity logged');
          })
          .catch((error) => {
            console.error('Error logging activity:', error);
          });
      } catch (error) {
        console.error('Error logging activity:', error);
      }
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Get started with common actions</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Recent Items */}
        <div>
          <h3 className="text-sm font-medium mb-3">Recent Items</h3>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : recentItems.length > 0 ? (
            <div className="space-y-1">
              {recentItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.url}
                  className="flex items-center justify-between py-2 px-3 text-sm hover:bg-accent rounded-md"
                >
                  <div className="flex items-center gap-2">
                    {item.type === 'blog' ? (
                      <FileText size={16} />
                    ) : (
                      <Download size={16} />
                    )}
                    <span className="truncate max-w-[200px]">{item.title}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {item.type === 'blog' ? 'Post' : 'Template'}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-2">No recent items found.</p>
          )}
        </div>

        {/* Actions Grid */}
        <div>
          <h3 className="text-sm font-medium mb-3">Common Actions</h3>
          <div className="grid grid-cols-3 gap-2">
            {actions.slice(0, 6).map((action, index) => (
              <Button
                key={index}
                variant="ghost"
                className="flex flex-col h-auto gap-1 py-3"
                asChild
                onClick={() => handleActionClick(action)}
              >
                <Link to={action.to}>
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center ${action.color}`}>
                    {action.icon}
                  </span>
                  <span className="text-xs font-medium">{action.label}</span>
                </Link>
              </Button>
            ))}
          </div>
        </div>

        {/* All Actions */}
        <div className="pt-2">
          <Button variant="outline" size="sm" className="w-full" asChild>
            <Link to="/dashboard/actions">View All Actions</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
