
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Filter, Calendar, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';

// Import local images for blog posts
import blogTechImage from '/images/blog/blog-tech.jpg';
import blogDesignImage from '/images/blog/blog-design.jpg';
import blogProgrammingImage from '/images/blog/blog-programming.jpg';

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featured_image: string;
  status: string;
  published_at: string;
  author: {
    username: string;
    avatar_url: string;
  };
  category: {
    name: string;
    slug: string;
  };
};

// Create a mapping for local images
const localImages = {
  'blog-tech': blogTechImage,
  'blog-design': blogDesignImage,
  'blog-programming': blogProgrammingImage,
};

const BlogPage = () => {
  const { categorySlug } = useParams<{ categorySlug?: string }>();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(categorySlug || null);

  // Update selected category when URL param changes
  useEffect(() => {
    setSelectedCategory(categorySlug || null);
  }, [categorySlug]);

  // Fetch posts from Supabase
  const { data: postsData, isLoading } = useQuery({
    queryKey: ['blog-posts', selectedCategory, searchQuery],
    queryFn: async () => {
      try {
        // Fetch categories first
        const { data: categoriesData } = await supabase
          .from('categories')
          .select('*');
        
        // Fetch posts with author and category info
        let query = supabase
          .from('posts')
          .select(`
            id, title, slug, excerpt, featured_image, status, published_at,
            profiles:author_id(username, avatar_url, full_name),
            categories:category_id(name, slug)
          `)
          .eq('status', 'published');
        
        if (selectedCategory) {
          // Get posts for the selected category
          query = query.eq('categories.slug', selectedCategory);
        }
        
        if (searchQuery) {
          query = query.ilike('title', `%${searchQuery}%`);
        }
        
        const { data: postsResult, error } = await query;
        
        if (error) throw error;
        
        return { 
          posts: postsResult || [], 
          categories: categoriesData || []
        };
      } catch (error) {
        console.error('Error fetching blog data:', error);
        return { posts: [], categories: [] };
      }
    }
  });

  // Format posts to match our Post type
  const posts: Post[] = postsData?.posts.map(post => ({
    id: post.id,
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt || 'No excerpt available',
    featured_image: post.featured_image || '/placeholder.svg',
    status: post.status,
    published_at: post.published_at,
    author: {
      username: post.profiles?.username || post.profiles?.full_name || 'Unknown Author',
      avatar_url: post.profiles?.avatar_url || null
    },
    category: {
      name: post.categories?.name || 'Uncategorized',
      slug: post.categories?.slug || 'uncategorized'
    }
  })) || [];
  
  const categories = postsData?.categories || [];

  // Get appropriate image for post
  const getPostImage = (post: Post) => {
    // If the post has an image URL that doesn't start with http (local reference)
    if (post.featured_image && !post.featured_image.startsWith('http')) {
      // Try to find a local image match based on the filename
      const imageName = post.featured_image.split('/').pop()?.split('.')[0];
      if (imageName && imageName in localImages) {
        return localImages[imageName as keyof typeof localImages];
      }
      
      // If the image starts with '/images/' it's from public folder
      if (post.featured_image.startsWith('/images/')) {
        return post.featured_image;
      }
    }
    
    // If it's an external URL, use it directly
    if (post.featured_image && post.featured_image.startsWith('http')) {
      return post.featured_image;
    }
    
    // Default images based on category
    const category = post.category.name.toLowerCase();
    if (category.includes('design')) return blogDesignImage;
    if (category.includes('tech')) return blogTechImage;
    if (category.includes('program') || category.includes('develop')) return blogProgrammingImage;
    
    // Final fallback
    return blogTechImage;
  };

  // Placeholder posts for when data is empty
  const placeholderPosts = [
    {
      id: '1',
      title: 'Cara Membuat Website Modern dengan React dan Tailwind CSS',
      slug: 'cara-membuat-website-modern',
      excerpt: 'Pelajari langkah-langkah untuk membuat website modern yang responsif menggunakan React dan Tailwind CSS',
      featured_image: blogTechImage,
      status: 'published',
      published_at: new Date().toISOString(),
      author: { username: 'admin', avatar_url: '' },
      category: { name: 'Web Development', slug: 'web-development' }
    },
    {
      id: '2',
      title: 'Mengenal Dasar-dasar TypeScript untuk Pengembang JavaScript',
      slug: 'dasar-typescript',
      excerpt: 'Panduan lengkap untuk memulai dengan TypeScript bagi pengembang yang sudah familiar dengan JavaScript',
      featured_image: blogProgrammingImage,
      status: 'published',
      published_at: new Date().toISOString(),
      author: { username: 'admin', avatar_url: '' },
      category: { name: 'JavaScript', slug: 'javascript' }
    },
    {
      id: '3',
      title: 'Mengoptimalkan Performa Aplikasi React dengan Hooks',
      slug: 'optimasi-react-hooks',
      excerpt: 'Tips dan trik untuk meningkatkan performa aplikasi React dengan penggunaan Hooks yang efisien',
      featured_image: blogDesignImage,
      status: 'published',
      published_at: new Date().toISOString(),
      author: { username: 'admin', avatar_url: '' },
      category: { name: 'React', slug: 'react' }
    }
  ];

  const displayPosts = posts.length > 0 ? posts : placeholderPosts;
  
  // Calculate reading time
  const calculateReadingTime = (excerpt: string) => {
    const wordsPerMinute = 200;
    const words = excerpt.split(/\s+/).length;
    return Math.max(1, Math.ceil(words / wordsPerMinute));
  };

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col space-y-4">
        <h1 className="text-4xl font-bold">Blog</h1>
        <p className="text-lg text-muted-foreground">
          Temukan artikel dan tutorial terbaru tentang pengembangan web dan desain.
        </p>
      </div>
      
      {/* Search and filter area */}
      <div className="my-8 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Cari artikel..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        {/* Categories filter */}
        <div className="flex flex-wrap gap-2">
          <Badge 
            variant={selectedCategory === null ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedCategory(null)}
          >
            Semua
          </Badge>
          {categories.length > 0 ? (
            categories.map((category) => (
              <Badge 
                key={category.id}
                variant={selectedCategory === category.slug ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(category.slug)}
              >
                {category.name}
              </Badge>
            ))
          ) : (
            // Placeholder categories when no data
            ['Web Development', 'JavaScript', 'React', 'UI/UX Design'].map((cat) => (
              <Badge
                key={cat}
                variant={selectedCategory === cat.toLowerCase().replace(' ', '-') ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedCategory(cat.toLowerCase().replace(' ', '-'))}
              >
                {cat}
              </Badge>
            ))
          )}
        </div>
      </div>

      {/* Posts grid */}
      {isLoading ? (
        // Loading skeleton
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-48 w-full" />
              </CardHeader>
              <CardContent className="space-y-2">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-8 w-24" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayPosts.map((post) => (
            <Card key={post.id} className="overflow-hidden flex flex-col">
              <div className="h-48 overflow-hidden">
                <img 
                  src={getPostImage(post)}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform hover:scale-105"
                />
              </div>
              <CardContent className="pt-6 flex-grow">
                <div className="flex justify-between items-center mb-2">
                  <Badge variant="outline" className="bg-primary/5">
                    {post.category.name}
                  </Badge>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{calculateReadingTime(post.excerpt)} min read</span>
                  </div>
                </div>
                <Link to={`/blog/${post.slug}`} className="hover:text-primary">
                  <h2 className="text-xl font-bold mb-2 line-clamp-2">{post.title}</h2>
                </Link>
                <p className="text-muted-foreground mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
              </CardContent>
              <CardFooter className="border-t pt-4">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center">
                    <Avatar className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center mr-2">
                      {post.author.avatar_url ? (
                        <AvatarImage 
                          src={post.author.avatar_url} 
                          alt={post.author.username} 
                          className="w-full h-full rounded-full" 
                        />
                      ) : (
                        <AvatarFallback>
                          {post.author.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <span className="text-sm">{post.author.username}</span>
                  </div>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3 mr-1" />
                    {new Date(post.published_at).toLocaleDateString()}
                  </div>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {/* Pagination or Load more */}
      {displayPosts.length > 0 && (
        <div className="flex justify-center mt-10">
          <Button variant="outline">
            Muat Lebih Banyak
          </Button>
        </div>
      )}
    </div>
  );
};

export default BlogPage;
