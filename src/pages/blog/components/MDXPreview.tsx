
import React from 'react';
import { Card } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface MDXPreviewProps {
  content: string;
}

// Simple component for MDX preview
// In a real implementation, you would parse and render MDX properly
const MDXPreview: React.FC<MDXPreviewProps> = ({ content }) => {
  const formatMarkdown = (markdown: string) => {
    // Very basic markdown formatting - in a real app you would use a proper MDX processor
    let formatted = markdown;
    
    // Headers
    formatted = formatted.replace(/^# (.+)$/gm, '<h1 class="text-3xl font-bold mt-6 mb-4">$1</h1>');
    formatted = formatted.replace(/^## (.+)$/gm, '<h2 class="text-2xl font-bold mt-5 mb-3">$1</h2>');
    formatted = formatted.replace(/^### (.+)$/gm, '<h3 class="text-xl font-bold mt-4 mb-2">$1</h3>');
    
    // Lists
    formatted = formatted.replace(/^\- (.+)$/gm, '<li class="ml-4">$1</li>');
    formatted = formatted.replace(/(<li.*<\/li>\n)+/g, '<ul class="list-disc mb-4">$&</ul>');
    
    // Code blocks
    formatted = formatted.replace(/```(\w+)?\n([\s\S]*?)\n```/g, (match, lang, code) => {
      return `<pre class="bg-muted p-4 rounded-md overflow-auto my-4"><code class="text-sm font-mono">${code.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</code></pre>`;
    });
    
    // Inline code
    formatted = formatted.replace(/`([^`]+)`/g, '<code class="bg-muted px-1 py-0.5 rounded text-sm font-mono">$1</code>');
    
    // Bold
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
    
    // Italic
    formatted = formatted.replace(/\*([^*]+)\*/g, '<em>$1</em>');
    
    // Links
    formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-primary underline">$1</a>');
    
    // Paragraphs - must be last
    formatted = formatted.replace(/^([^<].*[^>])$/gm, '<p class="mb-4">$1</p>');
    
    // React components (simplified handling)
    formatted = formatted.replace(/<([A-Z][a-zA-Z]*)(.*?)>(.*?)<\/\1>/gs, (match) => {
      return `<div class="border border-primary/20 rounded p-4 my-4 bg-primary/5">
        <div class="text-xs text-muted-foreground mb-2">React Component:</div>
        <div class="font-mono">${match.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</div>
      </div>`;
    });
    
    return formatted;
  };

  try {
    const formattedContent = formatMarkdown(content);
    
    return (
      <div className="prose prose-stone dark:prose-invert max-w-none">
        <div dangerouslySetInnerHTML={{ __html: formattedContent }} />
      </div>
    );
  } catch (error) {
    console.error('Error rendering MDX:', error);
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Error rendering MDX content. Check for syntax errors.
        </AlertDescription>
      </Alert>
    );
  }
};

export default MDXPreview;
