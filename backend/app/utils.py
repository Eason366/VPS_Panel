import bcrypt
import os
from dotenv import load_dotenv
from .config import ENV_KEY, DEFAULT_PASSWORD, ENV_FILE

# ✅ 初始加载 .env（强制覆盖）
load_dotenv(override=True)

def initialize_password():
    """初始化 .env 文件中的 HASHED_PASSWORD，如果尚未存在"""
    if os.getenv(ENV_KEY):
        return  # 已存在密码，跳过初始化

    hashed = bcrypt.hashpw(DEFAULT_PASSWORD.encode(), bcrypt.gensalt())
    lines = []
    found = False

    # 读取 .env 并替换或追加
    if os.path.exists(ENV_FILE):
        with open(ENV_FILE, "r") as f:
            for line in f:
                if line.startswith(f"{ENV_KEY}="):
                    lines.append(f"{ENV_KEY}={hashed.decode()}\n")
                    found = True
                else:
                    lines.append(line)

    if not found:
        lines.append(f"{ENV_KEY}={hashed.decode()}\n")

    with open(ENV_FILE, "w") as f:
        f.writelines(lines)

    print(f"[初始化密码] 默认密码为 '{DEFAULT_PASSWORD}'，已写入 .env 文件")

    # ✅ 强制刷新当前环境变量（确保之后读取生效）
    load_dotenv(override=True)


def verify_password(password: str) -> bool:
    """验证输入密码与 .env 中存储的哈希是否一致"""
    hashed = os.getenv(ENV_KEY, "").encode()
    if not hashed:
        return False
    return bcrypt.checkpw(password.encode(), hashed)


def update_password(new_password: str):
    """更新 .env 文件中的 HASHED_PASSWORD"""
    hashed = bcrypt.hashpw(new_password.encode(), bcrypt.gensalt())

    lines = []
    found = False
    if os.path.exists(ENV_FILE):
        with open(ENV_FILE, "r") as f:
            for line in f:
                if line.startswith(f"{ENV_KEY}="):
                    lines.append(f"{ENV_KEY}={hashed.decode()}\n")
                    found = True
                else:
                    lines.append(line)

    if not found:
        lines.append(f"{ENV_KEY}={hashed.decode()}\n")

    with open(ENV_FILE, "w") as f:
        f.writelines(lines)

    print("[修改密码] 密码已更新到 .env 文件")

    # ✅ 强制刷新当前环境变量
    load_dotenv(override=True)
