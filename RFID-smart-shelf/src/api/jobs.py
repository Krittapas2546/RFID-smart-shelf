from fastapi import APIRouter, Request
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.templating import Jinja2Templates
import json
import pathlib
import os
import requests

# --- สำหรับควบคุม LED ---
from core.led_controller import set_led

# --- Import จากไฟล์ที่เราสร้างขึ้น ---
from core.models import JobRequest, ErrorRequest, LEDPositionRequest, LEDPositionsRequest, LotCheckRequest
from core.database import (
    DB, get_job_by_id, get_lots_in_position, add_lot_to_position, remove_lot_from_position, update_lot_quantity, validate_position, get_shelf_info, SHELF_CONFIG
)
from api.websockets import manager # <-- import manager มาจากที่ใหม่

router = APIRouter() # <-- สร้าง router สำหรับไฟล์นี้
templates = Jinja2Templates(directory=str(pathlib.Path(__file__).parent.parent / "templates"))

# --- Routes ---

# --- LED Control Endpoint ---
from fastapi import Request
from fastapi.responses import JSONResponse

# ลบ endpoint ที่ซ้ำกัน - ใช้แค่อันด้านล่างที่ tags=["Jobs"]
# @router.get("/api/shelf/config", tags=["System"])
# def get_shelf_config():
#     config = SHELF_CONFIG
#     total_levels = len(config)
#     max_blocks = max(config.values())
#     return JSONResponse(content={
#         "config": config,
#         "total_levels": total_levels,
#         "max_blocks": max_blocks
#     })


# รองรับสั่งทีละดวง (เดิม)
@router.post("/api/led", tags=["System"])
async def control_led(request: Request):
    """รับ level, block แล้วควบคุม LED (Pi5Neo)"""
    try:
        data = await request.json()
        level = int(data.get('level', 0))
        block = int(data.get('block', 0))
        r = int(data.get('r', 0))
        g = int(data.get('g', 255))
        b = int(data.get('b', 0))
    except Exception as e:
        return JSONResponse(status_code=400, content={"error": "Invalid JSON", "detail": str(e)})

    if not (1 <= level <= 4 and 1 <= block <= 6):
        return JSONResponse(status_code=400, content={"error": "Invalid level or block"})

    try:
        result = set_led(level, block, r, g, b)
        return result
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": "LED control failed", "detail": str(e)})

# รองรับสั่งหลายดวงพร้อมกัน
@router.post("/api/led/batch", tags=["System"])
async def control_led_batch(request: Request):
    """รับ array ของ led objects แล้วควบคุม LED หลายดวงพร้อมกัน"""
    try:
        data = await request.json()
        leds = data.get('leds', [])
        if not isinstance(leds, list):
            return JSONResponse(status_code=400, content={"error": "Invalid format: 'leds' must be a list"})
        # ตัวอย่าง: [{level, block, r, g, b}, ...]
        from core.led_controller import set_led_batch
        set_led_batch(leds)
        return {"ok": True, "count": len(leds)}
    except Exception as e:
        return JSONResponse(status_code=400, content={"error": "Invalid JSON or batch", "detail": str(e)})

# รองรับสั่งไฟด้วยรูปแบบ position string เช่น "L1B1"
@router.post("/api/led/position", tags=["LED Control"])
async def control_led_by_position(request: LEDPositionRequest):
    """ควบคุม LED โดยส่ง position string เช่น L1B1, L2B3"""
    try:
        position = request.position.upper().strip()
        r = request.r
        g = request.g
        b = request.b
        
        # Parse position string (L1B1, L2B3, etc.)
        import re
        match = re.match(r'^L(\d+)B(\d+)$', position)
        if not match:
            return JSONResponse(status_code=400, content={
                "error": "Invalid position format", 
                "message": "Position must be in format L{level}B{block} (e.g., L1B1, L2B3)"
            })
        
        level = int(match.group(1))
        block = int(match.group(2))
        
        # Validate position exists in shelf config
        if not validate_position(level, block):
            return JSONResponse(status_code=400, content={
                "error": "Invalid position", 
                "message": f"Position {position} does not exist in shelf configuration"
            })
        
        # Control LED
        result = set_led(level, block, r, g, b)
        result.update({
            "position": position,
            "level": level,
            "block": block,
            "color": {"r": r, "g": g, "b": b},
            "hex_color": f"#{r:02x}{g:02x}{b:02x}"
        })
        
        return result
        
    except Exception as e:
        return JSONResponse(status_code=400, content={
            "error": "Invalid request", 
            "detail": str(e)
        })

