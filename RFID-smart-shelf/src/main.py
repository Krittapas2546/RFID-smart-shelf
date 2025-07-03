from fastapi import FastAPI
import uvicorn
from fastapi.staticfiles import StaticFiles
import pathlib

# --- Import Routers จากไฟล์ที่เราสร้าง ---
from api import jobs, websockets

# สร้างแอปพลิเคชัน FastAPI หลัก
app = FastAPI(
    title="RFID Smart Shelf API (Refactored)",
    description="A professional, well-structured server for the Smart Shelf system.",
    version="2.0.0"
)

# --- START: แก้ไขตรงนี้ ---
# 1. Mount โฟลเดอร์ static ก่อน เพื่อให้มีความสำคัญสูงสุดสำหรับ path /static
STATIC_PATH = pathlib.Path(__file__).parent / "static"
app.mount("/static", StaticFiles(directory=STATIC_PATH), name="static")

# 2. "ประกอบร่าง" Router อื่นๆ ทีหลัง
app.include_router(jobs.router)
app.include_router(websockets.router)
# --- END: แก้ไขตรงนี้ ---


# --- Main ---
if __name__ == "__main__":
    print("🚀 Starting RFID Smart Shelf Server (v2.0 Refactored)...")
    print("📱 Smart Shelf UI: http://localhost:8000")
    print("🎮 Event Simulator: http://localhost:8000/simulator")
    print("📄 API Docs:       http://localhost:8000/docs")
    print("🌐 Network API:    http://[YOUR_IP]:8000")  # เพิ่มบรรทัดนี้
    uvicorn.run(app, host="0.0.0.0", port=8000)  # เปลี่ยนจาก 127.0.0.1 เป็น 0.0.0.0