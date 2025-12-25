"""
MatruRaksha AI - Authentication Routes
API endpoints for user authentication and authorization
"""

import logging
from typing import Optional
from fastapi import APIRouter, HTTPException, status, Depends, UploadFile, File, Form
from pydantic import BaseModel, Field, EmailStr

# Import auth service and middleware
try:
    from backend.services.auth_service import auth_service, supabase_admin
    from backend.middleware.auth import get_current_user, require_admin
except ImportError:
    from services.auth_service import auth_service, supabase_admin
    from middleware.auth import get_current_user, require_admin

logger = logging.getLogger(__name__)

# Create router
router = APIRouter(prefix="/auth", tags=["Authentication"])


# ==================== REQUEST/RESPONSE MODELS ====================

class SignUpRequest(BaseModel):
    email: str = Field(..., pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters")
    full_name: str = Field(..., min_length=1, description="Full name required")
    role: str = Field(..., pattern="^(ADMIN|DOCTOR|ASHA_WORKER)$", description="User role")
    phone: Optional[str] = None
    assigned_area: Optional[str] = None


class SignInRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshTokenRequest(BaseModel):
    refresh_token: str


class UpdateProfileRequest(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    assigned_area: Optional[str] = None
    avatar_url: Optional[str] = None


class AuthResponse(BaseModel):
    success: bool
    user: dict
    session: Optional[dict] = None
    message: Optional[str] = None

class RegisterRequest(BaseModel):
    email: str = Field(..., pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    password: str = Field(..., min_length=8, description="Password for the account")
    full_name: str = Field(..., min_length=1)
    role: str = Field(..., pattern="^(DOCTOR|ASHA_WORKER)$")
    phone: Optional[str] = None
    assigned_area: Optional[str] = None
    degree_cert_url: Optional[str] = Field(None, description="Doctor certification file URL in storage")

class RegisterRequestDecision(BaseModel):
    approved: bool
    note: Optional[str] = None


# ==================== AUTHENTICATION ENDPOINTS ====================

@router.post("/signup", response_model=AuthResponse, status_code=status.HTTP_201_CREATED)
async def sign_up(request: SignUpRequest):
    """
    Register a new user
    
    **Roles**: ADMIN, DOCTOR, ASHA_WORKER
    
    **Required fields**:
    - email: Valid email address
    - password: At least 8 characters
    - full_name: User's full name
    - role: User role (ADMIN, DOCTOR, ASHA_WORKER)
    
    **Optional fields**:
    - phone: Phone number
    - assigned_area: Assigned geographical area
    """
    try:
        result = await auth_service.sign_up(
            email=request.email,
            password=request.password,
            full_name=request.full_name,
            role=request.role,
            phone=request.phone,
            assigned_area=request.assigned_area
        )
        
        return AuthResponse(**result, message="User registered successfully")
    
    except Exception as e:
        logger.error(f"❌ Sign up error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/signin", response_model=AuthResponse)
async def sign_in(request: SignInRequest):
    """
    Sign in with email and password
    
    Returns user data and JWT tokens (access_token, refresh_token)
    """
    try:
        result = await auth_service.sign_in(
            email=request.email,
            password=request.password
        )
        
        return AuthResponse(**result, message="Signed in successfully")
    
    except Exception as e:
        logger.error(f"❌ Sign in error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )


@router.post("/signin/google")
async def sign_in_with_google():
    """
    Sign in with Google OAuth
    
    Returns OAuth URL for redirection
    """
    try:
        result = await auth_service.sign_in_with_google()
        
        return result
    
    except Exception as e:
        logger.error(f"❌ Google OAuth error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/signout")
async def sign_out(current_user: dict = Depends(get_current_user)):
    """
    Sign out current user
    
    Requires authentication
    """
    try:
        # Note: In Supabase, signout is typically handled client-side
        # This endpoint is for logging/tracking purposes
        
        logger.info(f"User signed out: {current_user.get('email')}")
        
        return {
            "success": True,
            "message": "Signed out successfully"
        }
    
    except Exception as e:
        logger.error(f"❌ Sign out error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/refresh")
async def refresh_token(request: RefreshTokenRequest):
    """
    Refresh access token using refresh token
    """
    try:
        result = await auth_service.refresh_session(request.refresh_token)
        
        return result
    
    except Exception as e:
        logger.error(f"❌ Token refresh error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )


@router.get("/me")
async def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    """
    Get current authenticated user profile
    
    Requires authentication
    """
    try:
        return {
            "success": True,
            "user": current_user
        }
    
    except Exception as e:
        logger.error(f"❌ Get profile error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch user profile"
        )


# ==================== Registration Requests (Admin Approval) ====================

@router.post("/register-request")
async def create_register_request(request: RegisterRequest):
    """
    Create a pending registration request (no account created yet)
    Roles allowed to request: DOCTOR, ASHA_WORKER
    """
    try:
        result = await auth_service.create_registration_request(
            email=request.email,
            password=request.password,
            full_name=request.full_name,
            role=request.role,
            phone=request.phone,
            assigned_area=request.assigned_area,
            degree_cert_url=request.degree_cert_url
        )
        return {"success": True, "request": result}
    except Exception as e:
        logger.error(f"❌ Register request error: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))



@router.get("/register-requests")
async def list_register_requests(current_user: dict = Depends(require_admin)):
    """List pending registration requests (Admin only)"""
    try:
        requests = await auth_service.list_registration_requests(status_filter="PENDING")
        return {"success": True, "requests": requests}
    except Exception as e:
        logger.error(f"❌ List register requests error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/register-requests/{request_id}/decision")
async def decide_register_request(request_id: int, body: RegisterRequestDecision, current_user: dict = Depends(require_admin)):
    """
    Approve or reject a registration request (Admin only)
    On approve, creates Supabase Auth user and links profile entries
    """
    try:
        if body.approved:
            result = await auth_service.approve_registration_request(request_id, reviewer_id=current_user["id"], note=body.note)
            return {"success": True, "message": "Request approved", "user": result}
        else:
            await auth_service.reject_registration_request(request_id, reviewer_id=current_user["id"], note=body.note)
            return {"success": True, "message": "Request rejected"}
    except Exception as e:
        logger.error(f"❌ Decide register request error: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# ==================== Pending OAuth Users (users with NULL role) ====================

class AssignRoleRequest(BaseModel):
    role: str = Field(..., pattern="^(ADMIN|DOCTOR|ASHA_WORKER)$")


@router.get("/pending-users")
async def list_pending_users(current_user: dict = Depends(require_admin)):
    """List users with NULL role (pending OAuth users) - Admin only"""
    try:
        # Query users where role is NULL
        # In supabase-py, use .is_() with 'null' as string
        result = supabase_admin.table("user_profiles").select("*").is_("role", "null").order("created_at", desc=True).execute()
        logger.info(f"Found {len(result.data or [])} pending users")
        return {"success": True, "users": result.data or []}
    except Exception as e:
        logger.error(f"❌ List pending users error: {e}")
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))


@router.post("/pending-users/{user_id}/assign-role")
async def assign_role_to_pending_user(
    user_id: str,
    body: AssignRoleRequest,
    current_user: dict = Depends(require_admin)
):
    """Assign a role to a pending OAuth user - Admin only"""
    try:
        # Update user_profiles with the new role
        result = supabase_admin.table("user_profiles").update({
            "role": body.role
        }).eq("id", user_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        
        user_data = result.data[0]
        
        # Also create doctor/asha_worker entry if applicable
        if body.role == "DOCTOR":
            try:
                supabase_admin.table("doctors").upsert({
                    "user_profile_id": user_id,
                    "name": user_data.get("full_name", ""),
                    "email": user_data.get("email", ""),
                    "phone": user_data.get("phone") or "",
                    "assigned_area": user_data.get("assigned_area") or "",
                    "is_active": True
                }).execute()
            except Exception as e:
                logger.warning(f"Could not create doctor entry: {e}")
        elif body.role == "ASHA_WORKER":
            try:
                supabase_admin.table("asha_workers").upsert({
                    "user_profile_id": user_id,
                    "name": user_data.get("full_name", ""),
                    "email": user_data.get("email", ""),
                    "phone": user_data.get("phone") or "",
                    "assigned_area": user_data.get("assigned_area") or "",
                    "is_active": True
                }).execute()
            except Exception as e:
                logger.warning(f"Could not create ASHA worker entry: {e}")
        
        logger.info(f"✅ Assigned role {body.role} to user {user_id}")
        return {"success": True, "message": f"Role {body.role} assigned successfully", "user": user_data}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Assign role error: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/pending-users/{user_id}")
async def reject_pending_user(user_id: str, current_user: dict = Depends(require_admin)):
    """Reject/Delete a pending OAuth user - Admin only"""
    try:
        # Delete from user_profiles
        supabase_admin.table("user_profiles").delete().eq("id", user_id).execute()
        
        # Also delete from auth.users
        try:
            supabase_admin.auth.admin.delete_user(user_id)
        except Exception as e:
            logger.warning(f"Could not delete auth user: {e}")
        
        logger.info(f"✅ Rejected/deleted pending user {user_id}")
        return {"success": True, "message": "User rejected and deleted"}
    except Exception as e:
        logger.error(f"❌ Reject pending user error: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.put("/profile")
async def update_user_profile(
    request: UpdateProfileRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Update current user profile
    
    Requires authentication
    """
    try:
        result = await auth_service.update_profile(
            user_id=current_user["id"],
            full_name=request.full_name,
            phone=request.phone,
            assigned_area=request.assigned_area,
            avatar_url=request.avatar_url
        )
        
        return result
    
    except Exception as e:
        logger.error(f"❌ Profile update error: {e}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


# ==================== ADMIN ENDPOINTS ====================

@router.get("/users")
async def get_all_users(current_user: dict = Depends(require_admin)):
    """
    Get all users (Admin only)
    
    Requires ADMIN role
    """
    try:
        # Get all users from user_profiles table
        from backend.services.supabase_service import supabase
        
        result = supabase.table("user_profiles").select("*").execute()
        
        return {
            "success": True,
            "count": len(result.data) if result.data else 0,
            "users": result.data or []
        }
    
    except Exception as e:
        logger.error(f"❌ Get users error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch users"
        )


@router.get("/users/role/{role}")
async def get_users_by_role(
    role: str,
    assigned_area: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    """
    Get users by role
    
    **Filters**:
    - role: User role (ADMIN, DOCTOR, ASHA_WORKER)
    - assigned_area: Optional area filter
    
    Requires authentication
    """
    try:
        # Validate role
        if role not in ["ADMIN", "DOCTOR", "ASHA_WORKER"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid role"
            )
        
        users = await auth_service.get_users_by_role(role, assigned_area)
        
        return {
            "success": True,
            "count": len(users),
            "users": users
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Get users by role error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch users"
        )


@router.get("/users/{user_id}")
async def get_user_by_id(
    user_id: str,
    current_user: dict = Depends(require_admin)
):
    """
    Get user by ID (Admin only)
    
    Requires ADMIN role
    """
    try:
        from backend.services.supabase_service import supabase
        
        result = supabase.table("user_profiles").select("*").eq("id", user_id).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return {
            "success": True,
            "user": result.data[0]
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Get user error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch user"
        )


@router.put("/users/{user_id}/activate")
async def activate_user(
    user_id: str,
    current_user: dict = Depends(require_admin)
):
    """
    Activate user account (Admin only)
    
    Requires ADMIN role
    """
    try:
        from backend.services.supabase_service import supabase
        
        result = supabase.table("user_profiles").update({
            "is_active": True
        }).eq("id", user_id).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return {
            "success": True,
            "message": "User activated successfully"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Activate user error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to activate user"
        )


@router.put("/users/{user_id}/deactivate")
async def deactivate_user(
    user_id: str,
    current_user: dict = Depends(require_admin)
):
    """
    Deactivate user account (Admin only)
    
    Requires ADMIN role
    """
    try:
        from backend.services.supabase_service import supabase
        
        result = supabase.table("user_profiles").update({
            "is_active": False
        }).eq("id", user_id).execute()
        
        if not result.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        
        return {
            "success": True,
            "message": "User deactivated successfully"
        }
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Deactivate user error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to deactivate user"
        )
# ==================== File Upload (Doctor Certification) ====================

@router.post("/upload-cert")
async def upload_certification(file: UploadFile = File(...), email: str = Form(...)):
    """Upload doctor certification file to Supabase Storage (service role)"""
    try:
        content = await file.read()
        safe_email = email.replace('@', '_').replace(':', '_')
        path = f"certifications/{safe_email}_{int(__import__('time').time())}_{file.filename}"
        resp = supabase_admin.storage.from_("certifications").upload(path, content, {
            "content-type": file.content_type or "application/octet-stream",
            "x-upsert": "true"
        })
        pub = supabase_admin.storage.from_("certifications").get_public_url(path)
        return {"success": True, "path": path, "public_url": pub}
    except Exception as e:
        logger.error(f"❌ Upload certification error: {e}")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


# ==================== Role-Based Registration Requests ====================

class RoleRequestDecision(BaseModel):
    role: Optional[str] = None
    reason: Optional[str] = None


@router.get("/role-requests")
async def list_role_requests(current_user: dict = Depends(require_admin)):
    """List all pending role-based registration requests (from AuthCallback flow)"""
    try:
        result = supabase_admin.table("registration_requests").select("*").order("created_at", desc=True).execute()
        return {"success": True, "requests": result.data or []}
    except Exception as e:
        logger.error(f"❌ List role requests error: {e}")
        # If table doesn't exist, return empty list
        return {"success": True, "requests": []}


@router.post("/role-requests/{request_id}/approve")
async def approve_role_request(request_id: str, body: RoleRequestDecision, current_user: dict = Depends(require_admin)):
    """Approve a role-based registration request and assign role to user"""
    try:
        # Get the request
        req_result = supabase_admin.table("registration_requests").select("*").eq("id", request_id).single().execute()
        if not req_result.data:
            raise HTTPException(status_code=404, detail="Request not found")
        
        request = req_result.data
        email = request["email"]
        role = body.role or request["role_requested"]
        
        # Find user by email in user_profiles
        profile_result = supabase_admin.table("user_profiles").select("*").eq("email", email).execute()
        
        if profile_result.data:
            # Update existing profile with role
            user_id = profile_result.data[0]["id"]
            supabase_admin.table("user_profiles").update({
                "role": role,
                "is_active": True
            }).eq("email", email).execute()
        else:
            # Try to find user in auth.users by email and create profile
            # For now, create profile without auth link - admin can update later
            user_id = None
            logger.warning(f"No user_profile found for email {email}, creating doctor/asha record only")
        
        # Create doctor/asha record if needed
        if role == "DOCTOR":
            existing = supabase_admin.table("doctors").select("id").eq("email", email).execute()
            if not existing.data:
                supabase_admin.table("doctors").insert({
                    "email": request["email"],
                    "name": request.get("full_name") or request["email"].split("@")[0],
                    "is_active": True,
                    "degree_cert_url": request.get("degree_cert_url")
                }).execute()
            else:
                # Update existing doctor
                supabase_admin.table("doctors").update({
                    "name": request.get("full_name") or request["email"].split("@")[0],
                    "is_active": True,
                    "degree_cert_url": request.get("degree_cert_url")
                }).eq("email", email).execute()
        elif role == "ASHA_WORKER":
            existing = supabase_admin.table("asha_workers").select("id").eq("email", email).execute()
            if not existing.data:
                supabase_admin.table("asha_workers").insert({
                    "email": request["email"],
                    "name": request.get("full_name") or request["email"].split("@")[0],
                    "is_active": True
                }).execute()
            else:
                # Update existing asha worker
                supabase_admin.table("asha_workers").update({
                    "name": request.get("full_name") or request["email"].split("@")[0],
                    "is_active": True
                }).eq("email", email).execute()
        
        # Update request status
        supabase_admin.table("registration_requests").update({
            "status": "APPROVED",
            "reviewed_by": current_user.get("id"),
            "reviewed_at": "now()"
        }).eq("id", request_id).execute()
        
        logger.info(f"✅ Approved role request {request_id} - User {user_id} assigned role {role}")
        return {"success": True, "message": f"User approved as {role}"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Approve role request error: {e}")
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/role-requests/{request_id}/reject")
async def reject_role_request(request_id: str, body: RoleRequestDecision, current_user: dict = Depends(require_admin)):
    """Reject a role-based registration request"""
    try:
        # Update request status
        result = supabase_admin.table("registration_requests").update({
            "status": "REJECTED",
            "reviewed_by": current_user.get("id"),
            "reviewed_at": "now()",
            "rejection_reason": body.reason
        }).eq("id", request_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="Request not found")
        
        logger.info(f"✅ Rejected role request {request_id}")
        return {"success": True, "message": "Request rejected"}
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"❌ Reject role request error: {e}")
        raise HTTPException(status_code=400, detail=str(e))
