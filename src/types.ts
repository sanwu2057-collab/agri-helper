// API and Data Types
export interface PlantAnalysisResult {
  disease: string;
  confidence: number;
  description: string;
  recommendations: string[];
}

export interface WeatherData {
  location: string;
  temperature: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  forecast: DailyForecast[];
}

export interface DailyForecast {
  date: string;
  minTemp: number;
  maxTemp: number;
  condition: string;
  humidity: number;
}

export interface CropPrice {
  crop: string;
  price: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
  timestamp: string;
}

export interface GovernmentScheme {
  id: string;
  name: string;
  description: string;
  eligibility: string[];
  benefits: string[];
  applicationDeadline?: string;
  website?: string;
}

export interface PestDetectionResult {
  pest: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
  treatment: string[];
  preventiveMeasures: string[];
}

export interface CropRotationGuide {
  crop: string;
  nextCrops: string[];
  duration: number;
  benefits: string[];
}

export interface ClimateData {
  region: string;
  temperature: number;
  humidity: number;
  rainfall: number;
  soilMoisture: number;
  alerts: string[];
}

export interface UserPreferences {
  language: string;
  theme: 'light' | 'dark';
  location: string;
  unit: 'metric' | 'imperial';
}

export interface AlertNotification {
  id: string;
  type: 'weather' | 'pest' | 'crop' | 'market';
  title: string;
  message: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: Date;
  read: boolean;
}
