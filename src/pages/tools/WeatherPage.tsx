
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Cloud, 
  CloudRain, 
  Droplets, 
  Gauge, 
  Loader2, 
  MapPin, 
  Search, 
  Thermometer, 
  ArrowLeft, 
  Wind, 
  Compass, 
  ArrowUp, 
  ArrowDown, 
  CloudSun,
  Sun,
  CloudFog,
  CloudSnow,
  CloudLightning,
  Umbrella
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

// Mendefinisikan tipe untuk data cuaca
type WeatherData = {
  location: {
    name: string;
    region: string;
    country: string;
    lat: number;
    lon: number;
    localtime: string;
  };
  current: {
    temp_c: number;
    temp_f: number;
    condition: {
      text: string;
      icon: string;
      code: number;
    };
    wind_kph: number;
    wind_degree: number;
    wind_dir: string;
    pressure_mb: number;
    precip_mm: number;
    humidity: number;
    cloud: number;
    feelslike_c: number;
    uv: number;
  };
  forecast?: {
    forecastday: Array<{
      date: string;
      day: {
        maxtemp_c: number;
        mintemp_c: number;
        avgtemp_c: number;
        condition: {
          text: string;
          icon: string;
          code: number;
        };
        daily_chance_of_rain: number;
      };
      hour: Array<{
        time: string;
        temp_c: number;
        condition: {
          text: string;
          icon: string;
        };
        chance_of_rain: number;
      }>;
    }>;
  };
};

const WeatherIcon: React.FC<{ condition: string; className?: string }> = ({ condition, className }) => {
  const getIcon = () => {
    const lowerCondition = condition.toLowerCase();
    
    if (lowerCondition.includes('rain') || lowerCondition.includes('drizzle')) {
      return <CloudRain className={cn('text-blue-500', className)} />;
    } else if (lowerCondition.includes('cloud')) {
      return <Cloud className={cn('text-gray-500', className)} />;
    } else if (lowerCondition.includes('fog') || lowerCondition.includes('mist')) {
      return <CloudFog className={cn('text-gray-400', className)} />;
    } else if (lowerCondition.includes('snow') || lowerCondition.includes('sleet')) {
      return <CloudSnow className={cn('text-blue-200', className)} />;
    } else if (lowerCondition.includes('thunder') || lowerCondition.includes('lightning')) {
      return <CloudLightning className={cn('text-amber-500', className)} />;
    } else if (lowerCondition.includes('sun') && lowerCondition.includes('cloud')) {
      return <CloudSun className={cn('text-amber-400', className)} />;
    } else if (lowerCondition.includes('clear') || lowerCondition.includes('sun')) {
      return <Sun className={cn('text-amber-400', className)} />;
    } else {
      return <CloudSun className={cn('text-amber-400', className)} />;
    }
  };
  
  return getIcon();
};

const WEATHER_API_KEY = 'YOUR_API_KEY'; // Ganti dengan API key Anda

