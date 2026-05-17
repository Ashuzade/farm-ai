from sqlalchemy.orm import Session
from backend.app.db.models import User
from backend.app.db.schemas import UserRegister, UserLogin, TokenResponse, UserResponse
from backend.app.config.auth_config import hash_password, verify_password, create_token
from fastapi import HTTPException

def register_user(data: UserRegister, db: Session) -> TokenResponse:
    # Check if email already exists
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Validate role
    if data.role not in ["farmer", "agronomist", "admin"]:
        raise HTTPException(status_code=400, detail="Role must be farmer, agronomist or admin")
    
    # Hash password and save user
    user = User(
        name     = data.name,
        email    = data.email,
        password = hash_password(data.password),
        role     = data.role
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Create JWT token
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

def login_user(data: UserLogin, db: Session) -> TokenResponse:
    # Find user by email
    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Verify password
    if not verify_password(data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    # Create JWT token
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
    from fastapi import HTTPException

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