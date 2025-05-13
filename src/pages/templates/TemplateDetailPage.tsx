
import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/common/context/AuthContext';
import { 
  Download, 
  Heart, 
  Share2, 
  Eye, 
  ArrowLeft, 
  Bookmark,
  ExternalLink,
  LayoutTemplate,
  Palette,
  Code,
  ChevronRight
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/hooks/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import CodeBlock from '@/components/CodeBlock';
import MultiTabCodeBlock from '@/components/MultiTabCodeBlock';

// Import images
import templateDashboard from '/images/templates/template-dashboard.jpg';
import templateBlog from '/images/templates/template-blog.jpg';
import templateEcommerce from '/images/templates/template-ecommerce.jpg';
import templatePortfolio from '/images/templates/template-portfolio.jpg';

// Local images mapping
const localImages = {
  'template-dashboard': templateDashboard,
  'template-blog': templateBlog,
  'template-ecommerce': templateEcommerce,
  'template-portfolio': templatePortfolio,
};

// Helper function to get appropriate image
const getTemplateImage = (imageUrl: string | null) => {
  if (!imageUrl) return templateDashboard;
  
  if (!imageUrl.startsWith('http')) {
    // Try to find a local image match based on the filename
    const imageName = imageUrl.split('/').pop()?.split('.')[0];
    if (imageName && imageName in localImages) {
      return localImages[imageName as keyof typeof localImages];
    }
    
    // If the image starts with '/images/' it's from public folder
    if (imageUrl.startsWith('/images/')) {
      return imageUrl;
    }
  }
  
  // If it's an external URL, use it directly
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  
  // Default fallback based on category
  return templateDashboard;
};

const TemplateDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isFavorited, setIsFavorited] = useState(false);
  
  // Fetch template details
  const { data: template, isLoading, error } = useQuery({
    queryKey: ['template', id],
    queryFn: async () => {
      if (!id) throw new Error('No template ID provided');
      
      const { data, error } = await supabase
        .from('templates')
        .select(`
          *,
          profiles:created_by(*)
        `)
        .eq('id', id)
        .single();
        
      if (error) throw error;
      return data;
    },
  });

  // Check if user has favorited this template
  useQuery({
    queryKey: ['template-favorite', id, user?.id],
    queryFn: async () => {
      if (!user?.id || !id) return null;
      
      const { data, error } = await supabase
        .from('user_favorites')
        .select('*')
        .eq('template_id', id)
        .eq('user_id', user.id)
        .single();
        
      if (data) {
        setIsFavorited(true);
      }
      
      return data;
    },
    enabled: !!user?.id && !!id,
  });

  // Placeholder for related templates
  const relatedTemplates = [
    { 
      id: '1', 
      name: 'Dashboard Analytics', 
      category: 'Dashboard',
      preview_image: templateDashboard,
      is_premium: true
    },
    { 
      id: '2', 
      name: 'Blog Modern', 
      category: 'Blog',
      preview_image: templateBlog,
      is_premium: false
    },
    {
      id: '3',
      name: 'Portfolio Minimal',
      category: 'Portfolio',
      preview_image: templatePortfolio,
      is_premium: false
    }
  ];

  const handleDownload = async () => {
    if (!template) return;
    
    if (template.is_premium && (!user || user.role !== "admin")) {
      toast({
        title: "Premium Template",
        description: "Anda perlu berlangganan untuk mengunduh template premium ini.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Log download if user is logged in
      if (user) {
        await supabase
          .from('download_history')
          .insert({
            user_id: user.id,
            url: template.download_url,
            platform: navigator.platform,
          });
        
        // Update download count
        await supabase
          .from('templates')
          .update({ download_count: (template.download_count || 0) + 1 })
          .eq('id', template.id);
      }
      
      // Open the download URL in a new tab
      window.open(template.download_url, '_blank');
      
      toast({
        title: "Unduhan Dimulai",
        description: "Template Anda sedang diunduh.",
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Error",
        description: "Gagal memulai unduhan. Silakan coba lagi.",
        variant: "destructive"
      });
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      toast({
        title: "Login Diperlukan",
        description: "Silakan login untuk menandai template sebagai favorit.",
        variant: "destructive"
      });
      return;
    }
    
    if (!template) return;
    
    try {
      if (isFavorited) {
        // Remove from favorites
        await supabase
          .from('user_favorites')
          .delete()
          .eq('template_id', template.id)
          .eq('user_id', user.id);
        
        setIsFavorited(false);
        toast({ 
          title: "Dihapus dari favorit", 
          description: "Template telah dihapus dari daftar favorit Anda."
        });
      } else {
        // Add to favorites
        await supabase
          .from('user_favorites')
          .insert({
            template_id: template.id,
            user_id: user.id
          });
        
        setIsFavorited(true);
        toast({ 
          title: "Ditambahkan ke favorit", 
          description: "Template telah ditambahkan ke daftar favorit Anda."
        });
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast({
        title: "Error",
        description: "Gagal memperbarui status favorit. Silakan coba lagi.",
        variant: "destructive"
      });
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: template?.name || 'Template',
        url: window.location.href,
      }).catch(console.error);
    } else {
      // Fallback untuk browser yang tidak support Web Share API
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link template disalin ke clipboard",
      });
    }
  };
  
  if (isLoading) return <TemplateSkeleton />;
  
  if (error || !template) {
    return (
      <div className="container mx-auto py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Template tidak ditemukan</h1>
        <p className="mb-8">Maaf, template yang Anda cari tidak tersedia.</p>
        <Link to="/templates">
          <Button variant="default">Kembali ke Templates</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Content */}
        <div className="flex-1">
          {/* Navigation */}
          <div className="flex justify-between items-center mb-6">
            <Link to="/templates">
              <Button variant="ghost" className="pl-0">
                <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Templates
              </Button>
            </Link>
          </div>
          
          {/* Preview Images */}
          <div className="rounded-lg overflow-hidden border mb-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
            <div className="aspect-[16/9] overflow-hidden">
              <img 
                src={getTemplateImage(template.preview_image)} 
                alt={template.name} 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          
          {/* Template Tabs */}
          <Tabs defaultValue="overview" className="mt-6">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Ikhtisar</TabsTrigger>
              <TabsTrigger value="details">Detail Teknis</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
              <TabsTrigger value="code-examples">Contoh Kode</TabsTrigger>
            </TabsList>
            
            {/* Overview Tab */}
            <TabsContent value="overview">
              <div className="prose dark:prose-invert max-w-none">
                <h2 className="text-2xl font-bold mb-4">Tentang Template</h2>
                <p>{template.description || 'Template ini tidak memiliki deskripsi.'}</p>
                
                <h3 className="text-xl font-bold mt-6 mb-4">Fitur Utama</h3>
                <ul>
                  <li>Desain Responsif - Tampilan yang optimal di semua perangkat</li>
                  <li>Performa Tinggi - Dioptimalkan untuk kecepatan loading</li>
                  <li>Mudah Dikustomisasi - Ubah tema dan warna dengan mudah</li>
                  <li>Dokumentasi Lengkap - Panduan installasi dan konfigurasi</li>
                  <li>Regular Updates - Pembaruan berkala dan perbaikan bug</li>
                </ul>
                
                <h3 className="text-xl font-bold mt-6 mb-4">Direkomendasikan Untuk</h3>
                {template.category === 'Dashboard' && (
                  <p>
                    Template dashboard ini sangat cocok untuk aplikasi admin, panel kontrol bisnis, 
                    dan visualisasi data. Ideal untuk startup, aplikasi SaaS, atau sistem manajemen internal.
                  </p>
                )}
                {template.category === 'Blog' && (
                  <p>
                    Template blog ini dirancang untuk blogger, jurnalis, dan kreator konten. 
                    Dengan fokus pada keterbacaan dan SEO, template ini sempurna untuk blog personal maupun publikasi online.
                  </p>
                )}
                {template.category === 'E-commerce' && (
                  <p>
                    Template e-commerce ini menawarkan pengalaman belanja yang mulus dengan 
                    fitur keranjang belanja, halaman produk yang menarik, dan checkout yang dioptimalkan untuk konversi.
                  </p>
                )}
                {template.category === 'Portfolio' && (
                  <p>
                    Dirancang untuk desainer, fotografer, dan profesional kreatif. Template portofolio ini 
                    memamerkan karya Anda dengan tampilan yang elegan dan minimalis.
                  </p>
                )}
                
                <h3 className="text-xl font-bold mt-6 mb-4">Testimoni Pengguna</h3>
                <blockquote className="italic border-l-4 pl-4 border-primary/30">
                  "Template ini sangat membantu saya membangun website dalam waktu singkat dengan tampilan yang profesional. Sangat direkomendasikan!"
                  <footer className="mt-2 font-semibold">— Ahmad S., Web Developer</footer>
                </blockquote>
              </div>
            </TabsContent>
            
            {/* Details Tab */}
            <TabsContent value="details">
              <div className="prose dark:prose-invert max-w-none">
                <h2 className="text-2xl font-bold mb-4">Spesifikasi Teknis</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {/* Technical Specifications */}
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-4 flex items-center">
                        <Code className="mr-2 h-5 w-5" /> Teknologi
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Framework:</span>
                          <span className="font-medium">React {template.technology?.includes('React') ? '✓' : ''}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">CSS Framework:</span>
                          <span className="font-medium">Tailwind CSS {template.technology?.includes('Tailwind CSS') ? '✓' : ''}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Bahasa:</span>
                          <span className="font-medium">TypeScript {template.technology?.includes('TypeScript') ? '✓' : ''}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Build Tool:</span>
                          <span className="font-medium">Vite</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">UI Library:</span>
                          <span className="font-medium">shadcn/ui</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Design Specifications */}
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-4 flex items-center">
                        <Palette className="mr-2 h-5 w-5" /> Desain
                      </h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Mode:</span>
                          <span className="font-medium">Light & Dark</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Skema Warna:</span>
                          <span className="font-medium">{template.color_scheme || 'Modern'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Layout:</span>
                          <span className="font-medium">Responsive</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Design System:</span>
                          <span className="font-medium">Modular Components</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Icons:</span>
                          <span className="font-medium">Lucide Icons</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Compatibility */}
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-4">Kompatibilitas</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Browser:</span>
                          <span className="font-medium">Chrome, Firefox, Safari, Edge</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Perangkat:</span>
                          <span className="font-medium">Desktop, Tablet, Mobile</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Responsif:</span>
                          <span className="font-medium">Ya, Fully Responsive</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Support & Updates */}
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-bold mb-4">Dukungan & Update</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Dukungan:</span>
                          <span className="font-medium">6 Bulan</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Pembaruan:</span>
                          <span className="font-medium">Ya (3 Bulan)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Dokumentasi:</span>
                          <span className="font-medium">Lengkap (PDF & Online)</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Support Channels:</span>
                          <span className="font-medium">Email, Discord</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>
            
            {/* Preview Tab */}
            <TabsContent value="preview">
              <div className="prose dark:prose-invert max-w-none">
                <h2 className="text-2xl font-bold mb-4">Preview Template</h2>
                
                <div className="mt-6 space-y-6">
                  {/* Main Preview Image */}
                  <div className="rounded-lg overflow-hidden border">
                    <img 
                      src={getTemplateImage(template.preview_image)} 
                      alt={template.name} 
                      className="w-full h-auto"
                    />
                  </div>
                  
                  {/* Additional Preview Images */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="rounded-lg overflow-hidden border">
                      <img 
                        src={template.category === 'Dashboard' ? templateDashboard : 
                          template.category === 'Blog' ? templateBlog : 
                          template.category === 'E-commerce' ? templateEcommerce : templatePortfolio} 
                        alt={`${template.name} - View 1`} 
                        className="w-full h-auto"
                      />
                    </div>
                    <div className="rounded-lg overflow-hidden border">
                      <img 
                        src={template.category === 'Blog' ? templateBlog : 
                          template.category === 'Dashboard' ? templateDashboard :
                          template.category === 'E-commerce' ? templateEcommerce : templatePortfolio} 
                        alt={`${template.name} - View 2`} 
                        className="w-full h-auto"
                      />
                    </div>
                  </div>
                  
                  {/* Demo Link */}
                  <div className="flex justify-center mt-8">
                    <Button className="flex items-center" variant="outline">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      Lihat Demo Template
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            {/* Code Examples Tab */}
            <TabsContent value="code-examples">
              <div className="prose dark:prose-invert max-w-none">
                <h2 className="text-2xl font-bold mb-4">Contoh Kode</h2>
                <p>Lihat beberapa contoh kode dari template ini:</p>
                
                {/* Single Code Block Example */}
                <h3 className="mt-6">Component Setup</h3>
                <CodeBlock 
                  language="typescript"
                  filename="Button.tsx"
                  code={`import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }`}
                />
                
                {/* Multi Tab Code Block Example */}
                <h3 className="mt-8">Template Struktur</h3>
                <MultiTabCodeBlock 
                  tabs={[
                    {
                      label: "HTML",
                      language: "html",
                      filename: "index.html",
                      code: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${template.name} Template</title>
  <link rel="stylesheet" href="style.css">
</head>
<body>
  <div class="container">
    <header class="main-header">
      <nav class="navbar">
        <div class="logo">
          <h1>${template.name}</h1>
        </div>
        <ul class="nav-links">
          <li><a href="#" class="active">Home</a></li>
          <li><a href="#">Features</a></li>
          <li><a href="#">Pricing</a></li>
          <li><a href="#">About</a></li>
          <li><a href="#">Contact</a></li>
        </ul>
        <button class="theme-toggle" id="themeToggle">
          🌙
        </button>
      </nav>
    </header>
    
    <main>
      <!-- Content goes here -->
    </main>
    
    <footer>
      <p>&copy; 2025 ${template.name} Template. All rights reserved.</p>
    </footer>
  </div>
  
  <script src="script.js"></script>
</body>
</html>`
                    },
                    {
                      label: "CSS",
                      language: "css",
                      filename: "styles.css",
                      code: `:root {
  --primary: #3b82f6;
  --primary-hover: #2563eb;
  --background: #ffffff;
  --foreground: #020817;
  --card: #ffffff;
  --card-foreground: #020817;
  --border: #e2e8f0;
  --input: #e2e8f0;
  --ring: #3b82f6;
  
  --radius: 0.5rem;
}

.dark {
  --primary: #3b82f6;
  --primary-hover: #60a5fa;
  --background: #020817;
  --foreground: #ffffff;
  --card: #1e293b;
  --card-foreground: #ffffff;
  --border: #1e293b;
  --input: #1e293b;
  --ring: #3b82f6;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen,
    Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  background-color: var(--background);
  color: var(--foreground);
  line-height: 1.6;
  transition: background-color 0.3s ease, color 0.3s ease;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

/* Navigation */
.main-header {
  padding: 1rem 0;
  border-bottom: 1px solid var(--border);
}

.navbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo h1 {
  font-size: 1.5rem;
  font-weight: bold;
}

.nav-links {
  display: flex;
  list-style: none;
  gap: 2rem;
}

.nav-links a {
  text-decoration: none;
  color: var(--foreground);
  font-weight: 500;
  transition: color 0.2s ease;
}

.nav-links a:hover,
.nav-links a.active {
  color: var(--primary);
}

/* Theme toggle */
.theme-toggle {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.25rem;
}

/* Responsive */
@media (max-width: 768px) {
  .navbar {
    flex-direction: column;
    gap: 1rem;
  }
  
  .nav-links {
    flex-wrap: wrap;
    justify-content: center;
    gap: 1rem;
  }
}`
                    },
                    {
                      label: "JavaScript",
                      language: "javascript",
                      filename: "script.js",
                      code: `document.addEventListener('DOMContentLoaded', () => {
  // Theme toggling functionality
  const themeToggle = document.getElementById('themeToggle');
  const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
  
  // Check for saved theme preference or use the system preference
  const currentTheme = localStorage.getItem('theme');
  if (currentTheme === 'dark' || (!currentTheme && prefersDarkScheme.matches)) {
    document.documentElement.classList.add('dark');
    themeToggle.textContent = '☀️';
  } else {
    document.documentElement.classList.remove('dark');
    themeToggle.textContent = '🌙';
  }
  
  // Toggle theme when button is clicked
  themeToggle.addEventListener('click', () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      themeToggle.textContent = '🌙';
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      themeToggle.textContent = '☀️';
    }
  });
  
  // Initialize interactive elements
  initializeComponents();
});

function initializeComponents() {
  // This function would initialize various components in the template
  console.log('${template.name} Template Initialized');
  
  // Example: Set up smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });
}`
                    }
                  ]}
                />
                
                <div className="mt-10">
                  <p className="text-muted-foreground">
                    Template ini termasuk lebih banyak komponen dan fitur yang sudah siap digunakan.
                    Setelah mengunduh template, Anda akan mendapatkan akses ke dokumentasi lengkap
                    dan panduan implementasi.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Sidebar */}
        <div className="lg:w-80 w-full space-y-6">
          {/* Template Info Card */}
          <Card className="sticky top-6">
            <CardContent className="p-6 space-y-6">
              <div className="flex justify-between items-center">
                <Badge variant="outline" className="bg-primary/5 text-primary">
                  {template.category}
                </Badge>
                <Badge variant={template.is_premium ? "default" : "secondary"}>
                  {template.is_premium ? 'Premium' : 'Gratis'}
                </Badge>
              </div>
              
              <h1 className="text-2xl font-bold">{template.name}</h1>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Unduhan</span>
                  <span className="font-medium">{template.download_count || 0}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Dibuat</span>
                  <span className="font-medium">
                    {formatDistanceToNow(new Date(template.created_at), 
                      { addSuffix: true, locale: idLocale })}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Lisensi</span>
                  <span className="font-medium">
                    {template.is_premium ? 'Commercial' : 'MIT'}
                  </span>
                </div>
                
                {template.technology && template.technology.length > 0 && (
                  <div>
                    <span className="text-muted-foreground block mb-2">Teknologi</span>
                    <div className="flex flex-wrap gap-1">
                      {template.technology.map((tech, index) => (
                        <Badge key={index} variant="outline">{tech}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <Button className="w-full" size="lg" onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  {template.is_premium ? 'Beli Sekarang' : 'Unduh Gratis'}
                </Button>
                
                <div className="flex gap-2">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline"
                          className="flex-1"
                          onClick={toggleFavorite}
                        >
                          <Heart 
                            className={cn(
                              "mr-2 h-4 w-4", 
                              isFavorited && "fill-rose-500 text-rose-500"
                            )} 
                          />
                          {isFavorited ? 'Favorit' : 'Favoritkan'}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{isFavorited ? 'Hapus dari favorit' : 'Tambahkan ke favorit'}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="outline"
                          size="icon"
                          onClick={handleShare}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Bagikan template</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Created By Card */}
          {template.profiles && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Dibuat Oleh</h3>
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 mr-3">
                    {template.profiles.avatar_url ? (
                      <AvatarImage src={template.profiles.avatar_url} />
                    ) : (
                      <AvatarFallback>
                        {(template.profiles.full_name || 'A').charAt(0)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <p className="font-medium">{template.profiles.full_name || 'Admin'}</p>
                    <p className="text-sm text-muted-foreground">
                      {template.profiles.username || 'admin'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Related Templates Card */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Template Terkait</h3>
              <div className="space-y-4">
                {relatedTemplates.map((relatedTemplate) => (
                  <div key={relatedTemplate.id} className="flex gap-3 group">
                    <div className="w-16 h-12 rounded overflow-hidden flex-shrink-0">
                      <img 
                        src={getTemplateImage(relatedTemplate.preview_image as string)} 
                        alt={relatedTemplate.name} 
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                      />
                    </div>
                    <div>
                      <p className="font-medium group-hover:text-primary transition-colors">
                        {relatedTemplate.name}
                      </p>
                      <div className="flex items-center mt-1">
                        <Badge variant="outline" className="text-xs">
                          {relatedTemplate.category}
                        </Badge>
                        {relatedTemplate.is_premium && (
                          <Badge variant="secondary" className="text-xs ml-2">
                            Premium
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/templates">
                    Lihat Semua Template <ChevronRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Support Card */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Butuh Bantuan?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Kami siap membantu apabila Anda memiliki pertanyaan terkait penggunaan template.
              </p>
              <Button variant="outline" className="w-full">
                Hubungi Dukungan
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

const TemplateSkeleton = () => (
  <div className="container mx-auto px-4 py-10">
    <div className="flex flex-col lg:flex-row gap-8">
      <div className="flex-1">
        <Skeleton className="h-10 w-40 mb-6" />
        <Skeleton className="w-full aspect-[16/9] rounded-lg mb-6" />
        <Skeleton className="h-10 w-full mb-6" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
      <div className="lg:w-80 w-full">
        <Skeleton className="h-80 w-full rounded-lg" />
      </div>
    </div>
  </div>
);

export default TemplateDetailPage;
