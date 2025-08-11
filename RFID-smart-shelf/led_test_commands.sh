# RFID Smart Shelf - LED Control API Commands Guide
# คู่มือการใช้งาน LED Control APIs สำหรับ Windows และ Linux
# =====================================================

# วิธีการใช้งาน:
# 1. เปิด Terminal/Command Prompt
# 2. Copy และ Paste คำสั่งที่ต้องการ
# 3. กด Enter เพื่อรันคำสั่ง

# ============================
# 🟢 Linux/macOS Commands
# ============================

# 1. ติดไฟสีแดงที่ตำแหน่ง L1B1
curl -X POST http://localhost:8000/api/led/position \
  -H "Content-Type: application/json" \
  -d '{"position":"L1B1","r":255,"g":0,"b":0}'

# 2. ติดไฟสีเขียวที่ตำแหน่ง L2B3
curl -X POST http://localhost:8000/api/led/position \
  -H "Content-Type: application/json" \
  -d '{"position":"L2B3","r":0,"g":255,"b":0}'

# 3. ติดไฟสีน้ำเงินที่ตำแหน่ง L1B3
curl -X POST http://localhost:8000/api/led/position \
  -H "Content-Type: application/json" \
  -d '{"position":"L1B3","r":0,"g":0,"b":255}'

# 4. ติดไฟหลายตำแหน่งพร้อมกัน (แบบ Rainbow)
curl -X POST http://localhost:8000/api/led/positions \
  -H "Content-Type: application/json" \
  -d '{
    "positions": [
      {"position":"L1B1","r":255,"g":0,"b":0},
      {"position":"L1B2","r":255,"g":127,"b":0},
      {"position":"L1B3","r":255,"g":255,"b":0},
      {"position":"L1B4","r":0,"g":255,"b":0},
      {"position":"L1B5","r":0,"g":0,"b":255}
    ]
  }'

# 5. ติดไฟแบบ Pattern สำหรับแสดง Job Queue
curl -X POST http://localhost:8000/api/led/positions \
  -H "Content-Type: application/json" \
  -d '{
    "positions": [
      {"position":"L1B1","r":0,"g":0,"b":255},
      {"position":"L2B2","r":0,"g":0,"b":255},
      {"position":"L3B3","r":0,"g":0,"b":255},
      {"position":"L4B4","r":0,"g":0,"b":255}
    ]
  }'

# 6. ติดไฟแสดง Error (แดง) และ Target (น้ำเงิน)
curl -X POST http://localhost:8000/api/led/positions \
  -H "Content-Type: application/json" \
  -d '{
    "positions": [
      {"position":"L1B1","r":255,"g":0,"b":0},
      {"position":"L2B3","r":0,"g":0,"b":255}
    ]
  }'

# 7. ดับไฟทั้งหมด
curl -X POST http://localhost:8000/api/led/clear

# 8. ตรวจสอบ Shelf Configuration
curl -X GET http://localhost:8000/api/shelf/config

# 9. ทดสอบ Position ผิด (จะได้ Error)
curl -X POST http://localhost:8000/api/led/position \
  -H "Content-Type: application/json" \
  -d '{"position":"INVALID","r":255,"g":0,"b":0}'

# 10. ทดสอบตำแหน่งที่ไม่มีอยู่ (จะได้ Error)
curl -X POST http://localhost:8000/api/led/position \
  -H "Content-Type: application/json" \
  -d '{"position":"L10B10","r":255,"g":0,"b":0}'

# ============================
# 🟦 Windows Commands (PowerShell/Command Prompt)
# ============================

# หมายเหตุ: สำหรับ Windows ใช้ " แทน ' และ ` สำหรับขึ้นบรรทัดใหม่

