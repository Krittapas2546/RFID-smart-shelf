import pathlib
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
# --- Setup ---
# ตรวจสอบให้แน่ใจว่า path นี้ถูกต้องตามโครงสร้างโปรเจกต์ของคุณ
# (ไฟล์ main.py อยู่ใน src/ และไฟล์ templates อยู่ใน src/templates/)
BASE_DIR = pathlib.Path(__file__).parent.resolve()
app = FastAPI()
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))

# --- Routes ---

@app.get("/", response_class=HTMLResponse)
def serve_shelf_ui(request: Request):
    """
    เส้นทางหลัก: แสดงหน้า Shelf UI (shelf_ui.html)
    หน้านี้จะรอรับข้อมูลจาก localStorage ที่ถูกส่งมาจากหน้า /test
    """
    return templates.TemplateResponse("shelf_ui.html", {"request": request})

@app.get("/test", response_class=HTMLResponse)
def serve_test_api(request: Request):
    """
    เส้นทางสำหรับทดสอบ: แสดงหน้า Test API Simulator (test_api.html)
    """
    return templates.TemplateResponse("test_api.html", {"request": request})