# รองรับสั่งไฟหลายตำแหน่งด้วย position strings
@router.post("/api/led/positions", tags=["LED Control"])
async def control_led_by_positions(request: LEDPositionsRequest):
    """ควบคุม LED หลายตำแหน่งโดยส่ง array ของ position objects"""
    try:
        led_commands = []
        invalid_positions = []
        
        # Parse each position
        import re
        for pos_data in request.positions:
            position = pos_data.position.upper().strip()
            r = pos_data.r
            g = pos_data.g
            b = pos_data.b
            
            # Parse position string
            match = re.match(r'^L(\d+)B(\d+)$', position)
            if not match:
                invalid_positions.append(f"{position}: Invalid format")
                continue
                
            level = int(match.group(1))
            block = int(match.group(2))
            
            # Validate position
            if not validate_position(level, block):
                invalid_positions.append(f"{position}: Not in shelf config")
                continue
                
            led_commands.append({
                "level": level,
                "block": block, 
                "r": r,
                "g": g,
                "b": b,
                "position": position,
                "hex_color": f"#{r:02x}{g:02x}{b:02x}"
            })
        
        if invalid_positions:
            return JSONResponse(status_code=400, content={
                "error": "Invalid positions found",
                "invalid_positions": invalid_positions,
                "valid_count": len(led_commands)
            })
        
        if not led_commands:
            return JSONResponse(status_code=400, content={
                "error": "No valid positions provided"
            })
        
        # Execute LED commands
        from core.led_controller import set_led_batch
        set_led_batch(led_commands)
        
        return {
            "ok": True,
            "count": len(led_commands),
            "positions": [cmd["position"] for cmd in led_commands],
            "colors": [
                {
                    "position": cmd["position"], 
                    "rgb": {"r": cmd["r"], "g": cmd["g"], "b": cmd["b"]},
                    "hex": cmd["hex_color"]
                } for cmd in led_commands
            ]
        }
        
    except Exception as e:
        return JSONResponse(status_code=400, content={
            "error": "Invalid request",
            "detail": str(e)
        })
    

@router.post("/api/led/clear", tags=["System"])
async def clear_leds():
    try:
        from core.led_controller import clear_all_leds
        clear_all_leds()
        return {"ok": True}
    except Exception as e:
        return JSONResponse(status_code=500, content={"error": "LED clear failed", "detail": str(e)})
    
@router.get("/", response_class=HTMLResponse, include_in_schema=False)
def serve_shelf_ui(request: Request):
    return templates.TemplateResponse("shelf_ui.html", {"request": request})

@router.get("/simulator", response_class=HTMLResponse, include_in_schema=False)
def serve_simulator(request: Request):
    return templates.TemplateResponse("test_api.html", {"request": request})

@router.get("/health", tags=["System"])
def health_check():
    return {"status": "ok", "message": "Barcode Smart Shelf Server is running"}

@router.get("/command", tags=["Jobs"])
def get_all_jobs():
    return {"jobs": DB["jobs"]}

@router.get("/api/shelf/state", tags=["Jobs"])
def get_shelf_state():
    # Return lots as list per cell
    shelf_state = []
    for cell in DB["shelf_state"]:
        level, block, lots = cell
        shelf_state.append({
            "level": level,
            "block": block,
            "lots": lots
        })
    return {"shelf_state": shelf_state}

@router.get("/api/shelf/config", tags=["Jobs"])
def get_shelf_config():
    """ดึงข้อมูลการกำหนดค่าของชั้นวาง"""
    return get_shelf_info()

