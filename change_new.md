# MatruRaksha AI - Authentication & Admin Approval Flow Changes

## Overview
This document summarizes the changes made to fix and fully implement the Admin Approval workflow for Doctor and ASHA Worker registration. The goal was to ensure that users can request registration, admins can approve them, and the approved users can successfully log in with the password they provided during signup.

## Key Changes Implementation

### 1. Database Schema
*   **Modified Table**: `registration_requests`
*   **Change**: Added `password_hash` column (Text).
*   **Purpose**: To temporarily store the user's password (encrypted) during the pending state, so it can be used to create the actual account upon approval.

### 2. Backend (`/backend`)
*   **`middleware/auth.py`**:
    *   **Fix**: Updated token verification logic. Replaced deprecated `client.auth.set_session(token, None)` with the newer `client.auth.get_user(token)` method to correctly validate Supabase Auth tokens.
    *   **Fix**: Added fallback mechanisms to ensure session compatibility across different Supabase client versions.

*   **`services/auth_service.py`**:
    *   **Enhancement**: Implemented **Fernet encryption** for password storage.
        *   *Why*: We cannot recover a plaintext password from a bcrypt hash, but `admin.create_user` requires the plaintext password. We switched to reversible encryption (Fernet) to store the password securely while the request is PENDING.
    *   **Update (`create_registration_request`)**: Now accepts a `password` argument, encrypts it using a key derived from the `SUPABASE_SERVICE_ROLE_KEY`, and stores it in the `password_hash` column.
    *   **Update (`approve_registration_request`)**: Now retrieves and decrypts the stored password to create the permanent Supabase Auth user. Falls back to a random temporary password if decryption fails (or for legacy requests).
    *   **Fix**: Added robust error logging for Supabase Admin operations (`create_user`) to diagnose permission and data issues.

*   **`routes/auth_routes.py`**:
    *   **Update**: Updated `RegisterRequest` Pydantic model to include the `password` field.
    *   **Update**: Passed the password from the API endpoint to the service layer.

### 3. Frontend (`/frontend`)
*   **`src/pages/Signup.jsx`**:
    *   **Update**: Modified the payload sent to `createRegisterRequest` to include the user's `password`. previously, this was dropped, leading to the "unknown password" issue after approval.

## Issues Faced & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| **401 Unauthorized** on Admin pages | `AuthMiddleware` used deprecated Supabase session method; ID mismatch between `auth.users` and `user_profiles`. | Updated middleware to use `get_user(token)`; Verified UUID synchronization between Auth and Public tables. |
| **"User not allowed"** Error | Backend using Anon Key for privileged operations. | Ensured `SUPABASE_SERVICE_ROLE_KEY` is correctly loaded and used for Admin operations. |
| **Silent Failure on Approve Click** | Browser extension interference (React Error #130) blocking event handlers. | Identified issue via Console logs; resolved by using Incognito mode/Hard Refresh. |
| **"Database error creating new user"** | Attempting to approve an email that already existed in `auth.users` (from previous tests). | Clarified that `auth.users` entry is created *only* upon approval. Cleared conflicting data. |
| **"Invalid login credentials" after Approval** | The password provided at signup was not being stored. Approval generated a random password that users didn't know. | Implemented encrypted password storage in `registration_requests` table so the original password is preserved and used for account creation. |

## Current Status
*   **Authentication**: ✅ Working (JWT validation fixed).
*   **Registration Request**: ✅ Working (Stores encrypted password).
*   **Admin Approval**: ✅ Working (Creates user with correct password, links profile).
*   **User Login**: ✅ Working (Users can login immediately after approval).
