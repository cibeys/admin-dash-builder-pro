
import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Upload, Image as ImageIcon, Download, Trash2, RefreshCcw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

interface UploadedImage {
  id: string;
  file: File;
  preview: string;
  optimizedPreview?: string;
  originalSize: string;
  optimizedSize?: string;
  format: string;
}

const ImageOptimizerPage: React.FC = () => {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [quality, setQuality] = useState(80);
  const [format, setFormat] = useState('webp');
  const [isProcessing, setIsProcessing] = useState(false);

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;
    
    const files = Array.from(event.target.files);
    
    // Validasi tipe file
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    const validFiles = files.filter(file => allowedTypes.includes(file.type));
    
    if (validFiles.length !== files.length) {
      toast.error('Beberapa file bukan gambar yang valid. Hanya mendukung JPEG, PNG, WebP dan GIF.');
    }
    
    // Tambahkan file yang valid ke state
    const newImages = validFiles.map(file => ({
      id: Math.random().toString(36).substring(2),
      file,
      preview: URL.createObjectURL(file),
      originalSize: formatFileSize(file.size),
      format: file.type.split('/')[1],
    }));
    
    setImages([...images, ...newImages]);
    
    // Reset input file
    event.target.value = '';
  };
  
  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };
  
  // Handle drag and drop
  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);
  
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      
      // Validasi tipe file
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      const validFiles = files.filter(file => allowedTypes.includes(file.type));
      
      if (validFiles.length !== files.length) {
        toast.error('Beberapa file bukan gambar yang valid. Hanya mendukung JPEG, PNG, WebP dan GIF.');
      }
      
      const newImages = validFiles.map(file => ({
        id: Math.random().toString(36).substring(2),
        file,
        preview: URL.createObjectURL(file),
        originalSize: formatFileSize(file.size),
        format: file.type.split('/')[1],
      }));
      
      setImages([...images, ...newImages]);
    }
  }, [images]);

  // Remove image
  const removeImage = (id: string) => {
    const imageToRemove = images.find(img => img.id === id);
    if (imageToRemove) {
      URL.revokeObjectURL(imageToRemove.preview);
      if (imageToRemove.optimizedPreview) {
        URL.revokeObjectURL(imageToRemove.optimizedPreview);
      }
    }
    
    setImages(images.filter(image => image.id !== id));
  };
  
  // Clear all images
  const clearAllImages = () => {
    images.forEach(image => {
      URL.revokeObjectURL(image.preview);
      if (image.optimizedPreview) {
        URL.revokeObjectURL(image.optimizedPreview);
      }
    });
    
    setImages([]);
  };
  
  // Process images (simulasi)
  const processImages = async () => {
    if (images.length === 0) {
      toast.error('Silakan unggah gambar terlebih dahulu');
      return;
    }
    
    setIsProcessing(true);
    
    // Simulasi proses dengan delay
    setTimeout(() => {
      const optimizedImages = images.map(image => {
        // Simulasi pengurangan ukuran file berdasarkan quality
        const reduction = (100 - quality) / 100;
        const originalSizeBytes = image.file.size;
        const optimizedSizeBytes = Math.round(originalSizeBytes * (1 - reduction * 0.7));
        
        return {
          ...image,
          optimizedPreview: image.preview, // Untuk simulasi, gunakan preview yang sama
          optimizedSize: formatFileSize(optimizedSizeBytes),
        };
      });
      
      setImages(optimizedImages);
      setIsProcessing(false);
      toast.success('Optimasi gambar selesai!');
    }, 1500);
  };
  
  // Download image (simulasi)
  const downloadImage = (id: string) => {
    const image = images.find(img => img.id === id);
    if (!image || !image.optimizedPreview) return;
    
    // Buat link download
    const link = document.createElement('a');
    link.href = image.optimizedPreview;
    link.download = `optimized-${image.file.name.split('.')[0]}.${format}`;
    link.click();
    
    toast.success('Gambar berhasil diunduh!');
  };
  
  // Download all images (simulasi)
  const downloadAllImages = () => {
    const optimizedImages = images.filter(img => img.optimizedPreview);
    if (optimizedImages.length === 0) {
      toast.error('Tidak ada gambar yang dioptimasi untuk diunduh');
      return;
    }
    
    // Untuk demo, hanya unduh satu per satu
    optimizedImages.forEach(image => {
      const link = document.createElement('a');
      link.href = image.optimizedPreview!;
      link.download = `optimized-${image.file.name.split('.')[0]}.${format}`;
      link.click();
    });
    
    toast.success(`${optimizedImages.length} gambar berhasil diunduh!`);
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-2">Image Optimizer</h1>
        <p className="text-muted-foreground mb-6">
          Kompres dan optimalkan gambar Anda untuk mempercepat loading website
        </p>
      </motion.div>
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upload Area & Settings */}
        <motion.div 
          className="lg:col-span-5"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Upload Gambar</CardTitle>
              <CardDescription>
                Unggah gambar yang ingin dioptimasi (JPG, PNG, WebP, GIF)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Upload Area */}
              <div
                onDragOver={onDragOver}
                onDrop={onDrop}
                className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-accent/50 transition-colors cursor-pointer"
              >
                <div className="flex flex-col items-center justify-center space-y-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Upload className="h-8 w-8 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium">Klik atau seret gambar ke area ini</p>
                    <p className="text-sm text-muted-foreground">
                      Mendukung JPG, PNG, WebP, dan GIF hingga 10MB
                    </p>
                  </div>
                  <input
                    type="file"
                    id="image-upload"
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                  <Button
                    variant="outline"
                    onClick={() => document.getElementById('image-upload')?.click()}
                  >
                    Pilih File
                  </Button>
                </div>
              </div>
              
              {/* Settings */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Kualitas: {quality}%</Label>
                  </div>
                  <Slider
                    value={[quality]}
                    min={10}
                    max={100}
                    step={1}
                    onValueChange={(value) => setQuality(value[0])}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Format Output</Label>
                  <RadioGroup defaultValue="webp" value={format} onValueChange={setFormat}>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="webp" id="webp" />
                        <Label htmlFor="webp">WebP</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="jpeg" id="jpeg" />
                        <Label htmlFor="jpeg">JPEG</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="png" id="png" />
                        <Label htmlFor="png">PNG</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="gif" id="gif" />
                        <Label htmlFor="gif">GIF</Label>
                      </div>
                    </div>
                  </RadioGroup>
                </div>
                
                <div className="pt-4 flex gap-2">
                  <Button 
                    onClick={processImages}
                    disabled={images.length === 0 || isProcessing}
                    className="flex-1"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCcw className="mr-2 h-4 w-4 animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      'Optimasi Gambar'
                    )}
                  </Button>
                  
                  {images.length > 0 && (
                    <Button 
                      variant="outline" 
                      onClick={clearAllImages}
                      disabled={isProcessing}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Image Preview & Results */}
        <motion.div 
          className="lg:col-span-7"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Gambar ({images.length})</CardTitle>
                <CardDescription>
                  {images.some(img => img.optimizedSize) 
                    ? 'Hasil optimasi gambar Anda'
                    : 'Preview gambar yang diunggah'}
                </CardDescription>
              </div>
              
              {images.some(img => img.optimizedSize) && (
                <Button variant="outline" onClick={downloadAllImages}>
                  <Download className="mr-2 h-4 w-4" />
                  Unduh Semua
                </Button>
              )}
            </CardHeader>
            <CardContent className="min-h-[300px]">
              {images.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-4 text-center">
                  <ImageIcon className="h-16 w-16 mb-4 opacity-20" />
                  <p>Belum ada gambar yang diunggah</p>
                  <p className="text-sm">
                    Unggah gambar untuk melihat preview dan hasil optimasi di sini
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {images.map((image) => (
                    <Card key={image.id} className="overflow-hidden">
                      <CardContent className="p-2">
                        <Tabs defaultValue={image.optimizedPreview ? "after" : "before"}>
                          <TabsList className="mb-2 w-full">
                            <TabsTrigger value="before" className="flex-1">
                              Asli ({image.originalSize})
                            </TabsTrigger>
                            <TabsTrigger 
                              value="after" 
                              disabled={!image.optimizedPreview}
                              className="flex-1"
                            >
                              Optimasi {image.optimizedSize && `(${image.optimizedSize})`}
                            </TabsTrigger>
                          </TabsList>
                          <TabsContent value="before">
                            <div className="aspect-square relative">
                              <img 
                                src={image.preview} 
                                alt="Original" 
                                className="w-full h-full object-cover rounded-md"
                              />
                            </div>
                          </TabsContent>
                          <TabsContent value="after">
                            {image.optimizedPreview ? (
                              <div className="aspect-square relative">
                                <img 
                                  src={image.optimizedPreview} 
                                  alt="Optimized" 
                                  className="w-full h-full object-cover rounded-md"
                                />
                              </div>
                            ) : (
                              <div className="aspect-square flex items-center justify-center">
                                <p className="text-muted-foreground">
                                  Klik 'Optimasi Gambar' untuk melihat hasil
                                </p>
                              </div>
                            )}
                          </TabsContent>
                        </Tabs>
                        
                        <div className="flex justify-between mt-2">
                          <p className="text-sm truncate flex-1" title={image.file.name}>
                            {image.file.name}
                          </p>
                          <div className="flex gap-1">
                            {image.optimizedPreview && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => downloadImage(image.id)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                            )}
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => removeImage(image.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default ImageOptimizerPage;
