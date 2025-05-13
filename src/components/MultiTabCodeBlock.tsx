
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

interface CodeTab {
  label: string;
  language: string;
  code: string;
  filename?: string;
}

interface MultiTabCodeBlockProps {
  tabs: CodeTab[];
  defaultTab?: string;
  showLineNumbers?: boolean;
  title?: string;
}

export const MultiTabCodeBlock: React.FC<MultiTabCodeBlockProps> = ({
  tabs,
  defaultTab,
  showLineNumbers = false,
  title,
}) => {
  const [isCopied, setIsCopied] = useState(false);
  const [isWrapped, setIsWrapped] = useState(false);
  const [activeTabIndex, setActiveTabIndex] = useState(defaultTab ? 
    tabs.findIndex(tab => tab.label === defaultTab) : 0);

  if (activeTabIndex < 0) setActiveTabIndex(0);
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(tabs[activeTabIndex].code);
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
  const getCodeWithLineNumbers = (code: string) => {
    if (!showLineNumbers) return null;
    
    return code.split('\n').map((line, i) => (
      <div key={i} className="table-row">
        <span className="table-cell pr-4 text-right text-zinc-500 select-none">{i + 1}</span>
        <span className="table-cell">{line}</span>
      </div>
    ));
  };

  return (
    <div className="relative mt-4 mb-8 rounded-lg overflow-hidden border bg-zinc-950 dark:bg-zinc-900 text-white">
      {title && (
        <div className="px-4 py-2 bg-zinc-800 border-b border-zinc-700 text-sm font-medium text-zinc-100">
          {title}
        </div>
      )}
      
      <div className="border-b border-zinc-700">
        <div className="flex justify-between items-center">
          <Tabs 
            defaultValue={tabs[activeTabIndex].label} 
            onValueChange={(value) => {
              const index = tabs.findIndex(tab => tab.label === value);
              if (index !== -1) setActiveTabIndex(index);
            }}
            className="w-full"
          >
            <div className="flex justify-between items-center px-2 bg-zinc-800">
              <TabsList className="p-0 h-auto bg-transparent">
                {tabs.map((tab, index) => (
                  <TabsTrigger
                    key={index}
                    value={tab.label}
                    className="px-3 py-2 rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-zinc-700/20 data-[state=active]:shadow-none text-xs"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              
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

            {tabs.map((tab, index) => (
              <TabsContent key={index} value={tab.label} className="m-0">
                {tab.filename && (
                  <div className="px-4 py-1 bg-zinc-800/50 border-b border-zinc-700">
                    <span className="text-xs font-semibold text-zinc-300">{tab.filename}</span>
                  </div>
                )}
                <div className={cn(
                  "overflow-x-auto font-mono text-sm p-4",
                  isWrapped && "whitespace-pre-wrap"
                )}>
                  {showLineNumbers ? (
                    <div className="table w-full">
                      {getCodeWithLineNumbers(tab.code)}
                    </div>
                  ) : (
                    <pre className={cn("text-white", !isWrapped && "whitespace-pre")}>
                      {tab.code}
                    </pre>
                  )}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default MultiTabCodeBlock;
