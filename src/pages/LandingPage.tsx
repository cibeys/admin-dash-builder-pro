
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useAnimation } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/common/context/ThemeContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Check, 
  ChevronRight, 
  FileText, 
  LayoutTemplate, 
  ArrowRight, 
  Download, 
  MessageSquareText,
  Code,
  Star,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

// Logo SVG Component inspired by Vite.js
const ViteLikeLogoSVG = () => (
  <motion.svg
    width="180"
    height="180"
    viewBox="0 0 180 180"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    initial={{ opacity: 0, scale: 0.8 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.5 }}
  >
    <motion.path
      d="M144.715 30.669L89.04 146.085C88.3419 147.435 86.4114 147.627 85.4245 146.467L33.9421 86.9588"
      stroke="url(#paint0_linear_1_2)"
      strokeWidth="12"
      strokeLinecap="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ delay: 0.2, duration: 1.2, ease: "easeInOut" }}
    />
    <motion.path
      d="M94.5 24L157.5 39L141 102"
      stroke="url(#paint1_linear_1_2)"
      strokeWidth="12"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{ pathLength: 0 }}
      animate={{ pathLength: 1 }}
      transition={{ delay: 0.5, duration: 1, ease: "easeInOut" }}
    />
    <defs>
      <linearGradient id="paint0_linear_1_2" x1="144.715" y1="30.669" x2="32.0531" y2="82.2114" gradientUnits="userSpaceOnUse">
        <stop stopColor="#646CFF" />
        <stop offset="1" stopColor="#9D8DF1" />
      </linearGradient>
      <linearGradient id="paint1_linear_1_2" x1="94.5" y1="24" x2="141" y2="102" gradientUnits="userSpaceOnUse">
        <stop stopColor="#41D1FF" />
        <stop offset="1" stopColor="#BD34FE" />
      </linearGradient>
    </defs>
  </motion.svg>
);

// Feature Card Component
const FeatureCard = ({ icon: Icon, title, description, to }) => (
  <motion.div
    whileHover={{ y: -5, transition: { duration: 0.2 } }}
    className="h-full"
  >
    <Card className="h-full border border-border/50 shadow-sm hover:shadow-md transition-all">
      <CardHeader>
        <Icon className="h-10 w-10 text-primary mb-2" />
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardFooter className="pt-2">
        <Link to={to}>
          <Button variant="ghost" className="group">
            Pelajari lebih lanjut
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardFooter>
    </Card>
  </motion.div>
);

