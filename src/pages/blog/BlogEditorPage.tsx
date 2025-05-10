
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save,
  Image as ImageIcon,
  FileText,
  HelpCircle,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  Eye,
  Code,
  Bold,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  FileImage,
  Heading1,
  Heading2,
  Heading3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/common/context/AuthContext';

const BlogEditorPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState<string>('');
  const [featuredImage, setFeaturedImage] = useState<string>('');
  const [isPublished, setIsPublished] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [previewMode, setPreviewMode] = useState(false);
  
  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug');
        
      if (!error) {
        setCategories(data || []);
      }
    };
    
    fetchCategories();
  }, []);
  
  // Fetch blog post data if editing existing post
  useEffect(() => {
    if (slug) {
      const fetchPost = async () => {
        const { data, error } = await supabase
          .from('posts')
          .select(`
            *,
            categories(*)
          `)
          .eq('slug', slug)
          .single();
          
        if (error) {
          toast({
            title: "Error",
            description: "Gagal memuat artikel. " + error.message,
            variant: "destructive",
          });
          return;
        }
        
        if (data) {
          setTitle(data.title || '');
          setContent(data.content || '');
          setExcerpt(data.excerpt || '');
          setCategory(data.category_id || '');
          setFeaturedImage(data.featured_image || '');
          setIsPublished(data.status === 'published');
        }
      };
      
      fetchPost();
    }
  }, [slug, toast]);
  
  const slugify = (text: string) => {
    return text
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  };
  
  const handleSave = async (publish: boolean = false) => {
    if (!title) {
      toast({
        title: "Judul diperlukan",
        description: "Mohon berikan judul untuk artikel ini.",
        variant: "destructive",
      });
      return;
    }
    
    if (!content) {
      toast({
        title: "Konten diperlukan",
        description: "Mohon berikan konten untuk artikel ini.",
        variant: "destructive",
      });
      return;
    }
    
    if (!user) {
      toast({
        title: "Login diperlukan",
        description: "Silakan login terlebih dahulu untuk menyimpan artikel.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const postData = {
        title,
        content,
        excerpt: excerpt || title.substring(0, 150) + '...',
        slug: slug || slugify(title),
        featured_image: featuredImage,
        category_id: category || null,
        status: publish || isPublished ? 'published' : 'draft',
        author_id: user.id,
        published_at: publish && !isPublished ? new Date().toISOString() : undefined,
      };
      
      let result;
      
      if (slug) {
        // Update existing post
        result = await supabase
          .from('posts')
          .update(postData)
          .eq('slug', slug);
      } else {
        // Insert new post
        result = await supabase
          .from('posts')
          .insert(postData);
      }
      
      if (result.error) {
        throw new Error(result.error.message);
      }
      
      toast({
        title: "Artikel berhasil disimpan",
        description: publish ? "Artikel telah dipublikasikan." : "Artikel telah disimpan sebagai draft.",
      });
      
      // Redirect to article page if published, otherwise stay on editor
      if (publish) {
        navigate(`/blog/${slug || slugify(title)}`);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Gagal menyimpan artikel: " + error.message,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleInsertMarkdown = (markdownType: string) => {
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    let insertion = '';
    
    switch (markdownType) {
      case 'bold':
        insertion = `**${selectedText || 'text tebal'}**`;
        break;
      case 'italic':
        insertion = `*${selectedText || 'text miring'}*`;
        break;
      case 'h1':
        insertion = `# ${selectedText || 'Heading 1'}\n`;
        break;
      case 'h2':
        insertion = `## ${selectedText || 'Heading 2'}\n`;
        break;
      case 'h3':
        insertion = `### ${selectedText || 'Heading 3'}\n`;
        break;
      case 'link':
        insertion = `[${selectedText || 'link text'}](url)`;
        break;
      case 'image':
        insertion = `![${selectedText || 'alt text'}](url)`;
        break;
      case 'code':
        insertion = selectedText ? `\`\`\`\n${selectedText}\n\`\`\`` : "```\ncode\n```";
        break;
      case 'list':
        insertion = selectedText 
          ? selectedText.split('\n').map(line => `- ${line}`).join('\n')
          : "- Item 1\n- Item 2\n- Item 3";
        break;
      case 'ordered-list':
        insertion = selectedText 
          ? selectedText.split('\n').map((line, i) => `${i + 1}. ${line}`).join('\n')
          : "1. Item 1\n2. Item 2\n3. Item 3";
        break;
      default:
        insertion = selectedText;
    }
    
    const newContent = content.substring(0, start) + insertion + content.substring(end);
    setContent(newContent);
    
    // Set focus back to textarea and place cursor at the right position
    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = start + insertion.length;
      textarea.selectionEnd = start + insertion.length;
    }, 0);
  };
  
  const renderMarkdown = (markdown: string) => {
    if (!markdown) return { __html: '' };
    
    // A very simple markdown parser for preview
    let html = markdown
      // Headers
      .replace(/^# (.+)$/gm, '<h1>$1</h1>')
      .replace(/^## (.+)$/gm, '<h2>$1</h2>')
      .replace(/^### (.+)$/gm, '<h3>$1</h3>')
      
      // Bold
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      
      // Italic
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      
      // Links
      .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank">$1</a>')
      
      // Images
      .replace(/!\[(.+?)\]\((.+?)\)/g, '<img src="$2" alt="$1" class="my-4 rounded-lg" />')
      
      // Lists
      .replace(/^- (.+)$/gm, '<li>$1</li>')
      .replace(/<\/li>\n<li>/g, '</li><li>')
      .replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
      
      // Ordered Lists
      .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
      .replace(/<\/li>\n<li>/g, '</li><li>')
      .replace(/(<li>.*<\/li>)/s, '<ol>$1</ol>')
      
      // Code blocks
      .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
      
      // Paragraphs
      .replace(/^(?!<[hou]).+$/gm, '<p>$&</p>');
    
    return { __html: html };
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">
            {slug ? 'Edit Artikel' : 'Artikel Baru'}
          </h1>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Switch 
              id="published" 
              checked={isPublished}
              onCheckedChange={setIsPublished}
            />
            <Label htmlFor="published" className="cursor-pointer">
              {isPublished ? 'Published' : 'Draft'}
            </Label>
          </div>
          
          <Button
            variant="outline"
            onClick={() => handleSave(false)}
            disabled={isSubmitting}
          >
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
          
          <Button
            onClick={() => handleSave(true)}
            disabled={isSubmitting}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            {isPublished ? 'Update' : 'Publish'}
          </Button>
        </div>
      </div>
      
      {/* Title and Category Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <Label htmlFor="title" className="mb-2 block">Judul Artikel</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-xl"
            placeholder="Masukkan judul artikel disini..."
          />
        </div>
        
        <div>
          <Label htmlFor="category" className="mb-2 block">Kategori</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger id="category">
              <SelectValue placeholder="Pilih kategori" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Featured Image */}
      <div className="mb-6">
        <Label htmlFor="featuredImage" className="mb-2 block">Featured Image URL</Label>
        <div className="flex gap-4">
          <Input
            id="featuredImage"
            value={featuredImage}
            onChange={(e) => setFeaturedImage(e.target.value)}
            placeholder="https://example.com/image.jpg"
            className="flex-grow"
          />
          <Button variant="outline" disabled>
            <FileImage className="mr-2 h-4 w-4" />
            Upload
          </Button>
        </div>
        
        {featuredImage && (
          <div className="mt-4 relative aspect-video w-full max-w-2xl mx-auto overflow-hidden rounded-lg border border-border">
            <img 
              src={featuredImage} 
              alt="Featured"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = 'https://placehold.co/1200x630?text=Image+Not+Found';
              }}
            />
          </div>
        )}
      </div>
      
      {/* Excerpt */}
      <div className="mb-6">
        <Label htmlFor="excerpt" className="mb-2 block">Excerpt</Label>
        <Textarea
          id="excerpt"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="Ringkasan singkat artikel (opsional, akan menggunakan 150 karakter pertama dari konten jika kosong)"
          className="resize-none"
          rows={2}
        />
      </div>
      
      {/* Content Editor with Toggle between Edit and Preview */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <Label htmlFor="content" className="text-lg font-medium">Konten (Markdown)</Label>
          <div className="flex gap-2">
            <Button
              variant={previewMode ? "outline" : "default"}
              size="sm"
              onClick={() => setPreviewMode(false)}
            >
              <FileText className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button
              variant={previewMode ? "default" : "outline"}
              size="sm"
              onClick={() => setPreviewMode(true)}
            >
              <Eye className="mr-2 h-4 w-4" />
              Preview
            </Button>
          </div>
        </div>
        
        {/* Markdown Toolbar */}
        {!previewMode && (
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleInsertMarkdown('bold')}
            >
              <Bold size={16} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleInsertMarkdown('italic')}
            >
              <Italic size={16} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleInsertMarkdown('h1')}
            >
              <Heading1 size={16} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleInsertMarkdown('h2')}
            >
              <Heading2 size={16} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleInsertMarkdown('h3')}
            >
              <Heading3 size={16} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleInsertMarkdown('link')}
            >
              <LinkIcon size={16} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleInsertMarkdown('image')}
            >
              <ImageIcon size={16} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleInsertMarkdown('list')}
            >
              <List size={16} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleInsertMarkdown('ordered-list')}
            >
              <ListOrdered size={16} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleInsertMarkdown('code')}
            >
              <Code size={16} />
            </Button>
          </div>
        )}
        
        {/* Editor/Preview Toggle */}
        <AnimatePresence mode="wait">
          {previewMode ? (
            <motion.div
              key="preview"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="border rounded-lg p-6 min-h-[400px] bg-card"
            >
              {content ? (
                <div 
                  className="prose prose-lg dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={renderMarkdown(content)} 
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <AlertCircle className="h-12 w-12 mb-2 opacity-20" />
                  <p>Tidak ada konten untuk ditampilkan</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="editor"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <Textarea 
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Tulis artikel Anda menggunakan Markdown..."
                className="min-h-[400px] font-mono"
              />
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Markdown Help */}
        <div className="mt-4">
          <details className="text-sm text-muted-foreground">
            <summary className="cursor-pointer flex items-center gap-1">
              <HelpCircle size={14} />
              <span>Bantuan Markdown</span>
            </summary>
            <div className="mt-2 p-4 bg-muted rounded-lg">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Format Teks</h4>
                  <p><code># Heading 1</code></p>
                  <p><code>## Heading 2</code></p>
                  <p><code>**Bold text**</code></p>
                  <p><code>*Italic text*</code></p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">Links & Media</h4>
                  <p><code>[Link text](URL)</code></p>
                  <p><code>![Alt text](Image URL)</code></p>
                  <p><code>```Code block```</code></p>
                </div>
              </div>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
};

export default BlogEditorPage;
