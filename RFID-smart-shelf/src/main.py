import pathlib
import json
import random
from fastapi import FastAPI, Request, Form
from fastapi.templating import Jinja2Templates
from fastapi.responses import HTMLResponse

BASE_DIR = pathlib.Path(__file__).parent.resolve()

app = FastAPI()
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))

# --- หน้า 1: หน้าทดสอบ API ---
@app.get("/", response_class=HTMLResponse)
def test_api_page(request: Request):
    # 1. สร้างรายการตำแหน่งทั้งหมดที่เป็นไปได้ (6 แถว x 4 คอลัมน์)
    all_positions = [[r, c] for r in range(6) for c in range(4)]
    random.shuffle(all_positions)

    # 2. กำหนดจำนวนช่องที่มีของ (สุ่มระหว่าง 5 ถึง 15 ช่อง)
    num_occupied = random.randint(5, 15)
    occupied_positions = all_positions[:num_occupied]
    empty_positions = all_positions[num_occupied:]
    
    # 3. สุ่มเลือกตำแหน่ง "From" จากช่องที่มีของ
    from_pos = random.choice(occupied_positions)

    # 4. สุ่มเลือกตำแหน่ง "To" จากช่องที่ว่าง
    to_pos = random.choice(empty_positions)

    sample_data = {
        "Biz": "IS",
        "Process": "BUR-BURN",
        "LotNo": f"Y{random.randint(2000, 9999)}",
        "ProductType": f"IMX{random.randint(100, 999)}",
        "FromSTK": f"AM_BURN_S_{random.randint(1, 5):04d}",
        "FromLevel": str(from_pos[0] + 1),
        "FromBlock": str(from_pos[1] + 1),
        "ToSTK": f"AM_CSAT_S_{random.randint(1, 5):04d}",
        "ToLevel": str(to_pos[0] + 1),
        "ToBlock": str(to_pos[1] + 1),
        "TimeStamp": f"{random.randint(0,23):02d}:{random.randint(0,59):02d}",
        "PositionSTK": occupied_positions
    }
    return templates.TemplateResponse("test_api.html", {"request": request, "data": sample_data})

# --- หน้า 2: รับข้อมูล JSON แล้วแสดงผล ---
@app.post("/show", response_class=HTMLResponse)
async def show_ui(request: Request, payload: str = Form(...)):
    data = json.loads(payload)
    return templates.TemplateResponse("shelf_ui.html", {"request": request, "data": data})

# --- ทำให้เปิด /show โดยตรงได้ ---
@app.get("/show", response_class=HTMLResponse)
def show_ui_get(request: Request):
    return templates.TemplateResponse("shelf_ui.html", {"request": request, "data": {}})
