from fastapi import FastAPI
import uvicorn
from fastapi.staticfiles import StaticFiles
import pathlib
import socket

# --- Import Routers จากไฟล์ที่เราสร้าง ---
from api import jobs, websockets
from core.websocket_manager import manager

# สร้างแอปพลิเคชัน FastAPI หลัก
app = FastAPI(
    title="RFID Smart Shelf API (Refactored)",
    description="A professional, well-structured server for the Smart Shelf system.",
    version="2.0.0"
)

# --- START:---
# Mount โฟลเดอร์ static ก่อน เพื่อให้มีความสำคัญสูงสุดสำหรับ path /static
STATIC_PATH = pathlib.Path(__file__).parent / "static"
app.mount("/static", StaticFiles(directory=STATIC_PATH), name="static")


app.include_router(jobs.router)
app.include_router(websockets.router)
# --- END  ---


# --- Main ---
if __name__ == "__main__":
    def get_local_ip():
        try:
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
    print(f"🌐 Network API:    http://{local_ip}:8000") 
    print(f"📱 Pi Access:      http://{local_ip}:8000")  
    uvicorn.run(app, host="0.0.0.0", port=8000)