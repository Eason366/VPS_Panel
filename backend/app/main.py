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

# 跨域设置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境建议替换为前端 origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 初始化默认密码（如不存在则写入）
initialize_password()

# 路由挂载
app.include_router(auth_router)
app.include_router(terminal_router)
app.include_router(system_router)
app.include_router(files_router)

