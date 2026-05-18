from sqlalchemy.orm import Session
from backend.app.db.models import User, LoginActivity
from backend.app.db.schemas import UserRegister, UserLogin, TokenResponse, UserResponse
from backend.app.config.auth_config import hash_password, verify_password, create_token
from backend.app.db.database import engine, Base
from fastapi import HTTPException

# ── Ensure all tables exist ──
Base.metadata.create_all(bind=engine)

def log_activity(db: Session, user: User, action: str, ip: str = None):
    try:
        activity = LoginActivity(
            user_id    = user.id,
            name       = user.name,
            email      = user.email,
            role       = user.role,
            action     = action,
            ip_address = ip
        )
        db.add(activity)
        db.commit()
    except Exception as e:
        print(f"Activity log error (non-critical): {e}")
        db.rollback()

def register_user(data: UserRegister, db: Session, ip: str = None) -> TokenResponse:
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    if data.role not in ["farmer", "agronomist", "admin"]:
        raise HTTPException(status_code=400, detail="Role must be farmer, agronomist or admin")

    user = User(
        name     = data.name,
        email    = data.email,
        password = hash_password(data.password),
        role     = data.role
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    log_activity(db, user, "register", ip)

    token = create_token({
        "sub":   str(user.id),
        "email": user.email,
        "name":  user.name,
        "role":  user.role
    })

    return TokenResponse(
        access_token = token,
        token_type   = "bearer",
        user         = UserResponse(
            id    = user.id,
            name  = user.name,
            email = user.email,
            role  = user.role
        )
    )

def login_user(data: UserLogin, db: Session, ip: str = None) -> TokenResponse:
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    if not verify_password(data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    log_activity(db, user, "login", ip)

    token = create_token({
        "sub":   str(user.id),
        "email": user.email,
        "name":  user.name,
        "role":  user.role
    })

    return TokenResponse(
        access_token = token,
        token_type   = "bearer",
        user         = UserResponse(
            id    = user.id,
            name  = user.name,
            email = user.email,
            role  = user.role
        )
    )

def get_current_user(token: str, db: Session) -> UserResponse:
    from backend.app.config.auth_config import decode_token

    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user = db.query(User).filter(User.id == int(payload["sub"])).first()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    return UserResponse(
        id    = user.id,
        name  = user.name,
        email = user.email,
        role  = user.role
    )