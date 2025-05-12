
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Gauge, RefreshCw, Trophy } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

// Sample typing texts
const SAMPLE_TEXTS = [
  "Ketik dengan cepat dan akurat untuk meningkatkan keterampilan mengetik Anda dalam bahasa Indonesia.",
  "Menulis kode dengan kecepatan tinggi membuat produktivitas meningkat dalam pengembangan perangkat lunak.",
  "Latihan mengetik secara rutin dapat meningkatkan keterampilan komunikasi digital Anda secara signifikan.",
  "Kecepatan mengetik yang baik merupakan keterampilan penting di era digital saat ini untuk berbagai profesi.",
  "Gunakan alat penghitung kecepatan ini untuk memantau dan meningkatkan kemampuan mengetik Anda setiap hari."
];

const TypingSpeedPage = () => {
  const { toast } = useToast();
  const [text, setText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [progress, setProgress] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    const saved = localStorage.getItem('typingBestScore');
    return saved ? JSON.parse(saved) : { wpm: 0, accuracy: 0 };
  });
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const timerRef = useRef<number | null>(null);

  // Initialize with a random text
  useEffect(() => {
    setText(SAMPLE_TEXTS[Math.floor(Math.random() * SAMPLE_TEXTS.length)]);
  }, []);

  // Handle timer countdown
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = window.setTimeout(() => {
        setTimeLeft((prevTime) => prevTime - 1);
        setProgress(((60 - timeLeft + 1) / 60) * 100);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      endTest();
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isActive, timeLeft]);

  // Calculate WPM and Accuracy
  const calculateResults = useCallback(() => {
    if (!startTime || !endTime) return;

    const timeInMinutes = (endTime - startTime) / 60000;
    const wordsTyped = userInput.trim().split(/\s+/).length;
    const calculatedWpm = Math.round(wordsTyped / timeInMinutes);

    // Calculate accuracy
    const correctChars = userInput.split('').filter((char, i) => text[i] === char).length;
    const calculatedAccuracy = Math.round((correctChars / userInput.length) * 100) || 0;

    setWpm(calculatedWpm);
    setAccuracy(calculatedAccuracy);

    // Save best score
    if (calculatedWpm > bestScore.wpm) {
      const newBestScore = { wpm: calculatedWpm, accuracy: calculatedAccuracy };
      setBestScore(newBestScore);
      localStorage.setItem('typingBestScore', JSON.stringify(newBestScore));
    }
  }, [startTime, endTime, userInput, text, bestScore]);

  const startTest = () => {
    setUserInput('');
    setStartTime(Date.now());
    setEndTime(null);
    setIsActive(true);
    setTimeLeft(60);
    setProgress(0);
    setWpm(0);
    setAccuracy(0);

    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const endTest = () => {
    setEndTime(Date.now());
    setIsActive(false);
    calculateResults();
    
    toast({
      title: "Tes Selesai!",
      description: `Kecepatan: ${wpm} KPM, Akurasi: ${accuracy}%`,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (!startTime) {
      setStartTime(Date.now());
    }
    setUserInput(e.target.value);

    // Check if text is completed
    if (e.target.value === text) {
      endTest();
    }
  };

  const getNewText = () => {
    let newText;
    do {
      newText = SAMPLE_TEXTS[Math.floor(Math.random() * SAMPLE_TEXTS.length)];
    } while (newText === text);
    
    setText(newText);
    setUserInput('');
    setStartTime(null);
    setEndTime(null);
    setIsActive(false);
    setTimeLeft(60);
    setProgress(0);
    setWpm(0);
    setAccuracy(0);
  };

  const getTextWithHighlight = () => {
    return text.split('').map((char, index) => {
      if (index >= userInput.length) {
        return char;
      }
      
      return userInput[index] === char ? 
        <span key={index} className="text-green-500">{char}</span> :
        <span key={index} className="text-red-500 bg-red-100 dark:bg-red-900/20">{char}</span>;
    });
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <h1 className="text-4xl font-bold mb-6 text-center">Alat Uji Kecepatan Mengetik</h1>
      <p className="text-muted-foreground text-center mb-8">
        Uji kecepatan mengetik Anda dengan mengikuti teks di bawah ini. Waktu akan mulai begitu Anda mulai mengetik.
      </p>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Teks untuk diketik</CardTitle>
                <CardDescription>Ketik teks di bawah ini secepat dan seakurat mungkin</CardDescription>
              </div>
              <Button variant="outline" size="icon" onClick={getNewText} disabled={isActive}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-muted p-4 rounded-md text-lg mb-4 min-h-[100px]">
              {getTextWithHighlight()}
            </div>
            
            <div className="mb-4">
              <Progress value={progress} className="h-2" />
              <div className="flex justify-between mt-1 text-sm">
                <span>Waktu tersisa: {timeLeft} detik</span>
                <span>Progress: {Math.round(progress)}%</span>
              </div>
            </div>
            
            <textarea
              ref={inputRef}
              value={userInput}
              onChange={handleInputChange}
              disabled={!isActive}
              className="w-full p-3 border rounded-md h-24 resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder={isActive ? "Mulailah mengetik di sini..." : "Klik tombol 'Mulai' untuk memulai tes"}
            />
          </CardContent>
          <CardFooter className="flex-col gap-4">
            <div className="flex justify-center w-full">
              <Button 
                onClick={isActive ? endTest : startTest} 
                className="px-8"
                variant={isActive ? "secondary" : "default"}
              >
                {isActive ? "Berhenti" : "Mulai"}
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <p className="text-sm font-medium text-muted-foreground">Kecepatan</p>
                      <p className="text-2xl font-bold">{wpm}</p>
                    </div>
                    <Gauge className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">kata per menit</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <p className="text-sm font-medium text-muted-foreground">Akurasi</p>
                      <p className="text-2xl font-bold">{accuracy}%</p>
                    </div>
                    <div className="h-6 w-6 text-primary flex items-center justify-center">
                      {accuracy >= 90 ? "🎯" : accuracy >= 70 ? "👍" : "⚠️"}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">ketepatan pengetikan</p>
                </CardContent>
              </Card>
              
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <p className="text-sm font-medium text-muted-foreground">Skor Terbaik</p>
                      <p className="text-2xl font-bold">{bestScore.wpm}</p>
                    </div>
                    <Trophy className="h-6 w-6 text-primary" />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    dengan akurasi {bestScore.accuracy}%
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="w-full text-center mt-2">
              <p className="text-sm text-muted-foreground">
                Latihan secara rutin untuk meningkatkan keterampilan mengetik Anda!
              </p>
            </div>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Tips Mengetik</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <Badge variant="outline">1</Badge>
                <span>Posisikan jari-jari Anda pada posisi home row: ASDF dan JKL;</span>
              </li>
              <li className="flex items-start gap-2">
                <Badge variant="outline">2</Badge>
                <span>Fokus pada akurasi terlebih dahulu, kecepatan akan mengikuti dengan latihan</span>
              </li>
              <li className="flex items-start gap-2">
                <Badge variant="outline">3</Badge>
                <span>Mengetik tanpa melihat keyboard akan meningkatkan kecepatan secara drastis</span>
              </li>
              <li className="flex items-start gap-2">
                <Badge variant="outline">4</Badge>
                <span>Latihan setiap hari selama 15-20 menit lebih baik daripada latihan panjang namun jarang</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TypingSpeedPage;
