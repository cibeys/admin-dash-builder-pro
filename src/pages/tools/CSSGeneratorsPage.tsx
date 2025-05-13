
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Copy, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const CSSGeneratorsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('flexbox');
  const { toast } = useToast();
  
  const [isCopied, setIsCopied] = useState(false);
  
  // Code copying function
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setIsCopied(true);
      toast({
        title: "Copied!",
        description: "CSS code copied to clipboard",
      });
      setTimeout(() => setIsCopied(false), 2000);
    }).catch(err => {
      console.error('Could not copy text: ', err);
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    });
  };
  
  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">CSS Generators</h1>
          <p className="text-muted-foreground">Generate CSS code visually for flexbox, grid, and more</p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
          <div className="flex justify-center">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="flexbox">Flexbox</TabsTrigger>
              <TabsTrigger value="grid">Grid</TabsTrigger>
              <TabsTrigger value="gradient">Gradient</TabsTrigger>
              <TabsTrigger value="shadow">Box Shadow</TabsTrigger>
            </TabsList>
          </div>
          
          {/* Flexbox Generator Tab */}
          <TabsContent value="flexbox">
            <FlexboxGenerator copyToClipboard={copyToClipboard} />
          </TabsContent>
          
          {/* Grid Generator Tab */}
          <TabsContent value="grid">
            <GridGenerator copyToClipboard={copyToClipboard} />
          </TabsContent>
          
          {/* Gradient Generator Tab */}
          <TabsContent value="gradient">
            <GradientGenerator copyToClipboard={copyToClipboard} />
          </TabsContent>
          
          {/* Box Shadow Generator Tab */}
          <TabsContent value="shadow">
            <BoxShadowGenerator copyToClipboard={copyToClipboard} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

