from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

import os
from .auth import router as auth_router
from .terminal import router as terminal_router
from .utils import initialize_password
from .system import router as system_router
from .files import router as files_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

initialize_password()

# ✅ 后端接口统一加前缀
app.include_router(auth_router)
app.include_router(terminal_router)
app.include_router(system_router)
app.include_router(files_router)

