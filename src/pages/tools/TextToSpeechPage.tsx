
import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Play, Pause, Download, Volume2, RotateCcw, Loader2 } from 'lucide-react';

type Voice = {
  id: string;
  name: string;
  language: string;
};

const voices: Voice[] = [
  { id: 'female-1', name: 'Siti', language: 'Indonesian (Female)' },
  { id: 'male-1', name: 'Budi', language: 'Indonesian (Male)' },
  { id: 'female-2', name: 'Sarah', language: 'English (Female)' },
  { id: 'male-2', name: 'David', language: 'English (Male)' },
  { id: 'female-3', name: 'Yuki', language: 'Japanese (Female)' },
];

const TextToSpeechPage: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [voice, setVoice] = useState<string>('female-1');
  const [volume, setVolume] = useState<number>(80);
  const [rate, setRate] = useState<number>(1);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  // For demo purposes - simulate text to speech conversion
  const convertTextToSpeech = async () => {
    if (!text.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to convert",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setAudioUrl(null);
    
    try {
      // In a real app, this would be a fetch to a TTS API
      // Simulating API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For demo, use the browser's speech synthesis API
      // But provide a static audio URL for download capability
      const audio = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();
      
      // Set voice (using system voices for demo)
      if (voices.length) {
        audio.voice = voices[0]; // Just use first available voice
      }
      
      // Set rate and volume
      audio.rate = rate;
      audio.volume = volume / 100;
      
      // Create a blob URL for demonstration purposes
      // In a real app, this would be the URL returned from the API
      const dummyAudioUrl = 'data:audio/mp3;base64,SUQzBAAAAAABEVRYWFgAAAAtAAADY29tbWVudABCaWdTb3VuZEJhbmsuY29tIC8gTGFTb25vdGhlcXVlLm9yZwBURU5DAAAAHQAAA1N3aXRjaCBQbHVzIMKpIE5DSCBTb2Z0d2FyZQBUSVQyAAAABgAAAzIyMzUAVFNTRQAAAA8AAANMYXZmNTcuODMuMTAwAAAAAAAAAAAAAAD/80DEAAAAA0gAAAAATEFNRTMuMTAwVVVVVVVVVVVVVUxBTUUzLjEwMFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQsRbAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVf/zQMSkAAADSAAAAABVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVV';
      setAudioUrl(dummyAudioUrl);
      
      // Play the audio using the Web Speech API for the demo
      if (!isPlaying) {
        window.speechSynthesis.speak(audio);
        setIsPlaying(true);
        
        // Set isPlaying to false when audio finishes
        audio.onend = () => {
          setIsPlaying(false);
        };
      }
      
      toast({
        title: "Success",
        description: "Text converted to speech successfully",
      });
    } catch (error) {
      console.error('Error converting text:', error);
      toast({
        title: "Error",
        description: "Failed to convert text to speech",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayPause = () => {
    if (isPlaying) {
      window.speechSynthesis.cancel(); // Stop the speech
      setIsPlaying(false);
    } else {
      if (text.trim()) {
        convertTextToSpeech();
      }
    }
  };

  const handleDownload = () => {
    if (audioUrl) {
      const a = document.createElement('a');
      a.href = audioUrl;
      a.download = 'text-to-speech.mp3';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleReset = () => {
    setText('');
    setVoice('female-1');
    setVolume(80);
    setRate(1);
    setAudioUrl(null);
    window.speechSynthesis.cancel();
    setIsPlaying(false);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    if (audioRef.current) {
      audioRef.current.volume = value[0] / 100;
    }
  };

  const handleRateChange = (value: number[]) => {
    setRate(value[0]);
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Text to Speech</h1>
          <p className="text-muted-foreground">Convert any text to spoken audio in multiple languages</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Convert Text to Speech</CardTitle>
            <CardDescription>Enter text below and customize voice settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Text Input */}
            <div className="space-y-2">
              <Label htmlFor="text">Text</Label>
              <Textarea
                id="text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter the text you want to convert to speech..."
                rows={5}
                className="resize-none"
              />
            </div>
            
            {/* Voice Selection */}
            <div className="space-y-2">
              <Label htmlFor="voice">Voice</Label>
              <Select value={voice} onValueChange={setVoice}>
                <SelectTrigger id="voice">
                  <SelectValue placeholder="Select a voice" />
                </SelectTrigger>
                <SelectContent>
                  {voices.map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.name} - {v.language}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {/* Volume and Rate Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="volume">Volume</Label>
                  <span className="text-sm text-muted-foreground">{volume}%</span>
                </div>
                <Slider
                  id="volume"
                  min={0}
                  max={100}
                  step={1}
                  defaultValue={[80]}
                  value={[volume]}
                  onValueChange={handleVolumeChange}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="rate">Speed</Label>
                  <span className="text-sm text-muted-foreground">{rate}x</span>
                </div>
                <Slider
                  id="rate"
                  min={0.5}
                  max={2}
                  step={0.1}
                  defaultValue={[1]}
                  value={[rate]}
                  onValueChange={handleRateChange}
                />
              </div>
            </div>
            
            {/* Audio Player (only shown when there's audio) */}
            {audioUrl && (
              <div className="pt-4">
                <audio ref={audioRef} src={audioUrl} controls className="w-full" />
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleReset}
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button
                variant={audioUrl ? "default" : "outline"}
                size="icon"
                onClick={handleDownload}
                disabled={!audioUrl}
              >
                <Download className="h-4 w-4" />
              </Button>
            </div>
            
            <Button 
              onClick={handlePlayPause} 
              disabled={isLoading || (!text.trim() && !isPlaying)}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Converting...
                </>
              ) : isPlaying ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Stop
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Speak
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
        
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>This is a demonstration. Connect to a real Text-to-Speech API for production use.</p>
        </div>
      </div>
    </div>
  );
};

export default TextToSpeechPage;