// Flexbox Generator Component
const FlexboxGenerator: React.FC<{ copyToClipboard: (text: string) => void }> = ({ copyToClipboard }) => {
  const [direction, setDirection] = useState('row');
  const [justifyContent, setJustifyContent] = useState('flex-start');
  const [alignItems, setAlignItems] = useState('stretch');
  const [flexWrap, setFlexWrap] = useState('nowrap');
  const [gap, setGap] = useState(8);
  
  const flexboxCode = `
.container {
  display: flex;
  flex-direction: ${direction};
  justify-content: ${justifyContent};
  align-items: ${alignItems};
  flex-wrap: ${flexWrap};
  gap: ${gap}px;
}`;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Flexbox Generator</CardTitle>
        <CardDescription>Create and visualize flexbox layouts</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Flex Direction</Label>
            <div className="grid grid-cols-2 gap-2">
              {['row', 'column', 'row-reverse', 'column-reverse'].map((dir) => (
                <Button
                  key={dir}
                  variant={direction === dir ? "default" : "outline"}
                  onClick={() => setDirection(dir)}
                  className="justify-start"
                >
                  {dir}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Justify Content</Label>
            <div className="grid grid-cols-2 gap-2">
              {['flex-start', 'flex-end', 'center', 'space-between', 'space-around', 'space-evenly'].map((jc) => (
                <Button
                  key={jc}
                  variant={justifyContent === jc ? "default" : "outline"}
                  onClick={() => setJustifyContent(jc)}
                  className="justify-start"
                >
                  {jc}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Align Items</Label>
            <div className="grid grid-cols-2 gap-2">
              {['flex-start', 'flex-end', 'center', 'baseline', 'stretch'].map((ai) => (
                <Button
                  key={ai}
                  variant={alignItems === ai ? "default" : "outline"}
                  onClick={() => setAlignItems(ai)}
                  className="justify-start"
                >
                  {ai}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Flex Wrap</Label>
            <div className="grid grid-cols-3 gap-2">
              {['nowrap', 'wrap', 'wrap-reverse'].map((wrap) => (
                <Button
                  key={wrap}
                  variant={flexWrap === wrap ? "default" : "outline"}
                  onClick={() => setFlexWrap(wrap)}
                  className="justify-start"
                >
                  {wrap}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Gap Size</Label>
              <span className="text-sm text-muted-foreground">{gap}px</span>
            </div>
            <Slider min={0} max={40} step={1} value={[gap]} onValueChange={(value) => setGap(value[0])} />
          </div>
        </div>
        
        <div>
          <div className="mb-4">
            <Label>Preview</Label>
            <div 
              className="bg-muted border rounded-md p-4 h-60 mt-2 overflow-auto"
              style={{
                display: 'flex',
                flexDirection: direction as any,
                justifyContent,
                alignItems,
                flexWrap: flexWrap as any,
                gap: `${gap}px`,
              }}
            >
              {[1, 2, 3, 4, 5].map((item) => (
                <div
                  key={item}
                  className="bg-primary text-primary-foreground p-4 rounded flex items-center justify-center min-w-16 min-h-16"
                >
                  Item {item}
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>CSS Code</Label>
              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(flexboxCode.trim())}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Textarea
              readOnly
              value={flexboxCode.trim()}
              className="font-mono text-sm h-60"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Grid Generator Component
const GridGenerator: React.FC<{ copyToClipboard: (text: string) => void }> = ({ copyToClipboard }) => {
  const [columns, setColumns] = useState(3);
  const [rows, setRows] = useState(2);
  const [columnGap, setColumnGap] = useState(16);
  const [rowGap, setRowGap] = useState(16);
  const [autoColumns, setAutoColumns] = useState('1fr');
  const [autoRows, setAutoRows] = useState('auto');
  
  const gridCode = `
.container {
  display: grid;
  grid-template-columns: repeat(${columns}, ${autoColumns});
  grid-template-rows: repeat(${rows}, ${autoRows});
  column-gap: ${columnGap}px;
  row-gap: ${rowGap}px;
}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Grid Generator</CardTitle>
        <CardDescription>Create and visualize CSS grid layouts</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Columns</Label>
              <span className="text-sm text-muted-foreground">{columns}</span>
            </div>
            <Slider min={1} max={6} step={1} value={[columns]} onValueChange={(value) => setColumns(value[0])} />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Rows</Label>
              <span className="text-sm text-muted-foreground">{rows}</span>
            </div>
            <Slider min={1} max={6} step={1} value={[rows]} onValueChange={(value) => setRows(value[0])} />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Column Gap</Label>
              <span className="text-sm text-muted-foreground">{columnGap}px</span>
            </div>
            <Slider min={0} max={40} step={1} value={[columnGap]} onValueChange={(value) => setColumnGap(value[0])} />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Row Gap</Label>
              <span className="text-sm text-muted-foreground">{rowGap}px</span>
            </div>
            <Slider min={0} max={40} step={1} value={[rowGap]} onValueChange={(value) => setRowGap(value[0])} />
          </div>
          
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Column Size</Label>
              <div className="flex gap-2">
                {['1fr', 'auto', 'minmax(100px, 1fr)'].map((size) => (
                  <Button
                    key={size}
                    variant={autoColumns === size ? "default" : "outline"}
                    onClick={() => setAutoColumns(size)}
                    size="sm"
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Row Size</Label>
              <div className="flex gap-2">
                {['auto', '100px', 'min-content'].map((size) => (
                  <Button
                    key={size}
                    variant={autoRows === size ? "default" : "outline"}
                    onClick={() => setAutoRows(size)}
                    size="sm"
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <div className="mb-4">
            <Label>Preview</Label>
            <div 
              className="bg-muted border rounded-md p-4 h-60 mt-2 overflow-auto"
              style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${columns}, ${autoColumns})`,
                gridTemplateRows: `repeat(${rows}, ${autoRows})`,
                columnGap: `${columnGap}px`,
                rowGap: `${rowGap}px`,
              }}
            >
              {Array.from({ length: columns * rows }).map((_, i) => (
                <div
                  key={i}
                  className="bg-primary text-primary-foreground p-4 rounded flex items-center justify-center"
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>CSS Code</Label>
              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(gridCode.trim())}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Textarea
              readOnly
              value={gridCode.trim()}
              className="font-mono text-sm h-60"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Gradient Generator Component
const GradientGenerator: React.FC<{ copyToClipboard: (text: string) => void }> = ({ copyToClipboard }) => {
  const [type, setType] = useState('linear');
  const [angle, setAngle] = useState(90);
  const [colors, setColors] = useState([
    { color: '#3B82F6', position: 0 },
    { color: '#6366F1', position: 100 },
  ]);
  
  const handleColorChange = (index: number, value: string) => {
    const newColors = [...colors];
    newColors[index].color = value;
    setColors(newColors);
  };
  
  const handlePositionChange = (index: number, value: number) => {
    const newColors = [...colors];
    newColors[index].position = value;
    setColors(newColors);
  };
  
  const addColor = () => {
    if (colors.length < 5) {
      const lastPosition = colors[colors.length - 1].position;
      const newPosition = Math.min(lastPosition + 20, 100);
      setColors([...colors, { color: '#10B981', position: newPosition }]);
    }
  };
  
  const removeColor = (index: number) => {
    if (colors.length > 2) {
      setColors(colors.filter((_, i) => i !== index));
    }
  };

  // Generate gradient string
  const getGradientString = () => {
    const sortedColors = [...colors].sort((a, b) => a.position - b.position);
    const colorStops = sortedColors.map(c => `${c.color} ${c.position}%`).join(', ');
    
    if (type === 'linear') {
      return `linear-gradient(${angle}deg, ${colorStops})`;
    } else {
      return `radial-gradient(circle, ${colorStops})`;
    }
  };
  
  const gradientString = getGradientString();
  
  const gradientCode = `
.element {
  background: ${gradientString};
}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gradient Generator</CardTitle>
        <CardDescription>Create beautiful CSS gradients visually</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Gradient Type</Label>
            <div className="flex gap-2">
              <Button
                variant={type === 'linear' ? "default" : "outline"}
                onClick={() => setType('linear')}
              >
                Linear
              </Button>
              <Button
                variant={type === 'radial' ? "default" : "outline"}
                onClick={() => setType('radial')}
              >
                Radial
              </Button>
            </div>
          </div>
          
          {type === 'linear' && (
            <div className="space-y-2">
              <div className="flex justify-between">
                <Label>Angle</Label>
                <span className="text-sm text-muted-foreground">{angle}°</span>
              </div>
              <Slider min={0} max={360} step={1} value={[angle]} onValueChange={(value) => setAngle(value[0])} />
            </div>
          )}
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <Label>Color Stops</Label>
              {colors.length < 5 && (
                <Button size="sm" variant="outline" onClick={addColor}>Add Color</Button>
              )}
            </div>
            
            {colors.map((color, index) => (
              <div key={index} className="grid grid-cols-[1fr,auto] gap-4">
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="color"
                      value={color.color}
                      onChange={(e) => handleColorChange(index, e.target.value)}
                    />
                    <Input
                      type="text"
                      value={color.color}
                      onChange={(e) => handleColorChange(index, e.target.value)}
                      className="font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Position</span>
                      <span>{color.position}%</span>
                    </div>
                    <Slider
                      min={0}
                      max={100}
                      step={1}
                      value={[color.position]}
                      onValueChange={(value) => handlePositionChange(index, value[0])}
                    />
                  </div>
                </div>
                {colors.length > 2 && (
                  <Button size="icon" variant="ghost" onClick={() => removeColor(index)} className="self-start">
                    ×
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <div className="mb-4">
            <Label>Preview</Label>
            <div 
              className="rounded-md mt-2 h-60"
              style={{ background: gradientString }}
            ></div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>CSS Code</Label>
              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(gradientCode.trim())}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Textarea
              readOnly
              value={gradientCode.trim()}
              className="font-mono text-sm h-32"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Box Shadow Generator Component
const BoxShadowGenerator: React.FC<{ copyToClipboard: (text: string) => void }> = ({ copyToClipboard }) => {
  const [hOffset, setHOffset] = useState(5);
  const [vOffset, setVOffset] = useState(5);
  const [blur, setBlur] = useState(10);
  const [spread, setSpread] = useState(0);
  const [color, setColor] = useState('#0000001A');
  const [inset, setInset] = useState(false);
  
  const boxShadowString = `${inset ? 'inset ' : ''}${hOffset}px ${vOffset}px ${blur}px ${spread}px ${color}`;
  
  const shadowCode = `
.element {
  box-shadow: ${boxShadowString};
}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Box Shadow Generator</CardTitle>
        <CardDescription>Create and visualize CSS box shadows</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Horizontal Offset</Label>
              <span className="text-sm text-muted-foreground">{hOffset}px</span>
            </div>
            <Slider min={-50} max={50} step={1} value={[hOffset]} onValueChange={(value) => setHOffset(value[0])} />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Vertical Offset</Label>
              <span className="text-sm text-muted-foreground">{vOffset}px</span>
            </div>
            <Slider min={-50} max={50} step={1} value={[vOffset]} onValueChange={(value) => setVOffset(value[0])} />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Blur Radius</Label>
              <span className="text-sm text-muted-foreground">{blur}px</span>
            </div>
            <Slider min={0} max={100} step={1} value={[blur]} onValueChange={(value) => setBlur(value[0])} />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label>Spread Radius</Label>
              <span className="text-sm text-muted-foreground">{spread}px</span>
            </div>
            <Slider min={-50} max={50} step={1} value={[spread]} onValueChange={(value) => setSpread(value[0])} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Color</Label>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                />
                <Input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="font-mono"
                />
              </div>
            </div>
            
            <div className="space-y-2 flex items-end">
              <div className="flex items-center space-x-2">
                <Checkbox id="inset" checked={inset} onCheckedChange={(checked) => setInset(checked as boolean)} />
                <Label htmlFor="inset">Inset Shadow</Label>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <div className="mb-4">
            <Label>Preview</Label>
            <div className="bg-muted border rounded-md p-8 h-60 mt-2 flex items-center justify-center">
              <div 
                className="bg-background w-40 h-40 rounded-md"
                style={{ boxShadow: boxShadowString }}
              ></div>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label>CSS Code</Label>
              <Button variant="ghost" size="sm" onClick={() => copyToClipboard(shadowCode.trim())}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Textarea
              readOnly
              value={shadowCode.trim()}
              className="font-mono text-sm h-32"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CSSGeneratorsPage;
