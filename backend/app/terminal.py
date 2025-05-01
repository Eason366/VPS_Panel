from fastapi import WebSocket, APIRouter
import asyncio, os, pty

router = APIRouter()

@router.websocket("/ws/terminal")
async def terminal_websocket(websocket: WebSocket):
    await websocket.accept()
    # 你希望进入的初始目录
    HOME_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../../"))
    
    pid, fd = pty.fork()
    if pid == 0:
        os.chdir(HOME_PATH)
        os.execvp("zsh", ["zsh"])
    else:
        loop = asyncio.get_event_loop()

        async def read_output():
            while True:
                try:
                    data = await loop.run_in_executor(None, os.read, fd, 1024)
                    await websocket.send_text(data.decode(errors="ignore"))
                except:
                    break

        reader = asyncio.create_task(read_output())

        try:
            while True:
                data = await websocket.receive_text()
                os.write(fd, data.encode())
        except:
            pass
        finally:
            reader.cancel()
            os.close(fd)
