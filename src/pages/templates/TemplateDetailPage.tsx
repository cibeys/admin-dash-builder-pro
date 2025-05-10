
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from '@/common/context/AuthContext';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Download, Heart, Share2, Eye, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const TemplateDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        setLoading(true);
        
        if (id) {
          // Fetch template details
          const { data, error } = await supabase
            .from('templates')
            .select(`
              *,
              profiles:created_by(username, avatar_url, full_name)
            `)
            .eq('id', id)
            .single();
          
          if (error) throw error;
          
          if (data) {
            setTemplate(data);
            
            // Check if user has favorited this template
            if (isAuthenticated && user) {
              const { data: favData } = await supabase
                .from('user_favorites')
                .select('*')
                .eq('user_id', user.id)
                .eq('template_id', id)
                .single();
              
              setIsFavorite(!!favData);
            }
            
            // Update view count
            await supabase.rpc('increment_template_downloads', { template_id: id });
          } else {
            // Use placeholder if no template found
            setTemplate(placeholderTemplate);
          }
        }
      } catch (error) {
        console.error('Error fetching template:', error);
        setTemplate(placeholderTemplate);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplate();
  }, [id, user, isAuthenticated]);

  const handleDownload = async () => {
    if (!template) return;
    
    try {
      // Record download in history
      if (isAuthenticated && user) {
        await supabase.from('download_history').insert({
          user_id: user.id,
          url: template.download_url,
          platform: navigator.platform,
          status: 'completed'
        });
      }
      
      // Open download URL in new tab
      window.open(template.download_url, '_blank');
      
      toast({
        title: "Download started",
        description: "Your template download has started. Thank you for using our platform!",
      });
    } catch (error) {
      console.error('Error recording download:', error);
      
      // Still allow download even if tracking fails
      window.open(template.download_url, '_blank');
    }
  };

  const toggleFavorite = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please login to save templates to favorites.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      if (isFavorite) {
        // Remove from favorites
        await supabase
          .from('user_favorites')
          .delete()
          .eq('user_id', user?.id)
          .eq('template_id', template.id);
        
        setIsFavorite(false);
        toast({
          title: "Removed from favorites",
          description: "Template has been removed from your favorites."
        });
      } else {
        // Add to favorites
        await supabase.from('user_favorites').insert({
          user_id: user?.id,
          template_id: template.id
        });
        
        setIsFavorite(true);
        toast({
          title: "Added to favorites",
          description: "Template has been added to your favorites."
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Action failed",
        description: "Failed to update favorites. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: template.name,
        text: template.description,
        url: window.location.href
      });
    } else {
      // Fallback for browsers that don't support the Web Share API
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Template link copied to clipboard."
      });
    }
  };

  // Placeholder template for when data is not available
  const placeholderTemplate = {
    id: '1',
    name: 'Admin Dashboard Pro',
    description: 'Dashboard admin modern dengan UI yang elegan dan fitur lengkap untuk aplikasi web Anda. Template ini mencakup banyak komponen yang dapat digunakan kembali dan layout yang sudah dioptimalkan untuk pengalaman pengguna terbaik.',
    preview_image: '/placeholder.svg',
    download_url: '#',
    category: 'Admin Templates',
    technology: ['React', 'Tailwind CSS', 'TypeScript', 'Chart.js'],
    color_scheme: 'dark',
    is_premium: true,
    download_count: 3450,
    profiles: {
      username: 'admin',
      full_name: 'Administrator',
      avatar_url: null
    },
    created_at: new Date().toISOString()
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center mb-6">
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2">
              <Skeleton className="h-8 w-3/4 mb-4" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3 mb-6" />
              
              <div className="flex gap-2 mb-6">
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
                <Skeleton className="h-8 w-20" />
              </div>
              
              <Skeleton className="h-96 w-full rounded-lg mb-8" />
            </div>
            
            <div>
              <div className="border border-border rounded-lg p-6">
                <Skeleton className="h-10 w-full mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3 mb-4" />
                <Skeleton className="h-10 w-full mb-4" />
                
                <div className="flex justify-between mt-6">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Template not found</h1>
          <p className="mt-4">The template you are looking for does not exist or has been moved.</p>
          <Link to="/templates" className="mt-6 inline-flex items-center text-primary hover:underline">
            <ArrowLeft size={16} className="mr-2" /> Back to templates
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-5xl mx-auto">
        {/* Back to templates link */}
        <Link to="/templates" className="inline-flex items-center text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft size={16} className="mr-2" /> Back to templates
        </Link>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="md:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold">{template.name}</h1>
              {template.is_premium && (
                <Badge variant="default" className="ml-2">Premium</Badge>
              )}
            </div>
            
            <p className="text-muted-foreground mb-6">{template.description}</p>
            
            {/* Technology badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              {template.technology?.map((tech: string) => (
                <Badge key={tech} variant="outline">{tech}</Badge>
              ))}
              {template.color_scheme && (
                <Badge variant="outline" className="capitalize">{template.color_scheme}</Badge>
              )}
            </div>
            
            {/* Preview image */}
            <div className="rounded-lg overflow-hidden mb-8 border border-border">
              <img 
                src={template.preview_image || '/placeholder.svg'} 
                alt={template.name}
                className="w-full h-auto"
              />
            </div>
            
            {/* Features and details */}
            <Tabs defaultValue="features" className="mb-8">
              <TabsList>
                <TabsTrigger value="features">Features</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="preview">Live Preview</TabsTrigger>
              </TabsList>
              
              <TabsContent value="features" className="pt-4">
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-primary flex-shrink-0 mt-0.5" />
                    <span>Fully responsive design that works on all devices</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-primary flex-shrink-0 mt-0.5" />
                    <span>Modern UI components built with {template.technology?.includes('Tailwind CSS') ? 'Tailwind CSS' : 'modern CSS'}</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-primary flex-shrink-0 mt-0.5" />
                    <span>Clean and well-documented code for easy customization</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-primary flex-shrink-0 mt-0.5" />
                    <span>{template.is_premium ? 'Premium support included' : 'Community support available'}</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle2 className="h-5 w-5 mr-2 text-primary flex-shrink-0 mt-0.5" />
                    <span>Regular updates with new features and improvements</span>
                  </li>
                </ul>
              </TabsContent>
              
              <TabsContent value="details" className="pt-4">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Category</h3>
                    <p className="text-muted-foreground">{template.category}</p>
                  </div>
                  <div>
                    <h3 className="font-medium">Created by</h3>
                    <p className="text-muted-foreground">
                      {template.profiles?.full_name || template.profiles?.username || 'Anonymous'}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium">Released</h3>
                    <p className="text-muted-foreground">
                      {new Date(template.created_at).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium">Downloads</h3>
                    <p className="text-muted-foreground">
                      {template.download_count.toLocaleString()}
                    </p>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="preview" className="pt-4">
                <div className="border border-border rounded-lg overflow-hidden">
                  <div className="bg-secondary/50 p-2 flex items-center gap-2 border-b border-border">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <div className="mx-auto text-xs text-muted-foreground">
                      Live Preview
                    </div>
                  </div>
                  <div className="h-96 bg-background flex items-center justify-center">
                    <div className="text-center">
                      <Eye className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-lg font-medium">Live preview available after download</p>
                      <p className="text-muted-foreground">
                        Download the template to see it in action
                      </p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            <div className="border border-border rounded-lg p-6">
              <Button 
                className="w-full mb-4"
                onClick={handleDownload}
              >
                <Download className="mr-2 h-4 w-4" /> 
                {template.is_premium ? 'Purchase & Download' : 'Download Free'}
              </Button>
              
              {template.is_premium && (
                <p className="text-center text-sm text-muted-foreground mb-4">
                  One-time purchase, lifetime updates
                </p>
              )}
              
              <div className="flex justify-center gap-4 pt-4 border-t border-border">
                <Button 
                  variant="outline" 
                  size="icon" 
                  className={isFavorite ? "text-red-500 hover:text-red-600" : ""}
                  onClick={toggleFavorite}
                >
                  <Heart className="h-5 w-5" fill={isFavorite ? "currentColor" : "none"} />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={handleShare}
                >
                  <Share2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            {/* Related templates */}
            <div className="border border-border rounded-lg p-6">
              <h3 className="font-medium mb-4">You might also like</h3>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Link 
                    key={i} 
                    to={`/templates/${i}`} 
                    className="flex items-center gap-3 hover:bg-secondary/50 p-2 rounded-md"
                  >
                    <div className="w-12 h-12 bg-muted rounded">
                      <img src="/placeholder.svg" alt="Template thumbnail" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium line-clamp-1">
                        {i === 1 ? "E-Commerce Starter" : i === 2 ? "Portfolio Minimal" : "Blog Template"}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {template.category}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemplateDetailPage;
