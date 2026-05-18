from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from backend.app.db.database import get_db
from backend.app.db.schemas import UserRegister, UserLogin, TokenResponse, UserResponse
from backend.app.services.auth_service import register_user, login_user, get_current_user
from backend.app.db.models import User, LoginActivity
from backend.app.config.auth_config import decode_token

router   = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer()

@router.post("/register", response_model=TokenResponse)
def register(data: UserRegister, request: Request, db: Session = Depends(get_db)):
    ip = request.client.host if request.client else None
    return register_user(data, db, ip)

@router.post("/login", response_model=TokenResponse)
def login(data: UserLogin, request: Request, db: Session = Depends(get_db)):
    ip = request.client.host if request.client else None
    return login_user(data, db, ip)

@router.get("/me", response_model=UserResponse)
def get_me(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    return get_current_user(credentials.credentials, db)

@router.post("/logout")
def logout():
    return {"message": "Logged out successfully"}

def require_admin(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    payload = decode_token(credentials.credentials)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    if payload.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return payload

@router.get("/admin/users")
def get_all_users(
    admin=Depends(require_admin),
    db: Session = Depends(get_db)
):
    users = db.query(User).order_by(User.created_at.desc()).all()
    return {
        "total":       len(users),
        "farmers":     sum(1 for u in users if u.role == "farmer"),
        "agronomists": sum(1 for u in users if u.role == "agronomist"),
        "admins":      sum(1 for u in users if u.role == "admin"),
        "users": [
            {
                "id":         u.id,
                "name":       u.name,
                "email":      u.email,
                "role":       u.role,
                "created_at": str(u.created_at),
            }
            for u in users
        ]
    }

@router.get("/admin/activity")
def get_login_activity(
    admin=Depends(require_admin),
    db: Session = Depends(get_db)
):
    activities = db.query(LoginActivity)\
        .order_by(LoginActivity.created_at.desc())\
        .limit(100).all()
    return {
        "total": len(activities),
        "activity": [
            {
                "id":         a.id,
                "name":       a.name,
                "email":      a.email,
                "role":       a.role,
                "action":     a.action,
                "ip_address": a.ip_address,
                "created_at": str(a.created_at),
            }
            for a in activities
        ]
    }

@router.get("/admin/stats")
def get_stats(
    admin=Depends(require_admin),
    db: Session = Depends(get_db)
):
    from backend.app.db.models import CropPrediction, DiseasePrediction
    return {
        "total_users":               db.query(User).count(),
        "total_farmers":             db.query(User).filter(User.role=="farmer").count(),
        "total_agronomists":         db.query(User).filter(User.role=="agronomist").count(),
        "total_crop_predictions":    db.query(CropPrediction).count(),
        "total_disease_predictions": db.query(DiseasePrediction).count(),
        "total_logins":              db.query(LoginActivity).filter(LoginActivity.action=="login").count(),
        "total_registers":           db.query(LoginActivity).filter(LoginActivity.action=="register").count(),
    }