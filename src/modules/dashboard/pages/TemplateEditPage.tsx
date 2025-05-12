import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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

interface Template {
  id?: string;
  name: string;
  description: string;
  category: string;
  download_url: string;
  preview_image?: string;
  is_premium: boolean;
  color_scheme?: string;
  technology?: string[];
}

export const TemplateEditPage: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditMode = id !== 'new';
  
  const [template, setTemplate] = useState<Template>({
    name: '',
    description: '',
    category: '',
    download_url: '',
    preview_image: '',
    is_premium: false,
    color_scheme: '',
    technology: []
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<string[]>([
    'Landing Page', 'Dashboard', 'Blog', 'E-commerce', 'Portfolio', 'Admin'
  ]);
  const [techOptions, setTechOptions] = useState<string[]>([
    'React', 'Vue', 'Angular', 'Tailwind CSS', 'Bootstrap', 'Material UI', 'TypeScript'
  ]);
  const [selectedTech, setSelectedTech] = useState<string>('');

  useEffect(() => {
    if (isEditMode) {
      fetchTemplate();
    }
    fetchCategories();
  }, [id]);

  const fetchTemplate = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      if (data) {
        setTemplate(data);
      }
    } catch (error) {
      console.error('Error fetching template:', error);
      toast({
        title: 'Error',
        description: 'Gagal memuat data template',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('templates')
        .select('category')
        .not('category', 'is', null);

      if (error) throw error;
      
      if (data && data.length > 0) {
        const uniqueCategories = Array.from(new Set(data.map(item => item.category)));
        setAvailableCategories(prevCategories => {
          return [...new Set([...prevCategories, ...uniqueCategories])];
        });
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTemplate(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setTemplate(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setTemplate(prev => ({ ...prev, is_premium: checked }));
  };

  const handleAddTechnology = () => {
    if (!selectedTech || template.technology?.includes(selectedTech)) return;
    
    setTemplate(prev => ({
      ...prev,
      technology: [...(prev.technology || []), selectedTech]
    }));
    setSelectedTech('');
  };

  const handleRemoveTechnology = (tech: string) => {
    setTemplate(prev => ({
      ...prev,
      technology: prev.technology?.filter(t => t !== tech) || []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      let response;
      
      if (isEditMode) {
        response = await supabase
          .from('templates')
          .update({
            name: template.name,
            description: template.description,
            category: template.category,
            download_url: template.download_url,
            preview_image: template.preview_image,
            is_premium: template.is_premium,
            color_scheme: template.color_scheme,
            technology: template.technology,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);
      } else {
        response = await supabase
          .from('templates')
          .insert({
            name: template.name,
            description: template.description,
            category: template.category,
            download_url: template.download_url,
            preview_image: template.preview_image,
            is_premium: template.is_premium,
            color_scheme: template.color_scheme,
            technology: template.technology
          });
      }

      const { error } = response;
      if (error) throw error;
      
      toast({
        title: 'Berhasil',
        description: `Template berhasil ${isEditMode ? 'diperbarui' : 'ditambahkan'}`,
      });
      
      navigate('/dashboard/templates');
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: 'Error',
        description: `Gagal ${isEditMode ? 'memperbarui' : 'menambahkan'} template`,
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
          {isEditMode ? 'Edit Template' : 'Template Baru'}
        </h1>
      </div>
      
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>{isEditMode ? 'Edit Detail Template' : 'Tambahkan Template Baru'}</CardTitle>
            <CardDescription>
              {isEditMode
                ? 'Perbarui informasi template yang ada'
                : 'Isi detail untuk menambahkan template baru'}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama Template*</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="Masukkan nama template"
                      value={template.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Kategori*</Label>
                    <Select
                      value={template.category}
                      onValueChange={(value) => handleSelectChange('category', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kategori" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCategories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Deskripsi</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Deskripsi template"
                    value={template.description || ''}
                    onChange={handleChange}
                    rows={4}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="download_url">URL Unduhan*</Label>
                    <Input
                      id="download_url"
                      name="download_url"
                      placeholder="https://example.com/download"
                      value={template.download_url}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="preview_image">URL Gambar Preview</Label>
                    <Input
                      id="preview_image"
                      name="preview_image"
                      placeholder="https://example.com/image.jpg"
                      value={template.preview_image || ''}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="color_scheme">Skema Warna</Label>
                    <Input
                      id="color_scheme"
                      name="color_scheme"
                      placeholder="Light, Dark, Colorful, etc."
                      value={template.color_scheme || ''}
                      onChange={handleChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="is_premium">Template Premium</Label>
                      <Switch
                        id="is_premium"
                        checked={template.is_premium}
                        onCheckedChange={handleSwitchChange}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Template premium memerlukan langganan untuk diunduh.
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <Label>Teknologi</Label>
                  <div className="flex flex-wrap gap-2">
                    {template.technology && template.technology.map((tech) => (
                      <div
                        key={tech}
                        className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm flex items-center gap-2"
                      >
                        {tech}
                        <button
                          type="button"
                          onClick={() => handleRemoveTechnology(tech)}
                          className="text-secondary-foreground/70 hover:text-secondary-foreground"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-2">
                    <Select
                      value={selectedTech}
                      onValueChange={setSelectedTech}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Pilih teknologi" />
                      </SelectTrigger>
                      <SelectContent>
                        {techOptions.map((tech) => (
                          <SelectItem key={tech} value={tech}>
                            {tech}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={handleAddTechnology}
                      disabled={!selectedTech}
                    >
                      Tambah
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/dashboard/templates')}
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
                isEditMode ? 'Perbarui Template' : 'Buat Template'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default TemplateEditPage;
