import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, AlertCircle } from 'lucide-react';

interface WeatherAlertData {
  type: 'extreme_heat' | 'frost' | 'heavy_rain' | 'drought' | 'high_wind' | 'flood_risk' | 'fog';
  severity: 'low' | 'medium' | 'high';
  message: string;
}

const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

export default function WeatherAlerts() {
  const { t } = useTranslation();
  const [location, setLocation] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [status, setStatus] = useState('');
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [liveAlerts, setLiveAlerts] = useState<WeatherAlertData[]>([]);
  const [nextCheckTime, setNextCheckTime] = useState<Date | null>(null);
  const [isLiveMonitoring, setIsLiveMonitoring] = useState(false);

  useEffect(() => {
    const subscription = localStorage.getItem('weather-alert-subscription');
    if (subscription) {
      const { location: savedLocation } = JSON.parse(subscription);
      setLocation(savedLocation);
      setIsSubscribed(true);
      setStatus(t('subscribed_for_alerts', { location: savedLocation }));
      setIsLiveMonitoring(true);
    }

    if (isSubscribed && 'Notification' in window && Notification.permission === 'granted') {
      const interval = setInterval(() => {
        fetchWeatherAlerts(location);
      }, 600000); // Check every 10 minutes

      return () => clearInterval(interval);
    }
  }, [isSubscribed, location, t]);

  // Start live monitoring interval when subscribed
  useEffect(() => {
    if (isSubscribed && location) {
      // Initial check
      fetchWeatherAlerts(location);
      
      const interval = setInterval(() => {
        fetchWeatherAlerts(location);
        setNextCheckTime(new Date(Date.now() + 600000)); // 10 minutes from now
      }, 600000); // Check every 10 minutes

      return () => clearInterval(interval);
    }
  }, [isSubscribed, location]);

  const fetchWeatherAlerts = async (loc: string) => {
    if (!OPENWEATHER_API_KEY) {
      console.error('OpenWeather API key is missing.');
      return;
    }
    
    try {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${loc}&appid=${OPENWEATHER_API_KEY}&units=metric`
      );
      const data = await response.json();

      if (!data.main) return;

      const alerts: WeatherAlertData[] = [];
      const temp = data.main.temp;
      const humidity = data.main.humidity;
      const windSpeed = data.wind.speed;
      const rain = data.rain?.['1h'] || 0;
      const weatherMain = data.weather[0]?.main.toLowerCase() || '';

      // Extreme heat (>38°C)
      if (temp > 38) {
        alerts.push({
          type: 'extreme_heat',
          severity: 'high',
          message: `🔥 EXTREME HEAT: ${temp}°C in ${loc}. Ensure adequate irrigation.`,
        });
      }

      // Frost warning (<0°C)
      if (temp < 0) {
        alerts.push({
          type: 'frost',
          severity: 'high',
          message: `❄️ FROST WARNING: ${temp}°C in ${loc}. Protect frost-sensitive crops.`,
        });
      }

      // Heavy rainfall (>10mm/hr)
      if (rain > 10) {
        alerts.push({
          type: 'heavy_rain',
          severity: 'medium',
          message: `🌧️ HEAVY RAIN: ${rain.toFixed(1)}mm/hr in ${loc}. Monitor drainage.`,
        });
      }

      // Flood risk (>20mm/hr)
      if (rain > 20) {
        alerts.push({
          type: 'flood_risk',
          severity: 'high',
          message: `⚠️ FLOOD RISK: ${rain.toFixed(1)}mm/hr in ${loc}. High flood potential!`,
        });
      }

      // Drought conditions (humidity <20%)
      if (humidity < 20) {
        alerts.push({
          type: 'drought',
          severity: 'high',
          message: `🏜️ DROUGHT ALERT: Humidity only ${humidity}% in ${loc}. Increase irrigation.`,
        });
      }

      // High wind warning (>40 km/h = 11.1 m/s)
      if (windSpeed > 11.1) {
        alerts.push({
          type: 'high_wind',
          severity: 'medium',
          message: `💨 HIGH WIND: ${(windSpeed * 3.6).toFixed(1)} km/h in ${loc}. Secure structures.`,
        });
      }

      // Fog/mist detection
      if (weatherMain.includes('fog') || weatherMain.includes('mist')) {
        alerts.push({
          type: 'fog',
          severity: 'low',
          message: `🌫️ FOG DETECTED: Low visibility in ${loc}. Avoid spraying.`,
        });
      }

      setLiveAlerts(alerts);

      // Send notifications for high-severity alerts
      alerts.forEach((alert) => {
        if (alert.severity === 'high' && 'Notification' in window && Notification.permission === 'granted') {
          new Notification('🚨 Weather Alert', {
            body: alert.message,
            icon: '🌤️',
          });
        }
      });

      setNextCheckTime(new Date(Date.now() + 600000)); // Next check in 10 minutes
    } catch (error) {
      console.error('Error fetching weather alerts:', error);
    }
  };

  const handleSubscribe = async () => {
    if (!location) {
      setStatus(t('enter_location_to_subscribe'));
      return;
    }

    if (!('Notification' in window)) {
      setStatus(t('browser_no_notification_support'));
      return;
    }

    if (Notification.permission === 'granted') {
      subscribeUser();
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        subscribeUser();
      } else {
        setStatus(t('notification_permission_denied'));
      }
    }
  };

  const subscribeUser = () => {
    localStorage.setItem('weather-alert-subscription', JSON.stringify({ location }));
    setIsSubscribed(true);
    setIsLiveMonitoring(true);
    setStatus(t('subscribed_success', { location }));
    setNextCheckTime(new Date());
    
    // Initial alert check
    fetchWeatherAlerts(location);

    new Notification(t('subscription_successful'), {
      body: t('will_receive_alerts', { location }) as string,
    });
  };

  const handleUnsubscribe = () => {
    localStorage.removeItem('weather-alert-subscription');
    setIsSubscribed(false);
    setIsLiveMonitoring(false);
    setStatus(t('unsubscribed_from_alerts'));
    setLiveAlerts([]);
  };

  const handleUseCurrentLocation = () => {
    setLoadingLocation(true);
    setStatus(t('fetching_location'));
    
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${OPENWEATHER_API_KEY}`)
            .then(res => res.json())
            .then(data => {
              if (data.name) {
                setLocation(data.name);
                setStatus(t('location_fetched_success', { location: data.name }));
              } else {
                setStatus(t('could_not_determine_city'));
              }
            })
            .catch(error => {
              console.error('Error during reverse geocoding:', error);
              setStatus(t('error_fetching_location_data'));
            })
            .finally(() => setLoadingLocation(false));
        },
        (error) => {
          console.error('Geolocation error:', error);
          setLoadingLocation(false);
          if (error.code === error.PERMISSION_DENIED) {
            setStatus(t('geolocation_permission_denied'));
          } else {
            setStatus(t('failed_to_fetch_location_data'));
          }
        }
      );
    } else {
      setLoadingLocation(false);
      setStatus(t('geolocation_not_supported'));
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'border-red-500/50 bg-red-500/10';
      case 'medium': return 'border-yellow-500/50 bg-yellow-500/10';
      case 'low': return 'border-blue-500/50 bg-blue-500/10';
      default: return 'border-gray-500/50 bg-gray-500/10';
    }
  };

  const getSeverityTextColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="p-8 min-h-screen">
      <h1 className="text-4xl font-bold font-display mb-8 text-center text-[var(--color-text-primary)]">{t('weather_alerts')}</h1>
      
      <div className="max-w-2xl mx-auto glassmorphism p-8 rounded-xl">
        <p className="text-[var(--color-text-secondary)] mb-6 text-center">{t('weather_alerts_description')}</p>
        
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <input 
            type="text" 
            value={location} 
            onChange={e => setLocation(e.target.value)} 
            placeholder={t('enter_location')} 
            className="flex-grow p-3 bg-[var(--color-glass-bg)] border border-[var(--color-glass-border)] text-[var(--color-text-primary)] rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--color-neon-blue)]"
            disabled={isSubscribed || loadingLocation}
          />
          {!isSubscribed && (
            <button 
              onClick={handleUseCurrentLocation} 
              disabled={loadingLocation} 
              className="p-3 bg-[var(--color-glass-bg)] border border-[var(--color-glass-border)] text-[var(--color-text-primary)] rounded-lg font-semibold hover:bg-[var(--color-neon-blue)]/20 transition-colors flex items-center justify-center"
            >
              {loadingLocation ? t('fetching_location') : <><MapPin size={20} className="mr-2" /> {t('use_current_location')}</>}
            </button>
          )}
          {isSubscribed ? (
            <button onClick={handleUnsubscribe} className="p-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors">
              {t('unsubscribe')}
            </button>
          ) : (
            <button onClick={handleSubscribe} className="p-3 bg-[var(--color-neon-blue)] text-white rounded-lg font-semibold hover:bg-[var(--color-neon-purple)] transition-colors">
              {t('subscribe')}
            </button>
          )}
        </div>

        {status && <p className="text-center text-sm text-[var(--color-text-secondary)] mt-4">{status}</p>}

        {/* Live Monitoring Status */}
        {isLiveMonitoring && (
          <div className="mt-6 p-4 border border-green-500/50 bg-green-500/10 rounded-lg">
            <div className="flex items-center">
              <span className="text-2xl mr-2">🔴</span>
              <div>
                <p className="text-green-400 font-semibold">Live Monitoring Active</p>
                <p className="text-sm text-[var(--color-text-secondary)]">
                  Checking every 10 minutes {nextCheckTime && `• Next check: ${nextCheckTime.toLocaleTimeString()}`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Active Alerts Display */}
        {liveAlerts.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center mb-4">
              <AlertCircle className="h-6 w-6 text-red-500 mr-2" />
              <h2 className="text-xl font-bold text-red-500">Active Weather Alerts ({liveAlerts.length})</h2>
            </div>
            <div className="space-y-3">
              {liveAlerts.map((alert, idx) => (
                <div key={idx} className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)}`}>
                  <p className={`${getSeverityTextColor(alert.severity)} font-semibold text-sm`}>
                    {alert.severity.toUpperCase()}
                  </p>
                  <p className="text-[var(--color-text-primary)] mt-1">{alert.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {isSubscribed && liveAlerts.length === 0 && (
          <div className="mt-6 p-4 border border-green-500/50 bg-green-500/10 rounded-lg text-center">
            <p className="text-green-400 font-semibold">✅ All conditions normal</p>
            <p className="text-sm text-[var(--color-text-secondary)]">No active weather alerts for {location}</p>
          </div>
        )}
      </div>
    </div>
  );
}
