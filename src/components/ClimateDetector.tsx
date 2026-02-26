import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';

interface CurrentWeatherData {
  temperature: number;
  humidity: number;
  windspeed: number;
}

interface DailyWeatherData {
  time: string[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  weathercode: number[];
}

export default function ClimateDetector() {
  const { t } = useTranslation();
  const [currentWeather, setCurrentWeather] = useState<CurrentWeatherData | null>(null);
  const [dailyForecast, setDailyForecast] = useState<DailyWeatherData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [locationInput, setLocationInput] = useState<string>('');
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number; name?: string } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const fetchWeatherData = async (latitude: number, longitude: number, locationName?: string) => {
    setError(null);
    setCurrentWeather(null);
    setDailyForecast(null);
    try {
      const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,weathercode&timezone=auto`);
      if (!response.ok) {
        throw new Error('Failed to fetch weather data.');
      }
      const data = await response.json();
      setCurrentWeather(data.current_weather);
      setDailyForecast(data.daily);
      if (locationName) {
        // Optionally store the location name if needed for display
      }
    } catch (err) {
      setError('Could not fetch weather data.');
      console.error(err);
    }
  };

  useEffect(() => {
    if (selectedLocation) {
      fetchWeatherData(selectedLocation.latitude, selectedLocation.longitude, selectedLocation.name);
    } else if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        fetchWeatherData(position.coords.latitude, position.coords.longitude);
      }, () => {
        setError('Geolocation permission denied. Please enter a location.');
      });
    } else {
      setError('Geolocation is not supported by this browser. Please enter a location.');
    }
  }, [selectedLocation]);

  const handleLocationSearch = async () => {
    if (!locationInput) return;
    setLocationLoading(true);
    setError(null);
    try {
      const response = await fetch(`https://api.open-meteo.com/v1/search?name=${locationInput}`);
      if (!response.ok) {
        throw new Error('Failed to fetch location data.');
      }
      const data = await response.json();
      if (data.results && data.results.length > 0) {
        const { latitude, longitude, name } = data.results[0];
        setSelectedLocation({ latitude, longitude, name });
      } else {
        setError('Location not found. Please try a different search term.');
      }
    } catch (err) {
      setError('Could not search for location.');
      console.error(err);
    } finally {
      setLocationLoading(false);
    }
  };

  const getWeatherDescription = (code: number) => {
    // Simplified weather code interpretation (refer to Open-Meteo documentation for full list)
    switch (code) {
      case 0: return 'Clear sky';
      case 1: case 2: case 3: return 'Mainly clear, partly cloudy, and overcast';
      case 45: case 48: return 'Fog and depositing rime fog';
      case 51: case 53: case 55: return 'Drizzle: Light, moderate, and dense intensity';
      case 56: case 57: return 'Freezing Drizzle: Light and dense intensity';
      case 61: case 63: case 65: return 'Rain: Slight, moderate and heavy intensity';
      case 66: case 67: return 'Freezing Rain: Light and heavy intensity';
      case 71: case 73: case 75: return 'Snow fall: Slight, moderate, and heavy intensity';
      case 77: return 'Snow grains';
      case 80: case 81: case 82: return 'Rain showers: Slight, moderate, and violent';
      case 85: case 86: return 'Snow showers: Slight and heavy';
      case 95: return 'Thunderstorm: Slight or moderate';
      case 96: case 99: return 'Thunderstorm with slight and heavy hail';
      default: return 'N/A';
    }
  };

  return (
    <div className="glassmorphism p-8 text-center">
      <h2 className="text-2xl font-bold font-display text-[var(--color-text-primary)] mb-4">{t('climate_detector')}</h2>

      <div className="flex space-x-2 mb-4">
        <input
          type="text"
          value={locationInput}
          onChange={(e) => setLocationInput(e.target.value)}
          placeholder={t('enter_location')}
          className="w-full p-3 border border-[var(--color-glass-border)] bg-[var(--color-glass-bg)] text-[var(--color-text-primary)] rounded-full font-sans focus:outline-none focus:border-[var(--color-neon-blue)]"
          disabled={locationLoading}
        />
        <button
          onClick={handleLocationSearch}
          disabled={!locationInput || locationLoading}
          className="bg-[var(--color-neon-blue)] text-white py-3 px-6 rounded-full font-display font-semibold hover:bg-[var(--color-neon-purple)] transition-colors disabled:bg-gray-700 disabled:text-[var(--color-text-secondary)]"
        >
          {locationLoading ? t('searching') : <Search className="h-5 w-5" />}
        </button>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {currentWeather ? (
        <div className="space-y-4 mb-8">
          <p className="text-5xl font-bold font-display text-[var(--color-neon-cyan)]">{currentWeather.temperature}°C</p>
          <div className="flex justify-around text-lg text-[var(--color-text-secondary)]">
            <p><span className="font-semibold text-[var(--color-text-primary)]">{t('humidity')}:</span> {currentWeather.humidity}%</p>
            <p><span className="font-semibold text-[var(--color-text-primary)]">{t('wind')}:</span> {currentWeather.windspeed} km/h</p>
          </div>
        </div>
      ) : (
        <p className="text-[var(--color-text-secondary)]">{t('loading_weather')}</p>
      )}

      {dailyForecast && (
        <div className="mt-8 border-t border-[var(--color-glass-border)] pt-8">
          <h3 className="text-xl font-bold font-display text-[var(--color-text-primary)] mb-4">{t('daily_forecast')}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {dailyForecast.time.map((dateString, index) => (
              <div key={dateString} className="glassmorphism p-4 text-left">
                <p className="text-sm font-mono text-[var(--color-text-secondary)]">{new Date(dateString).toLocaleDateString()}</p>
                <p className="text-lg font-bold text-[var(--color-neon-cyan)]">{dailyForecast.temperature_2m_max[index]}°C / {dailyForecast.temperature_2m_min[index]}°C</p>
                <p className="text-sm text-[var(--color-text-primary)]">{getWeatherDescription(dailyForecast.weathercode[index])}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
