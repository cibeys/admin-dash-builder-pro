
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Download, Search, Filter, Star, BarChart4 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

// Import local images for templates
import templateBlogImage from '/images/templates/template-blog.jpg';
import templateDashboardImage from '/images/templates/template-dashboard.jpg';
import templateEcommerceImage from '/images/templates/template-ecommerce.jpg';
import templatePortfolioImage from '/images/templates/template-portfolio.jpg';

// Template type definition
interface Template {
  id: string;
  name: string;
  description: string;
  category: string;
  preview_image: string | null;
  download_url: string;
  download_count: number;
  is_premium: boolean;
  technology: string[] | null;
}

// Create a mapping for local images
const localImages = {
  'template-blog': templateBlogImage,
  'template-dashboard': templateDashboardImage,
  'template-ecommerce': templateEcommerceImage,
  'template-portfolio': templatePortfolioImage,
};

const TemplatesPage: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, [selectedCategory, searchQuery, activeTab]);

  const fetchTemplates = async () => {
    setIsLoading(true);
    try {
      let query = supabase.from("templates").select("*");

      if (searchQuery) {
        query = query.ilike("name", `%${searchQuery}%`);
      }

      if (selectedCategory) {
        query = query.eq("category", selectedCategory);
      }

      if (activeTab === "premium") {
        query = query.eq("is_premium", true);
      } else if (activeTab === "free") {
        query = query.eq("is_premium", false);
      }

      query = query.order("created_at", { ascending: false });

      const { data, error } = await query;

      if (error) throw error;

      if (data) {
        setTemplates(data);

        // Extract unique categories
        const uniqueCategories = Array.from(
          new Set(data.map((item) => item.category))
        );
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to get the appropriate image for a template
  const getTemplateImage = (template: Template) => {
    if (!template.preview_image) {
      // Default images based on category
      const category = template.category.toLowerCase();
      if (category.includes('blog')) return templateBlogImage;
      if (category.includes('dashboard') || category.includes('admin')) return templateDashboardImage;
      if (category.includes('ecommerce') || category.includes('shop')) return templateEcommerceImage;
      if (category.includes('portfolio')) return templatePortfolioImage;
      
      // Final fallback
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
    if (template.preview_image && template.preview_image.startsWith('http')) {
      return template.preview_image;
    }
    
    // Fallback by category
    const category = template.category.toLowerCase();
    if (category.includes('blog')) return templateBlogImage;
    if (category.includes('dashboard')) return templateDashboardImage;
    if (category.includes('ecommerce')) return templateEcommerceImage;
    return templatePortfolioImage;
  };

  // Placeholder templates for when data is empty
  const placeholderTemplates: Template[] = [
    {
      id: '1',
      name: 'Blog Modern Template',
      description: 'Template blog modern dengan desain yang bersih dan responsif',
      category: 'Blog',
      preview_image: templateBlogImage,
      download_url: '#',
      download_count: 458,
      is_premium: false,
      technology: ['React', 'Tailwind CSS']
    },
    {
      id: '2',
      name: 'Admin Dashboard Pro',
      description: 'Dashboard admin dengan fitur lengkap untuk manajemen data',
      category: 'Dashboard',
      preview_image: templateDashboardImage,
      download_url: '#',
      download_count: 1204,
      is_premium: true,
      technology: ['React', 'TypeScript', 'Material UI']
    },
    {
      id: '3',
      name: 'E-commerce Starter Kit',
      description: 'Template e-commerce dengan integrasi pembayaran dan keranjang belanja',
      category: 'E-commerce',
      preview_image: templateEcommerceImage,
      download_url: '#',
      download_count: 873,
      is_premium: true,
      technology: ['React', 'Redux', 'Tailwind CSS']
    },
    {
      id: '4',
      name: 'Portfolio Minimalist',
      description: 'Template portfolio yang elegan dengan animasi smooth',
      category: 'Portfolio',
      preview_image: templatePortfolioImage,
      download_url: '#',
      download_count: 345,
      is_premium: false,
      technology: ['React', 'Framer Motion']
    }
  ];

  const displayTemplates = templates.length > 0 ? templates : placeholderTemplates;

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col space-y-4">
        <h1 className="text-4xl font-bold">Templates</h1>
        <p className="text-lg text-muted-foreground">
          Dapatkan template yang sesuai dengan kebutuhan proyek Anda
        </p>
      </div>

      <div className="mt-8 space-y-6">
        {/* Search and filters */}
        <div className="flex flex-col md:flex-row gap-4 justify-between">
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari template..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="hidden md:flex">
              <Filter className="h-4 w-4 mr-2" /> Filter
            </Button>
            
            <div className="flex-1 md:flex-none">
              <Tabs
                defaultValue="all"
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="all">Semua</TabsTrigger>
                  <TabsTrigger value="free">Gratis</TabsTrigger>
                  <TabsTrigger value="premium">Premium</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2">
          <Badge
            variant={selectedCategory === null ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedCategory(null)}
          >
            Semua Kategori
          </Badge>
          {categories.length > 0
            ? categories.map((category) => (
                <Badge
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </Badge>
              ))
            : ["Blog", "Dashboard", "E-commerce", "Portfolio", "Landing Page"].map(
                (cat) => (
                  <Badge
                    key={cat}
                    variant={selectedCategory === cat ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </Badge>
                )
              )}
        </div>

        {/* Templates grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="h-48 w-full" />
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Skeleton className="h-9 w-full" />
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
            {displayTemplates.map((template) => (
              <Card key={template.id} className="overflow-hidden flex flex-col">
                {/* Template preview image */}
                <div className="relative h-48 overflow-hidden group">
                  <img
                    src={getTemplateImage(template)}
                    alt={template.name}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  />
                  {template.is_premium && (
                    <Badge className="absolute top-2 right-2 bg-primary">Premium</Badge>
                  )}
                </div>
                
                <CardContent className="p-4 flex-grow">
                  <div className="mb-2">
                    <Badge variant="outline">{template.category}</Badge>
                  </div>
                  <Link to={`/templates/${template.id}`}>
                    <h3 className="text-lg font-semibold mb-2 hover:text-primary">
                      {template.name}
                    </h3>
                  </Link>
                  <p className="text-muted-foreground text-sm line-clamp-2">
                    {template.description || `Template ${template.category} untuk kebutuhan proyek Anda`}
                  </p>
                  
                  {/* Technologies */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {template.technology?.map((tech) => (
                      <Badge variant="secondary" key={tech} className="text-xs">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                
                <CardFooter className="p-4 pt-0 mt-auto flex justify-between items-center">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Download className="h-3.5 w-3.5 mr-1" />
                    <span>{template.download_count}</span>
                  </div>
                  
                  <Link to={`/templates/${template.id}`}>
                    <Button>Lihat Detail</Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplatesPage;