# 1. ติดไฟสีแดงที่ตำแหน่ง L1B1
curl -X POST http://localhost:8000/api/led/position `
  -H "Content-Type: application/json" `
  -d "{\"position\":\"L1B1\",\"r\":255,\"g\":0,\"b\":0}"

# 2. ติดไฟสีเขียวที่ตำแหน่ง L2B3
curl -X POST http://localhost:8000/api/led/position `
  -H "Content-Type: application/json" `
  -d "{\"position\":\"L2B3\",\"r\":0,\"g\":255,\"b\":0}"

# 3. ติดไฟสีน้ำเงินที่ตำแหน่ง L1B3
curl -X POST http://localhost:8000/api/led/position `
  -H "Content-Type: application/json" `
  -d "{\"position\":\"L1B3\",\"r\":0,\"g\":0,\"b\":255}"

# 4. ติดไฟหลายตำแหน่งพร้อมกัน (แบบ Rainbow)
curl -X POST http://localhost:8000/api/led/positions `
  -H "Content-Type: application/json" `
  -d "{\"positions\":[{\"position\":\"L1B1\",\"r\":255,\"g\":0,\"b\":0},{\"position\":\"L1B2\",\"r\":255,\"g\":127,\"b\":0},{\"position\":\"L1B3\",\"r\":255,\"g\":255,\"b\":0},{\"position\":\"L1B4\",\"r\":0,\"g\":255,\"b\":0},{\"position\":\"L1B5\",\"r\":0,\"g\":0,\"b\":255}]}"

# 5. ติดไฟแบบ Pattern สำหรับแสดง Job Queue
curl -X POST http://localhost:8000/api/led/positions `
  -H "Content-Type: application/json" `
  -d "{\"positions\":[{\"position\":\"L1B1\",\"r\":0,\"g\":0,\"b\":255},{\"position\":\"L2B2\",\"r\":0,\"g\":0,\"b\":255},{\"position\":\"L3B3\",\"r\":0,\"g\":0,\"b\":255},{\"position\":\"L4B4\",\"r\":0,\"g\":0,\"b\":255}]}"

# 6. ติดไฟแสดง Error (แดง) และ Target (น้ำเงิน)
curl -X POST http://localhost:8000/api/led/positions `
  -H "Content-Type: application/json" `
  -d "{\"positions\":[{\"position\":\"L1B1\",\"r\":255,\"g\":0,\"b\":0},{\"position\":\"L2B3\",\"r\":0,\"g\":0,\"b\":255}]}"

# 7. ดับไฟทั้งหมด
curl -X POST http://localhost:8000/api/led/clear

# 8. ตรวจสอบ Shelf Configuration
curl -X GET http://localhost:8000/api/shelf/config

# 9. ทดสอบ Position ผิด (จะได้ Error)
curl -X POST http://localhost:8000/api/led/position `
  -H "Content-Type: application/json" `
  -d "{\"position\":\"INVALID\",\"r\":255,\"g\":0,\"b\":0}"

# 10. ทดสอบตำแหน่งที่ไม่มีอยู่ (จะได้ Error)
curl -X POST http://localhost:8000/api/led/position `
  -H "Content-Type: application/json" `
  -d "{\"position\":\"L10B10\",\"r\":255,\"g\":0,\"b\":0}"

# =============================================
# 🎯 Smart Shelf Workflow Examples
# =============================================

# ========== Linux/macOS ==========

# Scenario 1: แสดง Preview งานทั้งหมดในคิว (สีน้ำเงิน)
curl -X POST http://localhost:8000/api/led/positions \
  -H "Content-Type: application/json" \
  -d '{
    "positions": [
      {"position":"L1B2","r":0,"g":0,"b":255},
      {"position":"L2B1","r":0,"g":0,"b":255},
      {"position":"L3B4","r":0,"g":0,"b":255}
    ]
  }'

# Scenario 2: แสดง Active Job (สีเหลือง)
curl -X POST http://localhost:8000/api/led/position \
  -H "Content-Type: application/json" \
  -d '{"position":"L1B2","r":255,"g":255,"b":0}'

# Scenario 3: แสดง Error Location (แดง) + Target (เหลือง)
curl -X POST http://localhost:8000/api/led/positions \
  -H "Content-Type: application/json" \
  -d '{
    "positions": [
      {"position":"L1B1","r":255,"g":0,"b":0},
      {"position":"L1B2","r":255,"g":255,"b":0}
    ]
  }'

# Scenario 4: Job Complete - ดับไฟทั้งหมด
curl -X POST http://localhost:8000/api/led/clear

# ========== Windows ==========

# Scenario 1: แสดง Preview งานทั้งหมดในคิว (สีน้ำเงิน)
curl -X POST http://localhost:8000/api/led/positions `
  -H "Content-Type: application/json" `
  -d "{\"positions\":[{\"position\":\"L1B2\",\"r\":0,\"g\":0,\"b\":255},{\"position\":\"L2B1\",\"r\":0,\"g\":0,\"b\":255},{\"position\":\"L3B4\",\"r\":0,\"g\":0,\"b\":255}]}"

# Scenario 2: แสดง Active Job (สีเหลือง)
curl -X POST http://localhost:8000/api/led/position `
  -H "Content-Type: application/json" `
  -d "{\"position\":\"L1B2\",\"r\":255,\"g\":255,\"b\":0}"

# Scenario 3: แสดง Error Location (แดง) + Target (เหลือง)
curl -X POST http://localhost:8000/api/led/positions `
  -H "Content-Type: application/json" `
  -d "{\"positions\":[{\"position\":\"L1B1\",\"r\":255,\"g\":0,\"b\":0},{\"position\":\"L1B2\",\"r\":255,\"g\":255,\"b\":0}]}"

# Scenario 4: Job Complete - ดับไฟทั้งหมด
curl -X POST http://localhost:8000/api/led/clear

# =============================================
# 📚 Additional API Commands
# =============================================

# ========== Job Management (Linux/macOS) ==========

# สร้าง Job ใหม่ (Place job)
curl -X POST http://localhost:8000/command \
  -H "Content-Type: application/json" \
  -d '{
    "lot_no": "LOT001",
    "level": "1",
    "block": "2",
    "place_flg": "1",
    "tray_count": "10"
  }'

# สร้าง Job ใหม่ (Pick job)
curl -X POST http://localhost:8000/command \
  -H "Content-Type: application/json" \
  -d '{
    "lot_no": "LOT002",
    "level": "2",
    "block": "3",
    "place_flg": "0",
    "tray_count": "5"
  }'

# ดู Job ทั้งหมด
curl -X GET http://localhost:8000/command

# ดูสถานะ Shelf
curl -X GET http://localhost:8000/api/shelf/state

# Reset ระบบ
curl -X POST http://localhost:8000/api/system/reset

# Health Check
curl -X GET http://localhost:8000/health

# ========== Job Management (Windows) ==========

# สร้าง Job ใหม่ (Place job)
curl -X POST http://localhost:8000/command `
  -H "Content-Type: application/json" `
  -d "{\"lot_no\":\"LOT001\",\"level\":\"1\",\"block\":\"2\",\"place_flg\":\"1\",\"tray_count\":\"10\"}"

# สร้าง Job ใหม่ (Pick job)
curl -X POST http://localhost:8000/command `
  -H "Content-Type: application/json" `
  -d "{\"lot_no\":\"LOT002\",\"level\":\"2\",\"block\":\"3\",\"place_flg\":\"0\",\"tray_count\":\"5\"}"

# ดู Job ทั้งหมด
curl -X GET http://localhost:8000/command

# ดูสถานะ Shelf
curl -X GET http://localhost:8000/api/shelf/state

# Reset ระบบ
curl -X POST http://localhost:8000/api/system/reset

# Health Check
curl -X GET http://localhost:8000/health

# =============================================
# 🎨 Color Reference Guide
# =============================================

# RGB Color Values:
# แดง (Red):     r:255, g:0,   b:0
# เขียว (Green):  r:0,   g:255, b:0
# น้ำเงิน (Blue):   r:0,   g:0,   b:255
# เหลือง (Yellow):  r:255, g:255, b:0
# ม่วง (Purple):   r:255, g:0,   b:255
# ฟ้า (Cyan):     r:0,   g:255, b:255
# ขาว (White):    r:255, g:255, b:255
# ส้ม (Orange):   r:255, g:127, b:0
# ชมพู (Pink):    r:255, g:192, b:203

# =============================================
# 📝 Usage Notes
# =============================================

# Linux/macOS:
# - ใช้ single quotes (') สำหรับ JSON
# - ใช้ backslash (\) สำหรับขึ้นบรรทัดใหม่
# - ไม่ต้อง escape double quotes

# Windows PowerShell:
# - ใช้ double quotes (") สำหรับ JSON
# - ใช้ backtick (`) สำหรับขึ้นบรรทัดใหม่
# - ต้อง escape double quotes ด้วย \"

# Position Format:
# - L{level}B{block} เช่น L1B1, L2B3, L4B8
# - Level: 1-4 (ตามการตั้งค่า SHELF_CONFIG)
# - Block: 1-8 (ขึ้นอยู่กับ level)

# Response Codes:
# - 200: สำเร็จ
# - 400: ข้อมูลผิดพลาด (invalid position, format, etc.)
# - 500: ข้อผิดพลาดของเซิร์ฟเวอร์

# Server URL:
# - Local: http://localhost:8000
# - Network: http://{raspberry_pi_ip}:8000
# - ตัวอย่าง: http://192.168.1.100:8000
