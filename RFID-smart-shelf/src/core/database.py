# นี่คือ "ฐานข้อมูลจำลอง" ที่จะเก็บสถานะทั้งหมดของระบบ
# เมื่อ Server รีสตาร์ท ข้อมูลจะหายไป (เหมาะสำหรับการพัฒนา)
DB = {
    "jobs": [],
    "shelf_state": [[r, c, 0, None] for r in range(1, 5) for c in range(1, 6)], 
    "job_counter": 0
}

# --- Helper Functions ---
def get_job_by_id(job_id: str):
    """ค้นหา Job จาก ID ใน DB"""
    return next((job for job in DB["jobs"] if job.get("jobId") == job_id), None)

def update_shelf_state(level: int, block: int, has_item: int, lot_no: str = None):
    """อัปเดตสถานะของช่องใน Shelf (รวมทั้ง lot_no)"""
    for i, cell in enumerate(DB["shelf_state"]):
        if cell[0] == level and cell[1] == block:
            DB["shelf_state"][i][2] = has_item
            DB["shelf_state"][i][3] = lot_no  # <-- เพิ่มการอัปเดต lot_no
            return

def get_lot_in_position(level: int, block: int):
    """ดึง lot_no ที่อยู่ในตำแหน่งที่กำหนด"""
    for cell in DB["shelf_state"]:
        if cell[0] == level and cell[1] == block:
            return cell[3]  # ส่งคืน lot_no
    return None