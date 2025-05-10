
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Hero3D } from '@/components/ui/Canvas3D';
import { useTheme } from '@/common/context/ThemeContext';
import { 
  Check, 
  ChevronRight, 
  FileText, 
  LayoutTemplate, 
  ArrowRight, 
  Download, 
  MessageSquareText 
} from 'lucide-react';

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

const LandingPage: React.FC = () => {
  const { theme } = useTheme();

  // Menggunakan spesifik title untuk dokumen
  useEffect(() => {
    document.title = "TanoeLuis - Platform Web Development Indonesia";
  }, []);

  // Menentukan gradient berdasarkan tema
  const getGradientClass = () => {
    return theme.mode === 'dark' 
      ? 'from-slate-900 via-purple-900 to-slate-900' 
      : 'from-blue-50 via-primary/10 to-purple-50';
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section dengan 3D */}
      <section className={`bg-gradient-to-br ${getGradientClass()} py-20`}>
        <div className="container mx-auto px-4">
          <Hero3D 
            title="TanoeLuis Platform"
            subtitle="Solusi web development dan template berkualitas untuk website modern"
          />
          
          <div className="flex justify-center mt-8 space-x-4">
            <Link to="/blog">
              <Button size="lg" className="group">
                Baca Blog
                <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/templates">
              <Button size="lg" variant="outline" className="group">
                Lihat Template
                <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
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
              icon={Download}
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

      {/* CTA Section */}
      <section className="py-16 bg-primary/10">
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
                <Button size="lg" className="w-full sm:w-auto">
                  Daftar Sekarang
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
