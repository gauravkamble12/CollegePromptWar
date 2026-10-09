from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.user import User, UserPreference, RoleEnum
from backend.app.schemas.user import UserCreate, UserLogin, UserResponse, Token, UserPreferenceUpdate, UserPreferenceResponse
from backend.app.security.auth import hash_password, verify_password, create_access_token, get_current_user
from backend.app.security.rate_limit import rate_limit

router = APIRouter(prefix="/auth", tags=["Authentication & User"])

@router.post("/register", response_model=Token, status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(rate_limit(10, 60))])
def register(user_in: UserCreate, db: Session = Depends(get_db)):
    # Check email or username collision
    if db.query(User).filter((User.email == user_in.email) | (User.username == user_in.username)).first():
        raise HTTPException(status_code=400, detail="A user with that email or username already exists.")

    new_user = User(
        email=user_in.email,
        username=user_in.username,
        hashed_password=hash_password(user_in.password),
        full_name=user_in.full_name,
        role=RoleEnum.USER
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Initialize default preference
    pref = UserPreference(user_id=new_user.id)
    db.add(pref)
    db.commit()

    token = create_access_token({"sub": str(new_user.id), "role": new_user.role.value})
    return Token(access_token=token, token_type="bearer", user=UserResponse.model_validate(new_user))

@router.post("/login", response_model=Token,
             dependencies=[Depends(rate_limit(10, 60))])
def login(login_in: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        (User.email == login_in.email_or_username) | (User.username == login_in.email_or_username)
    ).first()

    if not user or not verify_password(login_in.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email/username or password.")

    token = create_access_token({"sub": str(user.id), "role": user.role.value})
    return Token(access_token=token, token_type="bearer", user=UserResponse.model_validate(user))

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)

@router.get("/preferences", response_model=UserPreferenceResponse)
def get_user_preferences(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    pref = db.query(UserPreference).filter(UserPreference.user_id == current_user.id).first()
    if not pref:
        pref = UserPreference(user_id=current_user.id)
        db.add(pref)
        db.commit()
        db.refresh(pref)
    return UserPreferenceResponse.model_validate(pref)

@router.put("/preferences", response_model=UserPreferenceResponse)
def update_user_preferences(
    pref_update: UserPreferenceUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    pref = db.query(UserPreference).filter(UserPreference.user_id == current_user.id).first()
    if not pref:
        pref = UserPreference(user_id=current_user.id)
        db.add(pref)

    for field, val in pref_update.model_dump(exclude_unset=True).items():
        setattr(pref, field, val)

    db.commit()
    db.refresh(pref)
    return UserPreferenceResponse.model_validate(pref)
