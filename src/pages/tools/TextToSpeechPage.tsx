
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Play,
  Pause,
  Save,
  ArrowLeft,
  Volume2,
  BookOpen,
  Mic,
  Clock,
  RefreshCw,
  HelpCircle,
  Copy,
  PlaySquare,
  CheckSquare,
  Download
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const TextToSpeechPage: React.FC = () => {
  const { toast } = useToast();
  const [text, setText] = useState<string>('');
  const [rate, setRate] = useState<number>(1);
  const [pitch, setPitch] = useState<number>(1);
  const [volume, setVolume] = useState<number>(1);
  const [voice, setVoice] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [recentTexts, setRecentTexts] = useState<string[]>([]);
  const [isButtonHovered, setIsButtonHovered] = useState<boolean>(false);
  const [isTextCopied, setIsTextCopied] = useState<boolean>(false);
  
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Initialize available voices
  React.useEffect(() => {
    const loadVoices = () => {
      const voiceList = window.speechSynthesis.getVoices();
      if (voiceList.length > 0) {
        setAvailableVoices(voiceList);
        // Set a default Indonesian voice if available, otherwise first voice
        const indonesianVoice = voiceList.find(voice => voice.lang.includes('id-ID'));
        setVoice(indonesianVoice ? indonesianVoice.name : voiceList[0].name);
      }
    };

    // Load voices on mount
    loadVoices();

    // Chrome needs a listener for the voices to load
    if (window.speechSynthesis) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
      
      // Cleanup
      return () => {
        window.speechSynthesis.onvoiceschanged = null;
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel();
        }
      };
    }
  }, []);

  // Handle text change
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
  };

  // Handle play/pause
  const handlePlayPause = () => {
    const synth = window.speechSynthesis;
    
    if (isPlaying) {
      synth.pause();
      setIsPlaying(false);
    } else {
      if (synth.paused) {
        synth.resume();
        setIsPlaying(true);
        return;
      }
      
      if (!text.trim()) {
        toast({
          title: "Teks kosong",
          description: "Masukkan teks untuk dibacakan",
          variant: "destructive",
        });
        return;
      }
      
      // Cancel any previous speech
      if (synth.speaking) {
        synth.cancel();
      }
      
      // Create new utterance
      const utterance = new SpeechSynthesisUtterance(text);
      speechRef.current = utterance;
      
      // Set properties
      utterance.rate = rate;
      utterance.pitch = pitch;
      utterance.volume = volume;
      
      // Set voice if we have one selected
      if (voice) {
        const selectedVoice = availableVoices.find(v => v.name === voice);
        if (selectedVoice) utterance.voice = selectedVoice;
      }
      
      // Event handlers
      utterance.onstart = () => {
        setIsPlaying(true);
        setIsSpeaking(true);
      };
      
      utterance.onend = () => {
        setIsPlaying(false);
        setIsSpeaking(false);
        
        // Add to recent texts if not already there
        if (text.trim() && !recentTexts.includes(text)) {
          setRecentTexts(prev => [text, ...prev].slice(0, 5));
        }
      };
      
      utterance.onpause = () => setIsPlaying(false);
      utterance.onresume = () => setIsPlaying(true);
      
      // Start speaking
      synth.speak(utterance);
    }
  };

  // Stop speaking
  const handleStop = () => {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
      setIsSpeaking(false);
    }
  };

  // Copy text to clipboard
  const handleCopyText = () => {
    if (!text.trim()) return;
    
    navigator.clipboard.writeText(text);
    setIsTextCopied(true);
    toast({
      title: "Teks disalin",
      description: "Teks berhasil disalin ke clipboard",
    });
    
    setTimeout(() => {
      setIsTextCopied(false);
    }, 2000);
  };

  // Reset settings
  const handleReset = () => {
    setRate(1);
    setPitch(1);
    setVolume(1);
    
    toast({
      title: "Pengaturan direset",
      description: "Semua pengaturan telah dikembalikan ke nilai awal",
    });
  };

  // Use recent text
  const useRecentText = (savedText: string) => {
    setText(savedText);
    toast({
      title: "Teks dimuat",
      description: "Teks sebelumnya telah dimuat",
    });
  };

  // Clear all recent texts
  const clearRecentTexts = () => {
    setRecentTexts([]);
    toast({
      title: "Riwayat dihapus",
      description: "Semua riwayat teks telah dihapus",
    });
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center gap-2 mb-6">
        <Link to="/tools">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Text to Speech</h1>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" />
                Masukkan Teks
              </CardTitle>
              <CardDescription>
                Ketik atau tempel teks yang ingin diubah menjadi ucapan
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <Label htmlFor="text-input">Teks Input</Label>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 px-2 text-xs"
                    onClick={handleCopyText}
                    disabled={!text.trim()}
                  >
                    {isTextCopied ? (
                      <>
                        <CheckSquare className="h-4 w-4 mr-1" />
                        Disalin
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-1" />
                        Salin Teks
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 px-2 text-xs"
                    onClick={() => setText('')}
                    disabled={!text.trim()}
                  >
                    Bersihkan
                  </Button>
                </div>
              </div>
              
              <Textarea
                id="text-input"
                placeholder="Tuliskan atau tempelkan teks di sini untuk diubah menjadi ucapan..."
                value={text}
                onChange={handleTextChange}
                className="min-h-[200px] resize-y"
              />
              
              <div className="flex flex-wrap gap-2 mt-4 items-center">
                <Button
                  onClick={handlePlayPause}
                  disabled={isSpeaking && !isPlaying}
                  className="gap-2"
                  onMouseEnter={() => setIsButtonHovered(true)}
                  onMouseLeave={() => setIsButtonHovered(false)}
                >
                  {isPlaying ? (
                    <>
                      <Pause className="h-4 w-4" />
                      Jeda
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      {isSpeaking ? 'Lanjutkan' : 'Mainkan'}
                    </>
                  )}
                </Button>
                
                {isSpeaking && (
                  <Button variant="outline" onClick={handleStop} className="gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Berhenti
                  </Button>
                )}
                
                <span className="text-sm text-muted-foreground ml-auto">
                  {text.length} karakter | {text.split(/\s+/).filter(Boolean).length} kata
                </span>
              </div>
            </CardContent>
          </Card>
          
          {/* Voice Settings */}
          <Card className="mt-6 shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mic className="h-5 w-5 text-primary" />
                Pengaturan Suara
              </CardTitle>
              <CardDescription>
                Sesuaikan properti suara sesuai keinginan Anda
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="voice-select" className="mb-2 block">
                    Pilih Suara
                  </Label>
                  <Select value={voice} onValueChange={setVoice}>
                    <SelectTrigger id="voice-select">
                      <SelectValue placeholder="Pilih suara" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableVoices.map((v) => (
                        <SelectItem key={v.name} value={v.name}>
                          {v.name} ({v.lang})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    {availableVoices.length} suara tersedia di perangkat Anda
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Rate control */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="rate-slider">Kecepatan</Label>
                      <span className="text-xs text-muted-foreground">{rate}x</span>
                    </div>
                    <Slider
                      id="rate-slider"
                      min={0.5}
                      max={2}
                      step={0.1}
                      value={[rate]}
                      onValueChange={(value) => setRate(value[0])}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Lambat</span>
                      <span>Normal</span>
                      <span>Cepat</span>
                    </div>
                  </div>
                  
                  {/* Pitch control */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="pitch-slider">Nada</Label>
                      <span className="text-xs text-muted-foreground">{pitch}x</span>
                    </div>
                    <Slider
                      id="pitch-slider"
                      min={0.5}
                      max={2}
                      step={0.1}
                      value={[pitch]}
                      onValueChange={(value) => setPitch(value[0])}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Rendah</span>
                      <span>Normal</span>
                      <span>Tinggi</span>
                    </div>
                  </div>
                  
                  {/* Volume control */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label htmlFor="volume-slider">Volume</Label>
                      <span className="text-xs text-muted-foreground">{Math.round(volume * 100)}%</span>
                    </div>
                    <Slider
                      id="volume-slider"
                      min={0}
                      max={1}
                      step={0.1}
                      value={[volume]}
                      onValueChange={(value) => setVolume(value[0])}
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Rendah</span>
                      <span>Normal</span>
                      <span>Tinggi</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button variant="outline" size="sm" onClick={handleReset} className="gap-2">
                  <RefreshCw className="h-3 w-3" />
                  Reset Pengaturan
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          {/* Recent Texts */}
          <Card className="shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary" />
                  Riwayat Teks
                </CardTitle>
                {recentTexts.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={clearRecentTexts}
                    className="h-8 px-2"
                  >
                    Bersihkan
                  </Button>
                )}
              </div>
              <CardDescription>
                Teks yang baru saja Anda gunakan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentTexts.length > 0 ? (
                recentTexts.map((savedText, index) => (
                  <div 
                    key={index}
                    className="border rounded-md p-3 hover:bg-muted/50 cursor-pointer flex items-start gap-2"
                    onClick={() => useRecentText(savedText)}
                  >
                    <PlaySquare className="h-4 w-4 text-primary mt-1 flex-shrink-0" />
                    <p className="text-sm line-clamp-2">
                      {savedText}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Belum ada teks yang digunakan
                </p>
              )}
            </CardContent>
          </Card>
          
          {/* Tips */}
          <Card className="shadow">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-primary" />
                Tips Penggunaan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  Gunakan tombol <strong>Play</strong> untuk memulai pembacaan teks
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  Sesuaikan kecepatan bicara untuk hasil yang lebih baik
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  Coba berbagai jenis suara untuk mendapatkan pengalaman yang berbeda
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  Anda dapat mengakses teks yang sebelumnya digunakan dari bagian Riwayat
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  Simbol seperti <strong>!</strong> dan <strong>?</strong> dapat membantu pembacaan lebih natural
                </li>
              </ul>
            </CardContent>
          </Card>
          
          {/* Example Texts */}
          <Card className="shadow">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                Contoh Teks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-left h-auto py-2 whitespace-normal"
                  onClick={() => setText("Selamat datang di aplikasi Text to Speech. Ini adalah contoh teks berbahasa Indonesia yang dapat dibacakan.")}
                >
                  <p className="line-clamp-1">Selamat datang di aplikasi Text to Speech...</p>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-left h-auto py-2 whitespace-normal"
                  onClick={() => setText("Hello world! This is an example of English text that can be read by the text-to-speech engine.")}
                >
                  <p className="line-clamp-1">Hello world! This is an example of English text...</p>
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start text-left h-auto py-2 whitespace-normal"
                  onClick={() => setText("1, 2, 3, 4, 5. Ini adalah contoh angka yang dapat dibacakan oleh mesin text to speech.")}
                >
                  <p className="line-clamp-1">1, 2, 3, 4, 5. Ini adalah contoh angka...</p>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TextToSpeechPage;