@router.get("/api/shelf/position/{level}/{block}", tags=["Jobs"])
def get_position_info(level: int, block: int):
    """ดึงข้อมูลของช่องเฉพาะ (level, block)"""
    if not validate_position(level, block):
        return {
            "error": "Invalid position",
            "message": f"Position L{level}B{block} does not exist in shelf configuration"
        }
    lots = get_lots_in_position(level, block)
    return {
        "level": level,
        "block": block,
        "lots": lots,
        "message": f"Position L{level}B{block}: {len(lots)} lot(s)"
    }

@router.get("/api/shelf/lots", tags=["Jobs"])
def get_all_lots_in_shelf():
    """ดึงรายการ Lot ทั้งหมดที่อยู่ในชั้นวาง (ทุก lot ทุก cell)"""
    lots_info = []
    for cell in DB["shelf_state"]:
        level, block, lots = cell
        for lot in lots:
            lots_info.append({
                "level": level,
                "block": block,
                "lot_no": lot["lot_no"],
                "tray_count": lot["tray_count"]
            })
    return {
        "total_lots": len(lots_info),
        "lots": lots_info
    }

@router.post("/command", status_code=201, tags=["Jobs"])
async def create_job_via_api(job: JobRequest):
    # --- START: ปิดการตรวจสอบงานซ้ำชั่วคราว (สำหรับทดสอบ) ---
    existing_lot = any(j['lot_no'] == job.lot_no for j in DB["jobs"])
    if existing_lot:
         print(f"API: Rejected duplicate job for Lot {job.lot_no}")
         return {"status": "error", "message": f"Job for lot {job.lot_no} already exists in the queue."}
    # --- END: ปิดการตรวจสอบ ---

    # --- NEW: Validate lot exists in specified position (เฉพาะงานหยิบ) ---
    if job.place_flg == "0":  # งานหยิบ (pick)
        level = int(job.level)
        block = int(job.block)
        
        # ตรวจสอบว่า position ถูกต้องหรือไม่
        if not validate_position(level, block):
            print(f"API: Rejected job for invalid position L{level}B{block}")
            return {
                "status": "error", 
                "message": f"Invalid position L{level}B{block} does not exist in shelf configuration"
            }
        
        # ตรวจสอบว่า lot_no มีอยู่ในช่องนั้นหรือไม่
        lots_in_cell = get_lots_in_position(level, block)
        lot_exists = any(lot["lot_no"] == job.lot_no for lot in lots_in_cell)
        
        if not lot_exists:
            print(f"API: Rejected pick job for Lot {job.lot_no} - not found in L{level}B{block}")
            print(f"API: Lots in cell ({level}, {block}): {[lot['lot_no'] for lot in lots_in_cell]}")
            return {
                "status": "error", 
                "message": f"Lot {job.lot_no} not found in position L{level}B{block}. Cannot create pick job for non-existent lot."
            }
        
        print(f"API: Validation passed - Lot {job.lot_no} exists in L{level}B{block}")
    # --- END: Validation ---

    print(f"API: Received new job for Lot {job.lot_no}")
    new_job = job.dict()
    # Ensure tray_count is int
    tray_count = int(new_job.get("tray_count", 1))
    new_job["tray_count"] = tray_count
    DB["job_counter"] += 1
    new_job["jobId"] = f"job_{DB['job_counter']}"
    DB["jobs"].append(new_job)
    await manager.broadcast(json.dumps({"type": "new_job", "payload": new_job}))
    return {"status": "success", "job_data": new_job}

