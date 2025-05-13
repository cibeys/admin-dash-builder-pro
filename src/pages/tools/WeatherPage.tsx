
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Search, Loader2, Wind, Droplets, Sun, Cloud, Thermometer, MapPin } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

type WeatherData = {
  location: string;
  country: string;
  temperature: number;
  feels_like: number;
  humidity: number;
  wind_speed: number;
  description: string;
  icon: string;
  forecast: Array<{
    date: string;
    min_temp: number;
    max_temp: number;
    description: string;
    icon: string;
  }>;
};

const WeatherPage: React.FC = () => {
  const [city, setCity] = useState<string>('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('current');
  const { toast } = useToast();

  // For demo purposes - simulate fetching data
  const fetchWeatherData = async (cityName: string) => {
    if (!cityName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a city name",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // In a real app, this would be a fetch to a weather API
      // Simulating API call with timeout
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock weather data
      const mockWeatherData: WeatherData = {
        location: cityName,
        country: "Indonesia",
        temperature: Math.floor(Math.random() * 15) + 20, // Random temp between 20-35°C
        feels_like: Math.floor(Math.random() * 15) + 20,
        humidity: Math.floor(Math.random() * 50) + 30, // Random humidity between 30-80%
        wind_speed: Math.floor(Math.random() * 20) + 5, // Random wind between 5-25 km/h
        description: ["Sunny", "Partly Cloudy", "Cloudy", "Light Rain", "Thunderstorm"][Math.floor(Math.random() * 5)],
        icon: "https://openweathermap.org/img/wn/02d@2x.png",
        forecast: Array.from({ length: 5 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() + i + 1);
          return {
            date: date.toLocaleDateString(),
            min_temp: Math.floor(Math.random() * 10) + 18,
            max_temp: Math.floor(Math.random() * 10) + 25,
            description: ["Sunny", "Partly Cloudy", "Cloudy", "Light Rain", "Thunderstorm"][Math.floor(Math.random() * 5)],
            icon: "https://openweathermap.org/img/wn/02d@2x.png"
          };
        })
      };
      
      setWeather(mockWeatherData);
      toast({
        title: "Success",
        description: `Weather data fetched for ${cityName}`,
      });
    } catch (error) {
      console.error('Error fetching weather:', error);
      toast({
        title: "Error",
        description: "Failed to fetch weather data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchWeatherData(city);
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Weather Forecast</h1>
          <p className="text-muted-foreground">Check the current weather and forecast for any city</p>
        </div>
        
        <Card className="mb-6">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  value={city} 
                  onChange={(e) => setCity(e.target.value)} 
                  placeholder="Enter city name..." 
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Search className="h-4 w-4 mr-2" />
                )}
                {isLoading ? "Loading..." : "Search"}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        {isLoading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-12 w-40" />
                  <Skeleton className="h-16 w-16 rounded-full" />
                </div>
                <Skeleton className="h-24 w-full" />
                <div className="grid grid-cols-3 gap-4">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        ) : weather ? (
          <Card className="overflow-hidden">
            <CardHeader className="bg-primary/10">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl">{weather.location}, {weather.country}</CardTitle>
                  <CardDescription>{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold">{weather.temperature}°C</div>
                  <div className="text-sm text-muted-foreground">Feels like {weather.feels_like}°C</div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full">
                  <TabsTrigger value="current" className="flex-1">Current</TabsTrigger>
                  <TabsTrigger value="forecast" className="flex-1">5-Day Forecast</TabsTrigger>
                </TabsList>
                
                <TabsContent value="current" className="pt-4">
                  <div className="flex items-center mb-6">
                    <div className="flex-1 text-center">
                      <img 
                        src={weather.icon} 
                        alt={weather.description} 
                        className="w-24 h-24 mx-auto"
                      />
                      <div className="text-lg capitalize">{weather.description}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="flex items-center p-4">
                        <Thermometer className="h-10 w-10 mr-4 text-yellow-500" />
                        <div>
                          <div className="text-sm text-muted-foreground">Temperature</div>
                          <div className="text-2xl font-semibold">{weather.temperature}°C</div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="flex items-center p-4">
                        <Droplets className="h-10 w-10 mr-4 text-blue-500" />
                        <div>
                          <div className="text-sm text-muted-foreground">Humidity</div>
                          <div className="text-2xl font-semibold">{weather.humidity}%</div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="flex items-center p-4">
                        <Wind className="h-10 w-10 mr-4 text-cyan-500" />
                        <div>
                          <div className="text-sm text-muted-foreground">Wind</div>
                          <div className="text-2xl font-semibold">{weather.wind_speed} km/h</div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
                
                <TabsContent value="forecast" className="pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
                    {weather.forecast.map((day, index) => (
                      <Card key={index}>
                        <CardContent className="text-center p-4">
                          <div className="text-sm font-medium">{day.date}</div>
                          <img 
                            src={day.icon} 
                            alt={day.description} 
                            className="w-12 h-12 mx-auto my-2"
                          />
                          <div className="text-xs capitalize mb-2">{day.description}</div>
                          <div className="flex justify-center items-center gap-2">
                            <span className="font-semibold">{day.max_temp}°</span>
                            <span className="text-muted-foreground text-sm">{day.min_temp}°</span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="bg-muted/30 text-sm text-muted-foreground">
              <p>Data provided for demonstration purposes only.</p>
            </CardFooter>
          </Card>
        ) : (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Cloud className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">No Weather Data</h3>
              <p className="text-muted-foreground text-center">
                Enter a city name above and click search to view current weather and forecast
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default WeatherPage;
