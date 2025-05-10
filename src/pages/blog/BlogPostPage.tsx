
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Clock, User, Tag, ArrowLeft } from 'lucide-react';
import { formatDistanceToNow, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

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
        {post.featured_image && (
          <div className="mb-8 rounded-lg overflow-hidden h-[400px]">
            <img 
              src={post.featured_image} 
              alt={post.title} 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        {/* Post Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">{post.title}</h1>
          
          <div className="flex flex-wrap items-center gap-4 text-muted-foreground mb-6">
            {/* Date */}
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              <span>{new Date(post.published_at).toLocaleDateString('id-ID', { 
                day: 'numeric', month: 'long', year: 'numeric' 
              })}</span>
            </div>
            
            {/* Reading Time */}
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4" />
              <span>{Math.ceil(post.content.split(' ').length / 200)} menit membaca</span>
            </div>
            
            {/* Author */}
            {post.profiles && (
              <div className="flex items-center">
                <User className="mr-2 h-4 w-4" />
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
