from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates
import json
import pathlib

# --- Import จากไฟล์ที่เราสร้างขึ้น ---
from core.models import JobRequest, ErrorRequest
from core.database import DB, get_job_by_id, update_shelf_state, get_lot_in_position
from api.websockets import manager # <-- import manager มาจากที่ใหม่

router = APIRouter() # <-- สร้าง router สำหรับไฟล์นี้
templates = Jinja2Templates(directory=str(pathlib.Path(__file__).parent.parent / "templates"))

# --- Routes ---
@router.get("/", response_class=HTMLResponse, include_in_schema=False)
def serve_shelf_ui(request: Request):
    return templates.TemplateResponse("shelf_ui.html", {"request": request})

@router.get("/simulator", response_class=HTMLResponse, include_in_schema=False)
def serve_simulator(request: Request):
    return templates.TemplateResponse("test_api.html", {"request": request})

@router.get("/health", tags=["System"])
def health_check():
    return {"status": "ok", "message": "RFID Smart Shelf Server is running"}

@router.get("/api/jobs", tags=["Jobs"])
def get_all_jobs():
    return {"jobs": DB["jobs"]}

@router.get("/api/shelf/state", tags=["Jobs"])
def get_shelf_state():
    return {"shelf_state": DB["shelf_state"]}

@router.get("/api/shelf/position/{level}/{block}", tags=["Jobs"])
def get_position_info(level: int, block: int):
    """ดึงข้อมูลของช่องเฉพาะ (level, block)"""
    lot_no = get_lot_in_position(level, block)
    has_item = 1 if lot_no else 0
    
    return {
        "level": level,
        "block": block, 
        "has_item": has_item,
        "lot_no": lot_no,
        "message": f"Position L{level}B{block}: {'Has ' + lot_no if lot_no else 'Empty'}"
    }

@router.get("/api/shelf/lots", tags=["Jobs"])  
def get_all_lots_in_shelf():
    """ดึงรายการ Lot ทั้งหมดที่อยู่ในชั้นวาง"""
    lots_info = []
    for level, block, has_item, lot_no in DB["shelf_state"]:
        if has_item and lot_no:
            lots_info.append({
                "level": level,
                "block": block,
                "lot_no": lot_no
            })
    
    return {
        "total_lots": len(lots_info),
        "lots": lots_info
    }

@router.post("/api/jobs", status_code=201, tags=["Jobs"])
async def create_job_via_api(job: JobRequest):
    # --- ตรวจสอบ Lot ซ้ำ ---
    existing_lot = next((j for j in DB["jobs"] if j.get("lot_no") == job.lot_no), None)
    if existing_lot:
        print(f"API: Rejected duplicate job for Lot {job.lot_no}")
        return {"status": "error", "message": f"Job for lot {job.lot_no} already exists in the queue."}
    
    print(f"API: Received new job for Lot {job.lot_no}")
    new_job = job.dict()
    DB["job_counter"] += 1
    new_job["jobId"] = f"job_{DB['job_counter']}"
    DB["jobs"].append(new_job)
    await manager.broadcast(json.dumps({"type": "new_job", "payload": new_job}))
    return {"status": "success", "job_data": new_job}

@router.post("/api/jobs/{job_id}/complete", tags=["Jobs"])
async def complete_job(job_id: str):
    print(f"API: Received 'Task Complete' for job {job_id}")
    job = get_job_by_id(job_id)
    if not job: return {"status": "error", "message": "Job not found"}
    
    has_item = 1 if job["place_flg"] == "1" else 0
    lot_no = job["lot_no"] if has_item == 1 else None  # <-- ถ้าเป็นการวาง ให้เก็บ lot_no, ถ้าเป็นการหยิบ ให้ลบ lot_no
    
    # อัปเดต shelf_state พร้อมกับ lot_no
    update_shelf_state(int(job["level"]), int(job["block"]), has_item, lot_no)
    DB["jobs"] = [j for j in DB["jobs"] if j.get("jobId") != job_id]
    
    await manager.broadcast(json.dumps({
        "type": "job_completed", 
        "payload": {"completedJobId": job_id, "shelf_state": DB["shelf_state"]}
    }))
    return {"status": "success"}

@router.post("/api/jobs/{job_id}/error", tags=["Jobs"])
async def error_job(job_id: str, body: ErrorRequest):
    print(f"API: Received 'Error' for job {job_id}")
    job = get_job_by_id(job_id)
    if not job: return {"status": "error", "message": "Job not found"}
        
    job["trn_status"] = "2"
    job["error"] = True
    job["errorLocation"] = body.errorLocation
    
    await manager.broadcast(json.dumps({"type": "job_error", "payload": job}))
    return {"status": "success"}

@router.post("/api/system/reset", tags=["System"])
async def reset_system():
    print("API: Received 'System Reset'")
    DB["jobs"] = []
    # เปลี่ยนจาก [r, c, 0] เป็น [r, c, 0, None] เพื่อให้สอดคล้องกับโครงสร้างใหม่
    DB["shelf_state"] = [[r, c, 0, None] for r in range(1, 5) for c in range(1, 7)]
    DB["job_counter"] = 0
    await manager.broadcast(json.dumps({"type": "system_reset"}))
    return {"status": "success"}

@router.get("/api/shelf/occupied", tags=["Jobs"])
def get_occupied_positions():
    """ดึงข้อมูลเฉพาะช่องที่มีของอยู่ในชั้นวาง"""
    occupied_positions = []
    
    for level, block, has_item, lot_no in DB["shelf_state"]:
        if has_item:  # ถ้าช่องนี้มีของ
            occupied_positions.append({
                "position": f"L{level}B{block}",
                "level": level,
                "block": block,
                "lot_no": lot_no or "Unknown"  # ถ้าไม่มี lot_no ให้แสดง "Unknown"
            })
    
    return {
        "total_occupied": len(occupied_positions),
        "occupied_positions": occupied_positions
    }

@router.get("/api/shelf/summary", tags=["Jobs"])
def get_shelf_summary():
    """ดึงสรุปข้อมูลชั้นวางทั้งหมด"""
    total_positions = len(DB["shelf_state"])
    occupied_count = 0
    empty_count = 0
    occupied_list = []
    
    for level, block, has_item, lot_no in DB["shelf_state"]:
        if has_item:
            occupied_count += 1
            occupied_list.append({
                "position": f"L{level}B{block}",
                "lot_no": lot_no or "Unknown"
            })
        else:
            empty_count += 1
    
    return {
        "summary": {
            "total_positions": total_positions,
            "occupied": occupied_count,
            "empty": empty_count,
            "occupancy_rate": f"{(occupied_count/total_positions)*100:.1f}%"
        },
        "occupied_details": occupied_list
    }