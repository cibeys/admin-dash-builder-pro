
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Clock, User, Tag, ArrowLeft, MessageSquare, Heart, Share2 } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Import local images
import blogTechImage from '/images/blog/blog-tech.jpg';
import blogDesignImage from '/images/blog/blog-design.jpg';
import blogProgrammingImage from '/images/blog/blog-programming.jpg';

// Create a mapping for local images
const localImages = {
  'blog-tech': blogTechImage,
  'blog-design': blogDesignImage,
  'blog-programming': blogProgrammingImage,
};

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  
  const { data: post, isLoading, error } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles:author_id(*),
          categories(*)
        `)
        .eq('slug', slug)
        .single();
        
      if (error) throw error;
      return data;
    }
  });

  // Function to get the appropriate image
  const getPostImage = (imageUrl: string | null) => {
    if (!imageUrl) return blogTechImage;
    
    // If the image URL doesn't start with http (local reference)
    if (!imageUrl.startsWith('http')) {
      // Try to find a local image match based on the filename
      const imageName = imageUrl.split('/').pop()?.split('.')[0];
      if (imageName && imageName in localImages) {
        return localImages[imageName as keyof typeof localImages];
      }
      
      // If the image starts with '/images/' it's from public folder
      if (imageUrl.startsWith('/images/')) {
        return imageUrl;
      }
    }
    
    // If it's an external URL, use it directly
    if (imageUrl.startsWith('http')) {
      return imageUrl;
    }
    
    // Default fallback
    return blogTechImage;
  };

  if (isLoading) return <BlogPostSkeleton />;
  
  if (error || !post) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Artikel tidak ditemukan</h1>
        <p className="mb-8">Maaf, artikel yang Anda cari tidak tersedia.</p>
        <Link to="/blog">
          <Button variant="default">Kembali ke Blog</Button>
        </Link>
      </div>
    );
  }

  // Amankan akses ke data kategori
  const category = post.categories ? post.categories : null;

  // Format date for better display
  const formatPublishedDate = () => {
    if (!post.published_at) return 'Belum dipublikasikan';
    
    return new Date(post.published_at).toLocaleDateString('id-ID', { 
      day: 'numeric', month: 'long', year: 'numeric' 
    });
  };

  // Calculate estimated reading time
  const calculateReadingTime = () => {
    const wordsPerMinute = 200;
    const wordCount = post.content ? post.content.split(/\s+/).length : 0;
    return Math.ceil(wordCount / wordsPerMinute);
  };
  
  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto py-10 px-4">
        {/* Back Button */}
        <div className="mb-8">
          <Link to="/blog">
            <Button variant="ghost" className="pl-0">
              <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Blog
            </Button>
          </Link>
        </div>
        
        {/* Featured Image */}
        <div className="mb-8 rounded-lg overflow-hidden h-[400px] shadow-md">
          <img 
            src={getPostImage(post.featured_image)}
            alt={post.title} 
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* Post Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">{post.title}</h1>
          
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6">
            {/* Date */}
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              <span>{formatPublishedDate()}</span>
            </div>
            
            {/* Reading Time */}
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              <span>{calculateReadingTime()} menit membaca</span>
            </div>
            
            {/* Author */}
            {post.profiles && (
              <div className="flex items-center">
                <Avatar className="h-6 w-6 mr-2">
                  {post.profiles.avatar_url ? (
                    <AvatarImage src={post.profiles.avatar_url} alt={post.profiles.full_name || 'Anonim'} />
                  ) : (
                    <AvatarFallback>{(post.profiles.full_name || 'A').charAt(0)}</AvatarFallback>
                  )}
                </Avatar>
                <span>{post.profiles.full_name || 'Anonim'}</span>
              </div>
            )}
          </div>
          
          {/* Category & Tags */}
          <div className="flex flex-wrap gap-2">
            {category && (
              <Link to={`/blog/category/${category.slug}`}>
                <Badge variant="outline" className="bg-primary/10 hover:bg-primary/20">
                  {category.name}
                </Badge>
              </Link>
            )}
          </div>
        </div>
        
        {/* Post Content */}
        <div className="prose prose-lg dark:prose-invert max-w-none">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>
        
        {/* Social Interactions */}
        <div className="mt-12 flex justify-between items-center border-t border-b py-6 px-4">
          <div className="flex gap-4">
            <Button variant="ghost" size="sm">
              <Heart className="mr-2 h-4 w-4" /> Suka
            </Button>
            <Button variant="ghost" size="sm">
              <MessageSquare className="mr-2 h-4 w-4" /> Komentar
            </Button>
          </div>
          <Button variant="ghost" size="sm">
            <Share2 className="mr-2 h-4 w-4" /> Bagikan
          </Button>
        </div>
        
        {/* Related Posts */}
        {post && post.categories && (
          <div className="mt-12">
            <h3 className="text-2xl font-bold mb-6">Artikel Terkait</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* These are placeholder cards - in a real implementation you would fetch related posts */}
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={i === 1 ? blogTechImage : i === 2 ? blogDesignImage : blogProgrammingImage} 
                      alt="Related post" 
                      className="w-full h-full object-cover transition-transform hover:scale-105"
                    />
                  </div>
                  <CardContent className="pt-6">
                    <div className="mb-2">
                      <Badge variant="outline">
                        {category.name}
                      </Badge>
                    </div>
                    <h4 className="text-xl font-bold mb-2">Artikel terkait {i}</h4>
                    <p className="text-muted-foreground line-clamp-2">
                      Ini adalah contoh artikel terkait dengan topik yang sama. Klik untuk membaca lebih lanjut.
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const BlogPostSkeleton = () => (
  <div className="container mx-auto py-10 px-4">
    <div className="mb-8">
      <Skeleton className="h-10 w-40" />
    </div>
    <Skeleton className="w-full h-[400px] mb-8 rounded-lg" />
    <Skeleton className="h-14 w-3/4 mb-6" />
    <div className="flex flex-wrap gap-4 mb-6">
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-6 w-40" />
      <Skeleton className="h-6 w-40" />
    </div>
    <div className="space-y-4">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-full" />
    </div>
  </div>
);

export default BlogPostPage;
