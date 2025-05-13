
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { DownloadCloud, Link, Film, AlertTriangle, Loader2, Check } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

type VideoQuality = '1080p' | '720p' | '480p' | '360p';

type VideoDetails = {
  title: string;
  duration: string;
  thumbnail: string;
  qualities: VideoQuality[];
};

const VideoDownloaderPage: React.FC = () => {
  const [url, setUrl] = useState<string>('');
  const [isValidating, setIsValidating] = useState<boolean>(false);
  const [videoDetails, setVideoDetails] = useState<VideoDetails | null>(null);
  const [selectedQuality, setSelectedQuality] = useState<VideoQuality | ''>('');
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [downloadComplete, setDownloadComplete] = useState<boolean>(false);
  const { toast } = useToast();

  // Function to validate URL and fetch video details (mocked for this example)
  const validateUrl = async () => {
    if (!url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a video URL",
        variant: "destructive",
      });
      return;
    }
    
    // Basic URL validation (simple check for demonstration)
    const isValidUrl = url.startsWith('http') && 
      (url.includes('youtube.com') || url.includes('vimeo.com') || url.includes('dailymotion.com'));
      
    if (!isValidUrl) {
      toast({
        title: "Invalid URL",
        description: "Please enter a valid YouTube, Vimeo, or Dailymotion URL",
        variant: "destructive",
      });
      return;
    }
    
    setIsValidating(true);
    
    try {
      // Mock API call to get video details
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock video details (in a real app, this would come from an API)
      const mockVideoDetails: VideoDetails = {
        title: "Sample Video - Exploring Nature and Wildlife",
        duration: "10:43",
        thumbnail: "https://picsum.photos/seed/picsum/640/360",
        qualities: ['1080p', '720p', '480p', '360p'],
      };
      
      setVideoDetails(mockVideoDetails);
      setSelectedQuality('720p'); // Default selected quality
      
      toast({
        title: "Success",
        description: "Video information retrieved successfully",
      });
    } catch (error) {
      console.error('Error validating URL:', error);
      toast({
        title: "Error",
        description: "Failed to retrieve video information",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  // Function to simulate downloading the video (mocked for this example)
  const downloadVideo = async () => {
    if (!videoDetails || !selectedQuality) return;
    
    setIsDownloading(true);
    setDownloadProgress(0);
    setDownloadComplete(false);
    
    try {
      // Simulate download progress
      const interval = setInterval(() => {
        setDownloadProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 5;
        });
      }, 200);
      
      // Simulate download completion
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      setDownloadComplete(true);
      clearInterval(interval);
      setDownloadProgress(100);
      
      toast({
        title: "Download Complete",
        description: `${videoDetails.title} has been downloaded successfully`,
      });
    } catch (error) {
      console.error('Error downloading video:', error);
      toast({
        title: "Error",
        description: "Failed to download video",
        variant: "destructive",
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const resetForm = () => {
    setUrl('');
    setVideoDetails(null);
    setSelectedQuality('');
    setDownloadProgress(0);
    setDownloadComplete(false);
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Video Downloader</h1>
          <p className="text-muted-foreground">Download videos from YouTube, Vimeo, and other platforms</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Download Video</CardTitle>
            <CardDescription>Enter a video URL to download the video</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* URL Input Section */}
            <div className="space-y-2">
              <Label htmlFor="video-url">Video URL</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="video-url"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="pl-10"
                    disabled={isValidating || !!videoDetails}
                  />
                </div>
                <Button 
                  onClick={videoDetails ? resetForm : validateUrl} 
                  disabled={isValidating}
                >
                  {isValidating ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Validating...
                    </>
                  ) : videoDetails ? (
                    "Try Another"
                  ) : (
                    "Check URL"
                  )}
                </Button>
              </div>
              
              <div className="text-xs text-muted-foreground pt-1">
                <span>Supported platforms: </span>
                <Badge variant="outline" className="mr-1">YouTube</Badge>
                <Badge variant="outline" className="mr-1">Vimeo</Badge>
                <Badge variant="outline">Dailymotion</Badge>
              </div>
            </div>
            
            {videoDetails && (
              <>
                <Separator />
                
                {/* Video Details Section */}
                <div className="grid grid-cols-1 md:grid-cols-[150px,1fr] gap-4">
                  <div className="overflow-hidden rounded-md">
                    <img 
                      src={videoDetails.thumbnail} 
                      alt={videoDetails.title}
                      className="w-full h-auto object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://placehold.co/640x360/gray/white?text=Video+Thumbnail";
                      }}
                    />
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-semibold line-clamp-2">{videoDetails.title}</h3>
                      <p className="text-sm text-muted-foreground">Duration: {videoDetails.duration}</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="quality">Quality</Label>
                      <Select
                        value={selectedQuality}
                        onValueChange={(value) => setSelectedQuality(value as VideoQuality)}
                      >
                        <SelectTrigger id="quality">
                          <SelectValue placeholder="Select quality" />
                        </SelectTrigger>
                        <SelectContent>
                          {videoDetails.qualities.map((quality) => (
                            <SelectItem key={quality} value={quality}>
                              {quality}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
                
                {/* Download Button */}
                <div>
                  <Button 
                    onClick={downloadVideo} 
                    disabled={isDownloading || !selectedQuality || downloadComplete}
                    className="w-full"
                    size="lg"
                  >
                    {isDownloading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin mr-2" />
                        Downloading... {downloadProgress}%
                      </>
                    ) : downloadComplete ? (
                      <>
                        <Check className="h-4 w-4 mr-2" />
                        Download Complete
                      </>
                    ) : (
                      <>
                        <DownloadCloud className="h-4 w-4 mr-2" />
                        Download Video
                      </>
                    )}
                  </Button>
                </div>
                
                {/* Download Progress */}
                {isDownloading && (
                  <div className="w-full bg-muted rounded-full h-2.5 dark:bg-gray-700">
                    <div 
                      className="bg-primary h-2.5 rounded-full" 
                      style={{ width: `${downloadProgress}%` }}
                    ></div>
                  </div>
                )}
              </>
            )}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 text-sm text-muted-foreground">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
              <p>
                This is a demonstration. In production, you would need a backend service to process video downloads, 
                and ensure compliance with the terms of service of video platforms.
              </p>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default VideoDownloaderPage;
