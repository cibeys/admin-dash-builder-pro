
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft } from 'lucide-react';

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<any>(null);
  const [relatedPosts, setRelatedPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        
        // Fetch post with author and category info
        const { data } = await supabase
          .from('posts')
          .select(`
            id, title, slug, content, excerpt, featured_image, status, published_at, updated_at,
            profiles:author_id(*),
            categories:category_id(*)
          `)
          .eq('slug', slug)
          .eq('status', 'published')
          .single();
        
        if (data) {
          setPost(data);
          
          // Fetch related posts from the same category
          if (data.category_id) {
            const { data: related } = await supabase
              .from('posts')
              .select(`
                id, title, slug, excerpt, featured_image,
                profiles:author_id(username, avatar_url)
              `)
              .eq('category_id', data.category_id)
              .eq('status', 'published')
              .neq('id', data.id)
              .limit(3);
              
            if (related) {
              setRelatedPosts(related);
            }
          }
        } else {
          // If no post found, use placeholder data
          setPost(placeholderPost);
          setRelatedPosts(placeholderRelated);
        }
      } catch (error) {
        console.error('Error fetching blog post:', error);
        // On error, use placeholder data
        setPost(placeholderPost);
        setRelatedPosts(placeholderRelated);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  // Placeholder data when no post is fetched
  const placeholderPost = {
    id: '1',
    title: 'Cara Membuat Website Modern dengan React dan Tailwind CSS',
    slug: 'cara-membuat-website-modern',
    content: `
      <h2>Pendahuluan</h2>
      <p>Di era digital seperti saat ini, memiliki website yang modern dan responsif menjadi suatu keharusan. React dan Tailwind CSS merupakan kombinasi teknologi yang sangat populer untuk membangun website modern.</p>
      
      <h2>Persiapan Awal</h2>
      <p>Sebelum mulai membuat website dengan React dan Tailwind CSS, pastikan Anda telah menginstall Node.js dan npm di komputer Anda. Ini merupakan prasyarat utama untuk menggunakan React dan Tailwind CSS.</p>
      
      <h2>Langkah-langkah Implementasi</h2>
      <ol>
        <li>Setup proyek React menggunakan create-react-app</li>
        <li>Instalasi dan konfigurasi Tailwind CSS</li>
        <li>Membuat komponen-komponen UI dasar</li>
        <li>Implementasi layout responsif</li>
        <li>Optimasi performa website</li>
      </ol>
      
      <h2>Kesimpulan</h2>
      <p>Dengan menggunakan React dan Tailwind CSS, Anda dapat membuat website modern yang tidak hanya tampil bagus tetapi juga memiliki performa yang baik.</p>
    `,
    excerpt: 'Pelajari langkah-langkah untuk membuat website modern yang responsif menggunakan React dan Tailwind CSS',
    featured_image: '/placeholder.svg',
    status: 'published',
    published_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    profiles: { 
      username: 'admin', 
      avatar_url: null,
      full_name: 'Admin User',
      bio: 'Web Developer dan Content Creator'
    },
    categories: { 
      name: 'Web Development', 
      slug: 'web-development',
      description: 'Artikel terkait pengembangan web'
    }
  };
  
  const placeholderRelated = [
    {
      id: '2',
      title: 'Mengenal Dasar-dasar TypeScript untuk Pengembang JavaScript',
      slug: 'dasar-typescript',
      excerpt: 'Panduan lengkap untuk memulai dengan TypeScript bagi pengembang yang sudah familiar dengan JavaScript',
      featured_image: '/placeholder.svg',
      profiles: { username: 'admin', avatar_url: null }
    },
    {
      id: '3',
      title: 'Mengoptimalkan Performa Aplikasi React dengan Hooks',
      slug: 'optimasi-react-hooks',
      excerpt: 'Tips dan trik untuk meningkatkan performa aplikasi React dengan penggunaan Hooks yang efisien',
      featured_image: '/placeholder.svg',
      profiles: { username: 'admin', avatar_url: null }
    }
  ];

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <Skeleton className="h-8 w-3/4 mb-4" />
          <div className="flex items-center space-x-4 mb-6">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-6 w-32" />
          </div>
          <Skeleton className="h-72 w-full mb-8" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-full" />
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Post not found</h1>
          <p className="mt-4">The post you are looking for does not exist or has been moved.</p>
          <Link to="/blog" className="mt-6 inline-flex items-center text-primary hover:underline">
            <ArrowLeft size={16} className="mr-2" /> Back to blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto">
        {/* Back to blog link */}
        <Link to="/blog" className="inline-flex items-center text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft size={16} className="mr-2" /> Back to all posts
        </Link>
        
        {/* Category badge */}
        <Badge variant="outline" className="mb-4">
          {post.categories?.name || 'Uncategorized'}
        </Badge>
        
        {/* Post title */}
        <h1 className="text-4xl font-bold mb-6">{post.title}</h1>
        
        {/* Author and date */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center mr-3">
              {post.profiles?.avatar_url ? (
                <img 
                  src={post.profiles.avatar_url} 
                  alt={post.profiles.username} 
                  className="w-full h-full rounded-full" 
                />
              ) : (
                <span className="text-sm font-semibold">
                  {(post.profiles?.username || 'A').charAt(0).toUpperCase()}
                </span>
              )}
            </div>
            <div>
              <p className="font-medium">{post.profiles?.full_name || post.profiles?.username || 'Anonymous'}</p>
              <p className="text-sm text-muted-foreground">{post.profiles?.bio || 'Author'}</p>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {new Date(post.published_at).toLocaleDateString('id-ID', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>
        
        {/* Featured image */}
        {post.featured_image && (
          <div className="mb-8 rounded-lg overflow-hidden">
            <img 
              src={post.featured_image} 
              alt={post.title}
              className="w-full h-auto" 
            />
          </div>
        )}
        
        {/* Post content */}
        <div 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
        
        {/* Tags section */}
        <div className="border-t border-border mt-12 pt-8">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">React</Badge>
            <Badge variant="secondary">Tailwind CSS</Badge>
            <Badge variant="secondary">Web Development</Badge>
          </div>
        </div>
        
        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <div className="border-t border-border mt-12 pt-8">
            <h3 className="text-xl font-bold mb-6">Related Posts</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {relatedPosts.map((related) => (
                <Link 
                  key={related.id} 
                  to={`/blog/${related.slug}`}
                  className="border border-border rounded-lg overflow-hidden flex hover:border-primary transition-colors"
                >
                  <div className="w-1/3">
                    <img 
                      src={related.featured_image || '/placeholder.svg'} 
                      alt={related.title}
                      className="w-full h-full object-cover" 
                    />
                  </div>
                  <div className="p-4 w-2/3">
                    <h4 className="font-bold mb-2 line-clamp-2">{related.title}</h4>
                    <p className="text-sm text-muted-foreground line-clamp-2">{related.excerpt}</p>
                    <div className="mt-2 text-xs text-muted-foreground">
                      By {related.profiles?.username || 'Anonymous'}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogPostPage;
