
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calculator, 
  MessageSquareText, 
  Image, 
  Thermometer, 
  VolumeX, 
  Layout, 
  Grid3X3, 
  User, 
  Cpu,
  Download,
  BarChart,
  FileCog,
  FileJson,
  QrCode,
  PenTool,
  Type,
  Clock,
  Binary,
  Fingerprint,
  Search,
  Hash,
  Percent,
} from 'lucide-react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface ToolCardProps {
  icon: React.ReactElement;
  title: string;
  description: string;
  to: string;
  badges?: string[];
}

const ToolCard: React.FC<ToolCardProps> = ({ icon, title, description, to, badges = [] }) => {
  return (
    <motion.div
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="group"
    >
      <Link to={to}>
        <Card className="h-full overflow-hidden hover:border-primary/50 transition-colors">
          <CardContent className="p-6">
            <div className="w-12 h-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              {icon}
            </div>
            <h3 className="text-lg font-bold mb-2">{title}</h3>
            <p className="text-muted-foreground text-sm">{description}</p>
          </CardContent>
          <CardFooter className="px-6 py-3 border-t flex justify-between items-center gap-2">
            <div className="flex gap-2 flex-wrap">
              {badges.map((badge, index) => (
                <span 
                  key={index}
                  className="text-xs px-2 py-1 rounded-full bg-muted"
                >
                  {badge}
                </span>
              ))}
            </div>
            <span className="text-xs text-primary group-hover:underline">Buka Tool</span>
          </CardFooter>
        </Card>
      </Link>
    </motion.div>
  );
};

const tools: ToolCardProps[] = [
  {
    icon: <Calculator size={24} />,
    title: "Kalkulator",
    description: "Kalkulator sederhana dengan fitur standard dan scientific",
    to: "/tools/calculator",
    badges: ["Math", "Utility"]
  },
  {
    icon: <Clock size={24} />,
    title: "Typing Speed",
    description: "Ukur kecepatan mengetik dan tingkatkan kemampuan",
    to: "/tools/typing-speed",
    badges: ["Productivity", "Test"]
  },
  {
    icon: <Thermometer size={24} />,
    title: "Cek Cuaca",
    description: "Cek prakiraan cuaca untuk lokasi mana pun di dunia",
    to: "/tools/weather",
    badges: ["Info", "API"]
  },
  {
    icon: <VolumeX size={24} stroke="currentColor" fill="none" />,
    title: "Text to Speech",
    description: "Ubah teks menjadi suara dengan berbagai pilihan suara",
    to: "/tools/text-to-speech",
    badges: ["Audio", "Accessibility"]
  },
  {
    icon: <Layout size={24} />,
    title: "Flexbox Generator",
    description: "Buat dan visualisasikan CSS Flexbox dengan mudah",
    to: "/tools/flexbox-generator",
    badges: ["CSS", "Layout"]
  },
  {
    icon: <Grid3X3 size={24} />,
    title: "Grid Generator",
    description: "Buat dan visualisasikan CSS Grid dengan mudah",
    to: "/tools/grid-generator",
    badges: ["CSS", "Layout"]
  },
  {
    icon: <User size={24} />,
    title: "Random Name Generator",
    description: "Generate nama random untuk berbagai kebutuhan",
    to: "/tools/random-name",
    badges: ["Generator", "Random"]
  },
  {
    icon: <Image size={24} />,
    title: "Image Optimizer",
    description: "Optimalkan dan kompres gambar tanpa menurunkan kualitas",
    to: "/tools/image-optimizer",
    badges: ["Image", "Optimizer"]
  },
  {
    icon: <MessageSquareText size={24} />,
    title: "AI Chat",
    description: "Chat dengan AI untuk mendapat bantuan coding",
    to: "/tools/ai-chat",
    badges: ["AI", "Chat"]
  },
  {
    icon: <Download size={24} />,
    title: "Downloader",
    description: "Download file dan video dari berbagai sumber online",
    to: "/tools",
    badges: ["Download", "Media"]
  },
  {
    icon: <QrCode size={24} />,
    title: "QR Code Generator",
    description: "Generate QR Code untuk website atau teks",
    to: "/tools",
    badges: ["Generator", "QR"]
  },
  {
    icon: <PenTool size={24} />,
    title: "Color Picker",
    description: "Pilih warna dan dapatkan kode HEX, RGB, atau HSL",
    to: "/tools",
    badges: ["Color", "Design"]
  },
  {
    icon: <Type size={24} />,
    title: "Lorem Ipsum Generator",
    description: "Generate teks dummy untuk kebutuhan desain",
    to: "/tools",
    badges: ["Text", "Generator"]
  },
  {
    icon: <Cpu size={24} />,
    title: "JSON Formatter",
    description: "Format, validate dan beautify JSON code",
    to: "/tools",
    badges: ["Code", "Formatter"]
  },
  {
    icon: <Hash size={24} />,
    title: "Hash Generator",
    description: "Generate hash dari teks (MD5, SHA-1, SHA-256)",
    to: "/tools",
    badges: ["Security", "Generator"]
  },
  {
    icon: <Percent size={24} />,
    title: "Unit Converter",
    description: "Konversi satuan panjang, berat, volume, dan lainnya",
    to: "/tools",
    badges: ["Calculator", "Utility"]
  },
];

const ToolsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  const filteredTools = tools.filter(tool => 
    tool.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.badges.some(badge => badge.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto mb-12 space-y-4">
        <h1 className="text-4xl font-bold">Developer Tools</h1>
        <p className="text-muted-foreground text-lg">
          Kumpulan tools gratis untuk mempermudah workflow kamu dalam development dan desain web
        </p>
        
        {/* Search */}
        <div className="w-full max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Cari tools..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTools.map((tool, index) => (
          <ToolCard key={index} {...tool} />
        ))}
      </div>
      
      {filteredTools.length === 0 && (
        <div className="text-center py-12">
          <p className="text-lg text-muted-foreground">
            Tidak ada tools yang sesuai dengan pencarian "{searchTerm}"
          </p>
          <button 
            className="text-primary hover:underline mt-2"
            onClick={() => setSearchTerm('')}
          >
            Reset pencarian
          </button>
        </div>
      )}
      
      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Punya Saran Tool Baru?</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
          Jika kamu punya saran atau ide untuk tool baru yang ingin ditambahkan ke koleksi ini,
          silakan bagikan di GitHub kami atau hubungi tim developer.
        </p>
        <div className="flex justify-center gap-4">
          <Button>
            <GitHub className="mr-2 h-4 w-4" />
            GitHub
          </Button>
          <Button variant="outline">
            <Mail className="mr-2 h-4 w-4" />
            Contact Us
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ToolsPage;
