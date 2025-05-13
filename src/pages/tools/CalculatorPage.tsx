
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, ArrowLeft, Lightbulb, History, Trash2, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

type CalculatorButtonProps = {
  value: string;
  onClick: (value: string) => void;
  className?: string;
  fullWidth?: boolean;
  variant?: 'default' | 'outline' | 'operator' | 'equals' | 'clear';
}

const CalculatorButton: React.FC<CalculatorButtonProps> = ({ 
  value, 
  onClick, 
  className, 
  fullWidth = false,
  variant = 'default' 
}) => {
  const getVariantClass = () => {
    switch(variant) {
      case 'operator':
        return 'bg-amber-500 hover:bg-amber-600 text-white';
      case 'equals':
        return 'bg-primary hover:bg-primary/90 text-white';
      case 'clear':
        return 'bg-destructive hover:bg-destructive/90 text-white';
      case 'outline':
        return 'bg-muted hover:bg-muted/80';
      default:
        return 'bg-secondary hover:bg-secondary/80';
    }
  }
  
  return (
    <Button 
      variant="secondary"
      className={cn(
        'text-lg font-medium h-14 rounded-lg',
        getVariantClass(),
        fullWidth ? 'col-span-2' : '',
        className
      )}
      onClick={() => onClick(value)}
    >
      {value}
    </Button>
  );
};

