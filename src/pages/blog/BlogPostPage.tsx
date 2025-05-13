
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Clock, User, Tag, ArrowLeft, MessageSquare, Heart, Share2, Bookmark, Eye, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";
import CodeBlock from '@/components/CodeBlock';
import MultiTabCodeBlock from '@/components/MultiTabCodeBlock';
import { fetchPostBySlug, fetchRelatedPosts, getPostImage, formatTimeAgo, calculateReadingTime, processContent, extractCodeBlocks } from '@/utils/blogUtils';

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { toast } = useToast();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [processedContent, setProcessedContent] = useState<string>('');
  const [codeBlocks, setCodeBlocks] = useState<Array<{ language: string, code: string, filename?: string }>>([]);
  
  const { data: post, isLoading, error } = useQuery({
    queryKey: ['blog-post', slug],
    queryFn: async () => {
      if (!slug) throw new Error('No slug provided');
      return fetchPostBySlug(slug);
    }
  });

  // Fetch related posts based on category
  const { data: relatedPosts = [] } = useQuery({
    queryKey: ['related-posts', post?.id, post?.category_id],
    queryFn: async () => {
      if (!post?.id) return [];
      return fetchRelatedPosts(post.category_id, post.id);
    },
    enabled: !!post?.id,
  });

  // Process content to extract code blocks
  useEffect(() => {
    if (post?.content) {
      const { processedContent, codeBlocks } = extractCodeBlocks(post.content);
      setProcessedContent(processedContent);
      setCodeBlocks(codeBlocks);
    }
  }, [post?.content]);

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast({
      title: isBookmarked ? "Artikel dihapus dari bookmark" : "Artikel ditambahkan ke bookmark",
      duration: 2000,
    });
  };

  const handleLike = () => {
    if (hasLiked) {
      setLikeCount(likeCount - 1);
      setHasLiked(false);
    } else {
      setLikeCount(likeCount + 1);
      setHasLiked(true);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: post?.title || 'Blog post',
        url: window.location.href,
      }).catch(console.error);
    } else {
      // Fallback untuk browser yang tidak support Web Share API
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link artikel disalin ke clipboard",
        duration: 2000,
      });
    }
  };

  // Render code blocks based on content
  const renderProcessedContent = (content: string) => {
    if (!content) return null;

    const parts = content.split(/<CodeBlockPlaceholder[^>]+>/);
    const placeholderRegex = /<CodeBlockPlaceholder id="(\d+)" language="([^"]+)"(?:\s+filename="([^"]+)")?(?:\s+)?\/?>/g;
    const matches = content.match(placeholderRegex) || [];
    
    const result = [];
    for (let i = 0; i < parts.length; i++) {
      // Add text part
      if (parts[i]) {
        result.push(
          <div key={`text-${i}`} dangerouslySetInnerHTML={{ __html: parts[i] }} />
        );
      }
      
      // Add code block if there is one
      if (i < matches.length) {
        const match = placeholderRegex.exec(matches[i]);
        if (match) {
          const [_, id, language, filename] = match;
          const codeBlock = codeBlocks[parseInt(id)];
          if (codeBlock) {
            result.push(
              <CodeBlock
                key={`code-${i}`}
                code={codeBlock.code}
                language={codeBlock.language}
                filename={codeBlock.filename}
              />
            );
          }
        }
        
        // Reset regex for next iteration
        placeholderRegex.lastIndex = 0;
      }
    }
    
    return result;
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

  // Format untuk time ago
  const timeAgo = formatTimeAgo(post.published_at);
  
  return (
    <div className="bg-background min-h-screen pb-16">
      {/* Hero Section with Featured Image */}
      <div 
        className="w-full bg-cover bg-center h-[50vh] relative"
        style={{ 
          backgroundImage: `url(${getPostImage(post.featured_image)})`,
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-black/50">
          <div className="container mx-auto h-full flex flex-col justify-end items-start p-6 md:p-10 pb-16">
            {/* Category Badge */}
            {category && (
              <Link to={`/blog/category/${category.slug}`}>
                <Badge variant="outline" className="bg-primary/80 hover:bg-primary text-white border-primary mb-4">
                  {category.name}
                </Badge>
              </Link>
            )}
            
            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              {post.title}
            </h1>
            
            {/* Author and Meta Info */}
            <div className="flex flex-wrap items-center gap-4 text-white/80">
              {post.profiles && (
                <div className="flex items-center">
                  <Avatar className="h-8 w-8 mr-2 border-2 border-white/20">
                    {post.profiles.avatar_url ? (
                      <AvatarImage src={post.profiles.avatar_url} alt={post.profiles.full_name || 'Anonim'} />
                    ) : (
                      <AvatarFallback>{(post.profiles.full_name || 'A').charAt(0)}</AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium text-white">{post.profiles.full_name || 'Anonim'}</span>
                    <span className="text-xs text-white/70">{timeAgo}</span>
                  </div>
                </div>
              )}
              
              <div className="flex items-center ml-auto gap-4">
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4" />
                  <span>{calculateReadingTime(post.content)} menit membaca</span>
                </div>
                <div className="flex items-center">
                  <Eye className="mr-2 h-4 w-4" />
                  <span>423 dilihat</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Content Card */}
            <Card className="overflow-hidden shadow-lg border-none">
              {/* Back Button - Mobile Only */}
              <div className="md:hidden p-4 border-b">
                <Link to="/blog">
                  <Button variant="ghost" size="sm" className="pl-0 h-8">
                    <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
                  </Button>
                </Link>
              </div>
              
              {/* Social Share Bar - Mobile Only */}
              <div className="flex justify-between items-center p-4 border-b md:hidden">
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={handleLike} 
                    className={cn(hasLiked && "text-rose-500")}
                  >
                    <Heart className={cn("h-4 w-4", hasLiked && "fill-current")} />
                    <span className="ml-1">{likeCount}</span>
                  </Button>
                  <Button variant="ghost" size="sm">
                    <MessageSquare className="h-4 w-4" />
                    <span className="ml-1">4</span>
                  </Button>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={handleBookmark}
                    className={cn(isBookmarked && "text-yellow-500")}
                  >
                    <Bookmark className={cn("h-4 w-4", isBookmarked && "fill-current")} />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleShare}>
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <CardContent className="p-6 md:p-10">
                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center justify-between mb-8">
                  <Link to="/blog">
                    <Button variant="ghost" size="sm">
                      <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Blog
                    </Button>
                  </Link>
                  
                  <div className="flex gap-3">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="icon" 
                            onClick={handleLike}
                            className={cn(hasLiked && "text-rose-500 border-rose-200 hover:bg-rose-50")}
                          >
                            <Heart className={cn("h-4 w-4", hasLiked && "fill-current")} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{hasLiked ? "Batal menyukai" : "Suka artikel ini"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={handleBookmark}
                            className={cn(isBookmarked && "text-yellow-500 border-yellow-200 hover:bg-yellow-50")}
                          >
                            <Bookmark className={cn("h-4 w-4", isBookmarked && "fill-current")} />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{isBookmarked ? "Hapus dari bookmark" : "Simpan artikel"}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="icon" onClick={handleShare}>
                            <Share2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Bagikan artikel</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>
                
                {/* Post excerpt/summary if available */}
                {post.excerpt && (
                  <div className="my-6 text-lg italic text-muted-foreground border-l-4 border-primary/20 pl-4 py-2">
                    {post.excerpt}
                  </div>
                )}
                
                {/* Post Content with Code Blocks */}
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  {renderProcessedContent(processedContent)}
                  
                  {/* Contoh MultiTabCodeBlock */}
                  <h3>Contoh Code Block Multi Tab</h3>
                  <p>Berikut adalah contoh code block dengan beberapa tab:</p>
                  
                  <MultiTabCodeBlock 
                    tabs={[
                      {
                        label: "HTML",
                        language: "html",
                        filename: "index.html",
                        code: `<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8">\n  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n  <title>Document</title>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <div class="container">\n    <h1>Hello World</h1>\n    <p>Welcome to my website</p>\n  </div>\n  <script src="script.js"></script>\n</body>\n</html>`
                      },
                      {
                        label: "CSS",
                        language: "css",
                        filename: "style.css",
                        code: `.container {\n  max-width: 1200px;\n  margin: 0 auto;\n  padding: 2rem;\n}\n\nh1 {\n  color: #333;\n  font-family: sans-serif;\n}\n\np {\n  line-height: 1.6;\n  color: #666;\n}`
                      },
                      {
                        label: "JavaScript",
                        language: "javascript",
                        filename: "script.js",
                        code: `document.addEventListener('DOMContentLoaded', () => {\n  console.log('DOM fully loaded');\n  \n  // Get the heading\n  const heading = document.querySelector('h1');\n  \n  // Add click event\n  heading.addEventListener('click', () => {\n    alert('You clicked the heading!');\n  });\n});`
                      }
                    ]}
                  />
                </div>
                
                {/* Tags */}
                <div className="mt-10 flex flex-wrap gap-2">
                  {category && (
                    <Link to={`/blog/category/${category.slug}`}>
                      <Badge variant="secondary" className="hover:bg-secondary/80">
                        {category.name}
                      </Badge>
                    </Link>
                  )}
                  
                  {/* Contoh tag, bisa diambil dari database jika ada */}
                  <Badge variant="outline">React</Badge>
                  <Badge variant="outline">Tutorial</Badge>
                  <Badge variant="outline">Web Development</Badge>
                </div>
              </CardContent>
              
              {/* Author Bio Section */}
              {post.profiles && (
                <div className="bg-muted/50 p-6 md:p-8 border-t m-6 md:m-10 rounded-lg">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-16 w-16 border-2 border-background">
                      {post.profiles.avatar_url ? (
                        <AvatarImage src={post.profiles.avatar_url} alt={post.profiles.full_name || 'Anonim'} />
                      ) : (
                        <AvatarFallback className="text-xl">{(post.profiles.full_name || 'A').charAt(0)}</AvatarFallback>
                      )}
                    </Avatar>
                    
                    <div>
                      <h3 className="text-lg font-semibold">{post.profiles.full_name || 'Anonim'}</h3>
                      <p className="text-muted-foreground">{post.profiles.bio || 'Penulis di Website Blog'}</p>
                    </div>
                  </div>
                  
                  {post.profiles.bio && (
                    <p className="mt-4 text-muted-foreground">
                      {post.profiles.bio}
                    </p>
                  )}
                </div>
              )}
              
              {/* Comments Section - Placeholder, would be implemented with actual comment functionality */}
              <div className="border-t p-6 md:p-10">
                <h3 className="text-xl font-semibold mb-6">Komentar (4)</h3>
                
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">John Doe</h4>
                        <span className="text-xs text-muted-foreground">2 hari yang lalu</span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Artikel yang sangat informatif! Terima kasih sudah berbagi pengetahuan ini.
                      </p>
                      <div className="mt-2 flex gap-4 text-xs">
                        <button className="text-muted-foreground hover:text-foreground">Balas</button>
                        <button className="text-muted-foreground hover:text-foreground">Laporkan</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Author Card */}
            {post.profiles && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">Tentang Penulis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col items-center">
                    <Avatar className="h-24 w-24 border-4 border-background mb-4">
                      {post.profiles.avatar_url ? (
                        <AvatarImage src={post.profiles.avatar_url} alt={post.profiles.full_name || 'Anonim'} />
                      ) : (
                        <AvatarFallback className="text-2xl">{(post.profiles.full_name || 'A').charAt(0)}</AvatarFallback>
                      )}
                    </Avatar>
                    <h3 className="text-lg font-semibold">{post.profiles.full_name || 'Anonim'}</h3>
                    <p className="text-sm text-muted-foreground text-center mt-1">
                      {post.profiles.bio || 'Penulis konten di website ini.'}
                    </p>
                    <div className="mt-4 w-full">
                      <Button className="w-full">Lihat Semua Artikel</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Related Posts */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Artikel Terkait</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {relatedPosts.length > 0 ? (
                  relatedPosts.map((relatedPost) => (
                    <Link key={relatedPost.id} to={`/blog/${relatedPost.slug}`} className="block group">
                      <div className="flex gap-3">
                        <div className="w-20 h-16 rounded overflow-hidden flex-shrink-0">
                          <img 
                            src={getPostImage(relatedPost.featured_image)} 
                            alt={relatedPost.title} 
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                          />
                        </div>
                        <div>
                          <h4 className="font-medium line-clamp-2 group-hover:text-primary transition-colors">
                            {relatedPost.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatTimeAgo(relatedPost.published_at)}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  // Placeholder related posts when none are available
                  [1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-20 h-16 rounded bg-muted flex-shrink-0"></div>
                      <div>
                        <h4 className="font-medium">Artikel terkait {i}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          Baru saja
                        </p>
                      </div>
                    </div>
                  ))
                )}
                
                <Button variant="outline" className="w-full mt-2">
                  Lihat Semua Artikel <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
            
            {/* Newsletter Subscription */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Berlangganan Update</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Dapatkan artikel terbaru langsung ke email Anda
                </p>
                <form className="space-y-2">
                  <input 
                    type="email" 
                    placeholder="Email Anda" 
                    className="w-full p-2 rounded-md border border-input bg-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  />
                  <Button className="w-full">Berlangganan</Button>
                </form>
                <p className="text-xs text-muted-foreground mt-3">
                  Kami tidak akan mengirimkan spam. Anda dapat berhenti berlangganan kapan saja.
                </p>
              </CardContent>
            </Card>
          </div>
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
