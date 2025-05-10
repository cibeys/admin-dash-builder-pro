
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const LandingPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Header Section */}
      <header className="bg-background border-b border-border">
        <div className="container mx-auto py-4 px-4 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-primary">TanoeLuis</Link>
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/blog" className="text-foreground hover:text-primary transition">Blog</Link>
            <Link to="/templates" className="text-foreground hover:text-primary transition">Templates</Link>
            <Link to="/tools" className="text-foreground hover:text-primary transition">Tools</Link>
            <Link to="/about" className="text-foreground hover:text-primary transition">About</Link>
          </nav>
          <div className="flex items-center space-x-4">
            <Link to="/auth/login">
              <Button variant="outline">Login</Button>
            </Link>
            <Link to="/auth/register">
              <Button>Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary/10 to-primary/5 py-20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Platform Kreasi Pengembang Modern</h1>
            <p className="text-lg mb-8 text-muted-foreground">
              Dapatkan akses ke ratusan template, alat, dan sumber daya untuk mempercepat alur kerja pengembangan Anda.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/templates">
                <Button size="lg" className="w-full sm:w-auto">Jelajahi Template</Button>
              </Link>
              <Link to="/auth/register">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">Bergabung Sekarang</Button>
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <img 
              src="/placeholder.svg" 
              alt="Hero" 
              className="w-full max-w-md rounded-lg shadow-xl" 
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Fitur Unggulan</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="border border-border rounded-lg p-6 bg-card">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Template Premium</h3>
              <p className="text-muted-foreground">
                Akses ratusan template premium untuk website, aplikasi mobile, dan desain UI/UX.
              </p>
            </div>
            
            <div className="border border-border rounded-lg p-6 bg-card">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Alat Pengembang</h3>
              <p className="text-muted-foreground">
                Optimasi gambar, generator kode, dan alat lain untuk meningkatkan produktivitas Anda.
              </p>
            </div>
            
            <div className="border border-border rounded-lg p-6 bg-card">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Tutorial Praktis</h3>
              <p className="text-muted-foreground">
                Blog dengan tutorial praktis dan artikel mendalam tentang pengembangan web modern.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Blog Posts */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold">Blog Terbaru</h2>
            <Link to="/blog" className="text-primary hover:underline">
              Lihat Semua
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((item) => (
              <div key={item} className="border border-border rounded-lg overflow-hidden bg-card">
                <img 
                  src="/placeholder.svg" 
                  alt="Blog" 
                  className="w-full h-48 object-cover" 
                />
                <div className="p-6">
                  <span className="text-xs font-medium text-primary uppercase tracking-wider">
                    Web Development
                  </span>
                  <h3 className="text-xl font-bold mt-2 mb-3">
                    <Link to={`/blog/post-${item}`} className="hover:text-primary">
                      Membangun Website Modern dengan React dan Tailwind CSS
                    </Link>
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Pelajari cara membangun website yang responsif dan modern menggunakan React dan Tailwind CSS.
                  </p>
                  <div className="flex items-center mt-4">
                    <div className="w-8 h-8 rounded-full bg-primary/20 mr-3"></div>
                    <span className="text-sm">Admin User</span>
                    <span className="mx-2 text-muted-foreground">•</span>
                    <span className="text-sm text-muted-foreground">May 10, 2025</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Siap Meningkatkan Produktivitas Anda?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">
            Bergabunglah dengan ribuan pengembang lain yang telah menggunakan platform kami untuk mempercepat alur kerja mereka.
          </p>
          <Link to="/auth/register">
            <Button size="lg" variant="secondary">
              Mulai Sekarang - Gratis
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">TanoeLuis</h3>
              <p className="text-muted-foreground mb-4">
                Platform terbaik untuk pengembang dan desainer modern yang ingin mempercepat alur kerja mereka.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Navigasi</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-muted-foreground hover:text-foreground">Beranda</Link>
                </li>
                <li>
                  <Link to="/blog" className="text-muted-foreground hover:text-foreground">Blog</Link>
                </li>
                <li>
                  <Link to="/templates" className="text-muted-foreground hover:text-foreground">Templates</Link>
                </li>
                <li>
                  <Link to="/tools" className="text-muted-foreground hover:text-foreground">Tools</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Dukungan</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/faq" className="text-muted-foreground hover:text-foreground">FAQ</Link>
                </li>
                <li>
                  <Link to="/contact" className="text-muted-foreground hover:text-foreground">Kontak</Link>
                </li>
                <li>
                  <Link to="/documentation" className="text-muted-foreground hover:text-foreground">Dokumentasi</Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/privacy" className="text-muted-foreground hover:text-foreground">Kebijakan Privasi</Link>
                </li>
                <li>
                  <Link to="/terms" className="text-muted-foreground hover:text-foreground">Syarat dan Ketentuan</Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-border mt-8 pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} TanoeLuis. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-twitter"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/></svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-github"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-linkedin"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