const CalculatorPage: React.FC = () => {
  const { toast } = useToast();
  const [display, setDisplay] = useState<string>('0');
  const [expression, setExpression] = useState<string>('');
  const [history, setHistory] = useState<Array<{expression: string, result: string}>>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [showTips, setShowTips] = useState<boolean>(false);

  const handleButtonClick = (value: string) => {
    switch (value) {
      case 'C':
        clearDisplay();
        break;
      case '=':
        calculateResult();
        break;
      case '%':
        handlePercent();
        break;
      case '±':
        toggleSign();
        break;
      case '←':
        handleBackspace();
        break;
      default:
        updateDisplay(value);
        break;
    }
  };

  const clearDisplay = () => {
    setDisplay('0');
    setExpression('');
  };

  const updateDisplay = (value: string) => {
    if (display === '0' && !isOperator(value) && value !== '.') {
      setDisplay(value);
      setExpression(value);
    } else if (isOperator(value)) {
      // Jika operator, tambahkan spasi untuk readability di expression
      setDisplay(value);
      setExpression(prev => `${prev} ${value} `);
    } else {
      // Jika angka atau decimal, cek apakah layar menampilkan operator
      if (isOperator(display)) {
        setDisplay(value);
        setExpression(prev => `${prev}${value}`);
      } else {
        // Jika sudah ada angka, tambahkan ke angka yang ada
        setDisplay(prev => prev + value);
        setExpression(prev => prev + value);
      }
    }
  };

  const calculateResult = () => {
    try {
      // Replace × dengan * dan ÷ dengan /
      const sanitizedExpression = expression
        .replace(/×/g, '*')
        .replace(/÷/g, '/');
      
      // eslint-disable-next-line no-eval
      const result = eval(sanitizedExpression);
      const formattedResult = Number.isInteger(result) 
        ? result.toString() 
        : result.toFixed(4).replace(/\.?0+$/, '');
      
      // Tambahkan ke history
      setHistory(prev => [...prev, {
        expression: expression,
        result: formattedResult
      }]);
      
      setDisplay(formattedResult);
      setExpression(formattedResult);
    } catch (error) {
      setDisplay('Error');
      setTimeout(() => setDisplay('0'), 1500);
    }
  };

  const handlePercent = () => {
    try {
      const value = parseFloat(display) / 100;
      const formattedValue = value.toString();
      setDisplay(formattedValue);
      setExpression(prev => {
        // Replace last number with percentage value
        const parts = prev.split(' ');
        parts[parts.length - 1] = formattedValue;
        return parts.join(' ');
      });
    } catch (error) {
      setDisplay('Error');
      setTimeout(() => setDisplay('0'), 1500);
    }
  };

  const toggleSign = () => {
    if (display !== '0') {
      const newValue = parseFloat(display) * -1;
      setDisplay(newValue.toString());
      setExpression(prev => {
        // Replace last number with negated value
        const parts = prev.split(' ');
        parts[parts.length - 1] = newValue.toString();
        return parts.join(' ');
      });
    }
  };

  const handleBackspace = () => {
    if (display.length > 1) {
      const newDisplay = display.slice(0, -1);
      setDisplay(newDisplay);
      // Update expression accordingly (more complex)
      setExpression(prev => {
        const parts = prev.split(' ');
        const lastPart = parts[parts.length - 1];
        if (lastPart.length > 1) {
          parts[parts.length - 1] = lastPart.slice(0, -1);
        } else if (lastPart.length === 1) {
          parts.pop(); // Remove the last part if it becomes empty
        }
        return parts.join(' ');
      });
    } else {
      setDisplay('0');
      setExpression(prev => {
        const parts = prev.split(' ');
        parts.pop(); // Remove the last part
        return parts.join(' ');
      });
    }
  };

  const isOperator = (value: string) => {
    return ['÷', '×', '-', '+'].includes(value);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(display);
    toast({
      title: "Disalin ke clipboard",
      description: `Nilai ${display} telah disalin.`,
    });
  };

  const clearHistory = () => {
    setHistory([]);
    toast({
      title: "Riwayat dihapus",
      description: "Semua riwayat perhitungan telah dihapus.",
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
        <h1 className="text-3xl font-bold">Kalkulator</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* Main Calculator */}
          <Card className="shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                Kalkulator
              </CardTitle>
              <CardDescription>
                Kalkulator sederhana untuk perhitungan dasar
              </CardDescription>
            </CardHeader>

            <CardContent>
              {/* Calculator Display */}
              <div className="bg-muted/50 rounded-lg p-4 mb-4">
                <div className="text-sm text-muted-foreground overflow-x-auto whitespace-nowrap mb-2">
                  {expression || '0'}
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-4xl font-semibold overflow-x-auto whitespace-nowrap">
                    {display}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={copyToClipboard} 
                    className="h-8 w-8"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Calculator Buttons */}
              <div className="grid grid-cols-4 gap-2">
                <CalculatorButton value="C" onClick={handleButtonClick} variant="clear" />
                <CalculatorButton value="±" onClick={handleButtonClick} variant="outline" />
                <CalculatorButton value="%" onClick={handleButtonClick} variant="outline" />
                <CalculatorButton value="÷" onClick={handleButtonClick} variant="operator" />

                <CalculatorButton value="7" onClick={handleButtonClick} />
                <CalculatorButton value="8" onClick={handleButtonClick} />
                <CalculatorButton value="9" onClick={handleButtonClick} />
                <CalculatorButton value="×" onClick={handleButtonClick} variant="operator" />

                <CalculatorButton value="4" onClick={handleButtonClick} />
                <CalculatorButton value="5" onClick={handleButtonClick} />
                <CalculatorButton value="6" onClick={handleButtonClick} />
                <CalculatorButton value="-" onClick={handleButtonClick} variant="operator" />

                <CalculatorButton value="1" onClick={handleButtonClick} />
                <CalculatorButton value="2" onClick={handleButtonClick} />
                <CalculatorButton value="3" onClick={handleButtonClick} />
                <CalculatorButton value="+" onClick={handleButtonClick} variant="operator" />

                <CalculatorButton value="0" onClick={handleButtonClick} fullWidth />
                <CalculatorButton value="." onClick={handleButtonClick} />
                <CalculatorButton value="=" onClick={handleButtonClick} variant="equals" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Calculator History */}
          <Card className="shadow-md">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="h-5 w-5" />
                <CardTitle className="text-lg">Riwayat Perhitungan</CardTitle>
              </div>
              {history.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={clearHistory}
                  className="h-8 w-8"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </CardHeader>
            <CardContent>
              {history.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>Belum ada riwayat perhitungan</p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                  {history.map((item, index) => (
                    <div 
                      key={index} 
                      className="border rounded-md p-3 hover:bg-muted/50 cursor-pointer"
                      onClick={() => {
                        setDisplay(item.result);
                        setExpression(item.result);
                      }}
                    >
                      <div className="text-sm text-muted-foreground">{item.expression}</div>
                      <div className="text-lg font-medium">{item.result}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Calculator Tips */}
          <Card className="shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-amber-500" />
                <CardTitle className="text-lg">Tips Penggunaan</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  Gunakan tombol <strong>C</strong> untuk menghapus semua perhitungan
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  Tombol <strong>±</strong> mengubah angka menjadi positif/negatif
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  Klik riwayat perhitungan untuk menggunakannya kembali
                </li>
                <li className="flex gap-2">
                  <span className="text-primary">•</span>
                  Hasil perhitungan dapat disalin dengan klik ikon salin
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CalculatorPage;
