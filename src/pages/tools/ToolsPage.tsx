
import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Image, Gauge } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ToolCard {
  title: string;
  description: string;
  icon: React.ReactNode;
  link: string;
  premium?: boolean;
}

const ToolsPage: React.FC = () => {
  const tools: ToolCard[] = [
    {
      title: "AI Chat Assistant",
      description: "Chat dengan AI dan dapatkan jawaban untuk semua pertanyaan Anda secara instan",
      icon: <MessageSquare className="h-12 w-12 text-primary" />,
      link: "/tools/ai-chat"
    },
    {
      title: "Pengoptimal Gambar",
      description: "Kompres, ubah ukuran, dan optimalkan gambar Anda dengan mudah",
      icon: <Image className="h-12 w-12 text-primary" />,
      link: "/tools/image-optimizer"
    },
    {
      title: "Uji Kecepatan Mengetik",
      description: "Ukur dan tingkatkan kecepatan mengetik Anda dengan alat uji interaktif",
      icon: <Gauge className="h-12 w-12 text-primary" />,
      link: "/tools/typing-speed"
    }
  ];

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-3">Alat-Alat Praktis</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Koleksi alat praktis yang membantu pekerjaan Anda menjadi lebih efisien dan produktif
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map((tool, index) => (
          <Card key={index} className="overflow-hidden transition-all hover:shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-2xl">
                {tool.title}
                {tool.premium && (
                  <span className="text-xs bg-amber-200 text-amber-800 px-2 py-1 rounded-full">Premium</span>
                )}
              </CardTitle>
              <CardDescription>{tool.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center py-6">
                {tool.icon}
              </div>
            </CardContent>
            <CardFooter>
              <Button asChild className="w-full">
                <Link to={tool.link}>Gunakan Alat</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="mt-16 bg-muted rounded-xl p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Ada saran untuk alat baru?</h2>
        <p className="mb-6 text-muted-foreground">
          Kami selalu berusaha meningkatkan koleksi alat kami. Jika ada alat yang menurut Anda akan berguna, beri tahu kami!
        </p>
        <Button variant="outline">Ajukan Ide Alat</Button>
      </div>
    </div>
  );
};

export default ToolsPage;
