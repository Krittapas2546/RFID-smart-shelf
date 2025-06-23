from fastapi import FastAPI
from pydantic import BaseModel
import uvicorn

# สร้าง Instance ของ FastAPI
app = FastAPI()

# 1. สร้าง Pydantic Model เพื่อกำหนดโครงสร้างข้อมูลของ Job
#    ข้อมูลที่ส่งมาจาก Client จะต้องมีหน้าตาแบบนี้
class Job(BaseModel):
    action: str
    lot_no: str
    # เราใช้ from_loc แทน from เพราะ 'from' เป็นคำสงวนใน Python
    from_loc: str
    employee_id: str
    task_location_row: int
    task_location_col: int

# 2. สร้าง API Endpoint ชื่อ /api/create_job เพื่อรอรับข้อมูล Job
#    ใช้เมธอด POST เพราะเป็นการสร้างข้อมูลใหม่
@app.post("/api/create_job")
async def create_job(job: Job):
    # เมื่อได้รับข้อมูลมาแล้ว ก็สามารถนำไปประมวลผลต่อได้
    # ในตัวอย่างนี้ เราจะแค่พิมพ์ข้อมูลออกมาดู
    print("✅ Received new job:")
    print(f"  Action: {job.action}")
    print(f"  Lot No: {job.lot_no}")
    print(f"  From: {job.from_loc}")
    print(f"  Employee ID: {job.employee_id}")
    print(f"  Task Location: Row {job.task_location_row}, Col {job.task_location_col}")

    # ส่ง response กลับไปบอก Client ว่ารับข้อมูลสำเร็จแล้ว
    return {"status": "success", "job_received": job.dict()}

# Endpoint เริ่มต้นสำหรับทดสอบว่า Server ทำงานอยู่
@app.get("/")
def read_root():
    return {"message": "Job server is running"}

# ส่วนสำหรับรัน Server โดยตรง (ถ้าไม่ใช้ uvicorn command)
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