@router.post("/command/{job_id}/complete", tags=["Jobs"])
async def complete_job(job_id: str):
    print(f"API: Received 'Task Complete' for job {job_id}")
    job = get_job_by_id(job_id)
    if not job:
        return {"status": "error", "message": "Job not found"}
    level = int(job["level"])
    block = int(job["block"])
    lot_no = job["lot_no"]
    tray_count = int(job.get("tray_count", 1))
    if job["place_flg"] == "1":
        # วางของ: เพิ่ม lot เข้า cell
        add_lot_to_position(level, block, lot_no, tray_count)
        action = "placed"
    else:
        # หยิบของ: ลบ lot ออกจาก cell (หรือ update tray_count ถ้าหยิบไม่หมด)
        remove_lot_from_position(level, block, lot_no)
        action = "picked"
    DB["jobs"] = [j for j in DB["jobs"] if j.get("jobId") != job_id]
    # Broadcast shelf_state as lots per cell
    shelf_state = []
    for cell in DB["shelf_state"]:
        l, b, lots = cell
        shelf_state.append({"level": l, "block": b, "lots": lots})
    await manager.broadcast(json.dumps({
        "type": "job_completed",
        "payload": {
            "completedJobId": job_id,
            "shelf_state": shelf_state,
            "lot_no": lot_no,
            "action": action
        }
    }))
    return {
        "status": "success",
        "lot_no": lot_no,
        "action": action,
        "location": f"L{level}B{block}"
    }

# เพิ่ม endpoint ใหม่สำหรับรับข้อมูลจาก JavaScript
@router.post("/command/complete", tags=["Jobs"])
async def complete_job_by_data(request_data: dict):
    """Complete job โดยใช้ข้อมูลที่ส่งมาจาก client"""
    job_id = request_data.get("job_id")
    lot_no = request_data.get("lot_no")
    
    print(f"API: Received 'Task Complete' via new endpoint for job {job_id}, lot {lot_no}")
    
    if not job_id:
        return {"status": "error", "message": "job_id is required"}
    
    # เรียกใช้ฟังก์ชันเดิม
    return await complete_job(job_id)

@router.post("/command/{job_id}/error", tags=["Jobs"])
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
    # Reset shelf_state to empty stacked lots
    DB["shelf_state"] = []
    for level, num_blocks in SHELF_CONFIG.items():
        for block in range(1, num_blocks + 1):
            DB["shelf_state"].append([level, block, []])
    DB["job_counter"] = 0
    await manager.broadcast(json.dumps({"type": "system_reset"}))
    return {"status": "success"}

@router.get("/api/shelf/occupied", tags=["Jobs"])
def get_occupied_positions():
    """ดึงข้อมูลเฉพาะช่องที่มีของอยู่ในชั้นวาง (มี lot อย่างน้อย 1)"""
    occupied_positions = []
    for cell in DB["shelf_state"]:
        level, block, lots = cell
        if lots:
            for lot in lots:
                occupied_positions.append({
                    "position": f"L{level}B{block}",
                    "level": level,
                    "block": block,
                    "lot_no": lot["lot_no"],
                    "tray_count": lot["tray_count"]
                })
    return {
        "total_occupied": len(occupied_positions),
        "occupied_positions": occupied_positions
    }

