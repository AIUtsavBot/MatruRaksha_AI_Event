# 🔐 MatruRaksha Authentication & Authorization System

## Overview

A comprehensive authentication and authorization system has been implemented for the MatruRaksha project with three distinct user roles:

1. **Admin** - Full system access and user management
2. **Doctor** - Access to patient data and medical features
3. **ASHA Worker** - Field worker access to assigned cases

## 🎯 Features Implemented

### ✅ Backend Components

#### 1. Database Schema (`infra/supabase/schema.sql`)
- User roles enum (`ADMIN`, `DOCTOR`, `ASHA_WORKER`)
- `user_profiles` table linked to Supabase Auth
- Row-Level Security (RLS) policies
- Automatic user profile creation on sign up
- Links to `doctors` and `asha_workers` tables

#### 2. Authentication Service (`backend/services/auth_service.py`)
- User registration with role assignment
- Email/password sign in
- Google OAuth integration
- Session management
- Profile updates
- Role verification

#### 3. Authentication Middleware (`backend/middleware/auth.py`)
- JWT token verification
- Role-based access control decorators
- Helper functions for common role checks:
  - `require_admin()`
  - `require_doctor()`
  - `require_asha_worker()`

#### 4. API Routes (`backend/routes/auth_routes.py`)
- `POST /auth/signup` - Register new user
- `POST /auth/signin` - Email/password login
- `POST /auth/signin/google` - Google OAuth
- `POST /auth/signout` - Logout
- `POST /auth/refresh` - Refresh token
- `GET /auth/me` - Get current user
- `PUT /auth/profile` - Update profile
- `GET /auth/users` - List all users (Admin)
- `GET /auth/users/role/{role}` - Filter by role

### ✅ Frontend Components

#### 1. Authentication Service (`frontend/src/services/auth.js`)
- Supabase client integration
- Sign up/sign in methods
- Google OAuth
- Session management
- Profile updates

#### 2. Auth Context (`frontend/src/contexts/AuthContext.jsx`)
- Global authentication state
- React hooks for auth operations
- Automatic session persistence
- Role checking utilities

#### 3. UI Components
- **Login Page** (`frontend/src/pages/Login.jsx`)
  - Email/password login
  - Google OAuth button
  - Forgot password link
  - Responsive design
  
- **Signup Page** (`frontend/src/pages/Signup.jsx`)
  - User registration form
  - Role selection
  - Phone and assigned area
  - Google OAuth option
  
- **Protected Route** (`frontend/src/components/ProtectedRoute.jsx`)
  - Route-level authentication
  - Role-based access control
  - Loading states

#### 4. App Integration (`frontend/src/App.jsx`)
- AuthProvider wrapper
- Protected and public routes
- Role-based redirects

## 📝 Configuration

### Backend Environment Variables

Add to `backend/.env`:

```env
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
OAUTH_REDIRECT_URL=http://localhost:5173/auth/callback
```

### Frontend Environment Variables

Add to `frontend/.env.local`:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Supabase Setup

1. **Run Database Migration**
   - Go to Supabase SQL Editor
   - Run the updated `infra/supabase/schema.sql`

2. **Configure Google OAuth** (Optional)
   - Enable Google provider in Supabase Authentication settings
   - Add OAuth credentials from Google Cloud Console
   - Set redirect URL: `http://localhost:5173/auth/callback`

3. **Email Settings**
   - Configure email templates in Supabase
   - Set up SMTP for email verification

## 🚀 Usage

### User Registration

```javascript
// Frontend
import { useAuth } from './contexts/AuthContext'

const { signUp } = useAuth()

await signUp({
  email: 'doctor@example.com',
  password: 'SecurePass123',
  fullName: 'Dr. Jane Doe',
  role: 'DOCTOR',
  phone: '+919876543210',
  assignedArea: 'Mumbai'
})
```

### User Login

```javascript
const { signIn } = useAuth()

await signIn('doctor@example.com', 'SecurePass123')
```

### Protected Routes

```jsx
<ProtectedRoute allowedRoles={['DOCTOR', 'ADMIN']}>
  <DoctorDashboard />
</ProtectedRoute>
```

### Backend API Protection

```python
from middleware.auth import require_doctor, get_current_user

@app.get("/api/patients")
async def get_patients(current_user: dict = Depends(require_doctor)):
    # Only doctors and admins can access
    return {"patients": []}
```

## 🔄 Authentication Flow

### Registration Flow
1. User fills registration form
2. Supabase Auth creates user account
3. Database trigger creates user profile
4. User receives verification email
5. User verifies email and can login

### Login Flow
1. User enters credentials
2. Supabase verifies credentials
3. JWT tokens are issued
4. User profile is fetched
5. Role-based redirect occurs
   - Admin → `/admin/dashboard`
   - Doctor → `/doctor/dashboard`
   - ASHA Worker → `/asha/dashboard`

