
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
import { Checkbox } from '@/components/ui/checkbox';
import { Save, Globe, FileCode, Link2, Eye } from 'lucide-react';

type Template = {
  id?: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  category_id: string | null;
  author_id: string | null;
  featured_image: string | null;
  demo_url: string | null;
  source_url: string | null;
  is_premium: boolean;
  is_featured: boolean;
  status: 'draft' | 'published';
};

interface Category {
  id: string;
  name: string;
  slug: string;
}

export const TemplateEditPage: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = id !== 'new';
  
  const [template, setTemplate] = useState<Template>({
    title: '',
    slug: '',
    description: '',
    content: '',
    category_id: null,
    author_id: null,
    featured_image: null,
    demo_url: null,
    source_url: null,
    is_premium: false,
    is_featured: false,
    status: 'draft'
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeTab, setActiveTab] = useState('details');

  useEffect(() => {
    fetchCategories();
    if (isEditMode && id) {
      fetchTemplate(id);
    }
  }, [id]);

  const fetchTemplate = async (id: string) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('templates')
        .select(`
          *,
          profiles:author_id(*),
          categories(*)
        `)
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      if (data) {
        setTemplate({
          id: data.id,
          title: data.title,
          slug: data.slug,
          description: data.description || '',
          content: data.content || '',
          category_id: data.category_id,
          author_id: data.author_id,
          featured_image: data.featured_image || '',
          demo_url: data.demo_url || '',
          source_url: data.source_url || '',
          is_premium: data.is_premium || false,
          is_featured: data.is_featured || false,
          status: data.status === 'published' ? 'published' : 'draft'
        });
      }
    } catch (error) {
      console.error('Error fetching template:', error);
      toast({
        title: 'Error',
        description: 'Failed to load template',
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
        description: 'Failed to load categories',
        variant: 'destructive'
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTemplate(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (name: string, checked: boolean) => {
    setTemplate(prev => ({ ...prev, [name]: checked }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setTemplate(prev => ({ ...prev, [name]: value }));
  };

  const generateSlug = () => {
    if (!template.title) return;
    
    const slug = template.title
      .toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-');
      
    setTemplate(prev => ({ ...prev, slug }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    if (!template.slug) {
      generateSlug();
    }
    
    try {
      const userData = await supabase.auth.getUser();
      const userId = userData.data.user?.id;
      
      let response;
      
      if (isEditMode) {
        response = await supabase
          .from('templates')
          .update({
            title: template.title,
            description: template.description,
            content: template.content,
            category_id: template.category_id,
            featured_image: template.featured_image,
            demo_url: template.demo_url,
            source_url: template.source_url,
            is_premium: template.is_premium,
            is_featured: template.is_featured,
            status: template.status,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);
      } else {
        response = await supabase
          .from('templates')
          .insert({
            title: template.title,
            slug: template.slug,
            description: template.description,
            content: template.content,
            category_id: template.category_id,
            featured_image: template.featured_image,
            demo_url: template.demo_url,
            source_url: template.source_url,
            is_premium: template.is_premium,
            is_featured: template.is_featured,
            status: template.status,
            author_id: userId
          });
      }

      const { error } = response;
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: `Template ${isEditMode ? 'updated' : 'created'} successfully`,
      });
      
      if (template.status === 'published') {
        // If published, navigate to the template page
        navigate('/templates');
      } else {
        // If draft, navigate back to template management
        navigate('/dashboard/templates');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: 'Error',
        description: `Failed to ${isEditMode ? 'update' : 'create'} template`,
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const publishTemplate = async () => {
    setIsSaving(true);
    try {
      const publishData = {
        ...template,
        status: 'published'
      };
      
      let response;
      
      if (isEditMode) {
        response = await supabase
          .from('templates')
          .update({
            ...publishData,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);
      } else {
        const userData = await supabase.auth.getUser();
        const userId = userData.data.user?.id;
        
        response = await supabase
          .from('templates')
          .insert({
            ...publishData,
            author_id: userId
          });
      }
      
      const { error } = response;
      if (error) throw error;
      
      toast({
        title: 'Success',
        description: 'Template published successfully',
      });
      
      // Navigate to the templates page to see the published template
      navigate('/templates');
    } catch (error) {
      console.error('Error publishing template:', error);
      toast({
        title: 'Error',
        description: 'Failed to publish template',
        variant: 'destructive'
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
    <div className="flex flex-col space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          {isEditMode ? 'Edit Template' : 'Create New Template'}
        </h1>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Template Information</CardTitle>
                <CardDescription>
                  Basic information about the template
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="w-full mb-4">
                    <TabsTrigger value="details" className="flex-1">Template Details</TabsTrigger>
                    <TabsTrigger value="content" className="flex-1">HTML Content</TabsTrigger>
                    <TabsTrigger value="preview" className="flex-1">Preview</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="details" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Title*</Label>
                      <Input
                        id="title"
                        name="title"
                        placeholder="Template title"
                        value={template.title}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="Template description"
                        value={template.description}
                        onChange={handleChange}
                        rows={4}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="demo_url">Demo URL</Label>
                        <Input
                          id="demo_url"
                          name="demo_url"
                          placeholder="https://example.com/demo"
                          value={template.demo_url || ''}
                          onChange={handleChange}
                          type="url"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="source_url">Source Code URL</Label>
                        <Input
                          id="source_url"
                          name="source_url"
                          placeholder="https://github.com/example/repo"
                          value={template.source_url || ''}
                          onChange={handleChange}
                          type="url"
                        />
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="content" className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="content">HTML Content</Label>
                      <Textarea
                        id="content"
                        name="content"
                        placeholder="Paste your HTML template code here"
                        value={template.content}
                        onChange={handleChange}
                        rows={15}
                        className="font-mono text-sm"
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="preview" className="border p-4 min-h-[400px] rounded-md">
                    {template.content ? (
                      <iframe
                        title="Template Preview"
                        srcDoc={template.content}
                        className="w-full h-[500px] border-0"
                        sandbox="allow-scripts"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
                        <p>Add template content to see a preview</p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>
                  Configure template settings and metadata
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug*</Label>
                  <div className="flex gap-2">
                    <Input
                      id="slug"
                      name="slug"
                      placeholder="template-url-slug"
                      value={template.slug}
                      onChange={handleChange}
                      required
                    />
                    <Button 
                      type="button" 
                      variant="outline"
                      onClick={generateSlug}
                      disabled={!template.title}
                    >
                      Generate
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category_id">Category</Label>
                  <Select
                    value={template.category_id || undefined}
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
                
                <div className="space-y-2">
                  <Label htmlFor="featured_image">Featured Image URL</Label>
                  <Input
                    id="featured_image"
                    name="featured_image"
                    placeholder="https://example.com/image.jpg"
                    value={template.featured_image || ''}
                    onChange={handleChange}
                  />
                  {template.featured_image && (
                    <div className="mt-2 border rounded-md overflow-hidden">
                      <img 
                        src={template.featured_image} 
                        alt="Featured" 
                        className="w-full h-32 object-cover"
                        onError={(e) => { 
                          (e.target as HTMLImageElement).src = '/images/templates/template-blog.jpg';
                        }} 
                      />
                    </div>
                  )}
                </div>
                
                <div className="space-y-3 pt-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="is_premium" 
                      checked={template.is_premium} 
                      onCheckedChange={(checked) => handleCheckboxChange('is_premium', checked as boolean)}
                    />
                    <Label htmlFor="is_premium" className="cursor-pointer">
                      Premium template
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="is_featured" 
                      checked={template.is_featured} 
                      onCheckedChange={(checked) => handleCheckboxChange('is_featured', checked as boolean)}
                    />
                    <Label htmlFor="is_featured" className="cursor-pointer">
                      Featured on homepage
                    </Label>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard/templates')}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <div className="flex gap-2">
                  <Button 
                    type="submit" 
                    variant="secondary"
                    disabled={isSaving}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    {isEditMode ? 'Update' : 'Save Draft'}
                  </Button>
                  
                  <Button 
                    type="button"
                    disabled={isSaving}
                    onClick={publishTemplate}
                  >
                    <Globe className="mr-2 h-4 w-4" />
                    Publish
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TemplateEditPage;
