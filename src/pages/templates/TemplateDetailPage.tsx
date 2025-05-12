
import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft,
  Download,
  Star,
  Calendar,
  Monitor,
  Check,
  Palette,
  Code,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

// Import local images for templates
import templateBlogImage from '/images/templates/template-blog.jpg';
import templateDashboardImage from '/images/templates/template-dashboard.jpg';
import templateEcommerceImage from '/images/templates/template-ecommerce.jpg';
import templatePortfolioImage from '/images/templates/template-portfolio.jpg';

// Create a mapping for local images
const localImages = {
  'template-blog': templateBlogImage,
  'template-dashboard': templateDashboardImage,
  'template-ecommerce': templateEcommerceImage,
  'template-portfolio': templatePortfolioImage,
};

interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  preview_image: string | null;
  download_url: string;
  download_count: number;
  is_premium: boolean;
  color_scheme: string | null;
  technology: string[] | null;
  created_at: string;
}

const TemplateDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: template, isLoading, error } = useQuery({
    queryKey: ['template', id],
    queryFn: async () => {
      if (!id) throw new Error('Template ID is required');
      
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data as Template;
    }
  });

  // Function to get the appropriate image
  const getTemplateImage = (template: Template | null | undefined) => {
    if (!template || !template.preview_image) {
      return templateDashboardImage;
    }

    // If the image URL doesn't start with http (local reference)
    if (!template.preview_image.startsWith('http')) {
      // Try to find a local image match based on the filename
      const imageName = template.preview_image.split('/').pop()?.split('.')[0];
      if (imageName && imageName in localImages) {
        return localImages[imageName as keyof typeof localImages];
      }
    }
    
    // If it's an external URL, use it directly
    if (template.preview_image.startsWith('http')) {
      return template.preview_image;
    }
    
    // Fallback by category
    if (template.category) {
      const category = template.category.toLowerCase();
      if (category.includes('blog')) return templateBlogImage;
      if (category.includes('dashboard')) return templateDashboardImage;
      if (category.includes('ecommerce')) return templateEcommerceImage;
      if (category.includes('portfolio')) return templatePortfolioImage;
    }
    
    // Final fallback
    return templateDashboardImage;
  };

  const handleDownload = async () => {
    if (!template) return;

    try {
      // Update download count
      const { error } = await supabase
        .from('templates')
        .update({
          download_count: (template.download_count || 0) + 1
        })
        .eq('id', template.id);

      if (error) throw error;

      // Log download
      await supabase.from('download_history').insert({
        url: template.download_url,
        platform: navigator.platform,
        format: 'zip',
        status: 'completed'
      });

      // Initiate download
      window.open(template.download_url, '_blank');

      toast({
        title: "Download dimulai",
        description: "Template sedang diunduh. Silahkan tunggu."
      });
    } catch (error) {
      console.error('Error downloading template:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Gagal mengunduh template"
      });
    }
  };

  // Placeholder template
  const placeholderTemplate: Template = {
    id: '1',
    name: 'Admin Dashboard Pro',
    description: 'Template dashboard admin modern dengan berbagai fitur lengkap seperti autentikasi, manajemen pengguna, analitik, dan tampilan yang fully responsive. Dibuat dengan React, TypeScript, dan Tailwind CSS untuk kemudahan pengembangan dan customisasi.',
    category: 'Dashboard',
    preview_image: templateDashboardImage,
    download_url: '#',
    download_count: 1245,
    is_premium: true,
    color_scheme: 'Light & Dark',
    technology: ['React', 'TypeScript', 'Tailwind CSS', 'Recharts'],
    created_at: new Date().toISOString()
  };

  // Use placeholder if no data
  const displayTemplate = template || placeholderTemplate;
  const templateImage = getTemplateImage(displayTemplate);

  if (isLoading) return <TemplateSkeleton />;

  if (error) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Template tidak ditemukan</h1>
        <p className="mb-8">Maaf, template yang Anda cari tidak tersedia.</p>
        <Link to="/templates">
          <Button>Kembali ke Daftar Templates</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Back Button */}
      <div className="mb-8">
        <Link to="/templates">
          <Button variant="ghost" className="pl-0">
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Templates
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Preview Image */}
        <div className="lg:col-span-2">
          <div className="rounded-lg overflow-hidden border">
            <img 
              src={templateImage} 
              alt={displayTemplate.name} 
              className="w-full h-auto object-cover"
            />
          </div>
          
          <div className="mt-8">
            <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full md:w-auto grid grid-cols-2 md:grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="features">Fitur</TabsTrigger>
                <TabsTrigger value="tech">Teknologi</TabsTrigger>
                <TabsTrigger value="license">Lisensi</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="mt-6">
                <h3 className="text-xl font-bold mb-4">Deskripsi</h3>
                <p className="text-muted-foreground">
                  {displayTemplate.description || 'Tidak ada deskripsi tersedia.'}
                </p>
                
                <h3 className="text-xl font-bold mt-8 mb-4">Spesifikasi</h3>
                <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Kategori</dt>
                    <dd>{displayTemplate.category}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Tanggal Rilis</dt>
                    <dd>{new Date(displayTemplate.created_at).toLocaleDateString()}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Skema Warna</dt>
                    <dd>{displayTemplate.color_scheme || 'Light'}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground">Jumlah Unduhan</dt>
                    <dd>{displayTemplate.download_count}</dd>
                  </div>
                </dl>
              </TabsContent>
              
              <TabsContent value="features" className="mt-6">
                <h3 className="text-xl font-bold mb-4">Fitur Utama</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-primary mt-0.5" />
                    <span>Fully responsive design yang menyesuaikan dengan semua ukuran layar</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-primary mt-0.5" />
                    <span>Komponen yang dapat digunakan kembali untuk pengembangan yang lebih cepat</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-primary mt-0.5" />
                    <span>Integrasi dengan API untuk menampilkan data dinamis</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-primary mt-0.5" />
                    <span>Dark mode dan light mode yang dapat diubah dengan satu klik</span>
                  </li>
                  <li className="flex items-start">
                    <Check className="h-5 w-5 mr-2 text-primary mt-0.5" />
                    <span>Dokumentasi lengkap untuk memudahkan penggunaan dan kustomisasi</span>
                  </li>
                </ul>
              </TabsContent>
              
              <TabsContent value="tech" className="mt-6">
                <h3 className="text-xl font-bold mb-4">Teknologi yang Digunakan</h3>
                <div className="flex flex-wrap gap-2 mb-6">
                  {displayTemplate.technology?.map((tech) => (
                    <Badge key={tech} variant="secondary" className="px-3 py-1">
                      <Code className="h-4 w-4 mr-2" />
                      {tech}
                    </Badge>
                  )) || (
                    <>
                      <Badge variant="secondary" className="px-3 py-1">
                        <Code className="h-4 w-4 mr-2" />
                        React
                      </Badge>
                      <Badge variant="secondary" className="px-3 py-1">
                        <Code className="h-4 w-4 mr-2" />
                        Tailwind CSS
                      </Badge>
                    </>
                  )}
                </div>
                
                <h4 className="text-lg font-bold mb-2">Persyaratan Sistem</h4>
                <ul className="space-y-2 text-muted-foreground">
                  <li>Node.js v14 atau lebih tinggi</li>
                  <li>npm atau yarn package manager</li>
                  <li>Pengetahuan dasar tentang React dan Tailwind CSS</li>
                </ul>
              </TabsContent>
              
              <TabsContent value="license" className="mt-6">
                <h3 className="text-xl font-bold mb-4">Informasi Lisensi</h3>
                <div className="p-4 border rounded-md bg-muted/50">
                  <h4 className="font-medium mb-2">
                    {displayTemplate.is_premium ? 'Lisensi Premium' : 'Lisensi Standar'}
                  </h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>✓ Digunakan untuk satu proyek</li>
                    <li>✓ Dapat dimodifikasi sesuai kebutuhan</li>
                    <li>{displayTemplate.is_premium ? '✓' : '✘'} Dukungan teknis prioritas</li>
                    <li>{displayTemplate.is_premium ? '✓' : '✘'} Akses ke semua update terbaru</li>
                    <li>{displayTemplate.is_premium ? '✓' : '✘'} Dapat digunakan untuk proyek komersial</li>
                  </ul>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        
        {/* Right Column - Details and Download */}
        <div>
          <div className="border rounded-lg p-6 sticky top-6">
            <h1 className="text-2xl font-bold mb-2">{displayTemplate.name}</h1>
            
            <div className="flex items-center mb-6">
              <Badge variant="outline" className="mr-2">{displayTemplate.category}</Badge>
              <div className="flex items-center text-muted-foreground text-sm">
                <Download className="h-3.5 w-3.5 mr-1" />
                <span>{displayTemplate.download_count} unduhan</span>
              </div>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-2">Skema Warna</h3>
                <div className="flex items-center">
                  <Palette className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{displayTemplate.color_scheme || 'Light'}</span>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Responsive</h3>
                <div className="flex items-center">
                  <Monitor className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Ya, semua ukuran layar</span>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Tanggal Rilis</h3>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{new Date(displayTemplate.created_at).toLocaleDateString()}</span>
                </div>
              </div>
              
              {/* Download Button */}
              <Button className="w-full" size="lg" onClick={handleDownload}>
                {displayTemplate.is_premium ? (
                  <>
                    <Lock className="h-4 w-4 mr-2" /> Download Premium
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" /> Download Gratis
                  </>
                )}
              </Button>
              
              {displayTemplate.is_premium && (
                <p className="text-center text-sm text-muted-foreground">
                  Memerlukan subscription premium untuk mengunduh
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TemplateSkeleton = () => (
  <div className="container mx-auto px-4 py-10">
    <div className="mb-8">
      <Skeleton className="h-10 w-40" />
    </div>
    
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <Skeleton className="w-full h-[400px]" />
        
        <div className="mt-8">
          <Skeleton className="h-10 w-full md:w-96 mb-6" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-full mb-2" />
          <Skeleton className="h-4 w-4/5 mb-8" />
          
          <Skeleton className="h-7 w-48 mb-4" />
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        </div>
      </div>
      
      <div>
        <div className="border rounded-lg p-6">
          <Skeleton className="h-8 w-4/5 mb-4" />
          <Skeleton className="h-5 w-full mb-6" />
          
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-full mb-4" />
          
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-full mb-4" />
          
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-full mb-6" />
          
          <Skeleton className="h-12 w-full mb-2" />
        </div>
      </div>
    </div>
  </div>
);

export default TemplateDetailPage;
