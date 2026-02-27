import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

export default function WeatherAlerts() {
  const { t } = useTranslation();
  const [location, setLocation] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const subscription = localStorage.getItem('weather-alert-subscription');
    if (subscription) {
      const { location: savedLocation } = JSON.parse(subscription);
      setLocation(savedLocation);
      setIsSubscribed(true);
      setStatus(`Subscribed for alerts in ${savedLocation}.`);
    }

    if (isSubscribed && 'Notification' in window && Notification.permission === 'granted') {
      const interval = setInterval(() => {
        fetchWeatherAlerts(location);
      }, 300000); // Check every 5 minutes

      return () => clearInterval(interval);
    }
  }, [isSubscribed, location]);

  const fetchWeatherAlerts = async (loc: string) => {
    if (!OPENWEATHER_API_KEY) {
      console.error('OpenWeather API key is missing.');
      return;
    }
    try {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${loc}&appid=${OPENWEATHER_API_KEY}`);
      const data = await response.json();

      if (data.weather && data.weather[0].main.toLowerCase().includes('rain')) {
        new Notification('Weather Alert', {
          body: `It's currently raining in ${loc}. Condition: ${data.weather[0].description}`,
        });
      }
    } catch (error) {
      console.error('Error fetching weather alerts:', error);
    }
  };

  const handleSubscribe = async () => {
    if (!location) {
      setStatus('Please enter a location to subscribe.');
      return;
    }

    if (!('Notification' in window)) {
      setStatus('This browser does not support desktop notification');
      return;
    }

    if (Notification.permission === 'granted') {
      subscribeUser();
    } else if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        subscribeUser();
      }
    }
  };

  const subscribeUser = () => {
    localStorage.setItem('weather-alert-subscription', JSON.stringify({ location }));
    setIsSubscribed(true);
    setStatus(`Successfully subscribed to weather alerts for ${location}.`);
    new Notification('Subscription Successful!', {
      body: `You will now receive weather alerts for ${location}.`,
    });
  };

  const handleUnsubscribe = () => {
    localStorage.removeItem('weather-alert-subscription');
    setIsSubscribed(false);
    setStatus('Unsubscribed from weather alerts.');
  };

  return (
    <div className="p-8 bg-gray-100 dark:bg-gray-800 min-h-screen">
      <h1 className="text-4xl font-bold font-display mb-8 text-center text-gray-800 dark:text-white">{t('weather_alerts')}</h1>
      <div className="max-w-2xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-md p-8">
        <p className="text-gray-600 dark:text-gray-300 mb-6 text-center">Get real-time notifications for significant weather events in your area.</p>
        
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <input 
            type="text" 
            value={location} 
            onChange={e => setLocation(e.target.value)} 
            placeholder={t('enter_location')} 
            className="flex-grow p-3 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubscribed}
          />
          {isSubscribed ? (
            <button onClick={handleUnsubscribe} className="p-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors">
              Unsubscribe
            </button>
          ) : (
            <button onClick={handleSubscribe} className="p-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
              {t('subscribe')}
            </button>
          )}
        </div>
        {status && <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">{status}</p>}
      </div>
    </div>
  );
}
