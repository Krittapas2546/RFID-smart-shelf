import requests
import datetime

# --- ตั้งค่า ---
# ❗ แก้ไข IP Address ของ Raspberry Pi ของคุณตรงนี้
pi_ip_address = "192.168.0.39"
# -------------

# URL ของ API endpoint บน Pi
api_url = f"http://{pi_ip_address}:8000/"

# ข้อมูลที่จะส่งไป (Payload)
job_data = {
    "action": "put",
    "status": "done",
    "lotNo": "LOT-FROM-SCRIPT-001",
    "from": "STK-B2",
    "employeeId": "EMP-123",
    "location": {
        "row": 8,
        "col": 3
    },
    "PositionSTK": [
        [10, 20]
    ],
    "timestamp": datetime.datetime.now().isoformat()
}

# --- โค้ดยิง API ---
print(f"กำลังส่ง Request ไปที่: {api_url}")
print("ข้อมูลที่จะส่ง:", job_data)

try:
    # ส่ง POST request พร้อมข้อมูลแบบ JSON
    response = requests.post(api_url, json=job_data, timeout=10) # เพิ่ม timeout 10 วินาที

    # หาก Server ตอบกลับมาเป็นรหัส Error (เช่น 404, 500) จะทำให้เกิด Exception
    response.raise_for_status()

    # พิมพ์ผลลัพธ์ที่ Server ตอบกลับ
    print("\n✅ ยิง API สำเร็จ!")
    print(f"Status Code: {response.status_code}")
    print("Server Response:")
    print(response.json())

except requests.exceptions.ConnectionError:
    print(f"\n❌ การเชื่อมต่อผิดพลาด: ไม่สามารถเชื่อมต่อกับ Raspberry Pi ที่ IP {pi_ip_address} ได้")
    print("   - ตรวจสอบว่า Raspberry Pi เปิดอยู่ และเชื่อมต่อเครือข่ายเดียวกับคอมพิวเตอร์ของคุณ")
    print("   - ตรวจสอบว่า Server (main.py) บน Pi กำลังทำงานอยู่")
except requests.exceptions.RequestException as e:
    print(f"\n❌ เกิดข้อผิดพลาดในการส่ง Request: {e}")
