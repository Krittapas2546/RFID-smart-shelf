# main.py

import pathlib
import datetime # <--- เพิ่มบรรทัดนี้
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse # <--- แก้ไขบรรทัดนี้
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel, Field # <--- เพิ่มบรรทัดนี้
from typing import List, Tuple      # <--- เพิ่มบรรทัดนี้


# --- Pydantic Model: กำหนดโครงสร้างข้อมูลที่จะรับ ---
class ShelfData(BaseModel):
    # Field(...) ใช้สำหรับสร้างตัวอย่างข้อมูลในหน้า Docs
    # และกำหนด validation เพิ่มเติมได้
    position_stk: List[Tuple[int, int]] = Field(..., example=[[10, 20], [15, 25]])
    timestamp: str = Field(..., example=datetime.datetime.now().isoformat())


# --- Setup ---
BASE_DIR = pathlib.Path(__file__).parent.resolve()
app = FastAPI()
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))


# --- NEW POST Route: เส้นทางสำหรับรับข้อมูล Shelf ---
@app.post("/api/update_shelf")
async def receive_shelf_data(data: ShelfData):
    """
    รับข้อมูลตำแหน่ง Shelf (position_stk) และ timestamp
    ที่ถูกส่งมาจากสคริปต์ภายนอก
    """
    # เมื่อได้รับข้อมูลแล้ว เราจะแสดงผลใน Terminal ของ Pi
    print("✅ ได้รับข้อมูล Shelf ใหม่:")
    print(f"   - Timestamp: {data.timestamp}")
    print(f"   - Position STK: {data.position_stk}")

    # ส่งคำตอบกลับไปให้สคริปต์ที่เรียกมา
    return JSONResponse(
        status_code=200,
        content={
            "message": "Data received successfully",
            "received_data": data.dict()
        }
    )


# --- Routes ---

@app.get("/", response_class=HTMLResponse)
def serve_shelf_ui(request: Request):
    """
    เส้นทางหลัก: แสดงหน้า Shelf UI (shelf_ui.html)
    """
    return templates.TemplateResponse("shelf_ui.html", {"request": request})

@app.get("/test", response_class=HTMLResponse)
def serve_test_api(request: Request):
    """
    เส้นทางสำหรับทดสอบ: แสดงหน้า Test API Simulator (test_api.html)
    """
    return templates.TemplateResponse("test_api.html", {"request": request})
