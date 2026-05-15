export interface Profile {
  userId: string;
  bio?: string;
  phone?: string;
  location?: string;
  farmSize?: number;
  cropTypes?: string[];
  avatar?: string;
  preferredLanguage?: string;
  notifications?: NotificationSettings;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationSettings {
  email: boolean;
  sms: boolean;
  inApp: boolean;
  diseaseAlerts: boolean;
  weatherAlerts: boolean;
  marketPrices: boolean;
}

export interface UpdateProfileRequest {
  bio?: string;
  phone?: string;
  location?: string;
  farmSize?: number;
  cropTypes?: string[];
  preferredLanguage?: string;
  notifications?: NotificationSettings;
}
