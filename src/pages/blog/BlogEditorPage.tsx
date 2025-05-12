import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/common/context/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Editor from '@monaco-editor/react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Save, 
  Eye, 
  Image as ImageIcon, 
  Code, 
  FileText, 
  List
} from 'lucide-react';

// Example MDX renderer component
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
}

const defaultMDXContent = `# Hello, MDX!

This is a sample MDX file. You can write Markdown as usual:

## Subheading

- List item 1
- List item 2

## Code Example

\`\`\`javascript
function hello() {
  console.log("Hello, world!");
}
\`\`\`

## React Component Example

You can also embed React components directly in your MDX:

<Box>
  <Button>Click me!</Button>
</Box>
`;

const BlogEditorPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [post, setPost] = useState<Post>({
    title: '',
    content: defaultMDXContent,
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

  useEffect(() => {
    fetchCategories();
    if (slug) {
      fetchPost(slug);
    } else if (user) {
      setPost(prev => ({ ...prev, author_id: user.id }));
    }
  }, [slug, user]);

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
          content: data.content || defaultMDXContent,
          excerpt: data.excerpt || '',
          slug: data.slug,
          featured_image: data.featured_image || '',
          category_id: data.category_id,
          status: postStatus,
          author_id: data.author_id
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPost(prev => ({ ...prev, [name]: value }));
  };

  const handleContentChange = (value: string | undefined) => {
    setPost(prev => ({ ...prev, content: value || '' }));
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
      
      if (!post.id) {
        // Redirect to edit page with slug after creating a new post
        navigate(`/dashboard/blog/edit/${post.slug}`);
      }
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
    setIsSaving(true);
    try {
      const now = new Date().toISOString();
      const result = await supabase
        .from('posts')
        .update({
          status: 'published',
          published_at: now,
        })
        .eq('id', post.id);
        
      if (result.error) throw result.error;
      
      setPost(prev => ({ ...prev, status: 'published' }));
      
      toast({
        title: 'Success',
        description: 'Post has been published',
      });
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
              
              {post.id && post.status !== 'published' && (
                <Button 
                  onClick={publishPost}
                  disabled={isSaving}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Publish
                </Button>
              )}
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
          
          {/* MDX Editor with Preview */}
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
              
              <TabsContent value="edit" className="mt-0 p-0">
                <div className="h-[500px]">
                  <Editor
                    height="500px"
                    language="markdown"
                    value={post.content}
                    onChange={handleContentChange}
                    theme="vs-dark"
                    options={{
                      minimap: { enabled: false },
                      wordWrap: 'on',
                      scrollBeyondLastLine: false,
                    }}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="preview" className="mt-0 p-4">
                <ScrollArea className="h-[500px] pr-4">
                  <MDXPreview content={post.content} />
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
                  <Input
                    id="excerpt"
                    name="excerpt"
                    value={post.excerpt}
                    onChange={handleInputChange}
                    placeholder="Brief summary of your post"
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
                <p className="text-sm font-medium capitalize">
                  {post.status}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default BlogEditorPage;
