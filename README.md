# RFID Smart Shelf System

**สถานะ:** ✅ **Complete - Frontend-Only System**

## 📖 ภาพรวม (Overview)

**RFID Smart Shelf** คือระบ## 📁 โครงสร้างโปรเจค (Project Structure)

```
RFID-smart-shelf/
├── README.md                  # 📖 คู่มือหลักของโปรเจค
├── API/
│   └── api_tester.py          # 🧪 API Testing Script (Legacy)
└── RFID-smart-shelf/
    ├── README.md              # คู่มือย่อย
    ├── requirements.txt       # Python Dependencies (Legacy)
    ├── pkgs/                  # Python Packages (Legacy)
    │   └── *.whl             # Pre-built packages
    └── src/
        ├── main.py            # 🔧 FastAPI Backend Server (Legacy)
        └── templates/ 📂 **ไฟล์หลักที่ใช้งานปัจจุบัน**
            ├── shelf_ui.html      # 🖥️ Smart Shelf UI (Main Application)
            └── test_api.html      # 🎮 Event Simulator & Job Creator
```

**หมายเหตุ:**
- **ไฟล์ปัจจุบัน:** `templates/shelf_ui.html` และ `templates/test_api.html`
- **ไฟล์ Legacy:** `main.py`, `requirements.txt`, `api_tester.py` (ไม่จำเป็นต้องใช้แล้ว)
- **สถาปัตยกรรมปัจจุบัน:** Frontend-only ไม่ต้องการ Backend Serverยะที่ออกแบบมาเพื่อจำลองการจัดการและติดตามตำแหน่งของสินค้าบนชั้นวาง โปรเจกต์นี้ประกอบด้วย:

- **Smart Shelf UI** - หน้าจอแสดงสถานะชั้นวางแบบ Real-time
- **Event Simulator** - เครื่องมือจำลองสถานการณ์และทดสอบระบบ

ระบบใช้เทคโนโลยี **localStorage** ในการจัดเก็บข้อมูลและสื่อสารระหว่าง UI กับ Simulator โดยไม่ต้องพึ่งพา Backend Server

---

## ✨ คุณสมบัติหลัก (Features)

### 🖥️ **Smart Shelf UI** (`shelf_ui.html`)
- **แสดงสถานะชั้นวางแบบ Real-time:** เห็นภาพรวมของชั้นวาง 4x6 ตำแหน่ง
- **ระบบจัดการคิูงาน (Job Queue):** แสดงรายการงานที่รอดำเนินการ
- **การเลือกงาน:** เลือกงานจากคิวเมื่อมีงานมากกว่า 1 งาน
- **แสดงตำแหน่งเป้าหมาย:** ไฮไลต์ช่องที่ต้องวาง/หยิบสินค้า (สีเขียว)
- **แสดงสถานะ Error:** กระพริบและแสดงตำแหน่งที่วางผิด (สีแดง)
- **Responsive Design:** รองรับหน้าจอขนาดต่าง ๆ

### 🎮 **Event Simulator** (`test_api.html`)
- **Shelf State Editor:** จัดการสถานะช่องว่าง/มีของบนชั้นวาง
- **สร้างงานใหม่:** เพิ่มงานใหม่ด้วยข้อมูล `{lot_no, level, block, place_flg, trn_status}`
- **จำลองการทำงานเสร็จ:** อัปเดตสถานะงานเป็นสำเร็จ
- **จำลองการวางผิด:** จำลองสถานการณ์ Error
- **ล้างข้อมูลระบบ:** รีเซ็ตข้อมูลทั้งหมด

### 🔧 **ฟีเจอร์เพิ่มเติม**
- **ดีบักและตรวจสอบข้อมูล:** ฟังก์ชัน `debugLocalStorage()` ใน Console
- **การทำความสะอาดข้อมูล:** กรองข้อมูลที่เสียหายโดยอัตโนมัติ
- **การซิงค์แบบ Real-time:** ใช้ `storage` event listener

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