### Google OAuth Flow
1. User clicks "Sign in with Google"
2. Redirects to Google OAuth
3. User grants permissions
4. Redirects back with token
5. User profile is created/updated
6. User is logged in

## 🎭 Role-Based Access

### Admin
- Full access to all features
- User management
- System configuration
- All dashboards

### Doctor
- Patient data access
- Medical reports
- Risk assessments
- Doctor dashboard

### ASHA Worker
- Assigned patient cases
- Field data entry
- Basic reports
- ASHA dashboard

## 🔒 Security Features

1. **JWT Authentication** - Secure token-based auth
2. **Row Level Security** - Database-level access control
3. **Password Requirements** - Minimum 8 characters
4. **Email Verification** - Verified email addresses
5. **Session Management** - Automatic token refresh
6. **Role-based Authorization** - Granular permissions
7. **Secure Password Storage** - Handled by Supabase

## 🧪 Testing

### Test User Accounts

Create test accounts for each role:

```bash
# Admin
Email: admin@matruraksha.ai
Password: Admin@123

# Doctor
Email: doctor@test.com
Password: Doctor@123

# ASHA Worker
Email: asha@test.com
Password: Asha@123
```

### Testing Checklist

- [ ] Register new user (each role)
- [ ] Login with email/password
- [ ] Login with Google OAuth
- [ ] Access protected routes
- [ ] Role-based access control
- [ ] Profile updates
- [ ] Password reset
- [ ] Session persistence
- [ ] Logout functionality

## 📚 API Endpoints

### Public Endpoints
- `POST /auth/signup` - Register
- `POST /auth/signin` - Login
- `POST /auth/signin/google` - Google OAuth
- `POST /auth/refresh` - Refresh token

### Protected Endpoints (Requires Authentication)
- `GET /auth/me` - Current user
- `PUT /auth/profile` - Update profile
- `POST /auth/signout` - Logout

### Admin Only Endpoints
- `GET /auth/users` - All users
- `GET /auth/users/{id}` - User by ID
- `PUT /auth/users/{id}/activate` - Activate user
- `PUT /auth/users/{id}/deactivate` - Deactivate user

## 🐛 Troubleshooting

### Common Issues

1. **"Invalid credentials" error**
   - Check email/password
   - Verify email is confirmed
   - Check user is active

2. **"Access denied" error**
   - Verify user role
   - Check route permissions
   - Ensure user is authenticated

3. **Token expired**
   - Use refresh token endpoint
   - Re-login if needed

4. **Google OAuth not working**
   - Verify OAuth credentials
   - Check redirect URL
   - Enable provider in Supabase

## 📖 Next Steps

1. **Enable Email Templates**
   - Customize verification emails
   - Add password reset emails
   - Welcome emails

2. **Multi-Factor Authentication**
   - SMS verification
   - Authenticator app support

3. **Audit Logging**
   - Track login attempts
   - Monitor user actions
   - Security alerts

4. **Advanced Permissions**
   - Granular feature permissions
   - Area-based access control
   - Time-based access

## 🤝 Support

For issues or questions:
- Check Supabase Auth documentation
- Review error logs
- Contact development team

---

## 🆕 New in Version 2.2.0 (December 2024)

### Enhanced OAuth Flow
The Google OAuth flow has been enhanced with:

1. **Role Selection After Login**
   - New users select their role (Doctor/ASHA Worker)
   - Doctors upload medical registration certificate
   - Pending approval screen shown until admin approves

2. **Admin Approval System**
   - Unified approval center at `/admin/approvals`
   - View uploaded certificates
   - Approve/Reject role requests with one click

3. **New API Endpoints**
   ```
   GET  /auth/role-requests              - List role requests
   POST /auth/role-requests/{id}/approve - Approve with role assignment
   POST /auth/role-requests/{id}/reject  - Reject request
   POST /auth/upload-cert                - Upload doctor certificate
   ```

4. **Email Notifications**
   - Resend API integration
   - Emergency alerts to assigned doctors/ASHA workers
   - Beautiful HTML email templates

### New Database Tables
```sql
-- registration_requests table
CREATE TABLE public.registration_requests (
  id UUID PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT,
  role_requested TEXT CHECK (role_requested IN ('DOCTOR', 'ASHA_WORKER')),
  degree_cert_url TEXT,
  status TEXT DEFAULT 'PENDING',
  ...
);

-- degree_cert_url column in doctors table
ALTER TABLE public.doctors ADD COLUMN degree_cert_url TEXT;
```

### User Flow
```
1. User signs in with Google
         ↓
2. AuthCallback shows role selection
         ↓
3. Doctor? → Upload certificate
         ↓
4. Request saved to registration_requests (status: PENDING)
         ↓
5. Admin sees request in /admin/approvals
         ↓
6. Admin views certificate → Clicks Approve
         ↓
7. Backend creates user_profiles + doctors entry
         ↓
8. User can now access their dashboard
```

---

**Created**: November 2025  
**Updated**: December 2024  
**Version**: 2.2.0  
**Status**: ✅ Implemented
