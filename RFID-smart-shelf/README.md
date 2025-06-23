# RFID Smart Shelf System

## 📖 ภาพรวม (Overview)
RFID Smart Shelf คือระบบชั้นวางของอัจฉริยะที่ใช้เทคโนโลยี RFID ในการจัดการและติดตามตำแหน่งของสินค้าบนชั้นวาง โปรเจกต์นี้พัฒนาขึ้นสำหรับทำงานบน Raspberry Pi โดยเฉพาะ เหมาะกับการทดลองใช้งานและต่อยอดในงาน IoT

---

## 💡 ฟีเจอร์หลัก
- ตรวจจับและระบุตำแหน่งสินค้าอัตโนมัติด้วย RFID
- แสดงผลและจัดการข้อมูลผ่านเว็บอินเทอร์เฟซ (FastAPI/Flask)
- สามารถขยายและปรับปรุงฟังก์ชันเพิ่มเติมได้ง่าย

---

## 🚀 วิธีติดตั้งและใช้งานบน Raspberry Pi 5

### 1. อัปเดตระบบ
```bash
sudo apt update && sudo apt upgrade
sudo apt install python3-venv python3-pip git
```

### 2. ดาวน์โหลดโปรเจกต์
```bash
git clone https://github.com/Krittapas2546/RFID-smart-shelf.git
cd RFID-smart-shelf
```

### 3. สร้างและเข้าใช้งาน venv
```bash
python3 -m venv .venv
source .venv/bin/activate
```

### 4. ติดตั้ง dependencies ที่จำเป็นสำหรับ Pi 5
```bash
pip install -r requirements-pi.txt --break-system-packages
```

### 5. รันเซิร์ฟเวอร์
```bash
cd src
uvicorn main:app --host 0.0.0.0 --port 8000
```
> ✨ หากไฟล์หลักของคุณใช้ชื่ออื่น (เช่น `app.py`) ให้ปรับชื่อที่ใช้กับ uvicorn ให้ตรง

### 6. เปิดใช้งานผ่านเว็บเบราว์เซอร์
เข้าไปที่ `http://<IP_Raspberry_Pi>:8000` จากเครื่องอื่นในเครือข่าย

---

## 📝 ตัวอย่างไฟล์ requirements-pi.txt

```txt
fastapi
uvicorn
jinja2
flask
itsdangerous
click
markupsafe
# เพิ่ม library อื่นๆ ตามที่ใช้จริงในโปรเจกต์
```

---

## 💬 หมายเหตุ
- หากพบปัญหาการติดตั้งแพ็กเกจ Python บน Raspberry Pi OS รุ่นใหม่ ให้เพิ่ม `--break-system-packages` ต่อท้ายคำสั่ง pip install
- หากต้องการล้าง venv แล้วติดตั้งใหม่ ใช้ `rm -rf .venv` แล้วสร้างใหม่ตามขั้นตอนข้างต้น
- หากต้องการให้รองรับ offline install ให้เตรียมไฟล์ .whl เฉพาะสำหรับสถาปัตยกรรม ARM (อย่าใช้ไฟล์ win_amd64)

---

## 📚 License
[MIT License](LICENSE)

---