# ต้องแก้ด้วยสู

SHELF_CONFIG = {
    1: 3, 
    2: 3, 
    3: 4, 
    4: 4
}


def create_initial_shelf_state():
    """สร้างสถานะเริ่มต้นของชั้นวางตาม SHELF_CONFIG"""
    shelf_state = []
    for level, num_blocks in SHELF_CONFIG.items():
        for block in range(1, num_blocks + 1):
            shelf_state.append([level, block, 0, None])  # [level, block, hasItem, lot_no]
    return shelf_state

DB = {
    "jobs": [],
    "shelf_state": create_initial_shelf_state(),
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

def validate_position(level: int, block: int):
    """ตรวจสอบว่าตำแหน่งที่กำหนดมีอยู่จริงในชั้นวางหรือไม่"""
    return level in SHELF_CONFIG and 1 <= block <= SHELF_CONFIG[level]

def get_shelf_info():
    """ส่งคืนข้อมูลการกำหนดค่าของชั้นวาง"""
    return {
        "config": SHELF_CONFIG,
        "total_levels": len(SHELF_CONFIG),
        "max_blocks": max(SHELF_CONFIG.values()) if SHELF_CONFIG else 0
    }