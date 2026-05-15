from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from backend.app.db.database import get_db
from backend.app.db.schemas import UserRegister, UserLogin, TokenResponse, UserResponse
from backend.app.services.auth_service import register_user, login_user, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

@router.post("/register", response_model=TokenResponse)
def register(data: UserRegister, db: Session = Depends(get_db)):
    """Register a new farmer or agronomist account."""
    return register_user(data, db)

@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin, db: Session = Depends(get_db)):
    """Login with email and password — returns JWT token."""
    return login_user(data, db)

@router.get("/me", response_model=UserResponse)
def get_me(
    token: str = Depends(oauth2_scheme),
    db:    Session = Depends(get_db)
):
    """Get current logged-in user profile."""
    return get_current_user(token, db)

@router.post("/logout")
def logout():
    """Logout — client should delete the token."""
    return {"message": "Logged out successfully"}