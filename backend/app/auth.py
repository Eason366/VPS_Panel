from fastapi import APIRouter, Header, UploadFile, File, Form
from datetime import datetime, timedelta
from jose import jwt, JWTError

from .models import LoginRequest, ChangePasswordRequest
from .utils import verify_password, update_password
from .config import SECRET_KEY, ALGORITHM, TOKEN_EXPIRE_MINUTES, AVATAR_DIR

import os

router = APIRouter()

@router.post("/api/login")
async def login(request: LoginRequest):
    if verify_password(request.password):
        expire = datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRE_MINUTES)
        token = jwt.encode({"exp": expire}, SECRET_KEY, algorithm=ALGORITHM)
        return {"success": True, "token": token}
    else:
        return {"success": False, "message": "密码错误"}

@router.post("/api/change-password")
async def change_password(request: ChangePasswordRequest):
    if not verify_password(request.old_password):
        return {"success": False, "message": "原密码错误"}
    update_password(request.new_password)
    return {"success": True}

@router.get("/api/verify")
async def verify_token(authorization: str = Header(...)):
    try:
        token = authorization.replace("Bearer ", "")
        jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return {"valid": True}
    except JWTError:
        return {"valid": False}
    

