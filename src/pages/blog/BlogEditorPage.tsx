
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/common/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { CodeBlock } from '@/components/CodeBlock';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { processContent } from '@/utils/blogUtils';
import { 
  Save, 
  Eye, 
  Image as ImageIcon, 
  Code, 
  FileText, 
  List,
  Bold,
  Italic,
  Underline,
  Link,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  ListOrdered,
  ListMinus
} from 'lucide-react';

// Example renderer component
import MDXPreview from './components/MDXPreview';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Post {
  id?: string;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  featured_image: string;
  category_id: string | null;
  status: 'draft' | 'published';
  author_id: string | null;
  published_at?: string | null;
}

const defaultContent = `# Hello, Welcome to Your Blog

This is a sample blog post. You can write your content here.

## Getting Started

- Add your content
- Format as needed
- Add images and code examples

## Example Code Block

\`\`\`javascript
function hello() {
  console.log("Hello, world!");
}
\`\`\`

Happy blogging!
`;

const BlogEditorPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const contentRef = useRef<HTMLTextAreaElement>(null);
  
  const [post, setPost] = useState<Post>({
    title: '',
    content: defaultContent,
    excerpt: '',
    slug: '',
    featured_image: '',
    category_id: null,
    status: 'draft',
    author_id: null,
  });
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('edit');
  const [previewContent, setPreviewContent] = useState<string>('');

  useEffect(() => {
    fetchCategories();
    if (slug) {
      fetchPost(slug);
    } else if (user) {
      setPost(prev => ({ ...prev, author_id: user.id }));
    }
  }, [slug, user]);

  useEffect(() => {
    // Update preview content when post content changes or when switching to preview tab
    if (activeTab === 'preview') {
      setPreviewContent(post.content);
    }
  }, [post.content, activeTab]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
        
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: 'Error',
        description: 'Failed to load categories',
        variant: 'destructive',
      });
    }
  };

  const fetchPost = async (slug: string) => {
    setIsLoading(true);
    try {
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
      
      if (data) {
        // Fix: Ensure the status field is properly typed
        const postStatus = data.status === 'published' ? 'published' : 'draft';
        
        setPost({
          id: data.id,
          title: data.title,
          content: data.content || defaultContent,
          excerpt: data.excerpt || '',
          slug: data.slug,
          featured_image: data.featured_image || '',
          category_id: data.category_id,
          status: postStatus,
          author_id: data.author_id,
          published_at: data.published_at
        });
      }
    } catch (error) {
      console.error('Error fetching post:', error);
      toast({
        title: 'Error',
        description: 'Failed to load post',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPost(prev => ({ ...prev, [name]: value }));
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let slugValue = e.target.value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
      
    setPost(prev => ({ ...prev, slug: slugValue }));
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    
    // Auto-generate slug from title if slug is empty
    if (!post.slug) {
      const slugValue = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
        
      setPost(prev => ({ 
        ...prev, 
        title: value,
        slug: slugValue
      }));
    } else {
      setPost(prev => ({ ...prev, title: value }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setPost(prev => ({ ...prev, [name]: value }));
  };

  const insertFormattedText = (format: string) => {
    if (!contentRef.current) return;
    
    const textarea = contentRef.current;
    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;
    const selectedText = textarea.value.substring(selectionStart, selectionEnd);
    
    let formattedText = '';
    let cursorOffset = 0;
    
    switch(format) {
      case 'bold':
        formattedText = `**${selectedText}**`;
        cursorOffset = 2;
        break;
      case 'italic':
        formattedText = `*${selectedText}*`;
        cursorOffset = 1;
        break;
      case 'h1':
        formattedText = `\n# ${selectedText}\n`;
        cursorOffset = 2;
        break;
      case 'h2':
        formattedText = `\n## ${selectedText}\n`;
        cursorOffset = 3;
        break;
      case 'link':
        formattedText = `[${selectedText}](url)`;
        cursorOffset = 1;
        break;
      case 'code':
        formattedText = selectedText ? `\`${selectedText}\`` : "```\ncode here\n```";
        cursorOffset = selectedText ? 1 : 12;
        break;
      case 'list-bullet':
        formattedText = selectedText 
          ? selectedText.split('\n').map(line => `- ${line}`).join('\n') 
          : "- List item\n- Another item";
        cursorOffset = 2;
        break;
      case 'list-number':
        formattedText = selectedText 
          ? selectedText.split('\n').map((line, i) => `${i+1}. ${line}`).join('\n') 
          : "1. First item\n2. Second item";
        cursorOffset = 3;
        break;
      case 'image':
        formattedText = `![Alt text](image-url)`;
        cursorOffset = 9;
        break;
      default:
        return;
    }
    
    // Insert the formatted text
    const newContent = textarea.value.substring(0, selectionStart) + formattedText + textarea.value.substring(selectionEnd);
    setPost(prev => ({ ...prev, content: newContent }));
    
    // Set cursor position after the format indicators
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = selectionStart + formattedText.length - cursorOffset;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const savePost = async () => {
    if (!post.title || !post.content || !post.slug) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const postToSave = {
        ...post,
        author_id: user?.id || post.author_id,
      };
      
      let result;
      
      if (post.id) {
        // Update existing post
        result = await supabase
          .from('posts')
          .update(postToSave)
          .eq('id', post.id);
      } else {
        // Create new post
        result = await supabase
          .from('posts')
          .insert(postToSave);
      }
      
      if (result.error) throw result.error;
      
      toast({
        title: 'Success',
        description: `Post has been ${post.id ? 'updated' : 'created'}`,
      });
      
      // Redirect to post list after save
      navigate('/dashboard/blog');
    } catch (error) {
      console.error('Error saving post:', error);
      toast({
        title: 'Error',
        description: 'Failed to save post',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const publishPost = async () => {
    if (!post.title || !post.content || !post.slug) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      const now = new Date().toISOString();
      
      let result;
      
      if (post.id) {
        // Update existing post
        result = await supabase
          .from('posts')
          .update({
            ...post,
            status: 'published',
            published_at: now
          })
          .eq('id', post.id);
      } else {
        // Create new post
        result = await supabase
          .from('posts')
          .insert({
            ...post,
            status: 'published',
            published_at: now,
            author_id: user?.id || post.author_id
          });
      }
      
      if (result.error) throw result.error;
      
      toast({
        title: 'Success',
        description: 'Post has been published',
      });
      
      // Redirect to blog page to see the published post
      navigate('/blog');
    } catch (error) {
      console.error('Error publishing post:', error);
      toast({
        title: 'Error',
        description: 'Failed to publish post',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="h-12 bg-muted rounded w-3/4"></div>
          <div className="h-96 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col lg:flex-row items-start gap-6">
        {/* Main Editor Area */}
        <div className="flex-1 w-full">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">
              {post.id ? 'Edit Post' : 'Create New Post'}
            </h1>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => navigate('/dashboard/blog')}
              >
                Cancel
              </Button>
              
              <Button 
                variant="secondary" 
                onClick={savePost}
                disabled={isSaving}
              >
                <Save className="mr-2 h-4 w-4" />
                Save Draft
              </Button>
              
              <Button 
                onClick={publishPost}
                disabled={isSaving}
              >
                <FileText className="mr-2 h-4 w-4" />
                Publish
              </Button>
            </div>
          </div>
          
          {/* Title Input */}
          <div className="mb-6">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              name="title"
              value={post.title}
              onChange={handleTitleChange}
              className="text-xl font-medium"
              placeholder="Post title"
            />
          </div>
          
          {/* Text Editor with Preview */}
          <Card className="mb-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <div className="flex justify-between items-center px-4 pt-2">
                <TabsList>
                  <TabsTrigger value="edit" className="flex items-center gap-1">
                    <Code className="h-4 w-4" /> Edit
                  </TabsTrigger>
                  <TabsTrigger value="preview" className="flex items-center gap-1">
                    <Eye className="h-4 w-4" /> Preview
                  </TabsTrigger>
                </TabsList>
              </div>
              
              <Separator className="mt-2" />
              
              <TabsContent value="edit" className="mt-0 p-4">
                <div className="flex flex-wrap gap-2 mb-4 p-2 bg-muted/20 rounded-md">
                  <Button type="button" variant="ghost" size="sm" onClick={() => insertFormattedText('bold')}>
                    <Bold className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => insertFormattedText('italic')}>
                    <Italic className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => insertFormattedText('h1')}>
                    <Heading1 className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => insertFormattedText('h2')}>
                    <Heading2 className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => insertFormattedText('link')}>
                    <Link className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => insertFormattedText('code')}>
                    <Code className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => insertFormattedText('list-bullet')}>
                    <ListMinus className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => insertFormattedText('list-number')}>
                    <ListOrdered className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={() => insertFormattedText('image')}>
                    <ImageIcon className="h-4 w-4" />
                  </Button>
                </div>
                <div className="h-[450px]">
                  <Textarea
                    ref={contentRef}
                    name="content"
                    value={post.content}
                    onChange={handleInputChange}
                    className="h-full font-mono text-sm resize-none"
                    placeholder="Write your post content here..."
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="preview" className="mt-0 p-4">
                <ScrollArea className="h-[500px] pr-4">
                  <div className="prose dark:prose-invert max-w-none">
                    <MDXPreview content={previewContent} />
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
        
        {/* Sidebar / Settings */}
        <div className="lg:w-80 w-full">
          <Card>
            <CardContent className="p-6 space-y-6">
              {/* Slug */}
              <div>
                <Label htmlFor="slug">Slug</Label>
                <div className="mt-1">
                  <Input
                    id="slug"
                    name="slug"
                    value={post.slug}
                    onChange={handleSlugChange}
                    placeholder="post-url-slug"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  This will be used for the post URL
                </p>
              </div>
              
              {/* Excerpt */}
              <div>
                <Label htmlFor="excerpt">Excerpt</Label>
                <div className="mt-1">
                  <Textarea
                    id="excerpt"
                    name="excerpt"
                    value={post.excerpt}
                    onChange={handleInputChange}
                    placeholder="Brief summary of your post"
                    rows={3}
                  />
                </div>
              </div>
              
              {/* Featured Image */}
              <div>
                <Label htmlFor="featured_image">Featured Image URL</Label>
                <div className="mt-1">
                  <Input
                    id="featured_image"
                    name="featured_image"
                    value={post.featured_image}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                {post.featured_image && (
                  <div className="mt-2 rounded-md overflow-hidden border border-border">
                    <img 
                      src={post.featured_image} 
                      alt="Featured" 
                      className="w-full h-32 object-cover"
                      onError={(e) => { 
                        (e.target as HTMLImageElement).src = '/images/blog/blog-tech.jpg';
                      }} 
                    />
                  </div>
                )}
              </div>
              
              {/* Category */}
              <div>
                <Label htmlFor="category">Category</Label>
                <div className="mt-1">
                  <Select 
                    value={post.category_id || undefined}
                    onValueChange={(value) => handleSelectChange('category_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No category</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {/* Status */}
              <div>
                <Label htmlFor="status">Status</Label>
                <div className="flex items-center space-x-2 mt-1">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    post.status === 'published' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {post.status === 'published' ? 'Published' : 'Draft'}
                  </span>
                  
                  {post.published_at && post.status === 'published' && (
                    <span className="text-xs text-muted-foreground">
                      on {new Date(post.published_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BlogEditorPage;
