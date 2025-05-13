
import React from 'react';
import CodeBlock from '@/components/CodeBlock';
import MultiTabCodeBlock from '@/components/MultiTabCodeBlock';
import { extractCodeBlocks, processContent } from '@/utils/blogUtils';

interface MDXPreviewProps {
  content: string;
}

const MDXPreview: React.FC<MDXPreviewProps> = ({ content }) => {
  if (!content) return null;
  
  // Extract code blocks from content
  const { processedContent, codeBlocks } = extractCodeBlocks(content);
  
  // Convert Markdown to HTML (basic implementation for this example)
  const renderedContent = processedContent
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/\*\*(.*)\*\*/gm, '<strong>$1</strong>')
    .replace(/\*(.*)\*/gm, '<em>$1</em>')
    .replace(/!\[(.*?)\]\((.*?)\)/gm, '<img alt="$1" src="$2" class="my-4 rounded-lg max-w-full" />')
    .replace(/\[(.*?)\]\((.*?)\)/gm, '<a href="$2" class="text-primary hover:underline">$1</a>')
    .replace(/`([^`]+)`/gm, '<code class="bg-muted px-1 py-0.5 rounded">$1</code>')
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul class="my-4 list-disc pl-6">${match}</ul>`)
    .replace(/^(\d+)\. (.*$)/gm, '<li>$2</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, (match) => match.includes('. ') ? `<ol class="my-4 list-decimal pl-6">${match}</ol>` : match)
    .replace(/\n\n/g, '<p class="mb-4"></p>');
    
  // Handle code blocks replacement
  let finalContent = renderedContent;
  
  codeBlocks.forEach((block, index) => {
    const placeholder = `<CodeBlockPlaceholder id="${index}" language="${block.language}" ${block.filename ? `filename="${block.filename}"` : ''} ${block.showLineNumbers ? 'showLineNumbers' : ''} />`;
    
    let replacement;
    if (block.language === 'multi' && block.filename) {
      // Parse tabs from filename (expected format: "tab1,tab2,tab3")
      const tabLabels = block.filename.split(',').map(t => t.trim());
      const tabCodes = block.code.split('---tab---');
      
      // Create tab data (ensuring we have enough tab data)
      const tabs = tabLabels.map((label, i) => ({
        label,
        language: label.includes('.') ? label.split('.').pop() || 'plaintext' : 'plaintext',
        code: i < tabCodes.length ? tabCodes[i] : '',
        filename: label
      }));
      
      replacement = (
        <MultiTabCodeBlock 
          key={index}
          tabs={tabs}
          showLineNumbers={!!block.showLineNumbers}
        />
      );
    } else {
      replacement = (
        <CodeBlock 
          key={index}
          code={block.code} 
          language={block.language} 
          filename={block.filename}
          showLineNumbers={!!block.showLineNumbers}
        />
      );
    }
    
    finalContent = finalContent.replace(placeholder, '');
    
    if (index === 0) {
      finalContent = (
        <>
          <div dangerouslySetInnerHTML={{ __html: finalContent.split(placeholder)[0] }} />
          {replacement}
          <div dangerouslySetInnerHTML={{ __html: finalContent.split(placeholder)[1] || '' }} />
        </>
      );
    }
  });
  
  if (typeof finalContent === 'string') {
    return <div dangerouslySetInnerHTML={{ __html: finalContent }} />;
  }
  
  return finalContent;
};

export default MDXPreview;
