
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

// Calculator types
type CalculatorMode = 'standard' | 'scientific';

const CalculatorPage: React.FC = () => {
  const [display, setDisplay] = useState<string>('0');
  const [firstOperand, setFirstOperand] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForSecondOperand, setWaitingForSecondOperand] = useState<boolean>(false);
  const [memory, setMemory] = useState<number>(0);
  const [history, setHistory] = useState<string[]>([]);
  const [mode, setMode] = useState<CalculatorMode>('standard');

  // Reset calculator
  const resetCalculator = () => {
    setDisplay('0');
    setFirstOperand(null);
    setOperator(null);
    setWaitingForSecondOperand(false);
  };

  // Input digit
  const inputDigit = (digit: string) => {
    if (waitingForSecondOperand) {
      setDisplay(digit);
      setWaitingForSecondOperand(false);
    } else {
      setDisplay(display === '0' ? digit : display + digit);
    }
  };

  // Input decimal point
  const inputDecimal = () => {
    if (waitingForSecondOperand) {
      setDisplay('0.');
      setWaitingForSecondOperand(false);
      return;
    }

    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  };

  // Handle operator
  const handleOperator = (nextOperator: string) => {
    const inputValue = parseFloat(display);

    if (firstOperand === null) {
      setFirstOperand(inputValue);
    } else if (operator) {
      const result = performCalculation[operator](firstOperand, inputValue);
      setDisplay(String(result));
      setFirstOperand(result);
      
      // Add to history
      setHistory([...history, `${firstOperand} ${operator} ${inputValue} = ${result}`]);
    }

    setWaitingForSecondOperand(true);
    setOperator(nextOperator);
  };

  // Handle calculate (equals)
  const handleCalculate = () => {
    if (firstOperand === null || operator === null) {
      return;
    }

    const inputValue = parseFloat(display);
    const result = performCalculation[operator](firstOperand, inputValue);
    
    setDisplay(String(result));
    
    // Add to history
    setHistory([...history, `${firstOperand} ${operator} ${inputValue} = ${result}`]);
    
    // Reset for next calculation
    setFirstOperand(result);
    setOperator(null);
    setWaitingForSecondOperand(true);
  };

  // Percentage
  const handlePercentage = () => {
    const inputValue = parseFloat(display);
    const result = inputValue / 100;
    setDisplay(String(result));
  };

  // Negate value
  const negateValue = () => {
    setDisplay(String(parseFloat(display) * -1));
  };

  // Special functions for scientific calculator
  const calculateSquare = () => {
    const inputValue = parseFloat(display);
    const result = inputValue * inputValue;
    setDisplay(String(result));
    setHistory([...history, `sqr(${inputValue}) = ${result}`]);
  };

  const calculateSquareRoot = () => {
    const inputValue = parseFloat(display);
    const result = Math.sqrt(inputValue);
    setDisplay(String(result));
    setHistory([...history, `sqrt(${inputValue}) = ${result}`]);
  };

  const calculateSin = () => {
    const inputValue = parseFloat(display);
    const result = Math.sin(inputValue * Math.PI / 180); // in degrees
    setDisplay(String(result));
    setHistory([...history, `sin(${inputValue}°) = ${result}`]);
  };

  const calculateCos = () => {
    const inputValue = parseFloat(display);
    const result = Math.cos(inputValue * Math.PI / 180); // in degrees
    setDisplay(String(result));
    setHistory([...history, `cos(${inputValue}°) = ${result}`]);
  };

  const calculateTan = () => {
    const inputValue = parseFloat(display);
    const result = Math.tan(inputValue * Math.PI / 180); // in degrees
    setDisplay(String(result));
    setHistory([...history, `tan(${inputValue}°) = ${result}`]);
  };

  const calculateLog = () => {
    const inputValue = parseFloat(display);
    const result = Math.log10(inputValue);
    setDisplay(String(result));
    setHistory([...history, `log(${inputValue}) = ${result}`]);
  };

  const calculateLn = () => {
    const inputValue = parseFloat(display);
    const result = Math.log(inputValue);
    setDisplay(String(result));
    setHistory([...history, `ln(${inputValue}) = ${result}`]);
  };

  // Memory functions
  const memoryAdd = () => {
    setMemory(memory + parseFloat(display));
  };

  const memorySubtract = () => {
    setMemory(memory - parseFloat(display));
  };

  const memoryRecall = () => {
    setDisplay(String(memory));
  };

  const memoryClear = () => {
    setMemory(0);
  };

  // Calculation functions
  const performCalculation: Record<string, (a: number, b: number) => number> = {
    '+': (a, b) => a + b,
    '-': (a, b) => a - b,
    '*': (a, b) => a * b,
    '/': (a, b) => a / b,
    '^': (a, b) => Math.pow(a, b),
  };

  // Clear history
  const clearHistory = () => {
    setHistory([]);
  };

  // Key press event handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const key = event.key;
      
      // Numbers
      if (/[0-9]/.test(key)) {
        event.preventDefault();
        inputDigit(key);
      }
      // Operators
      else if (['+', '-', '*', '/'].includes(key)) {
        event.preventDefault();
        handleOperator(key);
      }
      // Equals/Enter
      else if (key === 'Enter' || key === '=') {
        event.preventDefault();
        handleCalculate();
      }
      // Decimal
      else if (key === '.') {
        event.preventDefault();
        inputDecimal();
      }
      // Backspace - not implemented yet
      else if (key === 'Backspace') {
        event.preventDefault();
        setDisplay(display.length > 1 ? display.slice(0, -1) : '0');
      }
      // Escape/Clear
      else if (key === 'Escape') {
        event.preventDefault();
        resetCalculator();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [display, firstOperand, operator, waitingForSecondOperand]);

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Calculator</h1>
          <p className="text-muted-foreground">Standard and scientific calculator with history</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Calculator</CardTitle>
                  <Tabs defaultValue={mode} onValueChange={(value) => setMode(value as CalculatorMode)}>
                    <TabsList>
                      <TabsTrigger value="standard">Standard</TabsTrigger>
                      <TabsTrigger value="scientific">Scientific</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent>
                {/* Calculator Display */}
                <div className="bg-muted p-4 mb-4 rounded-md text-right">
                  <div className="text-3xl font-mono overflow-x-auto whitespace-nowrap">
                    {display}
                  </div>
                </div>

                {/* Memory Display */}
                <div className="flex justify-between items-center mb-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Memory:</span>
                    <span className="ml-2 font-mono">{memory}</span>
                  </div>
                  {operator && (
                    <div className="text-right">
                      <span className="font-mono">{firstOperand} {operator}</span>
                    </div>
                  )}
                </div>

                {/* Calculator Buttons */}
                <div className="grid grid-cols-4 gap-2">
                  {/* Memory Row */}
                  <Button variant="outline" size="sm" onClick={memoryClear}>MC</Button>
                  <Button variant="outline" size="sm" onClick={memoryRecall}>MR</Button>
                  <Button variant="outline" size="sm" onClick={memoryAdd}>M+</Button>
                  <Button variant="outline" size="sm" onClick={memorySubtract}>M-</Button>

                  {/* Scientific Calculator Buttons */}
                  {mode === 'scientific' && (
                    <>
                      <Button variant="outline" size="sm" onClick={calculateSquare}>x²</Button>
                      <Button variant="outline" size="sm" onClick={calculateSquareRoot}>√x</Button>
                      <Button variant="outline" size="sm" onClick={() => handleOperator('^')}>x^y</Button>
                      <Button variant="outline" size="sm" onClick={calculateLog}>log</Button>

                      <Button variant="outline" size="sm" onClick={calculateLn}>ln</Button>
                      <Button variant="outline" size="sm" onClick={calculateSin}>sin</Button>
                      <Button variant="outline" size="sm" onClick={calculateCos}>cos</Button>
                      <Button variant="outline" size="sm" onClick={calculateTan}>tan</Button>
                    </>
                  )}

                  {/* Standard Calculator Buttons */}
                  <Button variant="outline" size="sm" onClick={resetCalculator}>C</Button>
                  <Button variant="outline" size="sm" onClick={negateValue}>±</Button>
                  <Button variant="outline" size="sm" onClick={handlePercentage}>%</Button>
                  <Button variant="outline" size="sm" onClick={() => handleOperator('/')}>÷</Button>

                  <Button onClick={() => inputDigit('7')}>7</Button>
                  <Button onClick={() => inputDigit('8')}>8</Button>
                  <Button onClick={() => inputDigit('9')}>9</Button>
                  <Button variant="outline" size="sm" onClick={() => handleOperator('*')}>×</Button>

                  <Button onClick={() => inputDigit('4')}>4</Button>
                  <Button onClick={() => inputDigit('5')}>5</Button>
                  <Button onClick={() => inputDigit('6')}>6</Button>
                  <Button variant="outline" size="sm" onClick={() => handleOperator('-')}>-</Button>

                  <Button onClick={() => inputDigit('1')}>1</Button>
                  <Button onClick={() => inputDigit('2')}>2</Button>
                  <Button onClick={() => inputDigit('3')}>3</Button>
                  <Button variant="outline" size="sm" onClick={() => handleOperator('+')}>+</Button>

                  <Button onClick={() => inputDigit('0')} className="col-span-2">0</Button>
                  <Button onClick={inputDecimal}>.</Button>
                  <Button variant="default" onClick={handleCalculate}>=</Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* History Panel */}
          <div>
            <Card className="h-full">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>History</CardTitle>
                  <Button variant="ghost" size="sm" onClick={clearHistory} disabled={history.length === 0}>
                    Clear
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {history.length > 0 ? (
                  <ul className="space-y-2">
                    {history.map((item, index) => (
                      <li key={index} className="p-2 bg-muted/50 rounded font-mono text-sm">
                        {item}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    No calculations yet. Your history will appear here.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalculatorPage;
