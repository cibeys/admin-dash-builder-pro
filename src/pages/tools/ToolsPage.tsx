
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, Cloud, MessageSquare, Image as ImageIcon, Type, Volume2, Download, Code, Grid, Loader2, Shuffle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ToolCard {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  badge?: string;
}

const ToolsPage: React.FC = () => {
  const tools: ToolCard[] = [
    {
      title: 'AI Chat',
      description: 'Chat with an AI assistant on a variety of topics',
      icon: <MessageSquare className="h-8 w-8 text-indigo-500" />,
      href: '/tools/ai-chat',
      badge: 'Popular'
    },
    {
      title: 'Image Optimizer',
      description: 'Optimize and compress images for faster loading times',
      icon: <ImageIcon className="h-8 w-8 text-blue-500" />,
      href: '/tools/image-optimizer'
    },
    {
      title: 'Typing Speed Test',
      description: 'Test and improve your typing speed and accuracy',
      icon: <Type className="h-8 w-8 text-green-500" />,
      href: '/tools/typing-speed'
    },
    {
      title: 'Calculator',
      description: 'Standard and scientific calculator with history',
      icon: <Calculator className="h-8 w-8 text-orange-500" />,
      href: '/tools/calculator',
      badge: 'New'
    },
    {
      title: 'Weather Forecast',
      description: 'Check current weather and forecast for any location',
      icon: <Cloud className="h-8 w-8 text-cyan-500" />,
      href: '/tools/weather',
      badge: 'New'
    },
    {
      title: 'Text to Speech',
      description: 'Convert text to natural sounding speech',
      icon: <Volume2 className="h-8 w-8 text-violet-500" />,
      href: '/tools/text-to-speech',
      badge: 'New'
    },
    {
      title: 'Video Downloader',
      description: 'Download videos from popular platforms',
      icon: <Download className="h-8 w-8 text-red-500" />,
      href: '/tools/video-downloader',
      badge: 'New'
    },
    {
      title: 'CSS Generators',
      description: 'Generate CSS for flexbox, grid, gradients and more',
      icon: <Code className="h-8 w-8 text-teal-500" />,
      href: '/tools/css-generators',
      badge: 'New'
    },
    {
      title: 'Random Name Generator',
      description: 'Generate random names for characters, projects, etc.',
      icon: <Shuffle className="h-8 w-8 text-pink-500" />,
      href: '/tools/random-name',
      badge: 'Coming Soon'
    }
  ];

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Free Online Tools</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover our collection of free online tools to help you with everyday tasks and boost productivity
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool, index) => (
            <Link 
              key={index} 
              to={tool.badge === 'Coming Soon' ? '#' : tool.href}
              className={`block transition-transform hover:scale-105 ${tool.badge === 'Coming Soon' ? 'opacity-70 pointer-events-none' : ''}`}
            >
              <Card className="h-full">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    {tool.icon}
                    {tool.badge && (
                      <Badge variant={tool.badge === 'Popular' ? 'default' : 'outline'} className={tool.badge === 'New' ? 'bg-green-500' : ''}>
                        {tool.badge}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="mt-2">{tool.title}</CardTitle>
                  <CardDescription>{tool.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {tool.badge === 'Coming Soon' ? (
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Loader2 className="h-3 w-3 animate-spin mr-1" />
                      <span>In development</span>
                    </div>
                  ) : (
                    <div className="text-sm text-blue-500 dark:text-blue-400">Try it out →</div>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ToolsPage;
