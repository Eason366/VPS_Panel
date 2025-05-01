from pydantic import BaseModel

class LoginRequest(BaseModel):
    password: str

class ChangePasswordRequest(BaseModel):
    old_password: str
    new_password: str
