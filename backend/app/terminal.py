from fastapi import WebSocket, APIRouter
from .config import ROOT_DIR

import asyncio, os, pty

router = APIRouter()

@router.websocket("/ws/terminal")
async def terminal_websocket(websocket: WebSocket):
    await websocket.accept()
    HOME_PATH = ROOT_DIR

    pid, fd = pty.fork()
    if pid == 0:
        os.chdir(HOME_PATH)
        os.execvp("bash", ["bash"])
    else:
        loop = asyncio.get_event_loop()

        async def read_output():
            while True:
                try:
                    data = await loop.run_in_executor(None, os.read, fd, 1024)
                    await websocket.send_bytes(data)  # ✅ 保留原始控制字符
                except Exception:
                    break

        reader = asyncio.create_task(read_output())

        try:
            while True:
                data = await websocket.receive_bytes()  # ✅ 接收原始字符
                os.write(fd, data)
        except Exception:
            pass
        finally:
            reader.cancel()
            os.close(fd)
