// Utility functions for fetching and managing user preferences from the database
// Created to replace localStorage dependency for theme and other preferences

export interface UserPreferences {
  theme: 'default' | 'dark';
  fontSize: string;
  aiMode: string;
  tone: string;
  notificationsEnabled: boolean;
  language: string;
}

export const fetchUserPreferences = async (): Promise<UserPreferences | null> => {
  try {
    const res = await fetch('http://localhost:8080/api/settings', {
      method: 'GET',
      credentials: 'include',
    });
    
    if (res.ok) {
      const settings = await res.json();
      return settings.preferences;
    } else {
      console.warn('Failed to load preferences from database');
      return null;
    }
  } catch (error) {
    console.error('Error loading preferences:', error);
    return null;
  }
};

export const applyThemeToBody = (theme: string) => {
  if (typeof window !== 'undefined') {
    document.body.dataset.theme = theme;
  }
};

export const applyFontSizeToBody = (fontSize: string) => {
  if (typeof window !== 'undefined') {
    document.body.dataset.fontsize = fontSize;
  }
};
