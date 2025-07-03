from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
import uvicorn
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
import pathlib
import socket

# --- Import Routers จากไฟล์ที่เราสร้าง ---
from api import jobs, websockets

# สร้างแอปพลิเคชัน FastAPI หลัก
app = FastAPI(
    title="RFID Smart Shelf API (Refactored)",
    description="A professional, well-structured server for the Smart Shelf system.",
    version="2.0.0"
)

# --- START: แก้ไขตรงนี้ ---
# Mount โฟลเดอร์ static ก่อน เพื่อให้มีความสำคัญสูงสุดสำหรับ path /static
STATIC_PATH = pathlib.Path(__file__).parent / "static"
app.mount("/static", StaticFiles(directory=STATIC_PATH), name="static")

# เพิ่ม Templates สำหรับ HTML
TEMPLATES_PATH = pathlib.Path(__file__).parent / "templates"
templates = Jinja2Templates(directory=TEMPLATES_PATH)

# --- เพิ่ม Route สำหรับหน้าแรก ---
@app.get("/", response_class=HTMLResponse)
async def serve_shelf_ui(request: Request):
    """แสดงหน้า Smart Shelf UI"""
    return templates.TemplateResponse("shelf_ui.html", {"request": request})

# "ประกอบร่าง" Router อื่นๆ ทีหลัง
app.include_router(jobs.router)

# --- เพิ่มบรรทัดนี้ ---
app.include_router(websockets.router)
# --- สิ้นสุดการแก้ไข ---


# --- Main ---
if __name__ == "__main__":
    def get_local_ip():
        try:
            # เชื่อมต่อไปยัง DNS ภายนอกเพื่อหา IP ที่ใช้งานจริง
            with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
                s.connect(("8.8.8.8", 80))
                return s.getsockname()[0]
        except:
            return "localhost"
    
    local_ip = get_local_ip()
    
    print("🚀 Starting RFID Smart Shelf Server (v2.0 Refactored)...")
    print(f"📱 Smart Shelf UI: http://localhost:8000")
    print(f"🎮 Event Simulator: http://localhost:8000/simulator")
    print(f"📄 API Docs:       http://localhost:8000/docs")
    print(f"🌐 Network API:    http://{local_ip}:8000")  # แสดง IP จริง
    print(f"📱 Pi Access:      http://{local_ip}:8000")   # สำหรับ Pi
    uvicorn.run(app, host="0.0.0.0", port=8000)  # เปลี่ยนจาก 127.0.0.1 เป็น 0.0.0.0