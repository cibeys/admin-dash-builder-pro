
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Heart, Search } from 'lucide-react';

type Template = {
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
};

const TemplatesPage = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeTech, setActiveTech] = useState<string[]>([]);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('templates')
          .select('*')
          .order('download_count', { ascending: false });
        
        if (error) throw error;
        
        if (data && data.length > 0) {
          setTemplates(data);
          setFilteredTemplates(data);
        } else {
          // Use placeholder data if no data is available
          setTemplates(placeholderTemplates);
          setFilteredTemplates(placeholderTemplates);
        }
      } catch (error) {
        console.error('Error fetching templates:', error);
        setTemplates(placeholderTemplates);
        setFilteredTemplates(placeholderTemplates);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  useEffect(() => {
    // Filter templates based on search query, category, and technology
    let filtered = templates;
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filter by category
    if (activeCategory !== 'all') {
      filtered = filtered.filter(template =>
        template.category.toLowerCase() === activeCategory.toLowerCase()
      );
    }
    
    // Filter by technology
    if (activeTech.length > 0) {
      filtered = filtered.filter(template =>
        template.technology && template.technology.some(tech => 
          activeTech.includes(tech.toLowerCase())
        )
      );
    }
    
    setFilteredTemplates(filtered);
  }, [searchQuery, activeCategory, activeTech, templates]);

  // Helper function to handle technology filter
  const toggleTechnology = (tech: string) => {
    const techLower = tech.toLowerCase();
    if (activeTech.includes(techLower)) {
      setActiveTech(activeTech.filter(t => t !== techLower));
    } else {
      setActiveTech([...activeTech, techLower]);
    }
  };

  // Extract unique categories and technologies
  const categories = [...new Set(templates.map(t => t.category))];
  const technologies = [...new Set(templates.flatMap(t => t.technology || []))];

  // Placeholder templates
  const placeholderTemplates: Template[] = [
    {
      id: '1',
      name: 'Admin Dashboard Pro',
      description: 'Dashboard admin modern dengan UI yang elegan dan fitur lengkap',
      preview_image: '/placeholder.svg',
      download_url: '#',
      category: 'Admin Templates',
      technology: ['React', 'Tailwind CSS', 'TypeScript'],
      color_scheme: 'dark',
      is_premium: true,
      download_count: 3450
    },
    {
      id: '2',
      name: 'E-Commerce Starter',
      description: 'Template e-commerce lengkap dengan keranjang belanja dan checkout',
      preview_image: '/placeholder.svg',
      download_url: '#',
      category: 'E-Commerce',
      technology: ['Next.js', 'Tailwind CSS', 'Stripe'],
      color_scheme: 'light',
      is_premium: false,
      download_count: 2890
    },
    {
      id: '3',
      name: 'Portfolio Minimal',
      description: 'Template portfolio minimalis untuk menampilkan karya kreatif Anda',
      preview_image: '/placeholder.svg',
      download_url: '#',
      category: 'Portfolio',
      technology: ['HTML', 'CSS', 'JavaScript'],
      color_scheme: 'light',
      is_premium: false,
      download_count: 1756
    },
    {
      id: '4',
      name: 'Blog Starter Kit',
      description: 'Template blog lengkap dengan sistem komentar dan newsletter',
      preview_image: '/placeholder.svg',
      download_url: '#',
      category: 'Blog',
      technology: ['React', 'Node.js', 'MongoDB'],
      color_scheme: 'light',
      is_premium: true,
      download_count: 2340
    },
    {
      id: '5',
      name: 'App Landing Page',
      description: 'Tampilan landing page modern untuk aplikasi mobile atau SaaS',
      preview_image: '/placeholder.svg',
      download_url: '#',
      category: 'Landing Page',
      technology: ['React', 'Styled Components'],
      color_scheme: 'dark',
      is_premium: false,
      download_count: 1820
    },
    {
      id: '6',
      name: 'Corporate Website',
      description: 'Template website korporat profesional dengan multiple halaman',
      preview_image: '/placeholder.svg',
      download_url: '#',
      category: 'Business',
      technology: ['WordPress', 'Bootstrap'],
      color_scheme: 'light',
      is_premium: true,
      download_count: 1240
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col space-y-4">
        <h1 className="text-4xl font-bold">Templates</h1>
        <p className="text-lg text-muted-foreground">
          Jelajahi koleksi template premium dan gratis untuk mempercepat alur kerja Anda.
        </p>
      </div>

      {/* Search and filters */}
      <div className="my-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={18} />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Filter section */}
          <div className="flex gap-2 overflow-x-auto">
            <Button
              variant={activeCategory === 'all' ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory('all')}
            >
              All
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={activeCategory === category.toLowerCase() ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveCategory(category.toLowerCase())}
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Technology filters */}
        <div className="mt-4 flex flex-wrap gap-2">
          {technologies.map((tech) => (
            <Badge
              key={tech}
              variant={activeTech.includes(tech.toLowerCase()) ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => toggleTechnology(tech)}
            >
              {tech}
            </Badge>
          ))}
        </div>
      </div>

      {/* Premium vs Free templates tabs */}
      <Tabs defaultValue="all" className="mt-8">
        <TabsList>
          <TabsTrigger value="all">All Templates</TabsTrigger>
          <TabsTrigger value="free">Free</TabsTrigger>
          <TabsTrigger value="premium">Premium</TabsTrigger>
        </TabsList>

        {/* All templates */}
        <TabsContent value="all" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              // Loading skeletons
              Array(6).fill(0).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="h-48 bg-muted animate-pulse"></div>
                  <CardContent className="p-4">
                    <div className="h-6 w-3/4 bg-muted animate-pulse mb-3 rounded"></div>
                    <div className="h-4 w-full bg-muted animate-pulse mb-2 rounded"></div>
                    <div className="h-4 w-2/3 bg-muted animate-pulse rounded"></div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 flex justify-between">
                    <div className="h-10 w-28 bg-muted animate-pulse rounded"></div>
                    <div className="h-10 w-10 bg-muted animate-pulse rounded-full"></div>
                  </CardFooter>
                </Card>
              ))
            ) : filteredTemplates.length > 0 ? (
              filteredTemplates.map((template) => (
                <Card key={template.id} className="overflow-hidden">
                  <Link to={`/templates/${template.id}`}>
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={template.preview_image || '/placeholder.svg'} 
                        alt={template.name}
                        className="w-full h-full object-cover transition-transform hover:scale-105"
                      />
                    </div>
                  </Link>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h2 className="font-bold text-lg hover:text-primary">
                        <Link to={`/templates/${template.id}`}>
                          {template.name}
                        </Link>
                      </h2>
                      {template.is_premium && (
                        <Badge>Premium</Badge>
                      )}
                    </div>
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                      {template.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      {template.technology?.map((tech) => (
                        <Badge key={tech} variant="outline" className="text-xs">
                          {tech}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0 flex justify-between items-center">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Download size={14} className="mr-1" />
                      <span>{template.download_count.toLocaleString()}</span>
                    </div>
                    <Button size="icon" variant="ghost" className="rounded-full">
                      <Heart size={16} className="text-muted-foreground" />
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <h3 className="text-xl font-medium mb-2">No templates found</h3>
                <p className="text-muted-foreground">
                  Try adjusting your search or filter to find what you're looking for.
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Free templates */}
        <TabsContent value="free" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.filter(t => !t.is_premium).map((template) => (
              <Card key={template.id} className="overflow-hidden">
                <Link to={`/templates/${template.id}`}>
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={template.preview_image || '/placeholder.svg'} 
                      alt={template.name}
                      className="w-full h-full object-cover transition-transform hover:scale-105"
                    />
                  </div>
                </Link>
                <CardContent className="p-4">
                  <h2 className="font-bold text-lg mb-2 hover:text-primary">
                    <Link to={`/templates/${template.id}`}>
                      {template.name}
                    </Link>
                  </h2>
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                    {template.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {template.technology?.map((tech) => (
                      <Badge key={tech} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-between items-center">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Download size={14} className="mr-1" />
                    <span>{template.download_count.toLocaleString()}</span>
                  </div>
                  <Button size="icon" variant="ghost" className="rounded-full">
                    <Heart size={16} className="text-muted-foreground" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Premium templates */}
        <TabsContent value="premium" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.filter(t => t.is_premium).map((template) => (
              <Card key={template.id} className="overflow-hidden">
                <Link to={`/templates/${template.id}`}>
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={template.preview_image || '/placeholder.svg'} 
                      alt={template.name}
                      className="w-full h-full object-cover transition-transform hover:scale-105"
                    />
                  </div>
                </Link>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="font-bold text-lg hover:text-primary">
                      <Link to={`/templates/${template.id}`}>
                        {template.name}
                      </Link>
                    </h2>
                    <Badge>Premium</Badge>
                  </div>
                  <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                    {template.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-3">
                    {template.technology?.map((tech) => (
                      <Badge key={tech} variant="outline" className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0 flex justify-between items-center">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Download size={14} className="mr-1" />
                    <span>{template.download_count.toLocaleString()}</span>
                  </div>
                  <Button size="icon" variant="ghost" className="rounded-full">
                    <Heart size={16} className="text-muted-foreground" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TemplatesPage;