// Template Preview Card
const TemplatePreviewCard = ({ template }) => (
  <motion.div
    whileHover={{ y: -5, scale: 1.02 }}
    transition={{ duration: 0.2 }}
    className="rounded-lg overflow-hidden shadow-md hover:shadow-xl"
  >
    <Link to={`/templates/${template.id}`}>
      <div className="h-48 overflow-hidden bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 relative">
        {template.preview_image ? (
          <img 
            src={template.preview_image} 
            alt={template.name} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <LayoutTemplate size={48} className="text-primary/30" />
          </div>
        )}
        {template.is_premium && (
          <Badge className="absolute top-2 right-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
            Premium
          </Badge>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-medium text-lg">{template.name}</h3>
        <div className="flex items-center mt-2 text-muted-foreground text-sm">
          <div className="flex items-center">
            <Star className="h-4 w-4 mr-1" />
            <span>4.8</span>
          </div>
          <span className="mx-2">•</span>
          <div className="flex items-center">
            <Download className="h-4 w-4 mr-1" />
            <span>{template.download_count || 0}</span>
          </div>
        </div>
        <div className="mt-3 flex flex-wrap gap-1">
          {template.technology && template.technology.slice(0, 3).map((tech, index) => (
            <Badge key={index} variant="outline" className="text-xs">{tech}</Badge>
          ))}
        </div>
      </div>
    </Link>
  </motion.div>
);

// Blog Preview Card
const BlogPreviewCard = ({ post }) => (
  <motion.div
    whileHover={{ y: -5, scale: 1.02 }}
    transition={{ duration: 0.2 }}
    className="rounded-lg overflow-hidden shadow-md hover:shadow-xl"
  >
    <Link to={`/blog/${post.slug}`}>
      <div className="h-40 overflow-hidden bg-gradient-to-br from-blue-100/50 via-purple-100/50 to-pink-100/50 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-pink-900/20 relative">
        {post.featured_image ? (
          <img 
            src={post.featured_image} 
            alt={post.title} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FileText size={36} className="text-primary/30" />
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-medium text-lg line-clamp-2">{post.title}</h3>
        <p className="text-muted-foreground mt-1 text-sm line-clamp-2">{post.excerpt}</p>
        <div className="flex items-center justify-between mt-3">
          <Badge variant="outline">{post.category?.name || 'Uncategorized'}</Badge>
          <span className="text-xs text-muted-foreground">
            {new Date(post.published_at).toLocaleDateString()}
          </span>
        </div>
      </div>
    </Link>
  </motion.div>
);

// Floating AI Chat Button Component
const FloatingAIChatButton = () => (
  <Link to="/tools/ai-chat" className="fixed bottom-6 right-6 z-50">
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Button size="lg" className="rounded-full h-14 w-14 shadow-lg bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700">
        <MessageSquareText size={24} />
        <span className="sr-only">Chat dengan AI</span>
      </Button>
    </motion.div>
  </Link>
);

// Main Landing Page Component
const LandingPage: React.FC = () => {
  const { theme } = useTheme();
  const [templates, setTemplates] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const controls = useAnimation();

  // For document title
  useEffect(() => {
    document.title = "TanoeLuis - Platform Web Development Indonesia";
  }, []);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      try {
        // Fetch templates
        const { data: templatesData } = await supabase
          .from('templates')
          .select('*')
          .order('download_count', { ascending: false })
          .limit(6);
        
        // Fetch blog posts
        const { data: postsData } = await supabase
          .from('posts')
          .select(`
            id, title, slug, excerpt, featured_image, published_at,
            categories:category_id(name, slug)
          `)
          .eq('status', 'published')
          .order('published_at', { ascending: false })
          .limit(3);
          
        if (templatesData) setTemplates(templatesData);
        if (postsData) setBlogs(postsData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
        controls.start({ opacity: 1, y: 0 });
      }
    };
    
    fetchData();
  }, [controls]);
  
  // Determine gradient class based on theme
  const getGradientClass = () => {
    return theme.mode === 'dark' 
      ? 'from-slate-900 via-purple-900/30 to-slate-900' 
      : 'from-blue-50 via-primary/10 to-purple-50';
  };
  
  // Placeholder templates if no data
  const placeholderTemplates = [
    {
      id: '1',
      name: 'Modern Landing Page',
      preview_image: '/placeholder.svg',
      technology: ['React', 'Tailwind CSS', 'TypeScript'],
      download_count: 128,
      is_premium: true
    },
    {
      id: '2',
      name: 'E-Commerce Dashboard',
      preview_image: '/placeholder.svg',
      technology: ['React', 'Shadcn UI', 'Supabase'],
      download_count: 95,
      is_premium: false
    },
    {
      id: '3',
      name: 'Portfolio Site',
      preview_image: '/placeholder.svg',
      technology: ['React', 'Framer Motion', 'Three.js'],
      download_count: 76,
      is_premium: false
    }
  ];
  
  // Placeholder blog posts if no data
  const placeholderBlogs = [
    {
      id: '1',
      title: 'Membangun Aplikasi Web Modern dengan React dan Tailwind CSS',
      slug: 'membangun-aplikasi-web-modern',
      excerpt: 'Panduan lengkap untuk membuat aplikasi web yang responsif dan interaktif',
      featured_image: '/placeholder.svg',
      published_at: new Date().toISOString(),
      category: { name: 'Web Development', slug: 'web-development' }
    },
    {
      id: '2',
      title: 'Pengantar TypeScript untuk Pengembang JavaScript',
      slug: 'pengantar-typescript',
      excerpt: 'Mengapa TypeScript semakin populer dan bagaimana memulai menggunakannya',
      featured_image: '/placeholder.svg',
      published_at: new Date().toISOString(),
      category: { name: 'TypeScript', slug: 'typescript' }
    },
    {
      id: '3',
      title: 'Optimasi Performa Aplikasi React dengan Hooks',
      slug: 'optimasi-performa-react-hooks',
      excerpt: 'Teknik dan strategi untuk membuat aplikasi React lebih cepat dan efisien',
      featured_image: '/placeholder.svg',
      published_at: new Date().toISOString(),
      category: { name: 'React', slug: 'react' }
    }
  ];
  
  const displayTemplates = templates.length > 0 ? templates : placeholderTemplates;
  const displayBlogs = blogs.length > 0 ? blogs : placeholderBlogs;

  return (
    <div className="flex flex-col min-h-screen">
      {/* Floating AI Chat Button */}
      <FloatingAIChatButton />
      
      {/* Hero Section with Vite-like Animation */}
      <section className={`bg-gradient-to-br ${getGradientClass()} py-20 overflow-hidden`}>
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            <div className="lg:w-1/2 mb-10 lg:mb-0">
              <motion.h1 
                className="text-4xl md:text-6xl font-bold mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                TanoeLuis <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">Platform</span>
              </motion.h1>
              
              <motion.p 
                className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                Solusi web development berkecepatan tinggi untuk mengubah ide menjadi website modern yang luar biasa.
              </motion.p>
              
              <motion.div 
                className="flex flex-wrap gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <Link to="/templates">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white group">
                    Jelajahi Template
                    <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Link to="/blog">
                  <Button size="lg" variant="outline" className="border-2 group">
                    Baca Blog
                    <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </motion.div>
            </div>
            
            <div className="lg:w-1/2 flex justify-center">
              <div className="relative">
                <motion.div
                  className="absolute -z-10 w-72 h-72 bg-purple-500/30 rounded-full blur-3xl"
                  animate={{ 
                    scale: [1, 1.2, 1], 
                    opacity: [0.3, 0.4, 0.3] 
                  }}
                  transition={{ 
                    duration: 5, 
                    repeat: Infinity,
                    repeatType: "reverse" 
                  }}
                />
                <ViteLikeLogoSVG />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl font-bold mb-4">Fitur Utama</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Dapatkan akses ke berbagai fitur untuk membantu proses pengembangan website Anda
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard 
              icon={FileText}
              title="Blog"
              description="Artikel terbaru tentang web development dan UI/UX"
              to="/blog"
            />
            <FeatureCard 
              icon={LayoutTemplate}
              title="Template"
              description="Koleksi template website dan dashboard berkualitas"
              to="/templates"
            />
            <FeatureCard 
              icon={Code}
              title="Tools"
              description="Kumpulan alat dan utilitas untuk mempermudah pekerjaan"
              to="/tools"
            />
            <FeatureCard 
              icon={MessageSquareText}
              title="AI Chat"
              description="Asisten AI untuk membantu menjawab pertanyaan coding"
              to="/tools/ai-chat"
            />
          </div>
        </div>
      </section>
      
      {/* Templates Preview Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-slate-900 dark:to-slate-900/80">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="flex justify-between items-center mb-10"
          >
            <h2 className="text-3xl font-bold">Template Pilihan</h2>
            <Link to="/templates">
              <Button variant="outline" className="group">
                Lihat Semua
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayTemplates.slice(0, 3).map((template, index) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <TemplatePreviewCard template={template} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Blog Preview Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="flex justify-between items-center mb-10"
          >
            <h2 className="text-3xl font-bold">Artikel Terbaru</h2>
            <Link to="/blog">
              <Button variant="outline" className="group">
                Lihat Semua
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayBlogs.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <BlogPreviewCard post={post} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary/5">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-3xl font-bold mb-6">
              Siap Untuk Memulai?
            </h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Daftar sekarang dan nikmati semua fitur premium yang tersedia untuk meningkatkan produktivitas Anda
            </p>

            <div className="bg-background rounded-lg p-6 shadow-lg">
              <h3 className="text-xl font-bold mb-4">
                Keuntungan Menjadi Member
              </h3>
              
              <div className="grid sm:grid-cols-2 gap-4 mb-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 dark:bg-green-900 text-green-500 flex items-center justify-center mr-3">
                    <Check className="h-4 w-4" />
                  </div>
                  <p className="text-left">Akses ke semua template premium</p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 dark:bg-green-900 text-green-500 flex items-center justify-center mr-3">
                    <Check className="h-4 w-4" />
                  </div>
                  <p className="text-left">Download tanpa batasan</p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 dark:bg-green-900 text-green-500 flex items-center justify-center mr-3">
                    <Check className="h-4 w-4" />
                  </div>
                  <p className="text-left">Prioritas bantuan teknis</p>
                </div>
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-6 w-6 rounded-full bg-green-100 dark:bg-green-900 text-green-500 flex items-center justify-center mr-3">
                    <Check className="h-4 w-4" />
                  </div>
                  <p className="text-left">Notifikasi update pertama</p>
                </div>
              </div>
              
              <Link to="/auth/register">
                <Button size="lg" className="w-full sm:w-auto group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  Daftar Sekarang
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold text-lg mb-4">TanoeLuis</h3>
              <p className="text-muted-foreground">
                Platform all-in-one untuk kebutuhan web development Anda.
              </p>
            </div>
            <div>
              <h4 className="font-medium mb-4">Konten</h4>
              <ul className="space-y-2">
                <li><Link to="/blog" className="text-muted-foreground hover:text-primary">Blog</Link></li>
                <li><Link to="/templates" className="text-muted-foreground hover:text-primary">Template</Link></li>
                <li><Link to="/tools" className="text-muted-foreground hover:text-primary">Tools</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Bantuan</h4>
              <ul className="space-y-2">
                <li><Link to="/faq" className="text-muted-foreground hover:text-primary">FAQ</Link></li>
                <li><Link to="/contact" className="text-muted-foreground hover:text-primary">Kontak</Link></li>
                <li><Link to="/support" className="text-muted-foreground hover:text-primary">Dukungan</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link to="/privacy" className="text-muted-foreground hover:text-primary">Kebijakan Privasi</Link></li>
                <li><Link to="/terms" className="text-muted-foreground hover:text-primary">Syarat & Ketentuan</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center text-muted-foreground">
            <p>© {new Date().getFullYear()} TanoeLuis. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
