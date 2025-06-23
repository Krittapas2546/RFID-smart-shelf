import requests
import json
import datetime

# --- ตั้งค่า ---
pi_ip_address = "YOUR_PI_IP_ADDRESS"  # <--- ✏️ ใส่ IP ของ Pi ของคุณ
# นี่คือ Path ใหม่ที่เราสร้างไว้ใน main.py ด้วย @app.post
api_path = "/api/update_shelf"
api_url = f"http://{pi_ip_address}:8000{api_path}"

# --- สร้างข้อมูลที่จะส่ง ---
# โครงสร้างของ Dictionary นี้ต้องตรงกับ Pydantic Model (ShelfData) บน Server
data_to_send = {
    "position_stk": [[10, 20], [15, 25], [5, 30]], # <--- Key คือ 'position_stk'
    "timestamp": datetime.datetime.now().isoformat()
}

# --- ส่ง Request และแสดงผลลัพธ์ ---
print(f"กำลังส่งข้อมูลไปที่: {api_url}")
print(f"ข้อมูลที่จะส่ง:\n{json.dumps(data_to_send, indent=2)}")

try:
    response = requests.post(api_url, json=data_to_send, timeout=10)
    response.raise_for_status()

    print("\n✅ ส่งข้อมูลสำเร็จ!")
    print("--------------------")
    print("Server บน Pi ตอบกลับว่า:")
    print(response.json())

except requests.exceptions.HTTPError as e:
    print(f"\n❌ เกิดข้อผิดพลาด (HTTP Error): {e.response.status_code} {e.response.reason}")
    print(f"   - Path ที่เรียก: '{api_path}'")
    print(f"   - ตรวจสอบให้แน่ใจว่าได้เพิ่มโค้ด @app.post('{api_path}') ใน main.py บน Pi และ restart server แล้ว")
    if e.response.status_code == 422:
        print("   - [สาเหตุ] โครงสร้างข้อมูลที่ส่ง (data_to_send) ไม่ตรงกับ Pydantic Model (ShelfData) บน Server")
        print("   - Server แจ้งว่า:\n", e.response.json())

except requests.exceptions.ConnectionError:
    print(f"\n❌ ไม่สามารถเชื่อมต่อกับ Raspberry Pi ที่ IP '{pi_ip_address}' ได้")
    print("   - ตรวจสอบว่า IP Address ถูกต้อง")
    print("   - ตรวจสอบว่า Pi และคอมพิวเตอร์อยู่ในวง LAN เดียวกัน")
    print("   - ตรวจสอบว่า Server (main.py) บน Pi กำลังทำงานอยู่")

except requests.exceptions.Timeout:
    print(f"\n❌ การเชื่อมต่อหมดเวลา (Timeout)")
    print("   - Server บน Pi อาจจะทำงานช้า หรือมีปัญหาเครือข่าย")

except Exception as e:
    print(f"\n❌ เกิดข้อผิดพลาดที่ไม่คาดคิด: {e}")
