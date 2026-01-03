# 📱 MatruRaksha Mobile App Development Guide

> Complete guide to building a mobile app for MatruRaksha AI using the existing backend.

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Technology Options](#-technology-options)
- [Recommended Stack: React Native](#-recommended-stack-react-native)
- [Project Setup](#-project-setup)
- [API Integration](#-api-integration)
- [Authentication](#-authentication)
- [Core Features Implementation](#-core-features-implementation)
- [Offline Support](#-offline-support)
- [Push Notifications](#-push-notifications)
- [Deployment](#-deployment)
- [Alternative: Flutter](#-alternative-flutter)

---

## 🔍 Overview

This guide explains how to create a mobile app for MatruRaksha AI that:

- ✅ **Uses the existing backend** - Same FastAPI backend, same database
- ✅ **Shares authentication** - Supabase Auth works across platforms
- ✅ **Role-based access** - Doctor, ASHA Worker, and Mother interfaces
- ✅ **Offline capable** - Works in low-connectivity areas
- ✅ **Push notifications** - Real-time alerts for emergencies

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌─────────────────┐    ┌─────────────────┐                    │
│   │   React Web     │    │  React Native   │                    │
│   │   (Existing)    │    │   Mobile App    │                    │
│   │   Port: 5173    │    │  (iOS/Android)  │                    │
│   └────────┬────────┘    └────────┬────────┘                    │
│            │                      │                              │
│            └──────────┬───────────┘                              │
│                       ▼                                          │
│         ┌───────────────────────────┐                           │
│         │    Shared API Service     │                           │
│         │    (Same endpoints)       │                           │
│         └───────────────────────────┘                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      EXISTING BACKEND                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   FastAPI Backend (No changes needed)                           │
│   ├── /auth/*        → Authentication                           │
│   ├── /mothers/*     → Mother management                        │
│   ├── /risk/*        → Risk assessments                         │
│   ├── /admin/*       → Admin operations                         │
│   └── /analytics/*   → Dashboard data                           │
│                                                                  │
│   Supabase (Shared)                                              │
│   ├── PostgreSQL     → Same database                            │
│   ├── Auth           → Same auth system                         │
│   └── Storage        → Same file storage                        │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Options

### Comparison

| Framework | Language | Pros | Cons | Best For |
|-----------|----------|------|------|----------|
| **React Native** | JavaScript/TypeScript | Code reuse from web, large ecosystem, Expo simplifies dev | Performance slightly lower than native | Teams with React experience |
| **Flutter** | Dart | Great performance, beautiful UI, single codebase | New language to learn | Premium UI/animations |
| **Native (Swift/Kotlin)** | Swift/Kotlin | Best performance, full platform access | Two codebases to maintain | Complex platform-specific features |
| **Capacitor/Ionic** | JavaScript | Wrap existing web app | Limited native feel | Quick MVP |

### Recommendation

**For MatruRaksha, we recommend React Native with Expo** because:

1. **Code Sharing** - Reuse logic from your React web app
2. **Expo Simplifies** - No native build configuration needed
3. **Supabase SDK** - Official React Native support
4. **Offline Support** - Easy to implement with AsyncStorage
5. **Push Notifications** - Expo Push Notifications are simple

---

## ⚛️ Recommended Stack: React Native

### Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | React Native + Expo |
| **Language** | TypeScript |
| **State Management** | React Context + React Query |
| **Navigation** | React Navigation |
| **UI Components** | React Native Paper or NativeBase |
| **Authentication** | Supabase Auth |
| **API Client** | Axios |
| **Offline Storage** | AsyncStorage + React Query |
| **Push Notifications** | Expo Notifications |

---

## 🚀 Project Setup

### Step 1: Create Expo Project

```bash
# Install Expo CLI globally
npm install -g expo-cli

# Create new project with TypeScript template
npx create-expo-app MatruRakshaApp --template expo-template-blank-typescript

# Navigate to project
cd MatruRakshaApp
```

### Step 2: Install Dependencies

```bash
# Core dependencies
npm install @supabase/supabase-js axios react-query

# Navigation
npm install @react-navigation/native @react-navigation/native-stack @react-navigation/bottom-tabs
npx expo install react-native-screens react-native-safe-area-context

# UI Components
npm install react-native-paper react-native-vector-icons

# Storage & Utilities
npx expo install @react-native-async-storage/async-storage
npx expo install expo-secure-store expo-notifications expo-device

# Forms
npm install react-hook-form @hookform/resolvers zod
```

### Step 3: Project Structure

Create this folder structure:

```
MatruRakshaApp/
├── app.json                    # Expo configuration
├── App.tsx                     # Entry point
├── babel.config.js
├── tsconfig.json
│
├── src/
│   ├── api/                    # API integration
│   │   ├── client.ts           # Axios instance
│   │   ├── auth.ts             # Auth endpoints
│   │   ├── mothers.ts          # Mother endpoints
│   │   └── risk.ts             # Risk endpoints
│   │
│   ├── components/             # Reusable components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── RiskBadge.tsx
│   │
│   ├── contexts/               # React Context
│   │   └── AuthContext.tsx
│   │
│   ├── hooks/                  # Custom hooks
│   │   ├── useAuth.ts
│   │   └── useRiskAssessment.ts
│   │
│   ├── navigation/             # Navigation setup
│   │   ├── AppNavigator.tsx
│   │   ├── AuthNavigator.tsx
│   │   └── TabNavigator.tsx
│   │
│   ├── screens/                # Screen components
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── SignupScreen.tsx
│   │   ├── mother/
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── CheckInScreen.tsx
│   │   │   └── TimelineScreen.tsx
│   │   ├── doctor/
│   │   │   ├── DashboardScreen.tsx
│   │   │   └── PatientDetailScreen.tsx
│   │   └── asha/
│   │       ├── MotherListScreen.tsx
│   │       └── VisitScreen.tsx
│   │
│   ├── services/               # Business logic
│   │   ├── supabase.ts         # Supabase client
│   │   ├── notifications.ts   # Push notifications
│   │   └── storage.ts          # Offline storage
│   │
│   ├── theme/                  # Styling
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   └── index.ts
│   │
│   ├── types/                  # TypeScript types
│   │   ├── auth.ts
│   │   ├── mother.ts
│   │   └── risk.ts
│   │
│   └── utils/                  # Utilities
│       ├── helpers.ts
│       └── constants.ts
│
└── assets/                     # Images, fonts
```

### Step 4: Environment Configuration

Create `src/utils/constants.ts`:

```typescript
// API Configuration
export const API_URL = __DEV__ 
  ? 'http://192.168.1.100:8000'  // Local network IP for development
  : 'https://your-backend.onrender.com';

// Supabase Configuration
export const SUPABASE_URL = 'https://xxxxx.supabase.co';
export const SUPABASE_ANON_KEY = 'your_anon_key';
```

---

## 🔌 API Integration

### Axios Client

Create `src/api/client.ts`:

```typescript
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../utils/constants';

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired - redirect to login
      await SecureStore.deleteItemAsync('accessToken');
      // Navigate to login screen
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### API Services

Create `src/api/mothers.ts`:

```typescript
import apiClient from './client';
import { Mother, RiskAssessment } from '../types';

export const mothersApi = {
  // Get all mothers (for ASHA/Doctor)
  getAll: async (): Promise<Mother[]> => {
    const response = await apiClient.get('/mothers');
    return response.data.mothers;
  },

  // Get mother by ID
  getById: async (id: number): Promise<Mother> => {
    const response = await apiClient.get(`/mothers/${id}`);
    return response.data;
  },

  // Register new mother
  register: async (data: Partial<Mother>): Promise<Mother> => {
    const response = await apiClient.post('/mothers/register', data);
    return response.data;
  },

  // Get risk assessments
  getRiskAssessments: async (motherId: number): Promise<RiskAssessment[]> => {
    const response = await apiClient.get(`/risk/mother/${motherId}`);
    return response.data.assessments;
  },

  // Submit risk assessment
  submitAssessment: async (data: Partial<RiskAssessment>): Promise<RiskAssessment> => {
    const response = await apiClient.post('/risk/assess', data);
    return response.data;
  },
};
```

---

## 🔐 Authentication

### Supabase Client

Create `src/services/supabase.ts`:

```typescript
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../utils/constants';

// Custom storage adapter for React Native
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Important for React Native
  },
});
```

### Auth Context

Create `src/contexts/AuthContext.tsx`:

```typescript
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../services/supabase';
import apiClient from '../api/client';
import * as SecureStore from 'expo-secure-store';

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'ADMIN' | 'DOCTOR' | 'ASHA_WORKER' | null;
  phone?: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.access_token) {
        SecureStore.setItemAsync('accessToken', session.access_token);
        fetchProfile();
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.access_token) {
          await SecureStore.setItemAsync('accessToken', session.access_token);
          await fetchProfile();
        } else {
          await SecureStore.deleteItemAsync('accessToken');
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await apiClient.get('/auth/profile');
      setProfile(response.data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'matruraksha://auth-callback', // Deep link
      },
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, name: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
      },
    });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    await SecureStore.deleteItemAsync('accessToken');
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{
      session,
      user,
      profile,
      loading,
      signIn,
      signInWithGoogle,
      signUp,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

---

## 📱 Core Features Implementation

### Login Screen

Create `src/screens/auth/LoginScreen.tsx`:

```typescript
import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text, Title } from 'react-native-paper';
import { useAuth } from '../../contexts/AuthContext';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signInWithGoogle } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await signIn(email, password);
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Title style={styles.title}>🤰 MatruRaksha</Title>
      <Text style={styles.subtitle}>Maternal Health Companion</Text>

      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
        mode="outlined"
      />

      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
        mode="outlined"
      />

      <Button
        mode="contained"
        onPress={handleLogin}
        loading={loading}
        style={styles.button}
      >
        Sign In
      </Button>

      <Button
        mode="outlined"
        onPress={signInWithGoogle}
        style={styles.button}
        icon="google"
      >
        Sign in with Google
      </Button>

      <Button
        mode="text"
        onPress={() => navigation.navigate('Signup')}
      >
        Don't have an account? Sign up
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 32,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 32,
    color: '#666',
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginVertical: 8,
  },
});
```

### Health Check-In Screen

Create `src/screens/mother/CheckInScreen.tsx`:

```typescript
import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { TextInput, Button, Text, Title, Card, RadioButton } from 'react-native-paper';
import { mothersApi } from '../../api/mothers';

export default function CheckInScreen() {
  const [feeling, setFeeling] = useState('good');
  const [systolicBp, setSystolicBp] = useState('');
  const [diastolicBp, setDiastolicBp] = useState('');
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const symptomOptions = [
    'Headache',
    'Swelling',
    'Nausea',
    'Dizziness',
    'Bleeding',
    'Fever',
  ];

  const toggleSymptom = (symptom: string) => {
    setSymptoms(prev => 
      prev.includes(symptom)
        ? prev.filter(s => s !== symptom)
        : [...prev, symptom]
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const assessment = await mothersApi.submitAssessment({
        systolic_bp: systolicBp ? parseInt(systolicBp) : undefined,
        diastolic_bp: diastolicBp ? parseInt(diastolicBp) : undefined,
        symptoms,
        notes,
      });
      setResult(assessment);
      Alert.alert('Success', 'Check-in submitted successfully!');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Title style={styles.title}>Daily Health Check-In</Title>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.label}>How are you feeling today?</Text>
          <RadioButton.Group onValueChange={setFeeling} value={feeling}>
            <RadioButton.Item label="😊 Good" value="good" />
            <RadioButton.Item label="😐 Okay" value="okay" />
            <RadioButton.Item label="😟 Not Good" value="not_good" />
          </RadioButton.Group>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.label}>Blood Pressure (optional)</Text>
          <View style={styles.bpRow}>
            <TextInput
              label="Systolic"
              value={systolicBp}
              onChangeText={setSystolicBp}
              keyboardType="numeric"
              style={styles.bpInput}
              mode="outlined"
            />
            <Text style={styles.bpSlash}>/</Text>
            <TextInput
              label="Diastolic"
              value={diastolicBp}
              onChangeText={setDiastolicBp}
              keyboardType="numeric"
              style={styles.bpInput}
              mode="outlined"
            />
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <Text style={styles.label}>Any symptoms?</Text>
          <View style={styles.symptomsGrid}>
            {symptomOptions.map(symptom => (
              <Button
                key={symptom}
                mode={symptoms.includes(symptom) ? 'contained' : 'outlined'}
                onPress={() => toggleSymptom(symptom)}
                style={styles.symptomButton}
                compact
              >
                {symptom}
              </Button>
            ))}
          </View>
        </Card.Content>
      </Card>

      <Card style={styles.card}>
        <Card.Content>
          <TextInput
            label="Additional Notes"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={3}
            mode="outlined"
          />
        </Card.Content>
      </Card>

      <Button
        mode="contained"
        onPress={handleSubmit}
        loading={loading}
        style={styles.submitButton}
      >
        Submit Check-In
      </Button>

      {result && (
        <Card style={[styles.card, styles.resultCard]}>
          <Card.Content>
            <Text style={styles.resultTitle}>Assessment Result</Text>
            <Text style={styles.riskLevel}>
              Risk Level: {result.risk_level}
            </Text>
            <Text>Risk Score: {result.risk_score}/100</Text>
          </Card.Content>
        </Card>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    marginBottom: 16,
  },
  card: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  bpRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bpInput: {
    flex: 1,
  },
  bpSlash: {
    fontSize: 24,
    marginHorizontal: 8,
  },
  symptomsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  symptomButton: {
    marginRight: 8,
    marginBottom: 8,
  },
  submitButton: {
    marginVertical: 16,
  },
  resultCard: {
    backgroundColor: '#e8f5e9',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  riskLevel: {
    fontSize: 16,
    color: '#2e7d32',
  },
});
```

---

## 📴 Offline Support

### Offline Storage Service

Create `src/services/storage.ts`:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  PENDING_CHECKINS: 'pending_checkins',
  CACHED_PROFILE: 'cached_profile',
  CACHED_ASSESSMENTS: 'cached_assessments',
};

export const offlineStorage = {
  // Save pending check-in for later sync
  savePendingCheckIn: async (checkIn: any) => {
    const existing = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_CHECKINS);
    const pending = existing ? JSON.parse(existing) : [];
    pending.push({ ...checkIn, timestamp: Date.now() });
    await AsyncStorage.setItem(STORAGE_KEYS.PENDING_CHECKINS, JSON.stringify(pending));
  },

  // Get all pending check-ins
  getPendingCheckIns: async () => {
    const data = await AsyncStorage.getItem(STORAGE_KEYS.PENDING_CHECKINS);
    return data ? JSON.parse(data) : [];
  },

  // Clear pending check-ins after sync
  clearPendingCheckIns: async () => {
    await AsyncStorage.removeItem(STORAGE_KEYS.PENDING_CHECKINS);
  },

  // Cache data for offline use
  cacheData: async (key: string, data: any) => {
    await AsyncStorage.setItem(key, JSON.stringify({
      data,
      cachedAt: Date.now(),
    }));
  },

  // Get cached data
  getCachedData: async (key: string, maxAge = 3600000) => { // 1 hour default
    const cached = await AsyncStorage.getItem(key);
    if (!cached) return null;
    
    const { data, cachedAt } = JSON.parse(cached);
    if (Date.now() - cachedAt > maxAge) return null;
    
    return data;
  },
};
```

### Network Status Hook

Create `src/hooks/useNetworkStatus.ts`:

```typescript
import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected ?? true);
    });

    return () => unsubscribe();
  }, []);

  return isConnected;
}
```

---

## 🔔 Push Notifications

### Notification Service

Create `src/services/notifications.ts`:

```typescript
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import apiClient from '../api/client';

// Configure notification handling
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const notificationService = {
  // Register for push notifications
  registerForPushNotifications: async () => {
    if (!Device.isDevice) {
      console.log('Push notifications require a physical device');
      return null;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return null;
    }

    const token = (await Notifications.getExpoPushTokenAsync()).data;

    // Register token with backend
    await apiClient.post('/notifications/register-device', {
      push_token: token,
      platform: Platform.OS,
    });

    return token;
  },

  // Schedule local notification (for reminders)
  scheduleReminder: async (title: string, body: string, trigger: Date) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: true,
      },
      trigger: { date: trigger },
    });
  },

  // Cancel all scheduled notifications
  cancelAllNotifications: async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  },
};
```

---

## 📦 Deployment

### Configure app.json

Update `app.json`:

```json
{
  "expo": {
    "name": "MatruRaksha",
    "slug": "matruraksha",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#4CAF50"
    },
    "assetBundlePatterns": ["**/*"],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.matruraksha.app",
      "buildNumber": "1.0.0"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#4CAF50"
      },
      "package": "com.matruraksha.app",
      "versionCode": 1,
      "permissions": [
        "CAMERA",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    },
    "scheme": "matruraksha",
    "plugins": [
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#4CAF50"
        }
      ]
    ],
    "extra": {
      "eas": {
        "projectId": "your-eas-project-id"
      }
    }
  }
}
```

### Build Commands

```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo account
eas login

# Configure project for builds
eas build:configure

# Build for Android (APK for testing)
eas build --platform android --profile preview

# Build for Android (Play Store AAB)
eas build --platform android --profile production

# Build for iOS (requires Apple Developer account)
eas build --platform ios --profile production

# Submit to stores
eas submit --platform android
eas submit --platform ios
```

### eas.json Configuration

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "android": {
        "buildType": "apk"
      },
      "distribution": "internal"
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

---

## 🦋 Alternative: Flutter

If you prefer Flutter, here's a quick setup:

### Create Flutter Project

```bash
flutter create matruraksha_app
cd matruraksha_app
```

### Dependencies (pubspec.yaml)

```yaml
dependencies:
  flutter:
    sdk: flutter
  supabase_flutter: ^2.0.0
  http: ^1.1.0
  provider: ^6.1.1
  go_router: ^12.0.0
  shared_preferences: ^2.2.2
  flutter_secure_storage: ^9.0.0
  firebase_messaging: ^14.7.0
```

### Supabase Client

```dart
import 'package:supabase_flutter/supabase_flutter.dart';

Future<void> main() async {
  await Supabase.initialize(
    url: 'https://xxxxx.supabase.co',
    anonKey: 'your_anon_key',
  );
  runApp(MyApp());
}

final supabase = Supabase.instance.client;
```

---

## 📚 Additional Resources

### Learning Resources

- [React Native Documentation](https://reactnative.dev/docs/getting-started)
- [Expo Documentation](https://docs.expo.dev/)
- [Supabase React Native Guide](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native)
- [React Navigation](https://reactnavigation.org/docs/getting-started)

### Related Project Files

- [API Endpoints](./api/endpoints.md) - Backend API reference
- [Database Schema](./architecture/database_schema.md) - Database structure
- [Setup Guide](./guides/setup_guide.md) - Backend setup

---

## ✅ Checklist for Mobile App

- [ ] Create Expo project with TypeScript
- [ ] Set up Supabase client for React Native
- [ ] Implement authentication flow
- [ ] Create role-based navigation (Mother/Doctor/ASHA)
- [ ] Build health check-in screens
- [ ] Implement offline storage
- [ ] Set up push notifications
- [ ] Test on physical devices
- [ ] Configure EAS builds
- [ ] Submit to App Store / Play Store

---

*Last Updated: January 2026*
