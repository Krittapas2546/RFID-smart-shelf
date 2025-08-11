# 💡 LED Control Commands Guide

คู่มือการใช้งาน LED Control APIs สำหรับ RFID Smart Shelf System

## 📋 สารบัญ

1. [วิธีการใช้งาน](#วิธีการใช้งาน)
2. [Commands สำหรับ Linux/macOS](#commands-สำหรับ-linuxmacos)
3. [Commands สำหรับ Windows](#commands-สำหรับ-windows)
4. [Smart Shelf Workflow Examples](#smart-shelf-workflow-examples)
5. [Job Management APIs](#job-management-apis)
6. [Color Reference Guide](#color-reference-guide)
7. [Troubleshooting](#troubleshooting)

---

## 🚀 วิธีการใช้งาน

### ขั้นตอนการใช้งาน:
1. **เปิด Terminal/Command Prompt**
2. **Copy คำสั่งที่ต้องการจากคู่มือนี้**
3. **Paste และกด Enter**
4. **ตรวจสอบผลลัพธ์**

### ความต่างระหว่าง OS:

| OS | Quote Character | Line Continuation | JSON Escaping |
|----|----------------|-------------------|---------------|
| **Linux/macOS** | Single quotes `'` | Backslash `\` | ไม่ต้อง escape |
| **Windows** | Double quotes `"` | Backtick `` ` `` | ต้อง escape `\"` |

---

## 🐧 Commands สำหรับ Linux/macOS

### 🔴 LED Control พื้นฐาน

```bash
# ติดไฟสีแดงที่ L1B1
curl -X POST http://localhost:8000/api/led/position \
  -H "Content-Type: application/json" \
  -d '{"position":"L1B1","r":255,"g":0,"b":0}'

# ติดไฟสีเขียวที่ L2B3
curl -X POST http://localhost:8000/api/led/position \
  -H "Content-Type: application/json" \
  -d '{"position":"L2B3","r":0,"g":255,"b":0}'

# ติดไฟสีน้ำเงินที่ L1B3
curl -X POST http://localhost:8000/api/led/position \
  -H "Content-Type: application/json" \
  -d '{"position":"L1B3","r":0,"g":0,"b":255}'
```

### 🌈 LED Control หลายดวง

```bash
# Rainbow Pattern
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

# Job Queue Preview (สีน้ำเงิน)
curl -X POST http://localhost:8000/api/led/positions \
  -H "Content-Type: application/json" \
  -d '{
    "positions": [
      {"position":"L1B1","r":0,"g":0,"b":255},
      {"position":"L2B2","r":0,"g":0,"b":255},
      {"position":"L3B3","r":0,"g":0,"b":255}
    ]
  }'
```

### 🔧 System Commands

```bash
# ดับไฟทั้งหมด
curl -X POST http://localhost:8000/api/led/clear

# ตรวจสอบ Shelf Configuration
curl -X GET http://localhost:8000/api/shelf/config

# Health Check
curl -X GET http://localhost:8000/health
```

---

## 🪟 Commands สำหรับ Windows

### 🔴 LED Control พื้นฐาน

```powershell
# ติดไฟสีแดงที่ L1B1
curl -X POST http://localhost:8000/api/led/position `
  -H "Content-Type: application/json" `
  -d "{\"position\":\"L1B1\",\"r\":255,\"g\":0,\"b\":0}"

# ติดไฟสีเขียวที่ L2B3
curl -X POST http://localhost:8000/api/led/position `
  -H "Content-Type: application/json" `
  -d "{\"position\":\"L2B3\",\"r\":0,\"g\":255,\"b\":0}"

# ติดไฟสีน้ำเงินที่ L1B3
curl -X POST http://localhost:8000/api/led/position `
  -H "Content-Type: application/json" `
  -d "{\"position\":\"L1B3\",\"r\":0,\"g\":0,\"b\":255}"
```

### 🌈 LED Control หลายดวง

```powershell
# Rainbow Pattern
curl -X POST http://localhost:8000/api/led/positions `
  -H "Content-Type: application/json" `
  -d "{\"positions\":[{\"position\":\"L1B1\",\"r\":255,\"g\":0,\"b\":0},{\"position\":\"L1B2\",\"r\":255,\"g\":127,\"b\":0},{\"position\":\"L1B3\",\"r\":255,\"g\":255,\"b\":0},{\"position\":\"L1B4\",\"r\":0,\"g\":255,\"b\":0},{\"position\":\"L1B5\",\"r\":0,\"g\":0,\"b\":255}]}"

# Job Queue Preview (สีน้ำเงิน)
curl -X POST http://localhost:8000/api/led/positions `
  -H "Content-Type: application/json" `
  -d "{\"positions\":[{\"position\":\"L1B1\",\"r\":0,\"g\":0,\"b\":255},{\"position\":\"L2B2\",\"r\":0,\"g\":0,\"b\":255},{\"position\":\"L3B3\",\"r\":0,\"g\":0,\"b\":255}]}"
```

### 🔧 System Commands

```powershell
# ดับไฟทั้งหมด
curl -X POST http://localhost:8000/api/led/clear

# ตรวจสอบ Shelf Configuration
curl -X GET http://localhost:8000/api/shelf/config

# Health Check
curl -X GET http://localhost:8000/health
```

---

## 🎯 Smart Shelf Workflow Examples

### Scenario 1: Queue Preview Mode
แสดงงานทั้งหมดในคิวด้วยไฟสีน้ำเงิน

**Linux/macOS:**
```bash
curl -X POST http://localhost:8000/api/led/positions \
  -H "Content-Type: application/json" \
  -d '{
    "positions": [
      {"position":"L1B2","r":0,"g":0,"b":255},
      {"position":"L2B1","r":0,"g":0,"b":255},
      {"position":"L3B4","r":0,"g":0,"b":255}
    ]
  }'
```

**Windows:**
```powershell
curl -X POST http://localhost:8000/api/led/positions `
  -H "Content-Type: application/json" `
  -d "{\"positions\":[{\"position\":\"L1B2\",\"r\":0,\"g\":0,\"b\":255},{\"position\":\"L2B1\",\"r\":0,\"g\":0,\"b\":255},{\"position\":\"L3B4\",\"r\":0,\"g\":0,\"b\":255}]}"
```

### Scenario 2: Active Job Mode
แสดงงานที่กำลังทำด้วยไฟสีเหลือง

**Linux/macOS:**
```bash
curl -X POST http://localhost:8000/api/led/position \
  -H "Content-Type: application/json" \
  -d '{"position":"L1B2","r":255,"g":255,"b":0}'
```

**Windows:**
```powershell
curl -X POST http://localhost:8000/api/led/position `
  -H "Content-Type: application/json" `
  -d "{\"position\":\"L1B2\",\"r\":255,\"g\":255,\"b\":0}"
```

### Scenario 3: Error State
แสดงตำแหน่งผิด (แดง) และตำแหน่งถูกต้อง (เหลือง)

**Linux/macOS:**
```bash
curl -X POST http://localhost:8000/api/led/positions \
  -H "Content-Type: application/json" \
  -d '{
    "positions": [
      {"position":"L1B1","r":255,"g":0,"b":0},
      {"position":"L1B2","r":255,"g":255,"b":0}
    ]
  }'
```

**Windows:**
```powershell
curl -X POST http://localhost:8000/api/led/positions `
  -H "Content-Type: application/json" `
  -d "{\"positions\":[{\"position\":\"L1B1\",\"r\":255,\"g\":0,\"b\":0},{\"position\":\"L1B2\",\"r\":255,\"g\":255,\"b\":0}]}"
```

### Scenario 4: Job Complete
ดับไฟทั้งหมดเมื่องานเสร็จ

```bash
curl -X POST http://localhost:8000/api/led/clear
```

---

## 📋 Job Management APIs

### สร้างงานใหม่

**Linux/macOS:**
```bash
# Place Job (วางของ)
curl -X POST http://localhost:8000/command \
  -H "Content-Type: application/json" \
  -d '{
    "lot_no": "LOT001",
    "level": "1",
    "block": "2",
    "place_flg": "1",
    "tray_count": "10"
  }'

# Pick Job (เก็บของ)
curl -X POST http://localhost:8000/command \
  -H "Content-Type: application/json" \
  -d '{
    "lot_no": "LOT002",
    "level": "2",
    "block": "3",
    "place_flg": "0",
    "tray_count": "5"
  }'
```

**Windows:**
```powershell
# Place Job (วางของ)
curl -X POST http://localhost:8000/command `
  -H "Content-Type: application/json" `
  -d "{\"lot_no\":\"LOT001\",\"level\":\"1\",\"block\":\"2\",\"place_flg\":\"1\",\"tray_count\":\"10\"}"

# Pick Job (เก็บของ)
curl -X POST http://localhost:8000/command `
  -H "Content-Type: application/json" `
  -d "{\"lot_no\":\"LOT002\",\"level\":\"2\",\"block\":\"3\",\"place_flg\":\"0\",\"tray_count\":\"5\"}"
```

### ดูข้อมูลระบบ

```bash
# ดู Job ทั้งหมด
curl -X GET http://localhost:8000/command

# ดูสถานะ Shelf
curl -X GET http://localhost:8000/api/shelf/state

# Reset ระบบ
curl -X POST http://localhost:8000/api/system/reset
```

---

## 🎨 Color Reference Guide

| สี | RGB Values | Hex | Use Case |
|----|------------|-----|----------|
| 🔴 **แดง (Red)** | `r:255, g:0, b:0` | #FF0000 | Error, Wrong location |
| 🟢 **เขียว (Green)** | `r:0, g:255, b:0` | #00FF00 | Success, Occupied |
| 🔵 **น้ำเงิน (Blue)** | `r:0, g:0, b:255` | #0000FF | Queue preview, Target |
| 🟡 **เหลือง (Yellow)** | `r:255, g:255, b:0` | #FFFF00 | Active job, Warning |
| 🟣 **ม่วง (Purple)** | `r:255, g:0, b:255` | #FF00FF | Special state |
| 🩵 **ฟ้า (Cyan)** | `r:0, g:255, b:255` | #00FFFF | Info, Secondary |
| ⚪ **ขาว (White)** | `r:255, g:255, b:255` | #FFFFFF | Empty, Default |
| 🟠 **ส้ม (Orange)** | `r:255, g:127, b:0` | #FF7F00 | Transition, Progress |
| 🩷 **ชมพู (Pink)** | `r:255, g:192, b:203` | #FFC0CB | Custom, Debug |

---

## 🔧 Troubleshooting

### ปัญหาที่พบบ่อย

#### 1. Connection Error
```
curl: (7) Failed to connect to localhost port 8000
```
**แก้ไข:** ตรวจสอบว่า Server รันอยู่หรือไม่
```bash
# ตรวจสอบ Server
curl -X GET http://localhost:8000/health
```

#### 2. Invalid Position Format
```json
{"error": "Invalid position format"}
```
**แก้ไข:** ใช้รูปแบบ L{level}B{block} เช่น L1B1, L2B3

#### 3. Position Not Found
```json
{"error": "Invalid position", "message": "Position L10B10 does not exist"}
```
**แก้ไข:** ตรวจสอบ Shelf Configuration
```bash
curl -X GET http://localhost:8000/api/shelf/config
```

#### 4. JSON Syntax Error (Windows)
```json
{"error": "Invalid JSON"}
```
**แก้ไข:** ตรวจสอบ escape characters สำหรับ Windows

### Tips การใช้งาน

1. **ตรวจสอบ Server ก่อนใช้งาน:**
   ```bash
   curl -X GET http://localhost:8000/health
   ```

2. **ดู Configuration ปัจจุบัน:**
   ```bash
   curl -X GET http://localhost:8000/api/shelf/config
   ```

3. **ทดสอบด้วยไฟเดียวก่อน:**
   ```bash
   curl -X POST http://localhost:8000/api/led/position \
     -H "Content-Type: application/json" \
     -d '{"position":"L1B1","r":255,"g":0,"b":0}'
   ```

4. **ดับไฟก่อนทดสอบใหม่:**
   ```bash
   curl -X POST http://localhost:8000/api/led/clear
   ```

### การเข้าถึงจากเครื่องอื่น

หากต้องการเข้าถึงจาก network อื่น ให้เปลี่ยน `localhost` เป็น IP address ของ Raspberry Pi:

```bash
# ตัวอย่าง
curl -X POST http://192.168.1.100:8000/api/led/position \
  -H "Content-Type: application/json" \
  -d '{"position":"L1B1","r":255,"g":0,"b":0}'
```

---

## 📞 Support

- **GitHub Repository:** https://github.com/Krittapas2546/RFID-smart-shelf
- **API Documentation:** http://localhost:8000/docs
- **Interactive Simulator:** http://localhost:8000/simulator

---

**© 2024 RFID Smart Shelf System - LED Control Guide**
