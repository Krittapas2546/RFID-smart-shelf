import socket
import json
import time

# --- ตั้งค่า Server ---
HOST = '0.0.0.0'  # ฟังจากทุก IP Address ที่เข้ามาที่เครื่องนี้
PORT = 65432      # Port ที่จะใช้สื่อสาร (เลือก Port ที่ไม่ซ้ำกับโปรแกรมอื่น)
# --------------------

# สร้าง Socket object
# AF_INET คือใช้ IPv4, SOCK_STREAM คือใช้ TCP
server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)

# ทำให้สามารถใช้ Port เดิมได้ทันทีหลังจากปิดโปรแกรม
server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)

# ผูก Socket กับ Host และ Port
server_socket.bind((HOST, PORT))

# รอรับการเชื่อมต่อ (ให้คิวรอได้ 1 การเชื่อมต่อ)
server_socket.listen(1)

print(f"✅ Server เริ่มทำงานแล้วที่ IP: {socket.gethostbyname(socket.gethostname())} Port: {PORT}")
print("...กำลังรอรับข้อมูล Job...")

def display_job(job_data):
    """ฟังก์ชันสำหรับแสดงผลข้อมูล Job ที่ได้รับให้สวยงาม"""
    print("\n" + "="*40)
    print("⚡️ Add New Job to Queue")
    print("="*40)
    print(f"  Action: \t{job_data.get('action', 'N/A')}")
    print(f"  Lot No.: \t{job_data.get('lotNo', 'N/A')}")
    print(f"  From: \t\t{job_data.get('from', 'N/A')}")
    print(f"  Employee ID: \t{job_data.get('employeeId', 'N/A')}")
    
    location = job_data.get('location', {})
    row = location.get('row', 'N/A')
    col = location.get('col', 'N/A')
    print(f"  Task Location: \tRow-{row}, Col-{col}")
    print(f"  Status: \t{job_data.get('status', 'N/A')}")
    print("="*40)

while True:
    try:
        # ยอมรับการเชื่อมต่อจาก Client
        conn, addr = server_socket.accept()
        with conn:
            print(f"\n🔌 ได้รับการเชื่อมต่อจาก {addr}")

            # รับข้อมูล (กำหนดขนาด Buffer ไว้ที่ 1024 bytes)
            data_bytes = conn.recv(1024)
            if not data_bytes:
                # ถ้าไม่ได้รับข้อมูล แสดงว่า Client ตัดการเชื่อมต่อ
                print(f"🔌 Client {addr} ตัดการเชื่อมต่อ")
                continue

            # แปลงข้อมูลจาก bytes เป็น string
            data_str = data_bytes.decode('utf-8')

            # แปลง JSON string เป็น Python Dictionary
            job_data = json.loads(data_str)

            # แสดงผลข้อมูล Job
            display_job(job_data)

            # ส่งข้อความยืนยันกลับไปหา Client
            confirmation_message = "✅ Job Received and Added to Queue".encode('utf-8')
            conn.sendall(confirmation_message)

    except json.JSONDecodeError:
        print("❌ เกิดข้อผิดพลาด: ไม่สามารถแปลงข้อมูล JSON ที่ได้รับได้")
        error_message = "Error: Invalid JSON format".encode('utf-8')
        conn.sendall(error_message)
    except Exception as e:
        print(f"❌ เกิดข้อผิดพลาดที่ไม่คาดคิด: {e}")
        time.sleep(5) # หน่วงเวลาก่อนเริ่มใหม่
    
    print("\n...กลับไปรอรับข้อมูล Job ต่อไป...")