- **Frontend:** HTML5, CSS3, JavaScript (ES6+)
- **Data Storage:** Browser localStorage
- **Styling:** Google Fonts (Inter), Custom CSS Grid
- **Communication:** Storage Event API for real-time sync between windows
- **Architecture:** Client-side only (No Backend Required)
- **Error Handling:** Robust validation and data cleaning for localStorage corruption

---

## 🚀 การติดตั้งและใช้งาน (Installation & Usage)

### **📥 การติดตั้ง**

```bash
# Clone Repository
git clone https://github.com/Krittapas2546/RFID-smart-shelf.git
cd RFID-smart-shelf/RFID-smart-shelf/src/templates
```

### **▶️ การใช้งาน**

**1. เปิดไฟล์ HTML โดยตรง:**
```bash
# เปิด Simulator สำหรับสร้างงานและจำลองเหตุการณ์
start test_api.html    # Windows
open test_api.html     # macOS
xdg-open test_api.html # Linux

# เปิด UI สำหรับดูสถานะชั้นวาง (เปิดในแท็บใหม่)
start shelf_ui.html    # Windows
open shelf_ui.html     # macOS
xdg-open shelf_ui.html # Linux
```

**2. หรือใช้ Live Server Extension (แนะนำ):**
- ติดตั้ง Live Server ใน VS Code
- Right-click บนไฟล์ → "Open with Live Server"

**3. หรือใช้ FastAPI Server (เสริม - ไม่จำเป็น):**
```bash
# ติดตั้ง dependencies
pip install fastapi uvicorn jinja2

# รัน server
cd RFID-smart-shelf/src
python main.py

# เข้าไปที่:
# - http://localhost:8000 (Smart Shelf UI)
# - http://localhost:8000/simulator (Event Simulator)
```

### **📖 วิธีการใช้งาน**

#### **ขั้นตอนการทดสอบระบบ:**

1. **เปิด Simulator** (`test_api.html`):
   - ปรับสถานะชั้นวางผ่าน "Shelf State Editor"
   - สร้างงานใหม่ในส่วน "Create New Job" 
   - กด "Add New Job to Queue"

2. **เปิด UI** (`shelf_ui.html`):
   - งานจะปรากฏใน Job Queue
   - หากมีหลายงาน ให้เลือกงานจาก Drawer
   - UI จะแสดงตำแหน่งเป้าหมาย (สีเขียว)

3. **จำลองการทำงาน** (กลับไปที่ Simulator):
   - **Simulate Task Complete:** จำลองการทำงานสำเร็จ
   - **Simulate Wrong Pick:** จำลองการวางผิดตำแหน่ง

4. **ตรวจสอบผลลัพธ์** (กลับไปที่ UI):
   - สถานะจะอัปเดตแบบ Real-time
   - การ Error จะแสดงเป็นสีแดงพร้อมกระพริบ

### **🔍 การดีบักข้อมูล (Debugging)**

เปิด DevTools (F12) และใช้คำสั่งต่อไปนี้ใน Console:

```javascript
// ฟังก์ชันดีบักที่มีอยู่ในระบบ (ใช้ได้ใน shelf_ui.html)
debugLocalStorage();

// ดูข้อมูล localStorage ทั้งหมด
console.table(localStorage);

// ดูข้อมูลเฉพาะส่วน
console.log('Queue:', JSON.parse(localStorage.getItem('shelfQueue') || '[]'));
console.log('Active Job:', JSON.parse(localStorage.getItem('activeShelfJob') || 'null'));
console.log('Shelf State:', JSON.parse(localStorage.getItem('globalShelfState') || '[]'));

// ตรวจสอบข้อมูลที่เสียหาย (Invalid Jobs)
const queue = JSON.parse(localStorage.getItem('shelfQueue') || '[]');
const invalidJobs = queue.filter(job => 
  !job.lot_no || !job.level || !job.block || !job.place_flg || !job.trn_status
);
console.log('Invalid Jobs Found:', invalidJobs);

// ล้างข้อมูลทั้งหมด
localStorage.clear();
```

