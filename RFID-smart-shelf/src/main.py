"""
RFID Smart Shelf System - Simple FastAPI Server (Optional)

⚠️  หมายเหตุ: ไฟล์นี้เป็น LEGACY CODE ไม่จำเป็นต้องใช้แล้ว
    ระบบปัจจุบันใช้ Frontend-only (เปิดไฟล์ HTML โดยตรง)
    
    หากต้องการใช้ FastAPI Server ให้รันคำสั่ง:
    uvicorn main:app --reload
    แล้วเข้าไปที่ http://localhost:8000
"""

import pathlib
from fastapi import FastAPI, Request, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel, Field
from typing import Optional, List
import json
import time

# --- Connection Manager for WebSockets ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

# --- In-Memory Database (Single Source of Truth) ---
# นี่คือ "ฐานข้อมูลจำลอง" ที่จะเก็บสถานะทั้งหมดของระบบ
# เมื่อ Server รีสตาร์ท ข้อมูลจะหายไป (เหมาะสำหรับการพัฒนา)
DB = {
    "jobs": [],
    "shelf_state": [[r, c, 0] for r in range(1, 5) for c in range(1, 7)], # [level, block, hasItem]
    "job_counter": 0 # <<<< เพิ่มตัวนับ Job
}

# --- Helper Functions ---
def get_job_by_id(job_id: str):
    return next((job for job in DB["jobs"] if job.get("jobId") == job_id), None)

def update_shelf_state(level: int, block: int, has_item: int):
    for i, cell in enumerate(DB["shelf_state"]):
        if cell[0] == level and cell[1] == block:
            DB["shelf_state"][i][2] = has_item
            return

# --- Data Models ---
class JobRequest(BaseModel):
    lot_no: str
    level: str
    block: str
    place_flg: str
    trn_status: str = "1"
    timestamp: Optional[str] = None
    error: Optional[dict] = None

class ErrorRequest(BaseModel):
    errorLocation: dict

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

# --- WebSocket Endpoint ---
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    # เมื่อมี Client เชื่อมต่อเข้ามาใหม่ ให้ส่งสถานะล่าสุดทั้งหมดไปให้ทันที
    initial_state = {"type": "initial_state", "payload": DB}
    await websocket.send_text(json.dumps(initial_state))
    try:
        while True:
            await websocket.receive_text() # Keep connection alive
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# --- API Endpoints (สำหรับ Simulator) ---

@app.get("/api/jobs")
def get_all_jobs():
    """ส่งข้อมูล Jobs ทั้งหมดในคิว"""
    return {"jobs": DB["jobs"]}

@app.get("/api/shelf/state")
def get_shelf_state():
    """ส่งข้อมูล Shelf State ทั้งหมด"""
    return {"shelf_state": DB["shelf_state"]}

@app.post("/api/jobs", status_code=201)
async def create_job_via_api(job: JobRequest):
    """รับ Job ใหม่จาก Simulator และ Broadcast"""
    print(f"API: Received new job for Lot {job.lot_no}")
    new_job = job.dict()
    
    # --- เปลี่ยนมาใช้ Counter ---
    DB["job_counter"] += 1 # เพิ่มค่าตัวนับก่อน
    new_job["jobId"] = f"job_{DB['job_counter']}" # สร้าง jobId ใหม่
    # -------------------------

    DB["jobs"].append(new_job)
    await manager.broadcast(json.dumps({"type": "new_job", "payload": new_job}))
    return {"status": "success", "job_data": new_job}

@app.post("/api/jobs/{job_id}/complete")
async def complete_job(job_id: str):
    """รับ Event 'Task Complete' และ Broadcast"""
    print(f"API: Received 'Task Complete' for job {job_id}")
    job = get_job_by_id(job_id)
    if not job:
        return {"status": "error", "message": "Job not found"}
    
    # อัปเดต Shelf State
    has_item = 1 if job["place_flg"] == "1" else 0
    update_shelf_state(int(job["level"]), int(job["block"]), has_item)
    
    # ลบ Job ออกจากคิว
    DB["jobs"] = [j for j in DB["jobs"] if j.get("jobId") != job_id]
    
    await manager.broadcast(json.dumps({
        "type": "job_completed", 
        "payload": {"completedJobId": job_id, "shelf_state": DB["shelf_state"]}
    }))
    return {"status": "success"}

@app.post("/api/jobs/{job_id}/error")
async def error_job(job_id: str, body: ErrorRequest):
    """รับ Event 'Wrong Pick' และ Broadcast"""
    print(f"API: Received 'Error' for job {job_id}")
    job = get_job_by_id(job_id)
    if not job:
        return {"status": "error", "message": "Job not found"}
        
    job["trn_status"] = "2" # Error
    job["error"] = True
    job["errorLocation"] = body.errorLocation
    
    await manager.broadcast(json.dumps({"type": "job_error", "payload": job}))
    return {"status": "success"}

@app.post("/api/system/reset")
async def reset_system():
    """รีเซ็ตระบบทั้งหมด และ Broadcast"""
    print("API: Received 'System Reset'")
    DB["jobs"] = []
    DB["shelf_state"] = [[r, c, 0] for r in range(1, 5) for c in range(1, 7)]
    DB["job_counter"] = 0 # <<<< รีเซ็ตตัวนับ
    await manager.broadcast(json.dumps({"type": "system_reset"}))
    return {"status": "success"}

# --- Main ---
if __name__ == "__main__":
    import uvicorn
    print("🚀 Starting RFID Smart Shelf Server...")
    print("📱 Smart Shelf UI: http://localhost:8000")
    print("🎮 Event Simulator: http://localhost:8000/simulator")
    print("⚡ Health Check:   http://localhost:8000/health")
    print("📦 API Endpoint:   POST http://localhost:8000/api/jobs")
    print("🔌 WebSocket:      ws://localhost:8000/ws")
    uvicorn.run(app, host="127.0.0.1", port=8000)