const WeatherPage: React.FC = () => {
  const { toast } = useToast();
  const [location, setLocation] = useState<string>('');
  const [currentLocation, setCurrentLocation] = useState<string>('Jakarta');
  const [useCurrentLocation, setUseCurrentLocation] = useState<boolean>(false);
  
  // Fetch weather data menggunakan React Query
  const { data: weatherData, isLoading, error, refetch } = useQuery<WeatherData>({
    queryKey: ['weather', currentLocation],
    queryFn: async () => {
      // Simulasi fetch data karena ini UI demo
      // Pada implementasi nyata, gunakan kode di bawah untuk fetch data
      // const response = await fetch(
      //   `https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${currentLocation}&days=3&aqi=no&alerts=no`
      // );
      // if (!response.ok) throw new Error('Failed to fetch weather data');
      // return response.json();
      
      // Simulasi delay untuk menunjukkan loading state
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Data demo
      return {
        location: {
          name: currentLocation,
          region: currentLocation === 'Jakarta' ? 'Jakarta Raya' : 'Jawa Barat',
          country: 'Indonesia',
          lat: -6.2,
          lon: 106.8,
          localtime: new Date().toISOString(),
        },
        current: {
          temp_c: 32,
          temp_f: 89.6,
          condition: {
            text: 'Partly cloudy',
            icon: '//cdn.weatherapi.com/weather/64x64/day/116.png',
            code: 1003,
          },
          wind_kph: 8.6,
          wind_degree: 270,
          wind_dir: 'W',
          pressure_mb: 1010,
          precip_mm: 0,
          humidity: 65,
          cloud: 25,
          feelslike_c: 34.5,
          uv: 6,
        },
        forecast: {
          forecastday: [
            {
              date: new Date().toISOString().split('T')[0],
              day: {
                maxtemp_c: 34,
                mintemp_c: 26,
                avgtemp_c: 30,
                condition: {
                  text: 'Partly cloudy',
                  icon: '//cdn.weatherapi.com/weather/64x64/day/116.png',
                  code: 1003,
                },
                daily_chance_of_rain: 20,
              },
              hour: Array(24).fill(0).map((_, i) => ({
                time: `2023-07-25 ${i.toString().padStart(2, '0')}:00`,
                temp_c: 26 + Math.floor(Math.random() * 8),
                condition: {
                  text: 'Partly cloudy',
                  icon: '//cdn.weatherapi.com/weather/64x64/day/116.png',
                },
                chance_of_rain: Math.floor(Math.random() * 30),
              })),
            },
            {
              date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
              day: {
                maxtemp_c: 33,
                mintemp_c: 25,
                avgtemp_c: 29,
                condition: {
                  text: 'Patchy rain possible',
                  icon: '//cdn.weatherapi.com/weather/64x64/day/176.png',
                  code: 1063,
                },
                daily_chance_of_rain: 40,
              },
              hour: [],
            },
            {
              date: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
              day: {
                maxtemp_c: 32,
                mintemp_c: 25,
                avgtemp_c: 28.5,
                condition: {
                  text: 'Moderate rain',
                  icon: '//cdn.weatherapi.com/weather/64x64/day/302.png',
                  code: 1189,
                },
                daily_chance_of_rain: 80,
              },
              hour: [],
            },
          ],
        },
      };
    },
    enabled: currentLocation !== '',
    retry: 2,
  });

  // Get current location from browser
  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      setUseCurrentLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation(`${latitude},${longitude}`);
          toast({
            title: 'Lokasi ditemukan',
            description: 'Menampilkan cuaca untuk lokasi Anda saat ini.',
          });
          setUseCurrentLocation(false);
        },
        (error) => {
          console.error('Error getting location:', error);
          toast({
            title: 'Error',
            description: 'Tidak dapat mengakses lokasi Anda. Periksa izin browser.',
            variant: 'destructive',
          });
          setUseCurrentLocation(false);
        }
      );
    } else {
      toast({
        title: 'Error',
        description: 'Geolokasi tidak didukung oleh browser Anda.',
        variant: 'destructive',
      });
    }
  };

  // Handle search form
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (location.trim()) {
      setCurrentLocation(location);
    } else {
      toast({
        title: 'Input diperlukan',
        description: 'Masukkan nama kota atau lokasi.',
        variant: 'destructive',
      });
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' };
    return new Date(dateString).toLocaleDateString('id-ID', options);
  };

  if (error) {
    return (
      <div className="container mx-auto py-12 px-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-4">Gagal memuat data cuaca</h2>
          <p className="text-muted-foreground mb-4">
            Maaf, kami tidak dapat memuat data cuaca untuk lokasi yang diminta. Mohon coba lagi nanti.
          </p>
          <Button onClick={() => refetch()}>Coba lagi</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center gap-2 mb-6">
        <Link to="/tools">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Informasi Cuaca</h1>
      </div>

      {/* Search Form */}
      <Card className="mb-8 shadow">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Cari kota atau lokasi..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                type="button" 
                variant="outline"
                onClick={handleGetCurrentLocation}
                disabled={useCurrentLocation}
              >
                {useCurrentLocation ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <MapPin className="mr-2 h-4 w-4" />
                )}
                Lokasi Saya
              </Button>
              <Button type="submit">
                <Search className="mr-2 h-4 w-4" />
                Cari
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Current Weather */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="col-span-2 shadow-lg overflow-hidden">
          {isLoading ? (
            <div className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="flex flex-col space-y-4 w-full">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-16 w-32" />
                  <Skeleton className="h-6 w-24" />
                </div>
                <div className="w-full flex justify-center">
                  <Skeleton className="h-32 w-32 rounded-full" />
                </div>
              </div>
            </div>
          ) : weatherData ? (
            <>
              <div className="bg-gradient-to-r from-blue-500/10 to-cyan-500/10 p-6">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                  <div>
                    <h2 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      {weatherData.location.name}
                    </h2>
                    <p className="text-muted-foreground">
                      {weatherData.location.region}, {weatherData.location.country}
                    </p>
                    <div className="text-5xl sm:text-6xl font-bold mt-4">
                      {weatherData.current.temp_c}°C
                    </div>
                    <p className="text-lg text-muted-foreground">
                      Terasa seperti {weatherData.current.feelslike_c}°C
                    </p>
                  </div>
                  <div className="flex flex-col items-center">
                    <WeatherIcon 
                      condition={weatherData.current.condition.text} 
                      className="h-24 w-24 md:h-32 md:w-32" 
                    />
                    <p className="mt-2 text-lg font-medium">
                      {weatherData.current.condition.text}
                    </p>
                  </div>
                </div>
              </div>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
                    <Wind className="h-6 w-6 text-blue-500 mb-2" />
                    <p className="text-sm text-muted-foreground">Angin</p>
                    <p className="font-medium">{weatherData.current.wind_kph} km/h</p>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
                    <Droplets className="h-6 w-6 text-blue-500 mb-2" />
                    <p className="text-sm text-muted-foreground">Kelembaban</p>
                    <p className="font-medium">{weatherData.current.humidity}%</p>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
                    <Umbrella className="h-6 w-6 text-blue-500 mb-2" />
                    <p className="text-sm text-muted-foreground">Curah Hujan</p>
                    <p className="font-medium">{weatherData.current.precip_mm} mm</p>
                  </div>
                  <div className="flex flex-col items-center p-3 bg-muted/50 rounded-lg">
                    <Gauge className="h-6 w-6 text-blue-500 mb-2" />
                    <p className="text-sm text-muted-foreground">Tekanan</p>
                    <p className="font-medium">{weatherData.current.pressure_mb} mb</p>
                  </div>
                </div>
              </CardContent>
            </>
          ) : (
            <div className="p-6 text-center">
              <p>Masukkan lokasi untuk melihat informasi cuaca</p>
            </div>
          )}
        </Card>

        {/* 3-Day Forecast */}
        <Card className="shadow">
          <CardHeader>
            <CardTitle className="text-lg">Perkiraan 3 Hari</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-4 w-16" />
                </div>
              ))
            ) : weatherData && weatherData.forecast ? (
              weatherData.forecast.forecastday.map((day, index) => (
                <div 
                  key={index} 
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg",
                    index === 0 ? "bg-muted/70" : "hover:bg-muted/40"
                  )}
                >
                  <div>
                    <p className={cn(
                      "font-medium",
                      index === 0 && "font-bold"
                    )}>
                      {index === 0 ? 'Hari ini' : formatDate(day.date)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {day.day.daily_chance_of_rain}% peluang hujan
                    </p>
                  </div>
                  <WeatherIcon condition={day.day.condition.text} className="h-10 w-10" />
                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <ArrowUp className="h-3 w-3 text-rose-500" />
                      <span>{day.day.maxtemp_c}°</span>
                    </div>
                    <div className="flex items-center gap-1 justify-end text-muted-foreground">
                      <ArrowDown className="h-3 w-3 text-blue-500" />
                      <span>{day.day.mintemp_c}°</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Tidak ada data perkiraan</p>
              </div>
            )}
          </CardContent>
          {weatherData && weatherData.forecast && (
            <CardFooter>
              <p className="text-xs text-muted-foreground">
                Data terakhir diperbarui: {new Date().toLocaleTimeString()}
              </p>
            </CardFooter>
          )}
        </Card>
      </div>

      {/* Hourly Forecast */}
      {weatherData && weatherData.forecast && weatherData.forecast.forecastday[0].hour.length > 0 && (
        <Card className="shadow">
          <CardHeader>
            <CardTitle>Perkiraan Per Jam</CardTitle>
            <CardDescription>Perkiraan cuaca selama 24 jam ke depan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto pb-2">
              <div className="flex space-x-4 min-w-max">
                {weatherData.forecast.forecastday[0].hour
                  .filter((_, i) => i % 3 === 0) // Filter setiap 3 jam
                  .map((hour, index) => {
                    const hourTime = new Date(hour.time).getHours();
                    const now = new Date().getHours();
                    const isCurrentHour = hourTime === now;
                    
                    return (
                      <div 
                        key={index} 
                        className={cn(
                          "flex flex-col items-center p-3 rounded-lg min-w-[80px]", 
                          isCurrentHour ? "bg-primary/10 border border-primary/30" : ""
                        )}
                      >
                        <p className="font-medium">
                          {hourTime === 0 ? '00:00' : `${hourTime}:00`}
                        </p>
                        <WeatherIcon condition={hour.condition.text} className="my-2 h-8 w-8" />
                        <p className="font-semibold">{hour.temp_c}°C</p>
                        <div className="flex items-center mt-1 text-xs text-muted-foreground">
                          <Droplets className="h-3 w-3 mr-1 text-blue-500" />
                          <span>{hour.chance_of_rain}%</span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WeatherPage;
