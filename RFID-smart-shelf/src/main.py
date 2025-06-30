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
from pydantic import BaseModel
from typing import Optional

# --- Data Models ---
class JobRequest(BaseModel):
    lot_no: str
    level: str
    block: str
    place_flg: str
    trn_status: str = "1"
    timestamp: Optional[str] = None
    error: Optional[bool] = None

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

# --- API Endpoints ---

@app.post("/api/jobs")
def create_job(job: JobRequest):
    """สร้างงานใหม่ผ่าน API"""
    import time
    from datetime import datetime
    
    # สร้าง Job Object
    job_data = {
        "jobId": f"job_{int(time.time() * 1000)}",
        "lot_no": job.lot_no,
        "level": job.level,
        "block": job.block,
        "place_flg": job.place_flg,
        "trn_status": job.trn_status,
        "timestamp": job.timestamp or datetime.now().strftime("%I:%M:%S %p"),
        "error": job.error
    }
    
    return {
        "status": "success",
        "message": f"Job created for Lot {job.lot_no}",
        "job": job_data,
        "note": "ใช้ localStorage ในหน้าเว็บเพื่อจัดการงาน (Frontend-only system)"
    }

@app.get("/api/jobs")
def get_jobs():
    """ดูงานทั้งหมด (สำหรับทดสอบ)"""
    return {
        "status": "info",
        "message": "ระบบใช้ localStorage ในฝั่ง Frontend",
        "note": "เปิด Developer Tools (F12) และใช้ console: localStorage.getItem('shelfQueue')"
    }

# --- Main ---
if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting RFID Smart Shelf Server...")
    print("📱 Smart Shelf UI: http://localhost:8000")
    print("🎮 Event Simulator: http://localhost:8000/simulator")
    print("⚡ Health Check: http://localhost:8000/health")
    print("🔌 API Endpoints:")
    print("   POST http://localhost:8000/api/jobs (Create Job)")
    print("   GET  http://localhost:8000/api/jobs (List Jobs)")
    print("\n💡 หมายเหตุ: คุณสามารถเปิดไฟล์ HTML โดยตรงได้โดยไม่ต้องใช้ Server นี้")
    uvicorn.run(app, host="0.0.0.0", port=8000)