@router.get("/api/shelf/summary", tags=["Jobs"])
def get_shelf_summary():
    """ดึงสรุปข้อมูลชั้นวางทั้งหมด (stacked lots)"""
    total_positions = len(DB["shelf_state"])
    occupied_count = 0
    empty_count = 0
    occupied_list = []
    for cell in DB["shelf_state"]:
        level, block, lots = cell
        if lots:
            occupied_count += 1
            for lot in lots:
                occupied_list.append({
                    "position": f"L{level}B{block}",
                    "lot_no": lot["lot_no"],
                    "tray_count": lot["tray_count"]
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

# --- Mock LMS Database สำหรับทดสอบ ---
MOCK_LMS_DATABASE = {
    "LOT001": "Smart Shelf Alpha",
    "LOT002": "Smart Shelf Beta", 
    "LOT003": "Smart Shelf Alpha",
    "LOT004": "Smart Shelf Gamma",
    "LOT005": "Smart Shelf Beta",
    "LOT123456": "Smart Shelf Demo",
    "LOT789012": "Smart Shelf Alpha",
    "LOT345678": "Smart Shelf Gamma",
    "LOT555666": "Smart Shelf Beta",
    "LOT999888": "Smart Shelf Delta",
    "DEMO001": "Smart Shelf Alpha",
    "DEMO002": "Smart Shelf Beta",
    "TEST001": "Smart Shelf Gamma",
    "PROD001": "Smart Shelf Alpha",
    "PROD002": "Smart Shelf Beta"
}

def mock_lms_find_shelf(lot_no: str) -> dict:
    """จำลอง LMS response สำหรับการหา shelf ของ lot"""
    lot_no = lot_no.strip().upper()
    
    if lot_no in MOCK_LMS_DATABASE:
        return {
            "status": "success",
            "lot_no": lot_no,
            "shelf_name": MOCK_LMS_DATABASE[lot_no],
            "found": True
        }
    else:
        return {
            "status": "not_found", 
            "lot_no": lot_no,
            "shelf_name": None,
            "found": False
        }

@router.post("/api/lot/check-shelf", tags=["Lot Verification"])
async def check_lot_correct_shelf(request: LotCheckRequest):
    """ตรวจสอบ lot กับ LMS server และรับชื่อ shelf ที่ถูกต้องกลับมา"""
    try:
        lot_no = request.lot_no.strip()
        
        if not lot_no:
            return JSONResponse(status_code=400, content={
                "error": "Missing lot_no",
                "message": "lot_no is required"
            })
        
        # ตรวจสอบว่าต้องการใช้ Mock LMS หรือไม่
        use_mock = os.getenv("MOCK_LMS_SERVER", "true").lower() == "true"
        
        if use_mock:
            # ใช้ Mock LMS Database
            print(f"🧪 Using Mock LMS to check lot: {lot_no}")
            mock_result = mock_lms_find_shelf(lot_no)
            
            if mock_result["found"]:
                return {
                    "status": "success",
                    "lot_no": lot_no,
                    "correct_shelf_name": mock_result["shelf_name"],
                    "message": f"Lot {lot_no} belongs to {mock_result['shelf_name']}",
                    "source": "mock_lms"
                }
            else:
                return JSONResponse(status_code=404, content={
                    "error": "Lot not found",
                    "message": f"Lot {lot_no} not found in Mock LMS database",
                    "source": "mock_lms"
                })
        else:
            # ใช้ LMS จริง
            print(f"🌐 Using Real LMS to check lot: {lot_no}")
            lms_server_url = os.getenv("LMS_SERVER_URL", "http://192.168.1.200:3000")
            
            response = requests.post(
                f"{lms_server_url}/api/lms/check-lot-shelf",
                json={"lot_no": lot_no},
                timeout=5
            )
            
            if response.status_code == 200:
                lms_data = response.json()
                shelf_name = lms_data.get("shelf_name", "Unknown Shelf")
                
                return {
                    "status": "success",
                    "lot_no": lot_no,
                    "correct_shelf_name": shelf_name,
                    "message": f"Lot {lot_no} belongs to {shelf_name}",
                    "source": "real_lms"
                }
            else:
                return JSONResponse(status_code=404, content={
                    "error": "Lot not found",
                    "message": f"Lot {lot_no} not found in LMS system",
                    "source": "real_lms"
                })
                
    except requests.RequestException as e:
        return JSONResponse(status_code=503, content={
            "error": "LMS server unavailable",
            "message": "Cannot connect to LMS server",
            "detail": str(e)
        })
    except Exception as e:
        return JSONResponse(status_code=500, content={
            "error": "Server error",
            "detail": str(e)
        })

# --- Mock LMS Endpoint สำหรับทดสอบ ---
@router.get("/api/mock-lms/lots", tags=["Mock LMS"])
def get_mock_lms_database():
    """แสดงข้อมูล Mock LMS Database ทั้งหมด"""
    return {
        "total_lots": len(MOCK_LMS_DATABASE),
        "database": MOCK_LMS_DATABASE,
        "available_shelves": list(set(MOCK_LMS_DATABASE.values()))
    }

@router.post("/api/mock-lms/add-lot", tags=["Mock LMS"])
def add_lot_to_mock_database(lot_no: str, shelf_name: str):
    """เพิ่ม lot ใหม่เข้า Mock LMS Database"""
    lot_no = lot_no.strip().upper()
    MOCK_LMS_DATABASE[lot_no] = shelf_name
    return {
        "status": "success",
        "message": f"Added {lot_no} to {shelf_name}",
        "total_lots": len(MOCK_LMS_DATABASE)
    }
