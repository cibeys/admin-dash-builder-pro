import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MonacoEditor from '@monaco-editor/react';

type Post = {
  id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  category_id: string | null;
  author_id: string | null;
  featured_image: string | null;
  status: 'draft' | 'published';
};

interface Category {
  id: string;
  name: string;
  slug: string;
}

export const BlogEditPage: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { slug } = useParams<{ slug: string }>();
  const isEditMode = slug !== 'new';
  
  const [post, setPost] = useState<Post>({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    category_id: null,
    author_id: null,
    featured_image: null,
    status: 'draft'
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [previewHtml, setPreviewHtml] = useState('');
  const [activeTab, setActiveTab] = useState('editor');

  const defaultMDXContent = `---
title: "Judul Post"
date: "${new Date().toISOString()}"
---

# Mulai menulis konten Anda di sini

Ini adalah konten MDX contoh. Anda bisa menggunakan Markdown dan komponen React.

## Subheading

- Item 1
- Item 2
- Item 3

\`\`\`jsx
function HelloWorld() {
  return <h1>Hello, world!</h1>;
}
\`\`\`

![Gambar](/images/blog/blog-tech.jpg)
`;

  useEffect(() => {
    fetchCategories();
    if (isEditMode) {
      fetchPost();
    } else {
      setPost(prev => ({
        ...prev,
        content: defaultMDXContent
      }));
    }
  }, [slug]);

  useEffect(() => {
    // Simulasi render MDX
    setPreviewHtml(
      post.content
        .replace(/^---[\s\S]*?---/m, '') // Hapus frontmatter
        .replace(/^# (.*$)/gm, '<h1>$1</h1>')
        .replace(/^## (.*$)/gm, '<h2>$1</h2>')
        .replace(/^### (.*$)/gm, '<h3>$1</h3>')
        .replace(/\*\*(.*)\*\*/gm, '<strong>$1</strong>')
        .replace(/\*(.*)\*/gm, '<em>$1</em>')
        .replace(/\n/gm, '<br />')
        .replace(/!\[(.*?)\]\((.*?)\)/gm, '<img alt="$1" src="$2" class="my-4 rounded-lg max-w-full" />')
        .replace(/\[(.*?)\]\((.*?)\)/gm, '<a href="$2" class="text-primary hover:underline">$1</a>')
        .replace(/```([\s\S]*?)```/gm, '<pre class="bg-muted p-4 rounded my-4 overflow-x-auto"><code>$1</code></pre>')
        .replace(/`([^`]+)`/gm, '<code class="bg-muted px-1 py-0.5 rounded">$1</code>')
        .replace(/- (.*)/gm, '<li>$1</li>').replace(/<li>(.*)<\/li>/gm, '<ul><li>$1</li></ul>')
    );
  }, [post.content, activeTab]);

  const fetchPost = async () => {
    if (!slug) return;
    
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
        description: 'Gagal memuat data post',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug')
        .order('name');

      if (error) throw error;
      
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat data kategori',
        variant: 'destructive'
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setPost(prev => ({ ...prev, [name]: value }));
  };

  const handleEditorChange = (value: string | undefined) => {
    if (value !== undefined) {
      setPost(prev => ({ ...prev, content: value }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setPost(prev => ({ ...prev, [name]: value }));
  };

  const generateSlug = () => {
    if (!post.title) return;
    
    const slug = post.title
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-');
      
    setPost(prev => ({ ...prev, slug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    if (!post.slug) {
      generateSlug();
    }
    
    try {
      const userData = await supabase.auth.getUser();
      const userId = userData.data.user?.id;
      
      let response;
      
      if (isEditMode) {
        response = await supabase
          .from('posts')
          .update({
            title: post.title,
            content: post.content,
            excerpt: post.excerpt,
            category_id: post.category_id,
            featured_image: post.featured_image,
            status: post.status,
            updated_at: new Date().toISOString()
          })
          .eq('slug', slug);
      } else {
        response = await supabase
          .from('posts')
          .insert({
            title: post.title,
            slug: post.slug,
            content: post.content,
            excerpt: post.excerpt,
            category_id: post.category_id,
            featured_image: post.featured_image,
            status: post.status,
            author_id: userId
          });
      }

      const { error } = response;
      if (error) throw error;
      
      toast({
        title: 'Berhasil',
        description: `Post berhasil ${isEditMode ? 'diperbarui' : 'ditambahkan'}`,
      });
      
      navigate('/dashboard/blog');
    } catch (error) {
      console.error('Error saving post:', error);
      toast({
        title: 'Error',
        description: `Gagal ${isEditMode ? 'memperbarui' : 'menambahkan'} post`,
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          {isEditMode ? 'Edit Blog Post' : 'Post Blog Baru'}
        </h1>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Konten</CardTitle>
                <CardDescription>
                  Tulis konten post menggunakan format MDX
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="w-full mb-4">
                    <TabsTrigger value="editor" className="flex-1">Editor</TabsTrigger>
                    <TabsTrigger value="preview" className="flex-1">Preview</TabsTrigger>
                  </TabsList>
                  <TabsContent value="editor" className="min-h-[500px] border rounded-lg">
                    <MonacoEditor
                      height="500px"
                      defaultLanguage="markdown"
                      value={post.content}
                      onChange={handleEditorChange}
                      options={{
                        minimap: { enabled: false },
                        wordWrap: 'on',
                        lineNumbers: 'on',
                      }}
                    />
                  </TabsContent>
                  <TabsContent value="preview" className="min-h-[500px] border rounded-lg p-4 overflow-auto prose dark:prose-invert max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: previewHtml }} />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informasi Post</CardTitle>
                <CardDescription>
                  Detail dan pengaturan post
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Judul*</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Judul post"
                    value={post.title}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug*</Label>
                  <div className="flex gap-2">
                    <Input
                      id="slug"
                      name="slug"
                      placeholder="url-post"
                      value={post.slug}
                      onChange={handleChange}
                      required
                    />
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={generateSlug}
                    >
                      Generate
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category_id">Kategori</Label>
                  <Select
                    value={post.category_id || undefined}
                    onValueChange={(value) => handleSelectChange('category_id', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Tanpa kategori</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="excerpt">Ringkasan</Label>
                  <Textarea
                    id="excerpt"
                    name="excerpt"
                    placeholder="Ringkasan singkat post"
                    value={post.excerpt}
                    onChange={handleChange}
                    rows={3}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="featured_image">URL Gambar Utama</Label>
                  <Input
                    id="featured_image"
                    name="featured_image"
                    placeholder="https://example.com/image.jpg"
                    value={post.featured_image || ''}
                    onChange={handleChange}
                  />
                  {post.featured_image && (
                    <div className="mt-2 border rounded-md p-2">
                      <img 
                        src={post.featured_image} 
                        alt="Preview" 
                        className="w-full h-32 object-cover rounded"
                        onError={(e) => { 
                          (e.target as HTMLImageElement).src = '/images/blog/blog-tech.jpg';
                        }} 
                      />
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={post.status}
                    onValueChange={(value: 'draft' | 'published') => handleSelectChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Status publikasi" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard/blog')}
                  disabled={isSaving}
                >
                  Batal
                </Button>
                <Button type="submit" disabled={isLoading || isSaving}>
                  {isSaving ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Menyimpan...
                    </>
                  ) : (
                    isEditMode ? 'Perbarui Post' : 'Publikasikan Post'
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BlogEditPage;