**การแก้ไขปัญหาทั่วไป:**
- **ข้อมูลเสียหาย:** ระบบจะทำความสะอาดข้อมูลโดยอัตโนมัติ แต่หากยังมีปัญหาให้ใช้ `localStorage.clear()`
- **งานไม่แสดง:** ตรวจสอบว่าข้อมูลงานมีฟิลด์ครบถ้วน (lot_no, level, block, place_flg, trn_status)
- **UI ไม่อัปเดต:** รีเฟรชหน้าหรือตรวจสอบ Console เพื่อดู Error

---

## 📁 โครงสร้างโปรเจค (Project Structure)

```
RFID-smart-shelf/
├── README.md                  # 📖 คู่มือหลักของโปรเจค
└── RFID-smart-shelf/
    └── src/
        ├── main.py            # 🔧 Optional FastAPI Server (ไม่จำเป็นต้องใช้)
        └── templates/ 📂 **ไฟล์หลักที่ใช้งานปัจจุบัน**
            ├── shelf_ui.html      # 🖥️ Smart Shelf UI (Main Application)
            └── test_api.html      # 🎮 Event Simulator & Job Creator
```

**หมายเหตุ:**
- **ไฟล์หลัก:** `templates/shelf_ui.html` และ `templates/test_api.html`
- **ไฟล์เสริม:** `main.py` (FastAPI Server แบบ Optional - ไม่จำเป็นต้องใช้)
- **สถาปัตยกรรม:** Frontend-only, localStorage-based (ไม่ต้องการ Backend Server)

## 💾 โครงสร้างข้อมูล (Data Structure)

### **Job Object Format (New Structure):**
```json
{
  "jobId": "job_1672531200000",
  "lot_no": "ABC123",        // Lot Number (Required)
  "level": "1",              // Shelf Level 1-4 (Required)
  "block": "3",              // Shelf Block 1-6 (Required)
  "place_flg": "1",          // Place Flag: 1=Place, 0=Pick (Required)
  "trn_status": "1",         // Transaction Status: 1=Waiting, 2=Error (Required)
  "timestamp": "10:30:25",   // Auto-generated
  "error": null              // Error state (if any)
}
```

**หมายเหตุ:** ระบบจะตรวจสอบและกรองงานที่ขาดฟิลด์จำเป็นออกโดยอัตโนมัติ

### **Shelf State Format:**
```json
[
  [1, 1, 0],  // [level, block, hasItem] - Level 1, Block 1, Empty
  [1, 2, 1],  // [level, block, hasItem] - Level 1, Block 2, Has Item
  [1, 3, 0],  // [level, block, hasItem] - Level 1, Block 3, Empty
  // ... 24 positions total (4 levels × 6 blocks)
]
```

### **localStorage Keys:**
- `shelfQueue`: Array ของ Job objects ที่รอดำเนินการ
- `activeShelfJob`: Job object ที่กำลังทำงานอยู่ปัจจุบัน
- `globalShelfState`: Array ของสถานะชั้นวาง (24 ตำแหน่ง)

---

## 🔄 การพัฒนาต่อ (Future Development)

### **การเพิ่ม Backend (Optional):**
```javascript
// แทนที่ localStorage calls ด้วย API calls
// ตัวอย่าง:
fetch('/api/jobs', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify(jobData)
});
```

**ขั้นตอนการพัฒนาต่อ:**
1. เพิ่ม FastAPI/Flask Server
2. แทนที่ localStorage ด้วย API calls
3. เพิ่ม Database (PostgreSQL/MongoDB)
4. เพิ่มระบบ Authentication

### **การเชื่อมต่อ Hardware (Optional):**
- RFID Reader Integration
- IoT Device Communication  
- Sensor Data Processing
- Real-time Hardware Events

---

## 👤 ผู้จัดทำ (Author)

*   **Krittapas P.** - ([@Krittapas2546](https://github.com/Krittapas2546))

---

## 📄 สัญญาอนุญาต (License)

This project is licensed under the MIT License.