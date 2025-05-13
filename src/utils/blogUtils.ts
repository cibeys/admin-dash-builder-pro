
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import blogTechImage from '/images/blog/blog-tech.jpg';
import blogDesignImage from '/images/blog/blog-design.jpg';
import blogProgrammingImage from '/images/blog/blog-programming.jpg';

// Create a mapping for local images
const localImages = {
  'blog-tech': blogTechImage,
  'blog-design': blogDesignImage,
  'blog-programming': blogProgrammingImage,
};

export const getPostImage = (imageUrl: string | null) => {
  if (!imageUrl) return blogTechImage;
  
  // If the image URL doesn't start with http (local reference)
  if (!imageUrl.startsWith('http')) {
    // Try to find a local image match based on the filename
    const imageName = imageUrl.split('/').pop()?.split('.')[0];
    if (imageName && imageName in localImages) {
      return localImages[imageName as keyof typeof localImages];
    }
    
    // If the image starts with '/images/' it's from public folder
    if (imageUrl.startsWith('/images/')) {
      return imageUrl;
    }
  }
  
  // If it's an external URL, use it directly
  if (imageUrl.startsWith('http')) {
    return imageUrl;
  }
  
  // Default fallback
  return blogTechImage;
};

export const formatTimeAgo = (date: string | null | undefined) => {
  if (!date) return 'baru saja';
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: idLocale });
};

export const calculateReadingTime = (content: string | null | undefined) => {
  if (!content) return 1;
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute));
};

// Function to fetch blog post by slug
export const fetchPostBySlug = async (slug: string) => {
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      profiles:author_id(*),
      categories(*)
    `)
    .eq('slug', slug)
    .single();
    
  if (error) {
    throw error;
  }
  
  return data;
};

// Function to fetch related posts
export const fetchRelatedPosts = async (categoryId: string | null, currentPostId: string, limit = 3) => {
  let query = supabase
    .from('posts')
    .select(`
      id, title, slug, excerpt, featured_image, status, published_at,
      profiles:author_id(username, avatar_url, full_name),
      categories:category_id(name, slug)
    `)
    .eq('status', 'published')
    .neq('id', currentPostId)
    .order('published_at', { ascending: false })
    .limit(limit);
    
  if (categoryId) {
    query = query.eq('category_id', categoryId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching related posts:', error);
    return [];
  }
  
  return data || [];
};

// Enhanced version to extract code blocks from content with better metadata handling
export const extractCodeBlocks = (content: string): { 
  processedContent: string, 
  codeBlocks: Array<{ language: string, code: string, filename?: string, showLineNumbers?: boolean }>
} => {
  // Enhanced regex to capture language, filename and line numbers option
  const codeBlockRegex = /```(\w+)(?:\s*\[([^\]]+)\])?(?:\s*\{([^\}]+)\})?\s*\n([\s\S]*?)```/g;
  const codeBlocks: Array<{ language: string, code: string, filename?: string, showLineNumbers?: boolean }> = [];
  
  // Replace code blocks with placeholders and collect code block info
  const processedContent = content.replace(codeBlockRegex, (match, lang, filename, options, code) => {
    const blockId = `__CODE_BLOCK_${codeBlocks.length}__`;
    
    // Parse additional options if present
    let showLineNumbers = false;
    if (options) {
      showLineNumbers = options.includes('showLineNumbers') || options.includes('lineNumbers');
    }
    
    codeBlocks.push({ 
      language: lang, 
      code: code.trim(),
      filename: filename?.trim(),
      showLineNumbers
    });
    return blockId;
  });
  
  return { processedContent, codeBlocks };
};

// Process content with code blocks
export const processContent = (content: string): string => {
  if (!content) return '';
  
  const { processedContent, codeBlocks } = extractCodeBlocks(content);
  
  // Replace placeholders with ReactNode representations (as string)
  let result = processedContent;
  codeBlocks.forEach((block, index) => {
    const placeholder = `__CODE_BLOCK_${index}__`;
    
    // Create string representation of component markup
    // This will be handled by MDX or a custom renderer
    const replacement = `<CodeBlockPlaceholder id="${index}" language="${block.language}" ${block.filename ? `filename="${block.filename}"` : ''} ${block.showLineNumbers ? 'showLineNumbers' : ''} />`;
    
    result = result.replace(placeholder, replacement);
  });
  
  return result;
};
