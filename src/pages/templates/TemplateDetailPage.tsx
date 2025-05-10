
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { ArrowLeft, Download, Heart, Share2, Eye, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface Template {
  id: string;
  name: string;
  description: string;
  preview_image: string;
  download_url: string;
  category: string;
  technology: string[];
  color_scheme: string;
  is_premium: boolean;
  download_count: number;
  created_at: string;
}

const TemplateDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [isLiked, setIsLiked] = useState(false);
  
  const { data: template, isLoading } = useQuery({
    queryKey: ['template', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('templates')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      return data as Template;
    }
  });
  
  const handleDownload = () => {
    if (!template) return;
    
    // Simpan histori download jika user terautentikasi
    const trackDownload = async () => {
      const user = supabase.auth.getUser();
      
      if ((await user).data?.user) {
        await supabase.from('download_history').insert({
          user_id: (await user).data.user.id,
          url: template.download_url,
          platform: 'web',
          format: 'zip'
        });
        
        // Update jumlah download template
        await supabase
          .from('templates')
          .update({ download_count: template.download_count + 1 })
          .eq('id', template.id);
      }
    };
    
    trackDownload();
    
    // Mulai proses download
    window.open(template.download_url, '_blank');
    
    toast({
      title: "Download dimulai",
      description: "Template sedang diunduh",
    });
  };
  
  const toggleLike = () => {
    setIsLiked(!isLiked);
    
    toast({
      title: isLiked ? "Dihapus dari favorit" : "Ditambahkan ke favorit",
      description: isLiked ? "Template dihapus dari favorit Anda" : "Template ditambahkan ke favorit Anda",
    });
  };
  
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: template?.name,
        text: template?.description,
        url: window.location.href,
      }).catch(console.error);
    } else {
      // Fallback untuk browser yang tidak support Web Share API
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "URL Disalin",
        description: "URL template telah disalin ke clipboard",
      });
    }
  };
  
  if (isLoading) return <TemplateSkeleton />;
  
  if (!template) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Template tidak ditemukan</h1>
        <p className="mb-8">Maaf, template yang Anda cari tidak tersedia.</p>
        <Link to="/templates">
          <Button variant="default">Kembali ke Galeri Template</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      {/* Back Button */}
      <div className="mb-8">
        <Link to="/templates">
          <Button variant="ghost" className="pl-0">
            <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Galeri Template
          </Button>
        </Link>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Preview Image */}
        <div className="bg-secondary/20 rounded-lg overflow-hidden border border-border">
          <img 
            src={template.preview_image || '/placeholder.svg'} 
            alt={template.name}
            className="w-full h-auto aspect-[4/3] object-cover"
          />
        </div>
        
        {/* Template Info */}
        <div>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">{template.name}</h1>
              
              {/* Kategori dan Label */}
              <div className="flex flex-wrap gap-2 mb-4">
                <Badge variant="secondary">{template.category}</Badge>
                {template.is_premium && (
                  <Badge variant="default" className="bg-amber-500 hover:bg-amber-600">Premium</Badge>
                )}
                {template.technology?.map((tech) => (
                  <Badge key={tech} variant="outline">{tech}</Badge>
                ))}
              </div>
            </div>
            
            {/* Actions */}
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleLike}
                className={isLiked ? "text-red-500" : ""}
              >
                <Heart className={`h-5 w-5 ${isLiked ? "fill-current" : ""}`} />
              </Button>
              <Button variant="ghost" size="icon" onClick={handleShare}>
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
          
          {/* Stats */}
          <div className="flex gap-4 text-sm text-muted-foreground mb-6">
            <div className="flex items-center">
              <Download className="mr-1 h-4 w-4" />
              <span>{template.download_count} unduhan</span>
            </div>
            <div className="flex items-center">
              <Eye className="mr-1 h-4 w-4" />
              <span>2.5K dilihat</span>
            </div>
            <div className="flex items-center">
              <ThumbsUp className="mr-1 h-4 w-4" />
              <span>95% suka</span>
            </div>
          </div>
          
          {/* Deskripsi */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Deskripsi</h2>
            <p className="text-muted-foreground">{template.description}</p>
          </div>
          
          {/* Fitur-fitur */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Fitur-fitur</h2>
            <ul className="space-y-2">
              <li className="flex items-start">
                <div className="mr-2 mt-1 h-4 w-4 text-primary">✓</div>
                <span>Full responsive design untuk semua ukuran perangkat</span>
              </li>
              <li className="flex items-start">
                <div className="mr-2 mt-1 h-4 w-4 text-primary">✓</div>
                <span>Kustomisasi warna dan tema yang fleksibel</span>
              </li>
              <li className="flex items-start">
                <div className="mr-2 mt-1 h-4 w-4 text-primary">✓</div>
                <span>Komponen yang dapat digunakan kembali</span>
              </li>
              <li className="flex items-start">
                <div className="mr-2 mt-1 h-4 w-4 text-primary">✓</div>
                <span>Dokumentasi lengkap</span>
              </li>
              <li className="flex items-start">
                <div className="mr-2 mt-1 h-4 w-4 text-primary">✓</div>
                <span>Support 6 bulan</span>
              </li>
            </ul>
          </div>
          
          {/* Download Button */}
          <Button 
            onClick={handleDownload} 
            size="lg" 
            className="w-full"
          >
            <Download className="mr-2 h-5 w-5" />
            Download Template{template.is_premium ? " Premium" : ""}
          </Button>
        </div>
      </div>
    </div>
  );
};

const TemplateSkeleton = () => {
  // Skeleton component implementation
  return <div className="animate-pulse">Loading...</div>;
};

export default TemplateDetailPage;
