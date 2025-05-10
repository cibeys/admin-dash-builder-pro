
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Image, FileType, ExternalLink, MessageSquare, FileCode, 
  Palette, FileCog, Sparkles
} from 'lucide-react';

const tools = [
  {
    id: 'image-optimizer',
    title: 'Image Optimizer',
    description: 'Kompres dan optimasi gambar tanpa mengurangi kualitas visual',
    icon: <Image className="h-6 w-6" />,
    category: 'Media',
    path: '/tools/image-optimizer'
  },
  {
    id: 'code-formatter',
    title: 'Code Formatter',
    description: 'Format kode JavaScript, HTML, CSS dan lainnya dengan standar baku',
    icon: <FileCode className="h-6 w-6" />,
    category: 'Development',
    path: '/tools/code-formatter'
  },
  {
    id: 'color-generator',
    title: 'Color Palette Generator',
    description: 'Buat palette warna harmonis untuk proyek desain Anda',
    icon: <Palette className="h-6 w-6" />,
    category: 'Design',
    path: '/tools/color-palette'
  },
  {
    id: 'file-converter',
    title: 'File Converter',
    description: 'Konversi file ke berbagai format dengan mudah dan cepat',
    icon: <FileType className="h-6 w-6" />,
    category: 'Utilities',
    path: '/tools/file-converter'
  },
  {
    id: 'ai-assistant',
    title: 'AI Chat Assistant',
    description: 'Gunakan AI untuk mendapatkan bantuan penulisan dan pengkodean',
    icon: <MessageSquare className="h-6 w-6" />,
    category: 'AI Tools',
    path: '/tools/ai-assistant'
  },
  {
    id: 'meta-tag-generator',
    title: 'Meta Tag Generator',
    description: 'Buat tag meta SEO untuk website Anda',
    icon: <FileCog className="h-6 w-6" />,
    category: 'SEO',
    path: '/tools/meta-generator'
  },
  {
    id: 'favicon-generator',
    title: 'Favicon Generator',
    description: 'Buat favicon untuk website Anda dalam berbagai ukuran',
    icon: <Image className="h-6 w-6" />,
    category: 'Design',
    path: '/tools/favicon-generator'
  },
  {
    id: 'api-tester',
    title: 'API Tester',
    description: 'Test dan dokumentasi API dengan interface yang intuitif',
    icon: <ExternalLink className="h-6 w-6" />,
    category: 'Development',
    path: '/tools/api-tester'
  }
];

// Group tools by category
const getToolsByCategory = () => {
  return tools.reduce((acc: Record<string, typeof tools>, tool) => {
    if (!acc[tool.category]) {
      acc[tool.category] = [];
    }
    acc[tool.category].push(tool);
    return acc;
  }, {});
};

const ToolsPage = () => {
  const toolsByCategory = getToolsByCategory();
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col space-y-4 mb-10">
        <h1 className="text-4xl font-bold">Developer Tools</h1>
        <p className="text-lg text-muted-foreground">
          Tingkatkan produktivitas Anda dengan koleksi alat pengembang online kami.
        </p>
      </div>

      {/* Featured Tools */}
      <div className="mb-12 bg-primary/5 p-6 rounded-lg border border-primary/10">
        <div className="flex items-center mb-6">
          <Sparkles className="text-primary mr-2" />
          <h2 className="text-xl font-semibold">Featured Tools</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.slice(0, 3).map((tool) => (
            <Card key={tool.id} className="bg-card">
              <CardHeader className="pb-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                  {tool.icon}
                </div>
                <CardTitle>{tool.title}</CardTitle>
                <CardDescription>{tool.description}</CardDescription>
              </CardHeader>
              <CardFooter>
                <Link to={tool.path} className="w-full">
                  <Button variant="default" className="w-full">Open Tool</Button>
                </Link>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      {/* All Tools by Category */}
      {Object.entries(toolsByCategory).map(([category, categoryTools]) => (
        <div key={category} className="mb-12">
          <h2 className="text-xl font-semibold mb-6">{category} Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryTools.map((tool) => (
              <Card key={tool.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-center mb-2">
                    {tool.icon}
                    <CardTitle className="ml-2 text-lg">{tool.title}</CardTitle>
                  </div>
                  <CardDescription>{tool.description}</CardDescription>
                </CardHeader>
                <CardFooter>
                  <Link to={tool.path} className="w-full">
                    <Button variant="outline" className="w-full">Open Tool</Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {/* Suggestions */}
      <div className="bg-muted/50 p-8 rounded-lg text-center mt-12">
        <h3 className="text-xl font-semibold mb-3">Don't see what you need?</h3>
        <p className="text-muted-foreground mb-6">
          Kami terus menambahkan alat baru untuk membantu alur kerja Anda. 
          Sarankan alat yang ingin Anda lihat selanjutnya.
        </p>
        <Link to="/contact">
          <Button variant="outline">Suggest a Tool</Button>
        </Link>
      </div>
    </div>
  );
};

export default ToolsPage;
