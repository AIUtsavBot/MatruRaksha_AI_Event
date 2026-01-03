# 📱 MatruRaksha Mobile App

> React Native mobile application for maternal health monitoring.

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 20.x or higher
- **npm** or **yarn**
- **Expo CLI** (optional, but recommended)
- iOS Simulator (Mac) or Android Emulator

### Installation

```bash
# Navigate to mobile directory
cd mobile

# Install dependencies
npm install

# Start the development server
npx expo start
```

### Running on Devices

```bash
# iOS Simulator (Mac only)
npm run ios

# Android Emulator
npm run android

# Scan QR code with Expo Go app on physical device
npx expo start
```

---

## 📁 Project Structure

```
mobile/
├── App.tsx                      # Main entry point
├── app.json                     # Expo configuration
├── package.json                 # Dependencies
├── tsconfig.json                # TypeScript config
├── babel.config.js              # Babel config
│
├── src/
│   ├── api/                     # API integration
│   │   ├── client.ts            # Axios instance
│   │   ├── auth.ts              # Auth endpoints
│   │   ├── mothers.ts           # Mother endpoints
│   │   └── risk.ts              # Risk endpoints
│   │
│   ├── components/              # Reusable components
│   │   ├── RiskBadge.tsx
│   │   ├── LoadingSpinner.tsx
│   │   └── EmptyState.tsx
│   │
│   ├── contexts/                # React Context
│   │   └── AuthContext.tsx      # Auth state management
│   │
│   ├── hooks/                   # Custom hooks
│   │   ├── useNetworkStatus.ts  # Network monitoring
│   │   ├── useMothers.ts        # Mothers data hook
│   │   └── useSyncPendingData.ts # Offline sync
│   │
│   ├── navigation/              # Navigation setup
│   │   ├── AppNavigator.tsx     # Root navigator
│   │   ├── AuthNavigator.tsx    # Auth stack
│   │   └── MainNavigator.tsx    # Main tab/stack
│   │
│   ├── screens/                 # Screen components
│   │   ├── auth/                # Auth screens
│   │   ├── mother/              # Mother screens
│   │   ├── doctor/              # Doctor screens
│   │   ├── asha/                # ASHA worker screens
│   │   └── common/              # Shared screens
│   │
│   ├── services/                # Business logic
│   │   ├── supabase.ts          # Supabase client
│   │   ├── storage.ts           # Offline storage
│   │   └── notifications.ts     # Push notifications
│   │
│   ├── theme/                   # Styling
│   │   └── index.ts             # Colors, typography
│   │
│   ├── types/                   # TypeScript types
│   │   ├── auth.ts
│   │   ├── mother.ts
│   │   └── risk.ts
│   │
│   └── utils/                   # Utilities
│       ├── constants.ts         # App constants
│       └── helpers.ts           # Helper functions
│
└── assets/                      # Static assets
```

---

## ⚙️ Configuration

### Environment Setup

Update the constants in `src/utils/constants.ts`:

```typescript
// API URL
export const API_URL = __DEV__
  ? 'http://YOUR_LOCAL_IP:8000'  // Replace with your local IP
  : 'https://your-backend.onrender.com';

// Supabase
export const SUPABASE_URL = 'https://xxxxx.supabase.co';
export const SUPABASE_ANON_KEY = 'your-anon-key';
```

### Finding Your Local IP

```bash
# Windows
ipconfig

# macOS/Linux
ifconfig
```

---

## 📱 Features

### For Mothers
- ✅ Daily health check-ins
- ✅ Health timeline view
- ✅ Risk assessment results
- ✅ Offline data entry

### For Doctors
- ✅ Patient dashboard
- ✅ Risk level monitoring
- ✅ Patient details view
- ✅ Quick actions

### For ASHA Workers
- ✅ Mother list with filtering
- ✅ Visit scheduling
- ✅ Patient search

### Common Features
- ✅ Multi-role authentication
- ✅ Offline support
- ✅ Push notifications
- ✅ Profile management

---

## 🔧 Building for Production

### Using EAS Build

```bash
# Install EAS CLI
npm install -g eas-cli

# Login
eas login

# Configure
eas build:configure

# Build Android APK
eas build --platform android --profile preview

# Build Android AAB (Play Store)
eas build --platform android --profile production

# Build iOS
eas build --platform ios --profile production
```

---

## 🧪 Testing

```bash
# Run linting
npm run lint

# Type checking
npx tsc --noEmit
```

---

## 📚 Related Documentation

- [Mobile App Development Guide](../docs/guides/mobile_app_guide.md)
- [API Documentation](../docs/api/endpoints.md)
- [Backend Setup](../docs/guides/setup_guide.md)

---

*Last Updated: January 2026*
