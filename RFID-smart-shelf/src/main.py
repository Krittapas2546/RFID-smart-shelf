import pathlib
from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse
from fastapi.templating import Jinja2Templates

# --- Setup ---
BASE_DIR = pathlib.Path(__file__).parent.resolve()
app = FastAPI()
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))

# --- Routes ---

@app.get("/", response_class=HTMLResponse)
def serve_shelf_ui(request: Request):
    """
    เส้นทางหลัก: แสดงหน้า Shelf UI (shelf_ui.html)
    """
    return templates.TemplateResponse("shelf_ui.html", {
        "request": request,
        "data": {},
        "initialize_demo": True  # เพิ่ม flag เพื่อให้ JavaScript รู้ว่าต้องสร้างข้อมูลตัวอย่าง
    })

@app.get("/test", response_class=HTMLResponse)
def serve_test_api(request: Request):
    """
    เส้นทางสำหรับทดสอบ: แสดงหน้า Test API Simulator (test_api.html)
    """
    return templates.TemplateResponse("test_api.html", {
        "request": request,
        "data": {}
    })

@app.get("/demo", response_class=HTMLResponse)
def serve_demo_ui(request: Request):
    """
    เส้นทางสำหรับดูตัวอย่างหน้า UI พร้อมข้อมูล
    """
    # ข้อมูลตัวอย่างสำหรับทดสอบ
    demo_data = {
        "lotNo": "Y2024001",
        "employeeId": "EMP123",
        "from": "STK-A1",
        "status": "Waiting",
        "timestamp": "2024-12-26 14:30:00",
        "location": {"row": 2, "col": 3},
        "error": False
    }
    return templates.TemplateResponse("shelf_ui.html", {
        "request": request,
        "data": demo_data,
        "initialize_demo": False
    })