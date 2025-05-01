from fastapi import APIRouter, HTTPException, Query
from fastapi import UploadFile, File, Form
from fastapi.responses import FileResponse
import zipfile
import tempfile
from pydantic import BaseModel
from typing import List
import os
import mimetypes
import time
import shutil
from .config import ROOT_DIR

router = APIRouter()

BASE_DIR = ROOT_DIR

def safe_join(base, *paths):
    final = os.path.abspath(os.path.join(base, *paths))
    if not final.startswith(base):
        raise HTTPException(status_code=400, detail="非法路径")
    return final

@router.get("/api/files")
def list_files(path: str = ""):
    abs_path = safe_join(BASE_DIR, path)

    if not os.path.exists(abs_path):
        raise HTTPException(status_code=404, detail="路径不存在")

    items = []
    for name in os.listdir(abs_path):
        full_path = os.path.join(abs_path, name)
        is_dir = os.path.isdir(full_path)
        stat = os.stat(full_path)

        items.append({
            "name": name,
            "is_dir": is_dir,
            "size": stat.st_size,
            "modified": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(stat.st_mtime)),
            "type": "folder" if is_dir else mimetypes.guess_type(name)[0] or "file"
        })

    return {
        "current": path,
        "parent": os.path.dirname(path) if path else None,
        "items": items
    }

@router.post("/api/upload")
async def upload_file(file: UploadFile = File(...), path: str = Form("")):
    upload_dir = safe_join(BASE_DIR, path)
    os.makedirs(upload_dir, exist_ok=True)

    file_path = os.path.join(upload_dir, file.filename)
    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    return {"success": True, "filename": file.filename}

@router.get("/api/download")
def download_file(path: str = Query(...)):
    abs_path = safe_join(BASE_DIR, path)
    if not os.path.exists(abs_path):
        raise HTTPException(status_code=404, detail="路径不存在")

    if os.path.isfile(abs_path):
        return FileResponse(abs_path, filename=os.path.basename(abs_path))

    # 是文件夹：压缩后返回
    with tempfile.NamedTemporaryFile(suffix=".zip", delete=False) as tmp:
        zip_path = tmp.name
        with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zipf:
            for root, _, files in os.walk(abs_path):
                for file in files:
                    file_path = os.path.join(root, file)
                    arcname = os.path.relpath(file_path, abs_path)
                    zipf.write(file_path, arcname)
        return FileResponse(zip_path, filename=os.path.basename(abs_path) + ".zip")


@router.get("/api/file/info")
def get_file_info(path: str = Query(...)):
    abs_path = safe_join(BASE_DIR, path)
    if not os.path.exists(abs_path):
        raise HTTPException(status_code=404, detail="文件不存在")

    stat = os.stat(abs_path)
    return {
        "name": os.path.basename(abs_path),
        "is_dir": os.path.isdir(abs_path),
        "size": stat.st_size,
        "modified": time.strftime("%Y-%m-%d %H:%M:%S", time.localtime(stat.st_mtime)),
        "path": path
    }


@router.get("/api/file/read")
def read_file(path: str = Query(...)):
    abs_path = safe_join(BASE_DIR, path)
    if not os.path.isfile(abs_path):
        raise HTTPException(status_code=404, detail="文件不存在")
    
    try:
        with open(abs_path, "r", encoding="utf-8") as f:
            content = f.read()
        return {"content": content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class SaveRequest(BaseModel):
    path: str
    content: str

@router.post("/api/file/save")
def save_file(req: SaveRequest):
    abs_path = safe_join(BASE_DIR, req.path)
    if not os.path.isfile(abs_path):
        raise HTTPException(status_code=404, detail="文件不存在")
    
    try:
        with open(abs_path, "w", encoding="utf-8") as f:
            f.write(req.content)
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class DeleteRequest(BaseModel):
    path: str

@router.post("/api/file/delete")
def delete_path(req: DeleteRequest):
    abs_path = safe_join(BASE_DIR, req.path)

    if not os.path.exists(abs_path):
        raise HTTPException(status_code=404, detail="路径不存在")
    
    try:
        if os.path.isdir(abs_path):
            shutil.rmtree(abs_path)
        else:
            os.remove(abs_path)
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class CreateRequest(BaseModel):
    path: str
    type: str  # "file" or "folder"

@router.post("/api/file/create")
def create_path(req: CreateRequest):
    abs_path = safe_join(BASE_DIR, req.path)

    if os.path.exists(abs_path):
        raise HTTPException(status_code=400, detail="已存在")

    try:
        if req.type == "folder":
            os.makedirs(abs_path, exist_ok=True)
        elif req.type == "file":
            with open(abs_path, "w", encoding="utf-8") as f:
                f.write("")
        else:
            raise HTTPException(status_code=400, detail="不支持的类型")
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

