"""
RFID Smart Shelf System - Simple FastAPI Server (Optional)

⚠️  หมายเหตุ: ไฟล์นี้เป็น LEGACY CODE ไม่จำเป็นต้องใช้แล้ว
    ระบบปัจจุบันใช้ Frontend-only (เปิดไฟล์ HTML โดยตรง)
    
    หากต้องการใช้ FastAPI Server ให้รันคำสั่ง:
    uvicorn main:app --reload
    แล้วเข้าไปที่ http://localhost:8000
"""

import pathlib
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

# --- Setup ---
BASE_DIR = pathlib.Path(__file__).parent.resolve()
app = FastAPI(
    title="RFID Smart Shelf API",
    description="Simple server for serving HTML files and API endpoints",
    version="1.0.0"
)
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))

# --- Routes ---

@app.get("/", response_class=HTMLResponse)
def serve_shelf_ui(request: Request):
    """แสดงหน้า Smart Shelf UI"""
    return templates.TemplateResponse("shelf_ui.html", {"request": request})

@app.get("/simulator", response_class=HTMLResponse)
def serve_simulator(request: Request):
    """แสดงหน้า Event Simulator"""
    return templates.TemplateResponse("test_api.html", {"request": request})

@app.get("/health")
def health_check():
    """API Health Check"""
    return {"status": "ok", "message": "RFID Smart Shelf Server is running"}

# --- Main ---
if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting RFID Smart Shelf Server...")
    print("📱 Smart Shelf UI: http://localhost:8000")
    print("🎮 Event Simulator: http://localhost:8000/simulator")
    print("⚡ Health Check: http://localhost:8000/health")
    print("\n💡 หมายเหตุ:ไม่ต้องรัน server")
    uvicorn.run(app, host="127.0.0.1", port=8000)