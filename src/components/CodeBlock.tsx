
import React, { useState } from 'react';
import { Check, Copy, WrapText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  showLineNumbers?: boolean;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language = 'javascript',
  filename,
  showLineNumbers = false,
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isWrapped, setIsWrapped] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const toggleWordWrap = () => {
    setIsWrapped(!isWrapped);
  };

  // Format line numbers if enabled
  const codeWithLineNumbers = showLineNumbers 
    ? code.split('\n').map((line, i) => (
        <div key={i} className="table-row">
          <span className="table-cell pr-4 text-right text-zinc-500 select-none">{i + 1}</span>
          <span className="table-cell">{line}</span>
        </div>
      ))
    : null;

  return (
    <div className="relative mt-4 mb-8 rounded-lg overflow-hidden border bg-zinc-950 dark:bg-zinc-900 text-white">
      {/* Header with language tag and filename */}
      <div className="flex justify-between items-center px-4 py-2 bg-zinc-800 border-b border-zinc-700">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono text-zinc-300">{language}</span>
          {filename && (
            <span className="text-xs font-semibold bg-zinc-700 px-2 py-1 rounded text-zinc-200">
              {filename}
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-zinc-400 hover:text-white hover:bg-zinc-700"
                  onClick={toggleWordWrap}
                >
                  <WrapText size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle word wrap</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-zinc-400 hover:text-white hover:bg-zinc-700"
                  onClick={handleCopy}
                  disabled={isCopied}
                >
                  {isCopied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isCopied ? 'Copied!' : 'Copy code'}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      {/* Code block content */}
      <div className={cn(
        "overflow-x-auto font-mono text-sm p-4",
        isWrapped && "whitespace-pre-wrap"
      )}>
        {showLineNumbers ? (
          <div className="table w-full">
            {codeWithLineNumbers}
          </div>
        ) : (
          <pre className={cn("text-white", !isWrapped && "whitespace-pre")}>
            {code}
          </pre>
        )}
      </div>
    </div>
  );
};

export default CodeBlock;
